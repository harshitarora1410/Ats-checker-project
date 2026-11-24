"""Entry point used by the backend:  score(resume_text, jd_text) -> ScoreResult"""
from __future__ import annotations

import json
import re

from pydantic import ValidationError

from .config import Settings
from .prompts import SYSTEM_PROMPT, build_retry_suffix, build_user_prompt
from .providers import BaseProvider, ProviderError, get_provider
from .schemas import LLMOutput, ScoreResult, SECTION_NAMES, SectionScore


class ScoringError(Exception):
    """Raised when a resume could not be scored (bad input, provider failure, invalid output)."""


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def extract_json(raw: str) -> dict:
    """Pull one JSON object out of a model reply, tolerating code fences or stray prose."""
    text = _FENCE.sub("", raw.strip())
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("no JSON object found in the reply")
    data = json.loads(text[start : end + 1])
    if not isinstance(data, dict):
        raise ValueError("reply JSON is not an object")
    return data


def compute_overall(sections: dict[str, SectionScore], settings: Settings) -> int:
    """Weighted average of section scores. Sections with score=None are skipped and
    the remaining weights are renormalised, so 'no certifications required' costs nothing."""
    scored = {k: v.score for k, v in sections.items() if v.score is not None}
    if not scored:
        raise ScoringError("model returned no usable section scores")
    total_weight = sum(settings.weights[k] for k in scored)
    overall = sum(settings.weights[k] * s for k, s in scored.items()) / total_weight
    return max(0, min(100, round(overall)))


def verdict_for(score: int, settings: Settings) -> str:
    if score >= settings.strong_threshold:
        return "Strong fit"
    if score >= settings.moderate_threshold:
        return "Moderate fit"
    return "Weak fit"


def _prepare(text: str, label: str, limit: int) -> str:
    text = (text or "").strip()
    if not text:
        raise ScoringError(f"{label} is empty")
    if len(text) > limit:
        text = text[:limit] + "\n[...truncated...]"
    return text


def score(
    resume_text: str,
    jd_text: str,
    *,
    provider: BaseProvider | None = None,
    settings: Settings | None = None,
) -> ScoreResult:
    settings = settings or Settings.from_env()
    resume = _prepare(resume_text, "resume text", settings.max_input_chars)
    jd = _prepare(jd_text, "job description", settings.max_input_chars)

    try:
        provider = provider or get_provider(settings)
    except ProviderError as e:
        raise ScoringError(str(e)) from e

    base_prompt = build_user_prompt(resume, jd)
    last_error: str | None = None
    parsed: LLMOutput | None = None

    for _ in range(settings.max_validation_retries + 1):
        prompt = base_prompt if last_error is None else base_prompt + build_retry_suffix(last_error)
        try:
            raw = provider.complete(SYSTEM_PROMPT, prompt)
        except ProviderError as e:
            raise ScoringError(str(e)) from e
        try:
            parsed = LLMOutput.model_validate(extract_json(raw))
            break
        except (ValueError, ValidationError) as e:
            last_error = str(e)

    if parsed is None:
        raise ScoringError(f"model output failed validation: {last_error}")

    sections = {name: getattr(parsed, name) for name in SECTION_NAMES}
    overall = compute_overall(sections, settings)

    return ScoreResult(
        overall_score=overall,
        verdict=verdict_for(overall, settings),
        sections=sections,
        summary=parsed.summary,
        weights_used=dict(settings.weights),
        provider=provider.name,
        model=provider.model,
    )