"""Output contract: AI -> backend (contracts/README.md section 2)."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Verdict = Literal["strong", "moderate", "weak"]


class SectionScores(BaseModel):
    skills: float
    experience: float
    education: float
    certifications: float


class SectionDetail(BaseModel):
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    reasoning: str = ""


class Details(BaseModel):
    skills: SectionDetail
    experience: SectionDetail
    education: SectionDetail
    certifications: SectionDetail
    recommendations: list[str] = Field(default_factory=list)


class ResultOut(BaseModel):
    resume_id: str
    rank: Optional[int] = None
    status: Literal["done", "failed"]
    error_message: Optional[str] = None
    candidate_name: Optional[str] = None
    overall_score: Optional[float] = Field(default=None, ge=0, le=100)
    verdict: Optional[Verdict] = None
    summary: Optional[str] = None
    section_scores: Optional[SectionScores] = None
    details: Optional[Details] = None
    report_text: Optional[str] = None


class AnalyzeResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())  # allows the field name "model_used"

    contract_version: str
    job_id: str
    status: Literal["done", "partially_failed", "failed"]
    model_used: str
    section_weights: dict[str, int]
    total_resumes: int
    succeeded: int
    failed: int
    results: list[ResultOut]
