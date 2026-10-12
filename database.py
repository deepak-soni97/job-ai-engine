import sqlite3
import json
import re
from datetime import datetime, date
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv("DATABASE_PATH", "jobs.db")


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: str = DB_PATH):
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            department TEXT,
            sector TEXT,
            selection_mode TEXT,
            raw_date TEXT,
            deadline_date TEXT,
            is_expired INTEGER DEFAULT 0,
            req_degree TEXT,
            req_exp TEXT,
            req_exp_num REAL DEFAULT 0.0,
            salary TEXT,
            vacancies TEXT,
            age_limit TEXT,
            location TEXT,
            fee_text TEXT,
            apply_procedure TEXT,
            apply_url TEXT,
            pdf_url TEXT,
            tags TEXT,
            documents TEXT,
            positions TEXT,
            is_verified_official INTEGER DEFAULT 0,
            verified_domain TEXT,
            embedding BLOB,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_deadline ON jobs(deadline_date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_expired ON jobs(is_expired);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_sector ON jobs(sector);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_exp ON jobs(req_exp_num);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_jobs_verified ON jobs(is_verified_official);")
        try:
            cursor.execute("ALTER TABLE jobs ADD COLUMN tenure TEXT DEFAULT '';")
        except sqlite3.OperationalError:
            pass
        conn.commit()

def parse_deadline_date(date_str: str) -> Tuple[Optional[str], bool, str]:
    """
    Parses date string into (ISO YYYY-MM-DD string, is_expired, formatted_display_date).
    """
    if not date_str or not date_str.strip():
        return None, False, "Ongoing"

    s = date_str.strip()
    today = date.today()

    # 1. Check if 'expired' is explicitly in text
    if "expired" in s.lower():
        m = re.search(r'(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})', s)
        if m:
            d, mth, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if yr < 100:
                yr += 2000
            try:
                dt = date(yr, mth, d)
                return dt.isoformat(), True, f"{dt.strftime('%d-%m-%Y')} (Expired)"
            except Exception:
                pass
        return None, True, f"{s}" if "expired" in s.lower() else f"{s} (Expired)"

    # 2. Check DD-MM-YY, DD-MM-YYYY, DD/MM/YYYY
    m = re.search(r'(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})', s)
    if m:
        d, mth, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if yr < 100:
            yr += 2000
        try:
            dt = date(yr, mth, d)
            diff = (dt - today).days
            iso_str = dt.isoformat()
            if diff < 0:
                return iso_str, True, f"{dt.strftime('%d-%m-%Y')} (Expired)"
            elif diff == 0:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} (Ends Today!)"
            elif diff == 1:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} (1 day left)"
            else:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} ({diff} days left)"
        except Exception:
            pass

    # 3. Check verbal dates like 'Nov 15, 2026'
    for fmt in ('%b %d, %Y', '%d %b %Y', '%B %d, %Y', '%d %B %Y', '%Y-%m-%d'):
        clean_s = re.sub(r'\(.*?\)', '', s).strip()
        try:
            dt = datetime.strptime(clean_s, fmt).date()
            diff = (dt - today).days
            iso_str = dt.isoformat()
            if diff < 0:
                return iso_str, True, f"{dt.strftime('%d-%m-%Y')} (Expired)"
            elif diff == 0:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} (Ends Today!)"
            elif diff == 1:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} (1 day left)"
            else:
                return iso_str, False, f"{dt.strftime('%d-%m-%Y')} ({diff} days left)"
        except Exception:
            pass

    return None, False, s

def row_to_job_dict(row: sqlite3.Row) -> Dict[str, Any]:
    # Reconstruct dynamic display date based on current day
    raw_date = row["raw_date"]
    deadline_date = row["deadline_date"]
    today = date.today()
    
    is_expired = bool(row["is_expired"])
    display_date = raw_date or "Ongoing"

    if deadline_date:
        try:
            dt = date.fromisoformat(deadline_date)
            diff = (dt - today).days
            if diff < 0:
                is_expired = True
                display_date = f"{dt.strftime('%d-%m-%Y')} (Expired)"
            elif diff == 0:
                is_expired = False
                display_date = f"{dt.strftime('%d-%m-%Y')} (Ends Today!)"
            elif diff == 1:
                is_expired = False
                display_date = f"{dt.strftime('%d-%m-%Y')} (1 day left)"
            else:
                is_expired = False
                display_date = f"{dt.strftime('%d-%m-%Y')} ({diff} days left)"
        except Exception:
            pass

    # Check if tenure column exists in row
    tenure_val = ""
    try:
        if "tenure" in row.keys() and row["tenure"]:
            tenure_val = str(row["tenure"]).strip()
    except Exception:
        pass

    return {
        "id": row["id"],
        "title": row["title"],
        "department": row["department"] or "",
        "sector": row["sector"] or "Central Govt",
        "selectionMode": row["selection_mode"] or "Refer Notification",
        "date": display_date,
        "deadlineDate": deadline_date,
        "isExpired": is_expired,
        "reqDegree": row["req_degree"] or "Refer Notification",
        "reqExp": row["req_exp"] or "Fresher / As per notification",
        "reqExpNum": row["req_exp_num"] or 0.0,
        "salary": row["salary"] or "Refer Notification",
        "vacancies": row["vacancies"] or "1 Post",
        "tenure": tenure_val,
        "ageLimit": row["age_limit"] or "Refer Notification",
        "location": row["location"] or "Refer Notification",
        "feeText": row["fee_text"] or "Nil",
        "applyProcedure": row["apply_procedure"] or "",
        "applyUrl": row["apply_url"] or "#",
        "pdfUrl": row["pdf_url"] or "#",
        "tags": json.loads(row["tags"]) if row["tags"] else [],
        "documents": json.loads(row["documents"]) if row["documents"] else [],
        "positions": json.loads(row["positions"]) if row["positions"] else [],
        "isVerifiedOfficial": bool(row["is_verified_official"]),
        "verifiedDomain": row["verified_domain"] or "",
        "isNew": False
    }

def upsert_job(job_data: Dict[str, Any], embedding_vec: Optional[np.ndarray] = None, db_path: str = DB_PATH):
    deadline_iso, is_expired, display_date = parse_deadline_date(job_data.get("date", ""))
    
    emb_blob = None
    if embedding_vec is not None:
        emb_blob = np.array(embedding_vec, dtype=np.float32).tobytes()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO jobs (
            id, title, department, sector, selection_mode,
            raw_date, deadline_date, is_expired, req_degree,
            req_exp, req_exp_num, salary, vacancies, age_limit,
            location, fee_text, apply_procedure, apply_url, pdf_url,
            tags, documents, positions, is_verified_official, verified_domain,
            embedding, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, datetime('now')
        )
        ON CONFLICT(id) DO UPDATE SET
            title=excluded.title,
            department=excluded.department,
            sector=excluded.sector,
            selection_mode=excluded.selection_mode,
            raw_date=excluded.raw_date,
            deadline_date=excluded.deadline_date,
            is_expired=excluded.is_expired,
            req_degree=excluded.req_degree,
            req_exp=excluded.req_exp,
            req_exp_num=excluded.req_exp_num,
            salary=excluded.salary,
            vacancies=excluded.vacancies,
            age_limit=excluded.age_limit,
            location=excluded.location,
            fee_text=excluded.fee_text,
            apply_procedure=excluded.apply_procedure,
            apply_url=excluded.apply_url,
            pdf_url=excluded.pdf_url,
            tags=excluded.tags,
            documents=excluded.documents,
            positions=excluded.positions,
            is_verified_official=excluded.is_verified_official,
            verified_domain=excluded.verified_domain,
            embedding=COALESCE(excluded.embedding, jobs.embedding),
            updated_at=datetime('now');
        """, (
            job_data.get("id"),
            job_data.get("title"),
            job_data.get("department"),
            job_data.get("sector"),
            job_data.get("selectionMode"),
            job_data.get("date"),
            deadline_iso,
            1 if is_expired else 0,
            job_data.get("reqDegree"),
            job_data.get("reqExp"),
            float(job_data.get("reqExpNum", 0.0)),
            job_data.get("salary"),
            job_data.get("vacancies"),
            job_data.get("ageLimit"),
            job_data.get("location"),
            job_data.get("feeText"),
            job_data.get("applyProcedure"),
            job_data.get("applyUrl"),
            job_data.get("pdfUrl"),
            json.dumps(job_data.get("tags", []), ensure_ascii=False),
            json.dumps(job_data.get("documents", []), ensure_ascii=False),
            json.dumps(job_data.get("positions", []), ensure_ascii=False),
            1 if job_data.get("isVerifiedOfficial") else 0,
            job_data.get("verifiedDomain", ""),
            emb_blob
        ))
        conn.commit()

def migrate_from_json(json_path: str = "jobs_data.json", embedding_model=None, db_path: str = DB_PATH) -> int:
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM jobs;")
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"SQLite DB already populated with {count} jobs. Skipping JSON migration.")
            return count

    with open(json_path, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    print(f"Migrating {len(jobs)} jobs from {json_path} into SQLite database ({db_path})...")
    
    # Pre-generate embeddings in batches if model provided
    embeddings = {}
    if embedding_model:
        print("Generating vector embeddings for initial database migration...")
        descriptions = [
            f"{j.get('title', '')} {j.get('department', '')} {j.get('sector', '')} {j.get('reqDegree', '')}"
            for j in jobs
        ]
        vectors = embedding_model.encode(descriptions, batch_size=64, show_progress_bar=False)
        for j, vec in zip(jobs, vectors):
            embeddings[j.get("id")] = vec

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        for j in jobs:
            deadline_iso, is_expired, _ = parse_deadline_date(j.get("date", ""))
            emb_blob = None
            if j.get("id") in embeddings:
                emb_blob = np.array(embeddings[j.get("id")], dtype=np.float32).tobytes()

            cursor.execute("""
            INSERT OR REPLACE INTO jobs (
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
                j.get("id"),
                j.get("title"),
                j.get("department"),
                j.get("sector"),
                j.get("selectionMode"),
                j.get("date"),
                deadline_iso,
                1 if is_expired else 0,
                j.get("reqDegree"),
                j.get("reqExp"),
                float(j.get("reqExpNum", 0.0)),
                j.get("salary"),
                j.get("vacancies"),
                j.get("ageLimit"),
                j.get("location"),
                j.get("feeText"),
                j.get("applyProcedure"),
                j.get("applyUrl"),
                j.get("pdfUrl"),
                json.dumps(j.get("tags", []), ensure_ascii=False),
                json.dumps(j.get("documents", []), ensure_ascii=False),
                json.dumps(j.get("positions", []), ensure_ascii=False),
                1 if j.get("isVerifiedOfficial") else 0,
                j.get("verifiedDomain", ""),
                emb_blob
            ))
        conn.commit()
    print(f"Migration complete: {len(jobs)} jobs saved into SQLite.")
    return len(jobs)

def auto_expire_jobs(db_path: str = DB_PATH) -> int:
    """Marks all jobs with deadline_date in the past as expired."""
    today_str = date.today().isoformat()
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE jobs
        SET is_expired = 1, updated_at = datetime('now')
        WHERE deadline_date IS NOT NULL
          AND deadline_date < ?
          AND is_expired = 0;
        """, (today_str,))
        count = cursor.rowcount
        conn.commit()
    return count

def deduplicate_all_jobs(db_path: str = DB_PATH) -> int:
    """
    Fuzzy deduplication based on core (title, department) signature.
    Collapses date variants like '(1 day left)' vs '(Ends Today!)'.
    Keeps the enriched row with genuine extracted salary, age and multi-positions.
    """
    from collections import defaultdict
    with get_connection(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM jobs")
        all_rows = cursor.fetchall()

        groups = defaultdict(list)
        for r in all_rows:
            t_clean = re.sub(r'[^a-z0-9]', '', str(r['title'] or '').lower())
            d_clean = re.sub(r'[^a-z0-9]', '', str(r['department'] or '').lower())
            d_core = re.sub(r'\d+posts?', '', d_clean).strip()
            sig = (t_clean, d_core)
            groups[sig].append(r)

        def richness_score(r):
            score = 0
            sal = str(r['salary'] or '').strip()
            if sal and 'refer' not in sal.lower():
                score += 20
            age = str(r['age_limit'] or '').strip()
            if age and 'refer' not in age.lower():
                score += 10
            loc = str(r['location'] or '').strip()
            if loc and 'refer' not in loc.lower() and 'all india' not in loc.lower():
                score += 10
            pos = r['positions']
            if pos:
                try:
                    p_list = json.loads(pos)
                    if len(p_list) > 1:
                        score += 30
                    elif len(p_list) == 1:
                        score += 5
                except Exception:
                    pass
            if r['is_verified_official']:
                score += 5
            return score

        ids_to_delete = []
        for sig, items in groups.items():
            if len(items) <= 1:
                continue
            items_sorted = sorted(items, key=lambda x: (richness_score(x), str(x['updated_at'] or ''), str(x['created_at'] or '')), reverse=True)
            best_row = items_sorted[0]

            best_sal = best_row['salary']
            best_age = best_row['age_limit']
            best_loc = best_row['location']
            best_pos = best_row['positions']
            best_date = best_row['raw_date']

            for sib in items_sorted[1:]:
                ids_to_delete.append(sib['id'])
                if (not best_sal or 'refer' in str(best_sal).lower()) and (sib['salary'] and 'refer' not in str(sib['salary']).lower()):
                    best_sal = sib['salary']
                if (not best_age or 'refer' in str(best_age).lower()) and (sib['age_limit'] and 'refer' not in str(sib['age_limit']).lower()):
                    best_age = sib['age_limit']
                if (not best_loc or 'refer' in str(best_loc).lower() or str(best_loc).lower() == 'all india') and (sib['location'] and 'refer' not in str(sib['location']).lower() and str(sib['location']).lower() != 'all india'):
                    best_loc = sib['location']
                if not best_pos and sib['positions']:
                    best_pos = sib['positions']
                if 'today' in str(sib['raw_date']).lower() or 'left' in str(sib['raw_date']).lower():
                    best_date = sib['raw_date']

            if best_sal != best_row['salary'] or best_age != best_row['age_limit'] or best_loc != best_row['location'] or best_pos != best_row['positions']:
                cursor.execute("""
                    UPDATE jobs
                    SET salary = ?, age_limit = ?, location = ?, positions = ?, raw_date = ?, updated_at = datetime('now')
                    WHERE id = ?
                """, (best_sal, best_age, best_loc, best_pos, best_date, best_row['id']))

        for del_id in ids_to_delete:
            cursor.execute("DELETE FROM jobs WHERE id = ?", (del_id,))
        conn.commit()
    return len(ids_to_delete)

def get_jobs_from_db(
    sector: Optional[str] = "All",
    experience: Optional[float] = None,
    only_verified: bool = False,
    include_expired: bool = False,
    db_path: str = DB_PATH
) -> List[Tuple[Dict[str, Any], Optional[np.ndarray]]]:
    """
    Executes fast indexed query on SQLite database to fetch active jobs
    filtered by expiry, sector, experience tier, and official verification.
    Returns list of (job_dict, embedding_vector) tuples.
    """
    query = ["SELECT * FROM jobs WHERE 1=1"]
    params = []

    if not include_expired:
        query.append("AND is_expired = 0")
        today_iso = date.today().isoformat()
        query.append("AND (deadline_date IS NULL OR deadline_date >= ?)")
        params.append(today_iso)

    if only_verified:
        query.append("AND is_verified_official = 1")

    if sector and sector != "All":
        sec_prefix = sector.split(" ")[0].lower()
        query.append("AND (LOWER(sector) LIKE ? OR LOWER(?) LIKE '%' || LOWER(sector) || '%')")
        params.extend([f"%{sec_prefix}%", sector])

    if experience is not None and experience >= 0:
        if experience == 0.0:
            query.append("AND req_exp_num = 0.0")
        else:
            query.append("AND req_exp_num >= ?")
            params.append(experience)

    query_str = " ".join(query) + " ORDER BY created_at DESC"

    results = []
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(query_str, tuple(params))
        rows = cursor.fetchall()
        for r in rows:
            job = row_to_job_dict(r)
            vec = None
            if r["embedding"]:
                try:
                    vec = np.frombuffer(r["embedding"], dtype=np.float32)
                except Exception:
                    pass
            results.append((job, vec))

    return results

