import httpx
from bs4 import BeautifulSoup
import json
import uuid
import re
from datetime import datetime, date
from typing import List, Dict, Any, Tuple
import database
from domain_validator import audit_job_security
from enrich_jobs import extract_salary, extract_age, extract_location

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

SYNC_URLS = [
    "https://govtjobguru.in/government-jobs-openings/",
    "https://govtjobguru.in/govt-jobs-state-wise/govt-jobs-mp/",
    "https://govtjobguru.in/govt-jobs-state-wise/govt-jobs-up/",
]

def run_sync_cycle(embedding_model=None) -> Dict[str, Any]:
    """
    Executes a complete real-time sync cycle:
    1. Auto-expires outdated jobs in SQLite.
    2. Incrementally fetches new job notices from live sources.
    3. Validates domains, extracts multi-post details and salaries.
    4. Upserts fresh jobs into SQLite database.
    """
    print(f"[{datetime.now().isoformat()}] Starting Live Job Sync Cycle...")
    
    # 1. Auto-expire jobs in DB
    expired_count = database.auto_expire_jobs()
    print(f"Auto-expired {expired_count} outdated job postings in SQLite.")

    # 2. Get existing signatures from DB to avoid duplicate scraping
    existing_signatures = set()
    with database.get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title, department, raw_date FROM jobs;")
        for row in cursor.fetchall():
            t = re.sub(r'[^a-z0-9]', '', str(row[0]).lower())
            d = re.sub(r'[^a-z0-9]', '', str(row[1]).lower())
            dt = re.sub(r'[^a-z0-9]', '', str(row[2]).lower())
            existing_signatures.add((t, d, dt))

    new_jobs_added = 0
    errors = []

    for url in SYNC_URLS:
        try:
            resp = httpx.get(url, headers=HEADERS, timeout=12.0)
            if resp.status_code != 200:
                continue
            soup = BeautifulSoup(resp.text, 'html.parser')
            tables = soup.find_all('table')
            for table in tables:
                rows = table.find_all('tr')
                for row in rows[1:]:
                    cols = row.find_all('td')
                    if len(cols) >= 5:
                        org = cols[0].get_text(separator=" ", strip=True)
                        vacancies = cols[1].get_text(separator=" ", strip=True)
                        title = cols[2].get_text(separator=" ", strip=True)
                        raw_qual = cols[3].get_text(separator=" ", strip=True)
                        raw_date = cols[4].get_text(separator=" ", strip=True)

                        org = re.sub(r'\s+New\b', '', org, flags=re.I).strip()
                        clean_vac = vacancies.strip()
                        if clean_vac in ["-", "--", "NA", ""]:
                            dept = org
                        elif clean_vac.lower().endswith("posts"):
                            dept = f"{org} - {clean_vac}"
                        else:
                            dept = f"{org} - {clean_vac} Posts"

                        sig = (
                            re.sub(r'[^a-z0-9]', '', title.lower()),
                            re.sub(r'[^a-z0-9]', '', dept.lower()),
                            re.sub(r'[^a-z0-9]', '', raw_date.lower())
                        )
                        if sig in existing_signatures:
                            continue

                        # Extract details & links
                        pdf_link = "#"
                        apply_link = "#"
                        for a in row.find_all('a', href=True):
                            href = a['href']
                            txt = a.get_text().lower()
                            if "notification" in txt or "pdf" in href.lower():
                                pdf_link = href
                            elif "apply" in txt or "registration" in txt:
                                apply_link = href

                        # Parse deadline
                        iso_deadline, is_exp, display_date = database.parse_deadline_date(raw_date)
                        if is_exp:
                            continue # Do not ingest expired notices

                        from smart_enricher import (
                            extract_smart_location,
                            extract_smart_selection_mode,
                            extract_smart_salary,
                            extract_smart_age,
                            extract_smart_qualification,
                            extract_smart_sector
                        )

                        full_text = f"{title} {dept} {raw_qual}"
                        location = extract_smart_location(title, dept, full_text)
                        sector = extract_smart_sector(dept, location)
                        selection_mode = extract_smart_selection_mode(title, dept, full_text)
                        salary = extract_smart_salary(title, dept, full_text, sector)
                        age_limit = extract_smart_age(title, full_text)
                        smart_qual = extract_smart_qualification(title, raw_qual)

                        job_id = str(uuid.uuid4())
                        job_record = {
                            "id": job_id,
                            "title": title,
                            "department": dept,
                            "sector": sector,
                            "selectionMode": selection_mode,
                            "date": display_date,
                            "rawQualification": raw_qual,
                            "reqDegree": smart_qual,
                            "reqExp": "Fresher / 0 Years",
                            "reqExpNum": 0.0,
                            "salary": salary,
                            "vacancies": clean_vac if clean_vac not in ["-", "--", ""] else "1 Post",
                            "ageLimit": age_limit,
                            "location": location,
                            "feeText": "Nil",
                            "applyProcedure": "Apply online via official portal.",
                            "applyUrl": apply_link,
                            "pdfUrl": pdf_link,
                            "tags": [t.strip() for t in title.split(",")[:4] if t.strip()],
                            "documents": ["Degree Certificate", "Govt ID", "Address Proof"],
                            "positions": [{
                                "sNo": 1,
                                "postName": title,
                                "vacancies": clean_vac if clean_vac not in ["-", "--", ""] else "1 Post",
                                "compensation": salary,
                                "minQualification": smart_qual,
                                "experience": "Fresher / 0 Years",
                                "age": age_limit,
                                "placeOfPosting": location,
                                "selectionMode": selection_mode
                            }],
                            "isVerifiedOfficial": False,
                            "verifiedDomain": ""
                        }

                        # Domain security audit
                        job_record = audit_job_security(job_record)

                        # Generate vector embedding if model available
                        vec = None
                        if embedding_model:
                            vec_text = f"{title} {dept} {sector} {raw_qual}"
                            vec = embedding_model.encode(vec_text)

                        # Upsert to SQLite
                        database.upsert_job(job_record, embedding_vec=vec)
                        existing_signatures.add(sig)
                        new_jobs_added += 1

        except Exception as e:
            errors.append(f"Error scraping {url}: {str(e)}")

    print(f"[{datetime.now().isoformat()}] Sync complete: {new_jobs_added} new active jobs ingested.")
    return {
        "status": "success",
        "newJobsIngested": new_jobs_added,
        "expiredJobsUpdated": expired_count,
        "errors": errors
    }
