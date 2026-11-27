"""Pure maths: overall score, verdict and ranking. Claude's own totals are never used."""
from __future__ import annotations

from .config import SECTIONS, Settings
from .schemas import ResultOut

# A section the JD does not ask for counts as fully met, so it never lowers anyone's score.
NOT_REQUIRED_SCORE = 100.0


def overall_score(section_scores: dict[str, float], weights: dict[str, int]) -> float:
    """overall = sum(score x weight) / 100, rounded to 2 decimals.  88/85/90/20 @ 35/35/15/15 -> 77.05"""
    total = sum(section_scores[name] * weights[name] for name in SECTIONS)
    return round(total / 100, 2)


def verdict_for(overall: float, settings: Settings) -> str:
    if overall >= settings.strong_threshold:
        return "strong"
    if overall >= settings.moderate_threshold:
        return "moderate"
    return "weak"


def rank_results(done: list[ResultOut]) -> list[ResultOut]:
    """Higher overall first; tie -> higher skills; tie -> higher experience; still tied -> input order."""
    ordered = sorted(
        done,
        key=lambda r: (-r.overall_score, -r.section_scores.skills, -r.section_scores.experience),
    )  # sorted() is stable, so full ties keep their input order
    return [r.model_copy(update={"rank": i}) for i, r in enumerate(ordered, start=1)]