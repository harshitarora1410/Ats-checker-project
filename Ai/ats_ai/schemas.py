"""Strict output schemas. The model's JSON is validated against LLMOutput;
the final, backend-facing object is ScoreResult."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

SECTION_NAMES = ("skills", "experience", "education", "certifications")

Verdict = Literal["Strong fit", "Moderate fit", "Weak fit"]


class SectionScore(BaseModel):
    model_config = ConfigDict(extra="ignore")

    # None means "this section does not apply to the JD" (e.g. no certifications asked for).
    score: Optional[int] = Field(default=None, ge=0, le=100)
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    reason: str = ""

    @field_validator("score", mode="before")
    @classmethod
    def _round_float(cls, v):
        if isinstance(v, float):
            return round(v)
        return v


class LLMOutput(BaseModel):
    """Exactly what we ask the model to return."""

    model_config = ConfigDict(extra="ignore")

    skills: SectionScore
    experience: SectionScore
    education: SectionScore
    certifications: SectionScore
    summary: str = ""


class ScoreResult(BaseModel):
    """What the backend receives from score()."""

    overall_score: int = Field(ge=0, le=100)
    verdict: Verdict
    sections: dict[str, SectionScore]
    summary: str = ""
    weights_used: dict[str, float]
    provider: str
    model: str