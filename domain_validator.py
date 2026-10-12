import ipaddress
import re
from urllib.parse import urlparse
from typing import Tuple, List, Set

# Allowed Official Government Top-Level Domains (TLDs) in India
ALLOWED_GOVT_TLDS = (
    ".gov.in",
    ".nic.in",
    ".ac.in",
    ".edu.in",
    ".res.in",
    ".org.in"
)

# Whitelist of Verified Public Sector Undertakings (PSUs), Nationalized Banks & Official Recruitment Agencies
VERIFIED_PSU_DOMAINS: Set[str] = {
    # Mandated PSUs & Agencies
    "iocl.com",
    "ongcindia.com",
    "sbi.co.in",
    "ibps.in",
    "bhel.com",
    "isro.gov.in",
    "drdo.gov.in",
    "sail.co.in",
    "upsc.gov.in",
    "ssc.gov.in",
    # Additional Nationalized Banks & Premier PSUs
    "dredge-india.com",
    "ujvnl.com",
    "gailonline.com",
    "gail.co.in",
    "mrpl.co.in",
    "punjabandsind.bank.in",
    "indbankonline.com",
    "bankofbaroda.in",
    "pnbindia.in",
    "canarabank.com",
    "unionbankofindia.co.in",
    "bankofindia.co.in",
    "indianbank.in",
    "centralbankofindia.co.in",
    "ucobank.com",
    "rbi.org.in",
    "sebi.gov.in",
    "nabard.org",
    "licindia.in",
    "hal-india.co.in",
    "bel-india.in",
    "ntpc.co.in",
    "powergrid.in",
    "coalindia.in",
    "hpcl.in",
    "bpcl.in",
    "cdac.in",
    # Armed Forces & State Portals
    "joinindianarmy.nic.in",
    "joinindiannavy.gov.in",
    "careerindianairforce.cdac.in",
    "mponline.gov.in",
    "esb.mp.gov.in",
    "peb.mp.gov.in",
    "mpsedc.mp.gov.in",
    "mppolice.gov.in",
    "uppsc.up.nic.in",
    "upsssc.gov.in"
}

# Blocklist of suspicious link shorteners, free hosts, and unofficial aggregators
BLOCKED_DOMAINS = {
    "forms.gle",
    "docs.google.com",
    "bit.ly",
    "tinyurl.com",
    "t.me",
    "wa.me",
    "api.whatsapp.com",
    "blogspot.com",
    "wordpress.com",
    "wixsite.com"
}

# Regex patterns for anti-phishing indicators
PHISHING_PATTERNS = [
    (r"\bwa\.me/\d+", "WhatsApp direct contact link detected"),
    (r"\b[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|upi|apl|gpay)\b", "Direct personal UPI payment ID detected"),
    (r"(?:google\s*pay|phonepe|paytm)\s*(?:no|number|to)\s*[:\-]?\s*\d{10}", "Direct mobile wallet payment request detected"),
    (r"(?:deposit|transfer|send)\s*(?:money|fee|amount)\s*(?:to|in)\s*(?:account|ac)\s*(?:no|number)?\s*[:\-]?\s*\d{9,18}", "Direct bank account payment request detected"),
    (r"(?:bitcoin|crypto|usdt|binance)\b", "Cryptocurrency payment reference detected")
]


def is_ip_address(host: str) -> bool:
    """Checks if the given hostname is a raw IP address."""
    clean_host = host.split(":")[0]  # strip port if present
    try:
        ipaddress.ip_address(clean_host)
        return True
    except ValueError:
        return False


def validate_and_sanitize_url(url: str) -> Tuple[bool, str, str]:
    """
    Validates whether a URL strictly belongs to a verified Indian Govt / PSU domain.
    Returns:
        (is_verified: bool, clean_domain: str, sanitized_url: str)
    """
    if not url or url.strip() in ("#", "", "None", "null"):
        return False, "", "#"

    cleaned_url = url.strip()
    
    # Must have a valid web scheme
    if not (cleaned_url.startswith("http://") or cleaned_url.startswith("https://")):
        # If schema missing, test with https
        cleaned_url = f"https://{cleaned_url}"

    try:
        parsed = urlparse(cleaned_url)
    except Exception:
        return False, "", "#"

    host = (parsed.netloc or "").lower().strip()
    if not host:
        return False, "", "#"

    # Strip port if present
    domain = host.split(":")[0]

    # Rule 1: Reject raw IP addresses (e.g., 14.139.49.55:8005)
    if is_ip_address(domain):
        return False, domain, "#"

    # Rule 2: Reject known link shorteners / free hosting / form builders
    if domain in BLOCKED_DOMAINS or any(domain.endswith(f".{b}") for b in BLOCKED_DOMAINS):
        return False, domain, "#"

    # Rule 3: Reject suspicious generic / spam TLDs
    if domain.endswith((".xyz", ".top", ".buzz", ".info", ".online", ".club", ".live", ".work")):
        return False, domain, "#"

    # Rule 4: Match against Official Govt TLDs
    if any(domain.endswith(tld) for tld in ALLOWED_GOVT_TLDS):
        # Force HTTPS for verified government portals
        sanitized = parsed._replace(scheme="https").geturl()
        return True, domain, sanitized

    # Rule 5: Match against Verified PSU / Nationalized Bank whitelist
    for psu in VERIFIED_PSU_DOMAINS:
        if domain == psu or domain.endswith(f".{psu}"):
            sanitized = parsed._replace(scheme="https").geturl()
            return True, domain, sanitized

    # Otherwise: Unverified 3rd-party domain
    return False, domain, "#"


def scan_text_for_phishing(text: str) -> Tuple[bool, List[str]]:
    """
    Scans job notification text for fraud/phishing indicators (personal UPI, WhatsApp money requests).
    Returns:
        (is_suspicious: bool, reasons: List[str])
    """
    if not text:
        return False, []

    reasons: List[str] = []
    for pattern, description in PHISHING_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            reasons.append(description)

    return (len(reasons) > 0), reasons


def audit_job_security(job: dict) -> dict:
    """
    Audits an entire job record and attaches verification metadata.
    """
    raw_apply = job.get("applyUrl", "#")
    pdf_url = job.get("pdfUrl", "#")
    
    # If applyUrl is missing or #, derive official portal URL from verified pdfUrl domain
    if (not raw_apply or raw_apply == "#") and pdf_url and pdf_url != "#":
        parsed_pdf = urlparse(pdf_url)
        if parsed_pdf.netloc:
            candidate_apply = f"https://{parsed_pdf.netloc}"
            is_v, v_dom, san_url = validate_and_sanitize_url(candidate_apply)
            if is_v:
                raw_apply = san_url

    is_verified, verified_domain, sanitized_apply = validate_and_sanitize_url(raw_apply)

    # Also scan notification and description for phishing signals
    combined_text = f"{job.get('title', '')} {job.get('department', '')} {job.get('applyProcedure', '')} {job.get('feeText', '')} {job.get('raw_desc', '')}"
    has_phishing, phishing_reasons = scan_text_for_phishing(combined_text)

    # If phishing is detected, quarantine the job immediately
    is_quarantined = has_phishing

    if is_quarantined:
        job["isQuarantined"] = True
        job["isVerifiedOfficial"] = False
        job["verifiedDomain"] = ""
        job["applyUrl"] = "#"
        job["securityNotes"] = phishing_reasons
    else:
        job["isQuarantined"] = False
        job["isVerifiedOfficial"] = is_verified
        job["verifiedDomain"] = verified_domain if is_verified else ""
        job["applyUrl"] = sanitized_apply if is_verified else "#"
        job["securityNotes"] = ["Verified Official Authority"] if is_verified else ["Third-party / Unverified Domain"]

    return job
