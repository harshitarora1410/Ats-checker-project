# Database Schema & Migrations — Algoworks ATS Checker (PostgreSQL)

## Tables Overview
1. **`users`**: Stores seeded Algoworks HR recruiter accounts.
2. **`analysis_jobs`**: Tracks each JD submission batch, configurable section weights (`skills: 35%`, `experience: 35%`, `education: 15%`, `certifications: 15%`), and async job status (`queued`, `processing`, `done`, `failed`).
3. **`resumes`**: Stores uploaded candidate files (`pdf`, `docx`, `doc`, `txt`, `rtf`), extracted text, and per-file processing status.
4. **`resume_scores`**: Stores AI-generated `overall_score`, `verdict` (`strong`, `moderate`, `weak`), individual section scores, and a `JSONB` `details` column containing matched/missing items, reasoning, and recommendations.
5. **`reports`**: Caches generated PDF report file paths per resume.

## Key Performance Indexes
- **`idx_analysis_jobs_user_id`**: On `analysis_jobs(user_id, created_at DESC)` for high-performance recruiter analysis history queries.
- **`idx_resumes_job_id`**: On `resumes(job_id)` for batch retrieval and fast cascade operations.
- **`idx_resume_scores_resume_id`**: On `resume_scores(resume_id)` for one-to-one score lookups.
- **`idx_resume_scores_overall_desc`**: On `resume_scores(overall_score DESC)` for candidate ranking.

## Running Migrations (Alembic)

All schema changes must be applied via Alembic migrations (no manual SQL in production):

1. **Set connection string (if not using defaults):**
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ats_checker_db"
   # On Windows PowerShell:
   # $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ats_checker_db"
   ```

2. **Apply migrations to head:**
   ```bash
   cd db
   alembic upgrade head
   ```

3. **Rollback migration (if needed):**
   ```bash
   cd db
   alembic downgrade -1
   ```

4. **Generate a new migration:**
   ```bash
   cd db
   alembic revision -m "describe_your_change"
   ```

5. **Run seeds (HR recruiter accounts):**
   ```bash
   psql -U postgres -d ats_checker_db -f db/seeds/seed_hr_users.sql
   ```

## Directory Structure
- `alembic.ini`: Alembic migration configuration.
- `migrations/`: Alembic environment scripts (`env.py`, `script.py.mako`) and version scripts (`versions/001_initial_schema.py`).
- `schema/`: Reference SQL files (`initial_schema.sql`).
- `seeds/`: Seed SQL data for development and testing (`seed_hr_users.sql`).
