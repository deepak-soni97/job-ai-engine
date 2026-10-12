import json
import re

def extract_salary(text: str, sector: str) -> str:
    # 1. High value salary / CTC range (e.g. Rs 8 to 12 Lakhs p.a.)
    m_range = re.search(r'(?:Rs\.?|INR|₹)?\s*[\d,.]+\s*(?:to|[-–])\s*(?:Rs\.?|INR|₹)?\s*[\d,.]+\s*(?:lakh|lac|crore|lpa|k)?(?:\s*p\.a\.|\s*CTC|\s*per month|\s*per annum|\s*/-)*', text, re.I)
    if m_range and any(k in m_range.group(0).lower() for k in ['lakh', 'lac', 'crore', 'lpa', 'p.a', 'ctc', 'annum']):
        return m_range.group(0).strip()
    
    # 1b. Single amount Lakhs / CTC (e.g. ₹8.85 Lakhs per annum)
    m_single = re.search(r'(?:Rs\.?|INR|₹)\s*[\d,.]+\s*(?:lakhs?|lacs?|crores?|lpa)(?:\s*(?:per\s*annum|p\.a\.?|CTC|/\s*year))?', text, re.I)
    if m_single:
        return m_single.group(0).strip()

    m_single_word = re.search(r'\b[\d,.]+\s*(?:lakhs?|lacs?|crores?|lpa)\s*(?:per\s*annum|p\.a\.?|CTC|/\s*year)', text, re.I)
    if m_single_word:
        return f"₹{m_single_word.group(0).strip()}"
    
    # 2. Official Pay Matrix / Level / Pay Scale
    m2 = re.search(r'(?:Pay Level|Level|Pay Scale|Scale of Pay)[:\s\-]*([^\n\r,;]{5,50})', text, re.I)
    if m2:
        val = m2.group(1).strip()
        if any(c.isdigit() for c in val):
            return f"Pay Scale: {val}"
            
    # 3. Monthly salary range if clearly >= 5000 or includes month/pm
    m3 = re.search(r'(?:Rs\.?|₹)\s*([\d,]+)(?:\s*[-–to/]\s*(?:Rs\.?|₹)?\s*([\d,]+))?(?:\s*/-)?(?:\s*per month|\s*p\.m\.|\s*pm)', text, re.I)
    if m3:
        return m3.group(0).strip()
        
    return "Refer Notification"

def extract_age(text: str, sector: str) -> str:
    m = re.search(r'(?:Age Limit|Age Criteria)[:\s]*([^\n\r,;]{3,35})', text, re.I)
    if m:
        val = m.group(1).strip()
        if any(c.isdigit() for c in val):
            return val
            
    m2 = re.search(r'(\b\d{2}\s*[-–to]\s*\d{2}\s*(?:years|yrs)?\b)', text, re.I)
    if m2:
        return m2.group(0).strip()
        
    return "Refer Notification"

def extract_location(text: str, sector: str, title: str, dept: str) -> str:
    m = re.search(r'(?:Place of Posting|Job Location|Posting Location)[:\s]*([A-Za-z\s,]{3,35})', text, re.I)
    if m:
        loc = m.group(1).strip()
        if len(loc) > 2 and "not" not in loc.lower():
            return loc
            
    sec_lower = (sector or "").lower()
    dept_lower = (dept or "").lower()
    title_lower = (title or "").lower()
    
    if "chennai" in text.lower() or "chennai" in dept_lower:
        return "Chennai"
    elif "bhopal" in dept_lower or "mp" in sec_lower:
        return "Madhya Pradesh (MP)"
    elif "lucknow" in dept_lower or "up" in sec_lower:
        return "Uttar Pradesh (UP)"
    elif "delhi" in dept_lower or "delhi" in text.lower():
        return "New Delhi / NCR"
    elif "mumbai" in dept_lower or "mumbai" in text.lower():
        return "Mumbai, Maharashtra"
    elif "railway" in sec_lower:
        return "All India (Zonal Railways)"
    elif "bank" in sec_lower:
        return "Pan India Branches"
    else:
        return "All India"

def main():
    with open("jobs_data.json", "r", encoding="utf-8") as f:
        jobs = json.load(f)
        
    indbank_job = None
    dredge_job = None
    other_jobs = []
    
    for job in jobs:
        # Check if this is the Indbank job
        if "indbank" in job.get("department", "").lower() or "indbankonline" in job.get("pdfUrl", "").lower():
            indbank_job = job
        elif "dredg" in job.get("department", "").lower() or "dredge-india" in job.get("pdfUrl", "").lower():
            dredge_job = job
        else:
            other_jobs.append(job)
            
    if dredge_job:
        dredge_job["title"] = "Executive Director (Operations & Technical / Finance)"
        dredge_job["department"] = "Dredging Corporation of India Limited (DCI) - 2 Posts"
        dredge_job["salary"] = "IDA Scale ₹1,20,000 - ₹2,80,000 (CTC ₹50 - 55 Lakh p.a.)"
        dredge_job["vacancies"] = "2 Posts"
        dredge_job["ageLimit"] = "45 - 57 Years (Superannuation: 60 Yrs)"
        dredge_job["location"] = "Visakhapatnam, Andhra Pradesh"
        dredge_job["reqDegree"] = "B.Tech/BE Engineering, Dredge Master (Operations) | CA, CMA (Finance)"
        dredge_job["reqExp"] = "Min 25 Years"
        dredge_job["reqExpNum"] = 25.0
        dredge_job["selectionMode"] = "Interview / PPT"
        dredge_job["sector"] = "Central Govt"
        dredge_job["tags"] = ["Executive Director", "Maritime & Ports", "Finance", "Operations", "DCI"]
        dredge_job["feeText"] = "₹1000/- (Non-refundable) | SC/ST/PwD/ExM: Exempted (Nil)"
        dredge_job["applyProcedure"] = "Apply online through DCIL website www.dredge-india.com under Careers from 23.09.2026 to 13.10.2026."
        dredge_job["applyUrl"] = "https://www.dredge-india.com"
        dredge_job["pdfUrl"] = "https://dredge-india.com/files/advt326.pdf"
        dredge_job["isVerifiedOfficial"] = True
        dredge_job["verifiedDomain"] = "dredge-india.com"
        dredge_job["positions"] = [
            {
                "sNo": 1,
                "postName": "Executive Director (Operations & Technical)",
                "vacancies": "1 Post",
                "compensation": "IDA Scale ₹1,20,000 - ₹2,80,000 (CTC ₹50 - 55 Lakh p.a.)",
                "minQualification": "Graduate in Engineering / Dredge Master Grade-I / MEO Class-I",
                "experience": "Min 25 Years post-qualification (5 yrs as HOD in listed company or E-7 in PSU)",
                "age": "45 - 57 Years",
                "placeOfPosting": "Visakhapatnam, Andhra Pradesh",
                "selectionMode": "PPT Presentation (50 Marks) & Interview (50 Marks)"
            },
            {
                "sNo": 2,
                "postName": "Executive Director (Finance)",
                "vacancies": "1 Post",
                "compensation": "IDA Scale ₹1,20,000 - ₹2,80,000 (CTC ₹50 - 55 Lakh p.a.)",
                "minQualification": "Qualified CA or CMA (Management degree advantage)",
                "experience": "Min 25 Years post-qualification (5 yrs as HOD in listed company or E-7 in PSU)",
                "age": "45 - 57 Years",
                "placeOfPosting": "Visakhapatnam, Andhra Pradesh",
                "selectionMode": "PPT Presentation (50 Marks) & Interview (50 Marks)"
            }
        ]
            
    if indbank_job:
        indbank_job["title"] = "Project Executive / Senior Project Executive - Accounts"
        indbank_job["department"] = "Indbank Merchant Banking Services Limited (IBMBS Ltd) - 1 Vacancy"
        indbank_job["salary"] = "Rs.8 to Rs.12 lakh p.a. CTC"
        indbank_job["vacancies"] = "1 Vacancy"
        indbank_job["ageLimit"] = "25 - 45 Years"
        indbank_job["location"] = "Chennai"
        indbank_job["reqDegree"] = "Chartered Accountant (CA) / CA Inter"
        indbank_job["reqExp"] = "Min 2 Years"
        indbank_job["reqExpNum"] = 2.0
        indbank_job["selectionMode"] = "Direct Interview"
        indbank_job["sector"] = "Banking / RBI"
        indbank_job["tags"] = ["Accounts", "Finance", "CA / CA Inter", "Banking"]
        indbank_job["feeText"] = "Nil (Free Application / No Fee)"
        indbank_job["applyProcedure"] = (
            "1. Download official application form from www.indbankonline.com.\n"
            "2. Fill up all academic & professional details.\n"
            "3. Attach self-attested copies of CA qualification, experience certificates, and Govt ID.\n"
            "4. Send via Speed Post/Registered Post in an envelope superscribed as 'Application for the post of Project Executive / Senior Project Executive - Accounts' to:\n"
            "Indbank Merchant Banking Services Limited, #480, 1st Floor, Khivraj Complex 1, Anna Salai, Nandanam, Chennai 600035 on or before 16.10.2026."
        )
        indbank_job["applyUrl"] = "https://www.indbankonline.com/"
        indbank_job["pdfUrl"] = "https://www.indbankonline.com/wp-content/uploads/2026/10/Adverisemnet-for-the-post-of-Project-Executive-Senior-Project-Executive-Accounts.-.pdf"
        indbank_job["isNew"] = True
        indbank_job["positions"] = [
            {
                "sNo": 1,
                "postName": "Project Executive / Senior Project Executive - Accounts",
                "vacancies": "1",
                "compensation": "Rs.8 to Rs.12 lakh p.a. CTC",
                "minQualification": "Preferably Chartered Accountant with minimum 2 years / CA inter qualified, appearing for Final with 2 or 3 years of experience having worked in listed companies / audit firms and can head the accounts department of the company.",
                "experience": "Minimum 2 years of experience in preparation of financial statements as per Ind-AS requirements including Balance Sheet, P&L Account and Schedules, filing of TDS, Income tax returns, GST, Stock exchange, Depository returns and other statutory requirements applicable to a company.",
                "age": "25 - 45 Years",
                "placeOfPosting": "Chennai",
                "selectionMode": "Interview"
            }
        ]

    for job in other_jobs:
        dept = job.get("department", "")
        title = job.get("title", "")
        sector = job.get("sector", "")
        full_text = f"{title} {dept} {job.get('applyProcedure', '')} {job.get('feeText', '')} {job.get('raw_desc', '')}"
        
        # Vacancies
        v_match = re.search(r'(\d+)\s*Posts', dept, re.I)
        if v_match:
            vacancies_str = f"{v_match.group(1)} Posts"
        else:
            vacancies_str = "1 Post"
            
        salary_str = extract_salary(full_text, sector)
        age_str = extract_age(full_text, sector)
        loc_str = extract_location(full_text, sector, title, dept)
        
        job["salary"] = salary_str
        job["vacancies"] = vacancies_str
        job["ageLimit"] = age_str
        job["location"] = loc_str
        
        # Position detail table
        job["positions"] = [
            {
                "sNo": 1,
                "postName": title,
                "vacancies": vacancies_str,
                "compensation": salary_str,
                "minQualification": job.get("reqDegree") or job.get("rawQualification", "As per Notification"),
                "experience": job.get("reqExp", "Fresher / Not Specified"),
                "age": age_str,
                "placeOfPosting": loc_str,
                "selectionMode": job.get("selectionMode", "Direct Interview")
            }
        ]

    # Reassemble: Place Indbank & Dredging right at top so user sees their exact jobs
    from domain_validator import audit_job_security
    final_jobs = []
    if indbank_job:
        final_jobs.append(audit_job_security(indbank_job))
    if dredge_job:
        final_jobs.append(audit_job_security(dredge_job))
    for oj in other_jobs:
        final_jobs.append(audit_job_security(oj))
    
    with open("jobs_data.json", "w", encoding="utf-8") as f:
        json.dump(final_jobs, f, indent=4)
        
    print(f"Enriched and Audited {len(final_jobs)} jobs with Salary, Vacancies, Age Limit, Location & Zero-Trust Domain Validation!")

if __name__ == "__main__":
    main()
