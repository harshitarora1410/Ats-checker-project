"""Input contract: backend -> AI (contracts/README.md section 1)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator

from ..config import CONTRACT_VERSION, SECTIONS, Settings
from ..errors import RequestError


class ResumeIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    resume_id: str = Field(min_length=1)
    resume_text: str = ""  # empty is allowed: that one resume comes back as failed

    @field_validator("resume_text", mode="before")
    @classmethod
    def _none_to_empty(cls, v):
        return "" if v is None else v


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    contract_version: str
    job_id: str
    jd_text: str
    section_weights: Optional[dict[str, int]] = None
    resumes: list[ResumeIn]


def validate_request(raw: object, settings: Settings) -> AnalyzeRequest:
    """Return the parsed request or raise RequestError (nothing is scored)."""
    if not isinstance(raw, dict):
        raise RequestError(["request must be a JSON object"])
    try:
        req = AnalyzeRequest.model_validate(raw)
    except ValidationError as e:
        raise RequestError([f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}" for err in e.errors()]) from None

    problems: list[str] = []
    if req.contract_version != CONTRACT_VERSION:
        problems.append(f"contract_version must be {CONTRACT_VERSION!r}, got {req.contract_version!r}")
    if not req.job_id.strip():
        problems.append("job_id is empty")
    if not req.jd_text.strip():
        problems.append("jd_text is empty")

    n = len(req.resumes)
    if n < 1 or n > settings.max_resumes_per_batch:
        problems.append(f"resumes must have 1 to {settings.max_resumes_per_batch} items, got {n}")

    seen: set[str] = set()
    dupes = sorted({r.resume_id for r in req.resumes if r.resume_id in seen or seen.add(r.resume_id)})
    if dupes:
        problems.append(f"duplicate resume_id: {', '.join(dupes)}")

    w = req.section_weights
    if w is not None:
        if set(w) != set(SECTIONS):
            problems.append(f"section_weights must have exactly the keys {list(SECTIONS)}")
        elif any(v < 0 for v in w.values()) or sum(w.values()) != 100:
            problems.append(f"section_weights must be whole numbers >= 0 that add up to 100 (got {sum(w.values())})")

    if problems:
        raise RequestError(problems)
    return req
