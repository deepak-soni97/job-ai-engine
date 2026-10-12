import sqlite3
import json
import re
from urllib.parse import urlparse
from domain_validator import audit_job_security

def extract_smart_location(title: str, dept: str, text: str) -> str:
    combined = f"{title} {dept} {text}".lower()
    
    if any(k in combined for k in ["angrau", "maruteru", "west godavari"]):
        return "Maruteru, West Godavari District, Andhra Pradesh"
    elif any(k in combined for k in ["appsc", "apcob", "andhra university", "svims", "tirupati"]):
        return "Andhra Pradesh"
    elif any(k in combined for k in ["dredging", "dci"]):
        return "Visakhapatnam, Andhra Pradesh"
    elif any(k in combined for k in ["aiims rishikesh", "rishikesh", "ujvnl", "dehradun", "ukpsc", "uksssc", "uttarakhand"]):
        return "Uttarakhand"
    elif any(k in combined for k in ["iit madras", "iitm", "indbank", "nandanam", "chennai", "tmb", "tuticorin", "tnpsc"]):
        return "Chennai, Tamil Nadu"
    elif any(k in combined for k in ["iit bhu", "iit (bhu)", "varanasi"]):
        return "Varanasi, Uttar Pradesh"
    elif any(k in combined for k in ["iit kanpur", "kanpur"]):
        return "Kanpur, Uttar Pradesh"
    elif any(k in combined for k in ["upsssc", "uppsc", "lucknow", "prayagraj", "uttar pradesh"]):
        return "Uttar Pradesh"
    elif any(k in combined for k in ["iim bangalore", "bengaluru", "bangalore", "kpsc", "karnataka"]):
        return "Bengaluru, Karnataka"
    elif any(k in combined for k in ["cdac", "pune"]):
        return "Pune, Maharashtra"
    elif any(k in combined for k in ["iit bombay", "mumbai", "maharashtra", "mpsc"]):
        return "Mumbai, Maharashtra"
    elif any(k in combined for k in ["sdhm kerala", "mgu", "kottayam", "thiruvananthapuram", "kerala"]):
        return "Kerala"
    elif any(k in combined for k in ["balod", "zila panchayat balod"]):
        return "Balod, Chhattisgarh"
    elif any(k in combined for k in ["surajpur", "district panchayat surajpur"]):
        return "Surajpur, Chhattisgarh"
    elif any(k in combined for k in ["chhattisgarh", "cgpsc", "raipur"]):
        return "Chhattisgarh"
    elif any(k in combined for k in ["mpsedc", "peb.mp", "esb.mp", "mppolice", "bhopal", "indore", "madhya pradesh"]):
        return "Madhya Pradesh"
    elif any(k in combined for k in ["pmbi", "janaushadhi", "gail", "delhi", "new delhi", "aiims delhi"]):
        return "New Delhi / NCR"
    elif any(k in combined for k in ["punjab & sind bank", "pgi chandigarh", "chandigarh", "punjab"]):
        return "Punjab / Chandigarh"
    elif any(k in combined for k in ["sbi", "state bank", "bank of baroda", "bob", "pnb", "canara", "central bank", "bank"]):
        return "Pan India Branches"
    elif any(k in combined for k in ["railway", "rrb"]):
        return "All India (Zonal Railways)"
    elif any(k in combined for k in ["defence", "army", "navy", "air force"]):
        return "All India (Armed Forces Bases)"
    else:
        return "All India"

def extract_smart_selection_mode(title: str, dept: str, text: str) -> str:
    combined = f"{title} {dept} {text}".lower()
    
    # 1. Walk-in Interview
    if any(k in combined for k in ["walk-in", "walk in", "walkin"]) or "angrau" in combined:
        return "Walk-in Interview"
        
    # 2. Executive / Faculty / Specialist / Direct Interview
    if any(k in combined for k in [
        "director", "executive director", "dean", "professor", "associate professor", 
        "teaching associate", "teaching assistant", "part time teacher", "guest faculty",
        "research associate", "consultant", "specialist cadre officer", "ciso",
        "credit analyst", "wealth executive", "medical officer", "doctor", "specialist officer",
        "physiotherapist", "faculty", "cbdo"
    ]):
        return "Direct Interview"
        
    # 3. Exam Based
    if any(k in combined for k in [
        "group i", "group ii", "group 1", "group 2", "prelims", "mains", 
        "written exam", "written test", "cbt", "constable", "police", 
        "clerk", "je", "junior engineer", "assistant", "inspector", "sub inspector",
        "ssc", "upsc civil services", "trainee"
    ]):
        return "Written Exam"
        
    # 4. Apprentice / Merit Based
    if any(k in combined for k in ["apprentice", "apprenticeship", "merit"]):
        return "Merit Based"
        
    return "Direct Interview" if any(k in combined for k in ["interview", "viva"]) else "Written Exam"

def extract_smart_salary(title: str, dept: str, text: str, sector: str) -> str:
    combined = f"{title} {dept} {text}".lower()
    
    # Check explicit numbers in text
    m_lakh_range = re.search(r'(?:Rs\.?|₹|INR)?\s*[\d,.]+\s*(?:to|[-–])\s*(?:Rs\.?|₹)?\s*[\d,.]+\s*(?:lakh|lac|crore|lpa)\s*(?:p\.a\.|\s*CTC|\s*per annum)?', text, re.I)
    if m_lakh_range:
        return m_lakh_range.group(0).strip()

    m_lakh_single = re.search(r'(?:Rs\.?|₹|INR)\s*[\d,.]+\s*(?:lakhs?|lacs?|crores?|lpa)(?:\s*(?:per\s*annum|p\.a\.?|CTC|/\s*year))?', text, re.I)
    if m_lakh_single:
        return m_lakh_single.group(0).strip()

    m_lakh_word = re.search(r'\b[\d,.]+\s*(?:lakhs?|lacs?|crores?|lpa)\s*(?:per\s*annum|p\.a\.?|CTC|/\s*year)', text, re.I)
    if m_lakh_word:
        return f"₹{m_lakh_word.group(0).strip()}"

    m_pm = re.search(r'(?:Rs\.?|₹)\s*([\d,]+)(?:\s*/-)?(?:\s*per month|\s*p\.m\.|\s*pm|\s*/\s*month)', text, re.I)
    if m_pm:
        return f"Rs. {m_pm.group(1)} / Month"

    # Domain specific exact real scales
    if "physical director" in combined and "angrau" in combined:
        return "Rs. 30,000 / Month"
    elif "teaching associate" in combined and "angrau" in combined:
        return "Rs. 35,000 - ₹54,000 / Month"
    elif "research associate" in combined:
        return "Rs. 47,000 - ₹54,000 / Month + HRA"
    elif "part time teacher" in combined or "lspm" in combined:
        return "Rs. 25,000 - ₹35,000 / Month"
    elif "director" in combined and "iit" in combined:
        return "Fixed ₹2,25,000 / Month (Apex Scale)"
    elif "director" in combined and "ujvnl" in combined:
        return "Level 14 (₹1,44,200 - ₹2,18,200)"
    elif "executive director" in combined and "dredging" in combined:
        return "IDA Scale ₹1,20,000 - ₹2,80,000 (CTC ₹50 - 55 Lakh p.a.)"
    elif "executive trainee" in combined and "gail" in combined:
        return "E-2 Grade ₹60,000 - ₹1,80,000 (CTC ₹18 Lakh p.a.)"
    else:
        return "Refer Notification"

def extract_smart_qualification(title: str, raw_qual: str) -> str:
    t_lower = title.lower()
    if "physical director" in t_lower:
        return "Bachelor Degree in Physical Education (B.P.Ed)"
    elif "teaching associate" in t_lower or "teaching assistant" in t_lower:
        return "Master Degree / Ph.D in Agriculture / Allied Discipline"
    elif "research associate" in t_lower:
        return "Ph.D or Master Degree with Research Experience"
    elif "executive trainee" in t_lower:
        return "B.Tech / BE in Engineering"
    elif "cssd officer" in t_lower:
        return "Degree in Microbiology / Medical Technology"
    elif "junior executive" in t_lower:
        return "Any Bachelors Degree / B.Tech / MBA"
    elif "director" in t_lower:
        return "Ph.D / Master Degree with 10-15 Yrs Experience"
    elif raw_qual and raw_qual.strip():
        return raw_qual.strip()
    else:
        return "Graduate in Relevant Discipline"

def extract_smart_age(title: str, text: str) -> str:
    combined = f"{title} {text}".lower()
    if "physical director" in combined and "angrau" in combined:
        return "Max 40 (Men) / 45 (Women)"
    elif "executive trainee" in combined and "gail" in combined:
        return "18 - 28 Years"
    elif "director" in combined or "executive director" in combined:
        return "45 - 57 Years"
    elif "group i" in combined or "appsc" in combined:
        return "18 - 42 Years"
    elif "police" in combined or "constable" in combined:
        return "18 - 25 Years"
    elif any(b in combined for b in ["bank", "sbi", "bob"]):
        return "21 - 38 Years"
    elif "associate" in combined or "teacher" in combined or "faculty" in combined:
        return "21 - 42 Years"
    else:
        return "Refer Notification"

def extract_smart_sector(dept: str, location: str) -> str:
    dept_lower = dept.lower()
    if any(k in dept_lower for k in ["angrau", "mgu", "university", "polytechnic"]):
        return "State University / College"
    elif any(k in dept_lower for k in ["appsc", "upsssc", "uppsc", "mppeb", "esb"]):
        return "State Public Service Commission"
    elif any(k in dept_lower for k in ["aiims", "iit", "iim", "nit", "cdac"]):
        return "Premier Central Institute"
    elif any(k in dept_lower for k in ["gail", "dredging", "dci", "ujvnl", "pmbi", "bhel", "ntpc", "iocl"]):
        return "Central / State PSU"
    elif any(k in dept_lower for k in ["sbi", "bank of baroda", "punjab & sind", "canara", "central bank", "tmb", "bank"]):
        return "Banking / Financial PSU"
    elif "andhra" in location.lower():
        return "State Govt (Andhra Pradesh)"
    elif "uttarakhand" in location.lower():
        return "State Govt (Uttarakhand)"
    elif "tamil nadu" in location.lower():
        return "State Govt (Tamil Nadu)"
    elif "uttar pradesh" in location.lower():
        return "State Govt (Uttar Pradesh)"
    elif "kerala" in location.lower():
        return "State Govt (Kerala)"
    elif "chhattisgarh" in location.lower():
        return "State Govt (Chhattisgarh)"
    elif "madhya pradesh" in location.lower():
        return "State Govt (Madhya Pradesh)"
    else:
        return "Central Govt"

def run_enrichment_and_deduplication():
    print("Connecting to jobs.db...")
    conn = sqlite3.connect("jobs.db")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute("SELECT * FROM jobs")
    all_rows = c.fetchall()
    print(f"Total rows currently in DB: {len(all_rows)}")
    
    # 1. Deduplicate by unique key: (title_clean, dept_clean, raw_date_clean)
    unique_jobs = {}
    for r in all_rows:
        t_clean = re.sub(r'[^a-z0-9]', '', (r['title'] or '').lower())
        d_clean = re.sub(r'[^a-z0-9]', '', (r['department'] or '').lower())
        date_clean = re.sub(r'[^a-z0-9]', '', (r['raw_date'] or '').lower())
        key = (t_clean, d_clean, date_clean)
        
        # Prefer row with more data or verified official
        if key not in unique_jobs:
            unique_jobs[key] = dict(r)
        else:
            existing = unique_jobs[key]
            if r['is_verified_official'] and not existing.get('is_verified_official'):
                unique_jobs[key] = dict(r)
                
    print(f"Distinct unique jobs identified: {len(unique_jobs)}")
    
    # 2. Enrich each job dynamically
    enriched_jobs = []
    for key, j in unique_jobs.items():
        title = j.get('title') or ''
        dept = j.get('department') or ''
        pdf_url = j.get('pdf_url') or ''
        apply_url = j.get('apply_url') or ''
        raw_qual = j.get('req_degree') or ''
        text_context = f"{title} {dept} {j.get('apply_procedure', '')} {pdf_url}"
        
        # Smart Dynamic Location
        location = extract_smart_location(title, dept, text_context)
        
        # Smart Dynamic Selection Mode
        selection_mode = extract_smart_selection_mode(title, dept, text_context)
        
        # Smart Dynamic Sector
        sector = extract_smart_sector(dept, location)
        
        # Smart Dynamic Salary
        salary = extract_smart_salary(title, dept, text_context, sector)
        
        # Smart Dynamic Qualification
        req_degree = extract_smart_qualification(title, raw_qual)
        
        # Smart Dynamic Age
        age_limit = extract_smart_age(title, text_context)
        
        # Experience
        req_exp = j.get('req_exp') or 'Fresher / 0 Years'
        req_exp_num = float(j.get('req_exp_num') or 0.0)
        if "director" in title.lower() and "physical" not in title.lower():
            if req_exp_num < 10.0:
                req_exp = "Min 15 Years"
                req_exp_num = 15.0
                
        # Auto-resolve official portal URLs when apply_url is missing
        if not apply_url or apply_url == "#":
            dept_low = f"{dept} {title}".lower()
            for pattern, portal_url in [
                (r"\bappsc\b", "https://psc.ap.gov.in"),
                (r"\bpmbi\b", "https://janaushadhi.gov.in"),
                (r"\bupsssc\b", "https://upsssc.gov.in"),
                (r"\buppsc\b", "https://uppsc.up.nic.in"),
                (r"\b(mppeb|esb mp|esb\.mp)\b", "https://esb.mp.gov.in"),
                (r"\bmpsedc\b", "https://mpsedc.mp.gov.in"),
                (r"\b(uksssc|sssc uk)\b", "https://sssc.uk.gov.in"),
                (r"\bukpsc\b", "https://psc.uk.gov.in"),
                (r"\bcgpsc\b", "https://psc.cg.gov.in"),
                (r"\btmb\b", "https://www.tmb.in"),
                (r"\bangrau\b", "https://angrau.ac.in"),
                (r"\b(bank of baroda|bob)\b", "https://bankofbaroda.in"),
                (r"\bpunjab & sind\b", "https://punjabandsind.bank.in"),
                (r"\bsbi\b", "https://sbi.bank.in"),
                (r"\bcanara bank\b", "https://canarabank.com"),
                (r"\bcentral bank\b", "https://centralbank.bank.in"),
                (r"\baiims rishikesh\b", "https://aiimsrishikesh.edu.in"),
                (r"\biit madras\b", "https://iitm.ac.in"),
                (r"\biit (bhu)\b", "https://iitbhu.ac.in"),
                (r"\bujvnl\b", "https://ujvnl.com"),
                (r"\bgail\b", "https://gailonline.com"),
                (r"\b(dci|dredging)\b", "https://dredge-india.com")
            ]:
                if re.search(pattern, dept_low):
                    apply_url = portal_url
                    break

        # Zero-Trust domain validation
        job_for_audit = {
            'title': title,
            'department': dept,
            'applyUrl': apply_url,
            'pdfUrl': pdf_url,
            'applyProcedure': j.get('apply_procedure', ''),
            'feeText': j.get('fee_text', 'NA'),
            'raw_desc': title
        }
        audited = audit_job_security(job_for_audit)
        
        j['location'] = location
        j['selection_mode'] = selection_mode
        j['sector'] = sector
        j['salary'] = salary
        j['req_degree'] = req_degree
        j['age_limit'] = age_limit
        j['req_exp'] = req_exp
        j['req_exp_num'] = req_exp_num
        j['apply_url'] = audited.get('applyUrl', '#')
        j['is_verified_official'] = 1 if audited.get('isVerifiedOfficial') else 0
        j['verified_domain'] = audited.get('verifiedDomain', '')
        
        # Re-structure positions modal data
        positions = [
            {
                'sNo': 1,
                'postName': title,
                'vacancies': j.get('vacancies') or '1 Post',
                'compensation': salary,
                'minQualification': req_degree,
                'experience': req_exp,
                'age': age_limit,
                'placeOfPosting': location,
                'selectionMode': selection_mode
            }
        ]
        j['positions'] = json.dumps(positions, ensure_ascii=False)
        
        enriched_jobs.append(j)

    # 3. Clean up and re-populate jobs.db with clean deduplicated & enriched data
    print("Purging duplicates and rebuilding jobs.db...")
    c.execute("DELETE FROM jobs")
    
    for j in enriched_jobs:
        c.execute("""
        INSERT INTO jobs (
            id, title, department, sector, selection_mode,
            raw_date, deadline_date, is_expired, req_degree,
            req_exp, req_exp_num, salary, vacancies, age_limit,
            location, fee_text, apply_procedure, apply_url, pdf_url,
            tags, documents, positions, is_verified_official, verified_domain,
            embedding
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?
        )
        """, (
            j.get('id'),
            j.get('title'),
            j.get('department'),
            j.get('sector'),
            j.get('selection_mode'),
            j.get('raw_date'),
            j.get('deadline_date'),
            j.get('is_expired', 0),
            j.get('req_degree'),
            j.get('req_exp'),
            j.get('req_exp_num', 0.0),
            j.get('salary'),
            j.get('vacancies'),
            j.get('age_limit'),
            j.get('location'),
            j.get('fee_text'),
            j.get('apply_procedure'),
            j.get('apply_url'),
            j.get('pdf_url'),
            j.get('tags'),
            j.get('documents'),
            j.get('positions'),
            j.get('is_verified_official'),
            j.get('verified_domain'),
            j.get('embedding')
        ))
        
    conn.commit()
    print(f"Successfully saved {len(enriched_jobs)} cleanly enriched jobs into jobs.db!")
    
    # 4. Synchronize jobs_data.json
    export_jobs = []
    for j in enriched_jobs:
        d = dict(j)
        if 'embedding' in d:
            del d['embedding']
        try:
            d['tags'] = json.loads(d['tags']) if isinstance(d.get('tags'), str) else d.get('tags', [])
            d['documents'] = json.loads(d['documents']) if isinstance(d.get('documents'), str) else d.get('documents', [])
            d['positions'] = json.loads(d['positions']) if isinstance(d.get('positions'), str) else d.get('positions', [])
        except Exception:
            pass
        d['isVerifiedOfficial'] = bool(d.get('is_verified_official'))
        d['verifiedDomain'] = d.get('verified_domain', '')
        d['selectionMode'] = d.get('selection_mode')
        d['reqExpNum'] = d.get('req_exp_num')
        d['reqDegree'] = d.get('req_degree')
        d['reqExp'] = d.get('req_exp')
        d['ageLimit'] = d.get('age_limit')
        d['applyUrl'] = d.get('apply_url')
        d['pdfUrl'] = d.get('pdf_url')
        d['feeText'] = d.get('fee_text')
        d['applyProcedure'] = d.get('apply_procedure')
        export_jobs.append(d)
        
    with open("jobs_data.json", "w", encoding="utf-8") as f:
        json.dump(export_jobs, f, indent=4, ensure_ascii=False)
    print("Synchronized jobs_data.json cleanly.")

if __name__ == "__main__":
    run_enrichment_and_deduplication()
