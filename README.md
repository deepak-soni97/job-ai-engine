# 🏛️ GovtTech AI — Next-Gen Job Discovery & Eligibility Engine

<p align="center">
  <img src="frontend/public/favicon.svg" alt="GovtTech AI Logo" width="80" height="80" />
</p>

<p align="center">
  <b>Deterministic Criteria Filtering + In-Memory AI Semantic Matching for Official Indian Government & Tech Jobs</b>
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-architecture--tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-local-setup--quickstart">Quickstart</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-production-deployment-rendercom">Deployment</a>
</p>

---

## 📌 Overview

**GovtTech AI** is an intelligent full-stack discovery engine built to eliminate the pain of reading 50-page complex PDF notifications for government, PSU, and state technical jobs.

Instead of basic keyword searching, GovtTech AI uses:
1. **A Deterministic Rule Engine**: Hierarchical degree matching (e.g., MCA, B.Tech, Graduate, 10th Pass) and exact experience threshold evaluation.
2. **AI Semantic Vector Matching**: Uses in-memory `sentence-transformers` (`all-MiniLM-L6-v2`) embeddings to rank job compatibility.
3. **Zero-Trust Security Guardrails**: Validates and flags official domains (`.gov.in`, `.nic.in`, official PSUs) to protect candidates from phishing and fee fraud.
4. **Auto-Expiry & Live Sync Engine**: Background workers that automatically expire outdated notices and ingest real-time opportunities without server downtime.

---

## 🚀 Key Features

- **⚡ Strict Eligibility Filter**: Automatically qualifies or disqualifies candidates based on exact educational degrees and years of experience.
- **🧠 AI Match Scoring (%)**: Blends rule-based eligibility with semantic cosine similarity between candidate search intent and job descriptions.
- **🔄 Periodic Background Live Sync**: Automatically syncs fresh job notices every 30 minutes, collapsing duplicates and updating salaries.
- **🛡️ Zero-Trust Official Portal Verification**: Inspects every application domain to ensure candidates only interact with authenticated government portals.
- **📑 Multi-Position Vacancy Breakdown**: Parses consolidated notifications into granular sub-positions with individual salary scales, postings, and tenure.
- **⚖️ Section 79 IT Act Compliant**: Built-in safe-harbor compliance footer and anti-phishing advisories.

---

## 🛠️ Architecture & Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
- **Server**: [Uvicorn](https://www.uvicorn.org/) ASGI
- **AI / Embeddings**: [Sentence-Transformers](https://sbert.net/) (`all-MiniLM-L6-v2`)
- **Database**: SQLite (`jobs.db`) with indexed query performance
- **Web Scraping & Extraction**: BeautifulSoup4, HTTPX
- **Configuration**: `python-dotenv`

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing with centralized interfaces)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
job-ai-engine/
├── .env.example              # Backend environment template
├── .env                      # Local backend environment config
├── .gitignore                # Git ignore rules for Python & environment
├── database.py               # SQLite database access layer & auto-expiry engine
├── domain_validator.py       # Zero-trust .gov.in domain audit & phishing check
├── enrich_jobs.py            # Salary, age limit, and location extraction logic
├── jobs.db                   # Indexed SQLite database containing 900+ active jobs
├── jobs_data.json            # Seed dataset with precomputed vector embeddings
├── live_sync.py              # Incremental live web scraper & background sync worker
├── main.py                   # FastAPI REST API endpoints, AI inference & lifespan worker
├── render.yaml               # Render.com Blueprint configuration (One-click deploy)
├── requirements.txt          # Python production dependencies
├── scraper.py                # Initial seed dataset generation script
├── smart_enricher.py         # Advanced multi-position salary & criteria parser
├── verify_env.py             # System health & FastAPI test verification script
│
└── frontend/                 # React + TypeScript + Vite Web Application
    ├── .env.example          # Frontend environment template
    ├── .env                  # Frontend local environment config
    ├── public/
    │   ├── favicon.svg       # Custom high-res vector brand favicon
    │   └── logo.svg          # Full brand logo
    ├── src/
    │   ├── components/
    │   │   ├── features/     # FilterForm, JobCard, JobModal, TagBadge, RedirectModal
    │   │   ├── layout/       # Header with branding badge
    │   │   └── ui/           # Accessible custom Dropdown
    │   ├── constants/        # Centralized filters, options, and tag glossary
    │   ├── services/         # API service consuming backend REST endpoints
    │   ├── types/            # Modular TypeScript interfaces (job, api, components)
    │   ├── App.tsx           # Main application state and view
    │   └── main.tsx          # React application entrypoint
    ├── package.json          # Node.js dependencies and scripts
    └── vite.config.ts        # Vite configuration with Tailwind CSS plugin
```

---

## 💻 Local Setup & Quickstart

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & **npm** installed
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/job-ai-engine.git
cd job-ai-engine
```

---

### Step 2: Setup & Run the Backend

1. **Create and activate a virtual environment**:
   ```powershell
   # Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. **Install Python dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Create a `.env` file (copied from `.env.example`):
   ```env
   HOST=0.0.0.0
   PORT=8000
   DATABASE_PATH=jobs.db
   CORS_ORIGINS=*
   PERIODIC_SYNC_INTERVAL_SECONDS=1800
   ```

4. **Verify backend environment**:
   ```powershell
   python verify_env.py
   ```

5. **Start the FastAPI backend server**:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   > Backend will be live at: **http://localhost:8000**  
   > Interactive API Docs: **http://localhost:8000/docs**

---

### Step 3: Setup & Run the Frontend

1. **Navigate to the frontend folder**:
   ```powershell
   cd frontend
   ```

2. **Install Node packages**:
   ```powershell
   npm install
   ```

3. **Configure environment variables (For Local Run)**:
   Create a `frontend/.env` file:
   ```env
   # Local development (runs on your computer)
   VITE_API_BASE_URL=http://localhost:8000
   ```
   > 💡 **Note for Production/Live Deployment**: When deploying live to **Render** or **Vercel**, replace `http://localhost:8000` with your actual live backend URL (e.g. `https://job-ai-backend.onrender.com`).

4. **Start Vite development server**:
   ```powershell
   npm run dev
   ```
   > Frontend will be live locally at: **http://localhost:5173**

5. **Check code quality (Optional)**:
   ```powershell
   npm run lint     # Runs ESLint (0 errors)
   npm run build    # Tests production TypeScript bundle
   ```

---

## ⚙️ Environment Variables

### Backend (`.env` in root)
| Variable | Local Default | Description |
| :--- | :--- | :--- |
| `HOST` | `0.0.0.0` | Bind host address |
| `PORT` | `8000` | Server port |
| `DATABASE_PATH` | `jobs.db` | Path to SQLite database file |
| `CORS_ORIGINS` | `*` | Allowed CORS origins (comma-separated or `*`) |
| `PERIODIC_SYNC_INTERVAL_SECONDS` | `1800` | Background scraper & expiry interval (30 min) |

### Frontend (`frontend/.env`)
| Variable | Local Development | Production / Live Deploy | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | `https://job-ai-backend.onrender.com` | Backend API URL (Local vs Cloud URL) |

---

## 🌐 Production Deployment (Render.com)

The project includes a ready-to-use **`render.yaml`** Blueprint.

### Option A: One-Click Blueprint Deployment
1. Push your repository to GitHub.
2. Log in to [Render.com](https://render.com/).
3. Click **New +** ➔ **Blueprint**.
4. Connect your `job-ai-engine` repository.
5. Render will automatically configure and provision both the **Web Service** (Backend) and **Static Site** (Frontend).

### Option B: Manual Setup on Render
- **Backend (Web Service)**:
  - Runtime: `Python 3`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - Env Vars: `DATABASE_PATH=jobs.db`, `CORS_ORIGINS=*`
- **Frontend (Static Site)**:
  - Root Directory: `frontend`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`
  - Env Var: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## 📜 Legal & Safe Harbor Notice

**GovtTech AI** operates strictly as an automated discovery engine indexing public job advertisements and gazettes under **Section 79 of the Information Technology Act, 2000**. GovtTech AI does not charge application fees, collect financial credentials, or provide employment guarantees. Candidates must verify official notifications and payment gateways on authenticated `.gov.in` or PSU portals.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
