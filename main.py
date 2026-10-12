import os
from contextlib import asynccontextmanager
import re
from datetime import datetime, date
from typing import List, Optional
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from sentence_transformers import SentenceTransformer

load_dotenv()


# Global container for model state
ml_models = {}

def get_embedding_model():
    """Lazily loads SentenceTransformer on-demand to maintain minimal memory footprint."""
    if "embedding_model" not in ml_models:
        try:
            print("Lazily loading SentenceTransformer model...")
            from sentence_transformers import SentenceTransformer
            ml_models["embedding_model"] = SentenceTransformer("all-MiniLM-L6-v2")
            print("SentenceTransformer loaded successfully.")
        except Exception as e:
            print(f"Notice: SentenceTransformer not loaded ({e}). Semantic search fallback active.")
            ml_models["embedding_model"] = None
    return ml_models.get("embedding_model")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    import database
    import live_sync

    # Fast & Lightweight Startup: DB check and cleanup only (Uses ~40MB RAM)
    print("Initializing SQLite Database (jobs.db)...")
    database.init_db()
    expired_cnt = database.auto_expire_jobs()
    dedup_cnt = database.deduplicate_all_jobs()
    if expired_cnt > 0 or dedup_cnt > 0:
        print(f"Startup clean: {expired_cnt} expired jobs marked, {dedup_cnt} duplicates collapsed in SQLite.")

    # Background periodic worker
    sync_interval = int(os.getenv("PERIODIC_SYNC_INTERVAL_SECONDS", "1800"))

    async def periodic_sync_worker():
        while True:
            try:
                await asyncio.sleep(sync_interval)
                print("Running scheduled live sync, deduplication & auto-expiry cycle...")
                database.auto_expire_jobs()
                database.deduplicate_all_jobs()
                live_sync.run_sync_cycle(embedding_model=ml_models.get("embedding_model"))
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Periodic sync worker error: {e}")

    sync_task = asyncio.create_task(periodic_sync_worker())
    yield
    # SHUTDOWN: Clean up
    sync_task.cancel()
    ml_models.clear()


app = FastAPI(
    title="Indian Govt & Tech Job Eligibility Engine",
    version="1.2.0",
    description="Deterministic Criteria Filtering (Degree, Exp) + AI Semantic Matching from Manual Post or Live URL",
    lifespan=lifespan
)

cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()] if cors_origins_raw != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# --- Pydantic Request & Response Schemas ---
# =====================================================================

class CandidateProfile(BaseModel):
    degree: str = Field(
        ..., 
        description="Candidate's highest educational qualification", 
        examples=["MCA"]
    )
    experience_years: float = Field(
        ..., 
        ge=0.0, 
        description="Total relevant professional work experience in years", 
        examples=[5.0]
    )
    skills_summary: str = Field(
        ..., 
        min_length=5, 
        description="Summary of technical skills and past projects", 
        examples=["Node.js, Express, PostgreSQL, Microservices, REST APIs, Docker"]
    )


class JobPost(BaseModel):
    job_title: str = Field(
        ..., 
        description="Official designation of the role", 
        examples=["Senior Software Engineer (Scale III)"]
    )
    organization: str = Field(
        ..., 
        description="Department / Hiring Organization", 
        examples=["MPSEDC / State IT Dept"]
    )
    eligible_degrees: List[str] = Field(
        ..., 
        min_length=1, 
        description="List of educational degrees accepted for this role", 
        examples=[["MCA", "B.Tech CS", "M.Sc IT", "BE Computer Engineering"]]
    )
    min_experience_required: float = Field(
        ..., 
        ge=0.0, 
        description="Mandatory minimum experience required in years", 
        examples=[3.0]
    )
    selection_mode: str = Field(
        default="Direct Interview", 
        description="Recruitment procedure (e.g. Direct Interview, Written Exam)",
        examples=["Direct Interview"]
    )
    job_description_raw: str = Field(
        ..., 
        min_length=10, 
        description="Official role responsibilities and required skill details"
    )


class JobEligibilityCheckRequest(BaseModel):
    candidate_profile: CandidateProfile
    job_post: JobPost


class URLMatchRequest(BaseModel):
    candidate_profile: CandidateProfile
    job_url: HttpUrl = Field(
        ..., 
        description="Live URL of the job advertisement / portal page",
        examples=["https://example.com/careers/senior-python-dev"]
    )
    eligible_degrees: List[str] = Field(
        ..., 
        min_length=1, 
        description="Eligible degrees specified in notification",
        examples=[["MCA", "B.Tech CS", "BE Computer Science"]]
    )
    min_experience_required: float = Field(
        ..., 
        ge=0.0, 
        description="Minimum required experience in years", 
        examples=[3.0]
    )


# --- Response Schemas ---

class CriteriaCheckDetail(BaseModel):
    is_satisfied: bool
    candidate_value: str
    required_value: str
    remarks: str


class EligibilityResponse(BaseModel):
    job_title: str
    organization: str
    hard_filters_passed: bool
    degree_check: CriteriaCheckDetail
    experience_check: CriteriaCheckDetail
    semantic_similarity_score: float
    match_percentage: float
    final_verdict: str
    verdict_reasons: List[str]


# =====================================================================
# --- Helpers: Vector Math & Web Scraper ---
# =====================================================================

def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Computes cosine similarity between two 1D numpy vectors."""
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))


async def extract_clean_text_from_url(url: str, timeout_seconds: float = 10.0) -> tuple[str, str]:
    """
    Asynchronously fetches a web page, strips scripts/styles/navs,
    and returns clean readable text and page title.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36 JobAIEngine/1.0"
        )
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Target job portal took too long to respond (Request Timeout).")
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502, 
            detail=f"Unable to access job URL. Remote server returned status code: {e.response.status_code}"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch job URL: {str(e)}")

    soup = BeautifulSoup(response.text, "html.parser")

    # 1. Extract Page Title (used as fallback job title)
    title = soup.title.string.strip() if soup.title and soup.title.string else "Scraped Job Posting"

    # 2. Decompose useless HTML boilerplate
    for tag in soup(["script", "style", "nav", "header", "footer", "noscript", "aside", "form"]):
        tag.decompose()

    # 3. Extract text and normalize multiple whitespaces/newlines
    raw_text = soup.get_text(separator=" ", strip=True)
    clean_text = re.sub(r"\s+", " ", raw_text).strip()

    if len(clean_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="The target page returned very little text. It might be behind a login wall, CAPTCHA, or client-rendered with SPA JavaScript."
        )

    return title, clean_text


def evaluate_eligibility(
    candidate: CandidateProfile,
    eligible_degrees: List[str],
    min_exp: float,
    job_description_text: str,
    job_title: str,
    organization: str,
    model: SentenceTransformer
) -> EligibilityResponse:
    """Core evaluation engine reusable by both manual and URL endpoints."""
    verdict_reasons: List[str] = []

    # HARD FILTER 1: Degree Check
    candidate_degree_clean = candidate.degree.strip().lower()
    normalized_eligible_degrees = [d.strip().lower() for d in eligible_degrees]
    degree_matched = candidate_degree_clean in normalized_eligible_degrees

    degree_detail = CriteriaCheckDetail(
        is_satisfied=degree_matched,
        candidate_value=candidate.degree,
        required_value=", ".join(eligible_degrees),
        remarks="Candidate degree matches criteria" if degree_matched else "Candidate degree not in eligible list"
    )
    if not degree_matched:
        verdict_reasons.append(f"Ineligible: Degree '{candidate.degree}' does not match required: {eligible_degrees}")

    # HARD FILTER 2: Experience Check
    exp_matched = candidate.experience_years >= min_exp
    experience_detail = CriteriaCheckDetail(
        is_satisfied=exp_matched,
        candidate_value=f"{candidate.experience_years} years",
        required_value=f"{min_exp} years",
        remarks="Candidate meets minimum experience" if exp_matched else "Insufficient years of experience"
    )
    if not exp_matched:
        verdict_reasons.append(
            f"Ineligible: Experience ({candidate.experience_years} yrs) is less than required ({min_exp} yrs)"
        )

    hard_filters_passed = degree_matched and exp_matched

    # AI SEMANTIC MATCH
    candidate_vec = model.encode(candidate.skills_summary)
    # Truncate text to first 2500 characters to keep relevant job description content within transformer bounds
    job_desc_vec = model.encode(job_description_text[:2500])

    raw_similarity = compute_cosine_similarity(candidate_vec, job_desc_vec)
    clean_score = max(0.0, min(1.0, raw_similarity))
    match_percentage = round(clean_score * 100, 2)

    # FINAL VERDICT
    if hard_filters_passed:
        if match_percentage >= 60.0:
            final_verdict = "Eligible & Highly Recommended"
            verdict_reasons.append(
                f"Candidate satisfies all eligibility rules with strong semantic skill match ({match_percentage}%)."
            )
        else:
            final_verdict = "Eligible but Moderate/Low Skill Match"
            verdict_reasons.append(
                f"Candidate meets degree and experience requirements, but semantic skill match is below threshold ({match_percentage}% < 60%)."
            )
    else:
        final_verdict = "Not Eligible (Mandatory Criteria Failed)"
        # Deterministic Penalty: Cap score at 0-20% when hard criteria fails
        match_percentage = min(20.0, round(clean_score * 20.0, 2))

    return EligibilityResponse(
        job_title=job_title,
        organization=organization,
        hard_filters_passed=hard_filters_passed,
        degree_check=degree_detail,
        experience_check=experience_detail,
        semantic_similarity_score=round(clean_score, 4),
        match_percentage=match_percentage,
        final_verdict=final_verdict,
        verdict_reasons=verdict_reasons
    )


# =====================================================================
# --- Endpoints ---
# =====================================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Indian Govt & Tech Job Eligibility Engine",
        "model_loaded": "embedding_model" in ml_models
    }


@app.post("/check-job-match", response_model=EligibilityResponse)
def check_job_match(request: JobEligibilityCheckRequest) -> EligibilityResponse:
    model = get_embedding_model()
    if not model:
        raise HTTPException(status_code=503, detail="AI Inference model is not ready")

    return evaluate_eligibility(
        candidate=request.candidate_profile,
        eligible_degrees=request.job_post.eligible_degrees,
        min_exp=request.job_post.min_experience_required,
        job_description_text=request.job_post.job_description_raw,
        job_title=request.job_post.job_title,
        organization=request.job_post.organization,
        model=model
    )


@app.post("/match-from-url", response_model=EligibilityResponse)
async def match_from_url(request: URLMatchRequest) -> EligibilityResponse:
    model = get_embedding_model()
    if not model:
        raise HTTPException(status_code=503, detail="AI Inference model is not ready")

    str_url = str(request.job_url)
    title, clean_text = await extract_clean_text_from_url(str_url, timeout_seconds=10.0)
    domain = urlparse(str_url).netloc

    return evaluate_eligibility(
        candidate=request.candidate_profile,
        eligible_degrees=request.eligible_degrees,
        min_exp=request.min_experience_required,
        job_description_text=clean_text,
        job_title=title,
        organization=domain,
        model=model
    )


def check_candidate_eligibility_for_job(
    candidate_degree: str,
    candidate_exp: Optional[float],
    query: str,
    job: dict,
    query_vector=None,
    job_vector=None
) -> dict:
    """
    Deterministic Criteria Filtering + Semantic Penalty Engine.
    Ensures that if candidate holds MCA and job strictly requires B.Tech/BE,
    score is penalized down to 5-20% and clearly marked as Ineligible.
    """
    cand_deg = (candidate_degree or "").strip().lower()
    
    if job_vector is None and "vector" in job:
        job_vector = np.array(job["vector"])
    
    # 1. Unchecked / All mode (when candidate has not selected degree)
    if not cand_deg or cand_deg in ["all", "all degrees"]:
        if query:
            q_clean = query.lower().strip()
            haystack = f"{job.get('title', '')} {job.get('department', '')} {' '.join(job.get('tags', []))}".lower()
            if q_clean in haystack or any(token in haystack for token in q_clean.split() if len(token) > 2):
                match_score = 92
            elif query_vector is not None and job_vector is not None:
                sim = compute_cosine_similarity(query_vector, job_vector)
                match_score = max(20, min(90, int(round(max(0, float(sim)) * 100))))
            else:
                match_score = 50
            return {
                "isEligible": True,
                "eligibilityStatus": "Eligible",
                "degreeMatch": True,
                "experienceMatch": True,
                "matchScore": match_score,
                "verdictReason": f"Relevant to search '{query}'"
            }
        
        # When NO degree, NO experience, and NO query are selected (Initial Directory View):
        return {
            "isEligible": True,
            "eligibilityStatus": "Unchecked",
            "degreeMatch": None,
            "experienceMatch": None,
            "matchScore": None,
            "verdictReason": "Select your Degree or Experience above to evaluate AI criteria eligibility."
        }
        
    norm_deg = [d.lower() for d in job.get("normalizedDegrees", [])]
    raw_qual = (job.get("rawQualification", "") or "").lower()
    req_deg = (job.get("reqDegree", "") or "").lower()
    inelig_deg = [d.lower() for d in job.get("ineligibleDegrees", [])]
    
    # Hard Filter 1: Degree Check
    degree_matched = False
    degree_reason = ""
    
    # Check if candidate degree is explicitly blacklisted (negative criteria)
    if any(cand_deg in d for d in inelig_deg):
        degree_matched = False
        degree_reason = f"Not Eligible — {candidate_degree} is explicitly barred for this post as per notification restriction."
    elif cand_deg == "mca":
        # Check B.Tech/Engineering strictly required (like TGC-145, Navy B.Tech, UPSC ESE)
        is_btech_only = any(b in norm_deg or b in raw_qual or b in req_deg for b in ["b.tech", "be", "b.e", "engineering"]) and not any(m in norm_deg or m in raw_qual or m in req_deg for m in ["mca", "computer", "it", "pg", "post graduate"])
        is_ca_only = any(c in raw_qual or c in req_deg for c in ["ca", "chartered accountant", "cma"])
        
        if is_btech_only:
            degree_matched = False
            degree_reason = f"Not Eligible — MCA is not listed as an accepted qualification for this post (Requires B.Tech / BE in Engineering)."
        elif is_ca_only:
            degree_matched = False
            degree_reason = f"Not Eligible — Post strictly requires Chartered Accountant (CA); MCA is not accepted."
        elif any(k in norm_deg or k in raw_qual or k in req_deg for k in ["mca", "master of computer applications", "m.sc it", "msc it", "post graduate", "pg in computer"]):
            degree_matched = True
            degree_reason = "Degree Matched: MCA is accepted for this position."
        elif any(k in raw_qual or k in req_deg for k in ["graduate", "any degree", "degree in any", "bachelor"]):
            degree_matched = True
            degree_reason = "Degree Matched: MCA satisfies graduation criteria."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — MCA does not match required qualification: {job.get('reqDegree')}."
    elif cand_deg in ["b.tech cs", "be", "engineering", "b.tech"]:
        is_ca_only = any(c in raw_qual or c in req_deg for c in ["ca", "chartered accountant", "cma"])
        if is_ca_only:
            degree_matched = False
            degree_reason = f"Not Eligible — Role requires Chartered Accountant (CA); Engineering degree not accepted."
        elif any(b in norm_deg or b in raw_qual or b in req_deg for b in ["b.tech", "be", "b.e", "engineering", "graduate", "degree"]):
            degree_matched = True
            degree_reason = "Degree Matched: B.Tech / BE Engineering accepted."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — B.Tech/BE does not match {job.get('reqDegree')}."
    elif cand_deg in ["10th pass", "10th", "matric", "high school"]:
        if any(d in inelig_deg for d in ["10th", "matric"]):
            degree_matched = False
            degree_reason = "Ineligible: 10th pass not accepted."
        elif any(k in norm_deg or k in raw_qual or k in req_deg for k in ["10th", "matric", "high school", "sslc"]):
            degree_matched = True
            degree_reason = "Degree Matched: 10th Pass accepted."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — Requires higher qualification ({job.get('reqDegree')})."
    elif cand_deg in ["12th pass", "12th", "intermediate"]:
        if any(k in raw_qual or k in req_deg for k in ["12th", "intermediate", "hsc", "10th"]):
            degree_matched = True
            degree_reason = "Degree Matched: 12th Pass accepted."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — Requires higher qualification ({job.get('reqDegree')})."
    elif cand_deg == "diploma":
        if any(k in norm_deg or k in raw_qual or k in req_deg for k in ["diploma", "polytechnic"]):
            degree_matched = True
            degree_reason = "Degree Matched: Diploma accepted."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — Requires {job.get('reqDegree')}."
    elif cand_deg == "iti":
        if any(k in norm_deg or k in raw_qual or k in req_deg for k in ["iti", "tradesman", "trade"]):
            degree_matched = True
            degree_reason = "Degree Matched: ITI accepted."
        else:
            degree_matched = False
            degree_reason = f"Not Eligible — Requires {job.get('reqDegree')}."
    else:
        # General matching
        degree_matched = any(cand_deg in d for d in norm_deg) or cand_deg in raw_qual or cand_deg in req_deg
        degree_reason = f"Degree Matched: {candidate_degree} accepted." if degree_matched else f"Not Eligible — {candidate_degree} does not match {job.get('reqDegree')}."
        
    # Hard Filter 2: Experience Check
    exp_matched = True
    exp_reason = "Experience requirement satisfied."
    req_exp = job.get("reqExpNum", 0.0)
    if candidate_exp is not None and candidate_exp >= 0:
        if candidate_exp < req_exp:
            exp_matched = False
            exp_reason = f"Ineligible: Post requires minimum {req_exp} yrs experience (Candidate has {candidate_exp} yrs)."
            
    # Semantic Match Score
    raw_sim = 0.85
    if query_vector is not None and job_vector is not None:
        raw_sim = max(0.0, float(compute_cosine_similarity(query_vector, job_vector)))
    elif query_vector is not None and "vector" in job:
        j_vec = np.array(job["vector"])
        raw_sim = max(0.0, float(compute_cosine_similarity(query_vector, j_vec)))
    elif query:
        q = query.lower()
        if q in job.get("title", "").lower() or q in job.get("department", "").lower() or any(q in t.lower() for t in job.get("tags", [])):
            raw_sim = 0.90
        else:
            raw_sim = 0.50
            
    # Final AI Reasoning Synthesis
    if degree_matched and exp_matched:
        final_score = max(60, min(99, int(round(raw_sim * 100))))
        return {
            "isEligible": True,
            "eligibilityStatus": "Eligible",
            "degreeMatch": True,
            "experienceMatch": True,
            "matchScore": final_score,
            "verdictReason": f"Eligible: {degree_reason} {exp_reason}".strip()
        }
    else:
        # HARD FILTER FAILED!
        # Penalize match score strictly to 5% - 20%!
        penalized_score = max(5, min(20, int(round(raw_sim * 20))))
        fail_reasons = []
        if not degree_matched:
            fail_reasons.append(degree_reason)
        if not exp_matched:
            fail_reasons.append(exp_reason)
        return {
            "isEligible": False,
            "eligibilityStatus": "Ineligible (Criteria Mismatch)",
            "degreeMatch": degree_matched,
            "experienceMatch": exp_matched,
            "matchScore": penalized_score,
            "verdictReason": " | ".join(fail_reasons)
        }


def parse_and_evaluate_job_date(raw_date: str, ref_date: Optional[date] = None) -> tuple[bool, str, Optional[date]]:
    """
    Dynamically parses a job deadline date and evaluates whether it is expired
    relative to today's date. Also computes human-readable remaining days in real time.
    Returns: (is_expired: bool, display_date_str: str, parsed_date_obj: Optional[date])
    """
    if not ref_date:
        ref_date = date.today()

    if not raw_date or not raw_date.strip():
        return False, "Ongoing", None

    s = raw_date.strip()

    # 1. Check if 'expired' is explicitly in text
    if "expired" in s.lower():
        m = re.search(r'(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})', s)
        if m:
            d, mth, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if yr < 100:
                yr += 2000
            try:
                dt = date(yr, mth, d)
                return True, f"{dt.strftime('%d-%m-%Y')} (Expired)", dt
            except Exception:
                pass
        return True, f"{s}" if "expired" in s.lower() else f"{s} (Expired)", None

    # 2. Check DD-MM-YY, DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
    m = re.search(r'(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})', s)
    if m:
        d, mth, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if yr < 100:
            yr += 2000
        try:
            dt = date(yr, mth, d)
            diff = (dt - ref_date).days
            if diff < 0:
                return True, f"{dt.strftime('%d-%m-%Y')} (Expired)", dt
            elif diff == 0:
                return False, f"{dt.strftime('%d-%m-%Y')} (Ends Today!)", dt
            elif diff == 1:
                return False, f"{dt.strftime('%d-%m-%Y')} (1 day left)", dt
            else:
                return False, f"{dt.strftime('%d-%m-%Y')} ({diff} days left)", dt
        except Exception:
            pass

    # 3. Check verbal dates like 'Nov 15, 2026', '15 Nov 2026', '2026-10-07'
    for fmt in ('%b %d, %Y', '%d %b %Y', '%B %d, %Y', '%d %B %Y', '%Y-%m-%d'):
        clean_s = re.sub(r'\(.*?\)', '', s).strip()
        try:
            dt = datetime.strptime(clean_s, fmt).date()
            diff = (dt - ref_date).days
            if diff < 0:
                return True, f"{dt.strftime('%d-%m-%Y')} (Expired)", dt
            elif diff == 0:
                return False, f"{dt.strftime('%d-%m-%Y')} (Ends Today!)", dt
            elif diff == 1:
                return False, f"{dt.strftime('%d-%m-%Y')} (1 day left)", dt
            else:
                return False, f"{dt.strftime('%d-%m-%Y')} ({diff} days left)", dt
        except Exception:
            pass

    return False, s, None


@app.get("/api/jobs/search")
def search_jobs(
    degree: Optional[str] = "All",
    experience: Optional[float] = None,
    sector: Optional[str] = "All",
    query: Optional[str] = "",
    skip: Optional[int] = 0,
    limit: Optional[int] = 10,
    only_verified: Optional[bool] = False,
    only_eligible: Optional[bool] = True
):
    import database
    from domain_validator import audit_job_security

    # 1. Fetch candidate jobs from SQLite (with indexed filters for expiry, sector, experience)
    candidate_records = database.get_jobs_from_db(
        sector=sector,
        experience=experience,
        only_verified=only_verified,
        include_expired=False
    )

    model = get_embedding_model() if query else None
    query_vector = None
    if query and model:
        try:
            query_vector = model.encode(query)
        except Exception:
            query_vector = None

    seen_signatures = set()
    filtered_jobs = []

    for job, job_vec in candidate_records:
        # Robust Deduplication Guardrail (ignoring shifting '(X days left)' date strings)
        t_clean = re.sub(r'[^a-z0-9]', '', str(job.get('title', '')).lower())
        d_clean = re.sub(r'[^a-z0-9]', '', str(job.get('department', '')).lower())
        d_core = re.sub(r'\d+posts?', '', d_clean).strip()
        sig = (t_clean, d_core)
        if sig in seen_signatures:
            continue
        seen_signatures.add(sig)

        # Zero-Trust Security: Drop any record flagged with phishing or quarantined
        if job.get("isQuarantined", False):
            continue

        # If only_verified is enabled, strictly filter out un-enriched 'Refer Notification' jobs
        sal_text = str(job.get("salary") or "").lower()
        age_text = str(job.get("ageLimit") or "").lower()
        if only_verified and ("refer" in sal_text and "refer" in age_text):
            continue

        # Guardrail: If job link is not verified official, neutralize direct application links
        if not job.get("isVerifiedOfficial", False):
            job["applyUrl"] = "#"
            job["verifiedDomain"] = ""

        # Query relevance check (Comprehensive Haystack + Vector Similarity)
        if query:
            q = query.lower().strip()
            text_haystack = f"{job.get('title', '')} {job.get('department', '')} {job.get('sector', '')} {job.get('location', '')} {job.get('reqDegree', '')} {' '.join(job.get('tags', []))}".lower()
            keyword_match = (q in text_haystack) or any(token in text_haystack for token in q.split() if len(token) > 2)
            
            if not keyword_match:
                if query_vector is not None and job_vec is not None:
                    denom = (np.linalg.norm(query_vector) * np.linalg.norm(job_vec)) + 1e-9
                    sim = float(np.dot(query_vector, job_vec) / denom)
                    if sim < 0.44:
                        continue
                else:
                    continue

        elig = check_candidate_eligibility_for_job(
            candidate_degree=degree,
            candidate_exp=experience,
            query=query,
            job=job,
            query_vector=query_vector,
            job_vector=job_vec
        )

        # Strict Eligibility Filter:
        # When only_eligible=True (default), never show jobs that candidate is unqualified for
        if only_eligible and not elig["isEligible"]:
            continue

        job["isEligible"] = elig["isEligible"]
        job["eligibilityStatus"] = elig["eligibilityStatus"]
        job["degreeMatch"] = elig["degreeMatch"]
        job["experienceMatch"] = elig["experienceMatch"]
        job["matchScore"] = elig["matchScore"]
        job["verdictReason"] = elig["verdictReason"]
        job["candidateDegree"] = degree
        job["candidateExperience"] = experience

        filtered_jobs.append(job)

    # Sort eligible jobs first (True > False), then direct title matches, then enriched richness, then by matchScore descending
    def job_sort_key(x):
        is_elig = 1 if x.get("isEligible", True) else 0
        title_hit = 0
        if query:
            q_clean = query.lower().strip()
            if q_clean in x.get("title", "").lower():
                title_hit = 2
            elif any(token in x.get("title", "").lower() for token in q_clean.split() if len(token) > 2):
                title_hit = 1
        sal = str(x.get("salary") or "").lower()
        has_real_sal = 1 if sal and "refer" not in sal else 0
        age = str(x.get("ageLimit") or "").lower()
        has_real_age = 1 if age and "refer" not in age else 0
        loc = str(x.get("location") or "").lower()
        has_real_loc = 1 if loc and "refer" not in loc and "all india" not in loc else 0
        pos_count = len(x.get("positions", []))
        richness = (has_real_sal * 4) + (has_real_age * 2) + has_real_loc + (2 if pos_count > 1 else 0)
        return (is_elig, title_hit, richness, x.get("matchScore") or 0)

    filtered_jobs.sort(key=job_sort_key, reverse=True)
    
    # Apply pagination
    paginated_jobs = filtered_jobs[skip : skip + limit]
    
    return {
        "total": len(filtered_jobs),
        "jobs": paginated_jobs,
        "skip": skip,
        "limit": limit
    }


@app.post("/api/jobs/sync")
def sync_jobs_now(background_tasks: BackgroundTasks):
    """Triggers real-time live scraping & auto-expiry sync asynchronously."""
    import live_sync
    background_tasks.add_task(live_sync.run_sync_cycle, embedding_model=get_embedding_model())
    return {
        "status": "initiated",
        "message": "Live incremental job sync and auto-expiry task has been started in the background."
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)



