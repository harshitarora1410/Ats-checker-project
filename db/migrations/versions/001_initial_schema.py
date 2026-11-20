"""create initial schema for ats checker

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-11-19 19:46:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Ensure pgcrypto extension is available for UUID generation
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    # =========================================================================
    # 1. USERS TABLE (HR Recruiters at Algoworks)
    # =========================================================================
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('role', sa.String(length=50), server_default='hr_recruiter', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_users')),
        sa.UniqueConstraint('email', name=op.f('uq_users_email')),
    )

    # =========================================================================
    # 2. ANALYSIS JOBS TABLE (Each JD + Batch Submission)
    # =========================================================================
    op.create_table(
        'analysis_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('jd_title', sa.String(length=255), nullable=True),
        sa.Column('jd_text', sa.Text(), nullable=False),
        sa.Column('jd_file_path', sa.Text(), nullable=True),
        sa.Column(
            'section_weights',
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text('\'{"skills": 35, "experience": 35, "education": 15, "certifications": 15}\'::jsonb'),
            nullable=False,
        ),
        sa.Column('status', sa.String(length=20), server_default='queued', nullable=False),
        sa.Column('total_resumes', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('queued', 'processing', 'done', 'failed')",
            name='ck_analysis_jobs_status',
        ),
        sa.CheckConstraint(
            'total_resumes >= 0 AND total_resumes <= 20',
            name='ck_analysis_jobs_total_resumes',
        ),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
            name=op.f('fk_analysis_jobs_user_id_users'),
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_analysis_jobs')),
    )

    # Index on analysis_jobs.user_id (with created_at DESC for recruiter history queries)
    op.create_index(
        'idx_analysis_jobs_user_id',
        'analysis_jobs',
        ['user_id', sa.text('created_at DESC')],
        unique=False,
    )

    # =========================================================================
    # 3. RESUMES TABLE (Individual files uploaded inside an analysis job)
    # =========================================================================
    op.create_table(
        'resumes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.Text(), nullable=False),
        sa.Column('file_type', sa.String(length=10), nullable=False),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.CheckConstraint(
            "file_type IN ('pdf', 'docx', 'doc', 'txt', 'rtf')",
            name='ck_resumes_file_type',
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'processing', 'done', 'failed')",
            name='ck_resumes_status',
        ),
        sa.ForeignKeyConstraint(
            ['job_id'],
            ['analysis_jobs.id'],
            name=op.f('fk_resumes_job_id_analysis_jobs'),
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_resumes')),
    )

    # Index on resumes.job_id
    op.create_index(
        'idx_resumes_job_id',
        'resumes',
        ['job_id'],
        unique=False,
    )

    # =========================================================================
    # 4. RESUME SCORES TABLE (AI ATS Evaluation & Section Breakdown)
    # =========================================================================
    op.create_table(
        'resume_scores',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('resume_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('candidate_name', sa.String(length=255), nullable=True),
        sa.Column('overall_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('verdict', sa.String(length=20), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('education_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('experience_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('skills_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('certifications_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column('model_used', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.CheckConstraint(
            'overall_score >= 0 AND overall_score <= 100',
            name='ck_resume_scores_overall_score',
        ),
        sa.CheckConstraint(
            "verdict IN ('strong', 'moderate', 'weak')",
            name='ck_resume_scores_verdict',
        ),
        sa.CheckConstraint(
            'education_score >= 0 AND education_score <= 100',
            name='ck_resume_scores_education_score',
        ),
        sa.CheckConstraint(
            'experience_score >= 0 AND experience_score <= 100',
            name='ck_resume_scores_experience_score',
        ),
        sa.CheckConstraint(
            'skills_score >= 0 AND skills_score <= 100',
            name='ck_resume_scores_skills_score',
        ),
        sa.CheckConstraint(
            'certifications_score >= 0 AND certifications_score <= 100',
            name='ck_resume_scores_certifications_score',
        ),
        sa.ForeignKeyConstraint(
            ['resume_id'],
            ['resumes.id'],
            name=op.f('fk_resume_scores_resume_id_resumes'),
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_resume_scores')),
        sa.UniqueConstraint('resume_id', name=op.f('uq_resume_scores_resume_id')),
    )

    # Index on resume_scores.resume_id
    op.create_index(
        'idx_resume_scores_resume_id',
        'resume_scores',
        ['resume_id'],
        unique=False,
    )

    # Index for sorting candidates by score descending
    op.create_index(
        'idx_resume_scores_overall_desc',
        'resume_scores',
        [sa.text('overall_score DESC')],
        unique=False,
    )

    # =========================================================================
    # 5. REPORTS TABLE (Cached generated PDF reports per resume)
    # =========================================================================
    op.create_table(
        'reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('resume_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_path', sa.Text(), nullable=False),
        sa.Column('generated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.ForeignKeyConstraint(
            ['resume_id'],
            ['resumes.id'],
            name=op.f('fk_reports_resume_id_resumes'),
            ondelete='CASCADE',
        ),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_reports')),
        sa.UniqueConstraint('resume_id', name=op.f('uq_reports_resume_id')),
    )


def downgrade() -> None:
    # Drop tables in reverse order of foreign key dependency
    op.drop_table('reports')

    op.drop_index('idx_resume_scores_overall_desc', table_name='resume_scores')
    op.drop_index('idx_resume_scores_resume_id', table_name='resume_scores')
    op.drop_table('resume_scores')

    op.drop_index('idx_resumes_job_id', table_name='resumes')
    op.drop_table('resumes')

    op.drop_index('idx_analysis_jobs_user_id', table_name='analysis_jobs')
    op.drop_table('analysis_jobs')

    op.drop_table('users')
