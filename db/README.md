# Database Schema — Algoworks ATS Checker (PostgreSQL)

## Tables Overview
1. **`users`**: Stores seeded Algoworks HR recruiter accounts.
2. **`analysis_jobs`**: Tracks each JD submission batch, configurable section weights (`skills: 35%`, `experience: 35%`, `education: 15%`, `certifications: 15%`), and async job status (`queued`, `processing`, `done`, `failed`).
3. **`resumes`**: Stores uploaded candidate files (`pdf`, `docx`, `doc`, `txt`, `rtf`), extracted text, and per-file processing status.
4. **`resume_scores`**: Stores AI-generated `overall_score`, `verdict` (`strong`, `moderate`, `weak`), individual section scores, and a `JSONB` `details` column containing matched/missing items, reasoning, and recommendations.
5. **`reports`**: Caches generated PDF report file paths per resume.

## Running Locally
1. Create database: `CREATE DATABASE ats_checker_db;`
2. Run schema: `psql -U postgres -d ats_checker_db -f db/schema/001_initial_schema.sql`
3. Run seeds: `psql -U postgres -d ats_checker_db -f db/seeds/seed_hr_users.sql`