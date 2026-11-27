"""What we ask Claude to return for ONE resume. Strictly validated; invalid -> re-ask."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_ITEMS = 10
MAX_RECOMMENDATIONS = 5


def _clean_list(v, limit: int) -> list[str]:
    if v is None:
        return []
    if not isinstance(v, list):
        raise ValueError("must be a list of strings")
    items = [str(x).strip() for x in v]
    return [x for x in items if x][:limit]


class LLMSection(BaseModel):
    model_config = ConfigDict(extra="ignore")

    score: Optional[float] = Field(default=None, ge=0, le=100)
    applicable: bool = True  # false = the JD asks for nothing in this section
    matched: list[str] = Field(default_factory=list)
    missing: list[str] = Field(default_factory=list)
    reasoning: str = ""

    @field_validator("matched", "missing", mode="before")
    @classmethod
    def _lists(cls, v):
        return _clean_list(v, MAX_ITEMS)

    @field_validator("reasoning", mode="before")
    @classmethod
    def _text(cls, v):
        return "" if v is None else str(v).strip()

    @model_validator(mode="after")
    def _score_needed(self):
        if self.applicable and self.score is None:
            raise ValueError("score is required when the section applies")
        return self


class LLMResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    candidate_name: Optional[str] = None
    skills: LLMSection
    experience: LLMSection
    education: LLMSection
    certifications: LLMSection
    summary: str = ""
    recommendations: list[str] = Field(default_factory=list)

    @field_validator("candidate_name", mode="before")
    @classmethod
    def _name(cls, v):
        if v is None:
            return None
        v = str(v).strip()[:120]
        return v or None

    @field_validator("summary", mode="before")
    @classmethod
    def _summary(cls, v):
        return "" if v is None else str(v).strip()

    @field_validator("recommendations", mode="before")
    @classmethod
    def _recs(cls, v):
        return _clean_list(v, MAX_RECOMMENDATIONS)
