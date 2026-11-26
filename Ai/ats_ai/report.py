"""Readable report text for the detail view and the PDF (built in Python, not by the model)."""
from __future__ import annotations

from .config import SECTIONS

_LABEL = {"strong": "Strong fit", "moderate": "Moderate fit", "weak": "Weak fit"}


def _num(x: float) -> str:
    x = round(x, 2)
    return str(int(x)) if x == int(x) else str(x)


def _collect(details: dict[str, dict], key: str, limit: int = 6) -> str:
    items: list[str] = []
    for name in SECTIONS:
        for item in details[name][key]:
            if item not in items:
                items.append(item)
    return ", ".join(items[:limit]) if items else "none identified"


def build_report_text(
    name: str | None,
    overall: float,
    verdict: str,
    section_scores: dict[str, float],
    details: dict[str, dict],
    recommendations: list[str],
) -> str:
    scores_line = " | ".join(f"{n.capitalize()} {_num(section_scores[n])}" for n in SECTIONS)
    lines = [
        f"ATS REPORT - {name or 'Candidate'}",
        f"Overall: {overall}/100 ({_LABEL[verdict]})",
        "",
        scores_line,
        "",
        f"Strengths: {_collect(details, 'matched')}",
        f"Gaps: {_collect(details, 'missing')}",
    ]
    if recommendations:
        lines += ["", "Recommendations:"] + [f"{i}. {r}" for i, r in enumerate(recommendations, start=1)]
    return "\n".join(lines)