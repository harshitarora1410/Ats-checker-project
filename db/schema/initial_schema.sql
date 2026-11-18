-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE (HR Recruiters at Algoworks)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'hr_recruiter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ANALYSIS JOBS TABLE (Each JD + Batch Submission)
-- ============================================================================
CREATE TABLE analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jd_title VARCHAR(255),
    jd_text TEXT NOT NULL,
    jd_file_path TEXT, -- Nullable if JD was pasted as plain text
    section_weights JSONB NOT NULL DEFAULT '{"skills": 35, "experience": 35, "education": 15, "certifications": 15}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'queued' 
        CHECK (status IN ('queued', 'processing', 'done', 'failed')),
    total_resumes INT NOT NULL DEFAULT 0 CHECK (total_resumes >= 0 AND total_resumes <= 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Index for History page (fetching past analyses per HR user)
CREATE INDEX idx_analysis_jobs_user_id ON analysis_jobs(user_id, created_at DESC);

-- ============================================================================
-- 3. RESUMES TABLE (Individual files uploaded inside an analysis job)
-- ============================================================================
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'docx', 'doc', 'txt', 'rtf')),
    extracted_text TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    error_message TEXT, -- Stores parsing/LLM failure reason if single file fails
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching all resumes belonging to a specific job
CREATE INDEX idx_resumes_job_id ON resumes(job_id);

-- ============================================================================
-- 4. RESUME SCORES TABLE (AI ATS Evaluation & Section Breakdown)
-- ============================================================================
CREATE TABLE resume_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID UNIQUE NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255),
    overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    verdict VARCHAR(20) NOT NULL CHECK (verdict IN ('strong', 'moderate', 'weak')),
    summary TEXT,
    
    -- 4 Section Scores (0 - 100)
    education_score DECIMAL(5,2) NOT NULL CHECK (education_score >= 0 AND education_score <= 100),
    experience_score DECIMAL(5,2) NOT NULL CHECK (experience_score >= 0 AND experience_score <= 100),
    skills_score DECIMAL(5,2) NOT NULL CHECK (skills_score >= 0 AND skills_score <= 100),
    certifications_score DECIMAL(5,2) NOT NULL CHECK (certifications_score >= 0 AND certifications_score <= 100),
    
    -- Stores matched[], missing[], reasoning per section & recommendations[]
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    model_used VARCHAR(100) NOT NULL, -- e.g., 'claude-3-5-sonnet' or 'gemini-2.5-pro'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookup and sorting cards in decreasing order of score
CREATE INDEX idx_resume_scores_resume_id ON resume_scores(resume_id);
CREATE INDEX idx_resume_scores_overall_desc ON resume_scores(overall_score DESC);

-- ============================================================================
-- 5. REPORTS TABLE (Cached generated PDF reports per resume)
-- ============================================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID UNIQUE NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);