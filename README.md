# ATS Score Checker

An AI-powered Applicant Tracking System (ATS) score checker built for **Algoworks** HR teams. HR uploads one or many resumes along with a Job Description (JD), and the system scores every candidate against the JD, section by section, with clear reasons for each score.

---

## Features

- **HR login** with JWT authentication
- **Drag-and-drop resume upload** (multiple files; PDF, DOCX, DOC, TXT)
- **JD input** as pasted text or a dropped file (PDF, DOCX, TXT)
- **LLM-based scoring** (Claude or Gemini, switchable via config)
- **Section-wise ATS scores** for Education, Experience, Skills and Certifications, plus an overall score and verdict
- **Result cards** for every resume showing the score, what matched and what is missing
- **Clickable cards** that open a detailed breakdown
- **PDF report download** for each candidate
- **PostgreSQL storage** of all analyses (cloud storage planned for a later phase)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| AI integration | Claude API / Gemini API (provider abstraction) |
| Auth | JWT |
| Containers | Docker, Docker Compose |

---

## Folder Structure

The repository is split into four main areas, one per workstream:

```
ats-score-checker/
├── frontend/                 # Web UI (Next.js)
│   ├── src/
│   │   ├── app/              # Pages and routes (login, analyze, results, history)
│   │   ├── components/       # UploadZone, JDInput, ResumeCard, DetailView, etc.
│   │   ├── lib/              # API client, auth helpers, validators
│   │   ├── hooks/            # Polling, upload and auth hooks
│   │   └── mocks/            # Mock API data for development
│   ├── public/
│   ├── e2e/                  # End-to-end UI tests
│   ├── .env.example
│   └── package.json
│
├── backend/                  # REST API (FastAPI)
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── api/              # Route handlers (auth, analyses, reports, health)
│   │   ├── core/             # Config, security, logging, dependencies
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (upload, parsing, scoring, reports)
│   │   ├── storage/          # Storage interface (local now, cloud later)
│   │   ├── workers/          # Async analysis job processing
│   │   └── utils/
│   ├── tests/                # Unit and API tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── db/                       # Database
│   ├── migrations/           # Alembic migration files
│   ├── seeds/                # Seed data (HR users)
│   ├── schema/               # Reference schema and ER diagram
│   └── alembic.ini
│
├── ai-integration/           # LLM scoring engine (Python package used by backend)
│   ├── ats_ai/
│   │   ├── providers/        # Base provider, Claude provider, Gemini provider
│   │   ├── prompts/          # Scoring prompt templates
│   │   ├── schemas/          # Strict JSON output schema and validators
│   │   ├── scorer.py         # Entry point: score(resume_text, jd_text)
│   │   └── config.py         # Model names, temperature, timeouts, retries
│   ├── tests/                # Prompt, schema and consistency tests
│   └── pyproject.toml
│
├── docs/                     # API spec (OpenAPI), test plan, deployment guide
├── docker-compose.yml        # Runs frontend, backend and PostgreSQL together
├── .gitignore
└── README.md
```

### Ownership

| Folder | Team |
|--------|------|
| `frontend/` | Abdul, Vanshika, Kali, Devesh |
| `backend/` and `db/` | Harshit, Vaibhav |
| `ai-integration/` | Ashish |
| Testing (all folders) | Ashish, Vishal |

---

## How It Works

1. HR logs in and opens the Analyze page.
2. HR drops resumes and provides the JD (text or file), then clicks **Submit**.
3. The backend creates an analysis job and returns a `job_id`.
4. For each resume, the backend extracts text and calls `ai-integration` to score it against the JD.
5. Scores are validated, the overall score is calculated using the configured weights, and results are saved to PostgreSQL.
6. The frontend polls the job status and shows one card per resume.
7. HR opens a card for the detailed view and can download the PDF report.

### Scoring

| Section | Default weight |
|---------|----------------|
| Skills | 35% |
| Experience | 35% |
| Education | 15% |
| Certifications | 15% |

| Overall score | Verdict |
|---------------|---------|
| 75 to 100 | Strong fit |
| 50 to 74 | Moderate fit |
| Below 50 | Weak fit |

Weights are configurable. The backend recalculates the overall score from the section scores instead of trusting the model's own total.

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use the Docker Compose service)
- An API key for Claude or Gemini

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/ats-score-checker.git
cd ats-score-checker
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/ats_checker
JWT_SECRET=change-me
LLM_PROVIDER=claude          # claude or gemini
ANTHROPIC_API_KEY=your-key
GEMINI_API_KEY=your-key
MAX_RESUMES_PER_JOB=20
MAX_FILE_SIZE_MB=5
```

Frontend `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Never commit `.env` files or API keys.

### 3. Run with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

### 4. Or run each part locally

**Database**

```bash
cd db
alembic upgrade head
python seeds/seed_users.py
```

**AI integration and backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -e ../ai-integration
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/analyses` | Upload resumes and JD, returns `job_id` |
| GET | `/api/analyses` | List past analyses |
| GET | `/api/analyses/{id}` | Job status and result cards |
| GET | `/api/analyses/{id}/resumes/{rid}` | Detailed result for one resume |
| GET | `/api/analyses/{id}/resumes/{rid}/report` | Download PDF report |
| GET | `/api/health` | Health check |

Full interactive docs are available at `/docs` when the backend is running.

---

## Database

Main tables: `users`, `analysis_jobs`, `resumes`, `resume_scores`, `reports`. Schema changes are made only through Alembic migrations in `db/migrations/`.

```bash
cd db
alembic revision -m "describe change"
alembic upgrade head
```

---

## Testing

```bash
# Backend
cd backend && pytest

# AI integration
cd ai-integration && pytest

# Frontend
cd frontend && npm test
npm run e2e
```

Test coverage includes API tests, UI and cross-browser tests, LLM output validation and score consistency, integration, security, performance and regression.

---

## Contributing

- Create a feature branch from `main` (`feature/<short-name>`).
- Open a pull request with at least one reviewer. No direct pushes to `main`.
- API changes need agreement from backend and frontend leads and must be reflected in `docs/`.
- Code freeze: **26 Nov 2026**. After this, only approved bug fixes.

---

## Roadmap

- Cloud storage for resumes and reports (S3 or equivalent)
- Combined multi-candidate PDF report
- OCR support for scanned resumes
- Analytics dashboard
- Email notifications
- Integrations with external ATS platforms

---

## Project Timeline

Start: 18 Nov 2026 | Release: 30 Nov 2026

---

## License

Internal project for Algoworks. All rights reserved.
