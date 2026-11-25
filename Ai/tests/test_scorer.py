import pytest

from ats_ai import Settings
from ats_ai.report import build_report_text
from ats_ai.scoring import overall_score, verdict_for
from ats_ai.utils import extract_json

S = Settings()
W = {"skills": 35, "experience": 35, "education": 15, "certifications": 15}


def test_overall_matches_the_contract_examples():
    assert overall_score({"skills": 88, "experience": 85, "education": 90, "certifications": 20}, W) == 77.05
    assert overall_score({"skills": 40, "experience": 25, "education": 45, "certifications": 30}, W) == 34.0


def test_overall_is_rounded_to_two_decimals():
    # 33.333 * 35 / 100 = 11.66655 -> 11.67
    assert overall_score({"skills": 33.333, "experience": 0, "education": 0, "certifications": 0}, W) == 11.67


@pytest.mark.parametrize(
    "score, verdict",
    [(100, "strong"), (75.0, "strong"), (74.99, "moderate"), (50.0, "moderate"), (49.99, "weak"), (0, "weak")],
)
def test_verdict_boundaries(score, verdict):
    assert verdict_for(score, S) == verdict


def test_extract_json_handles_fences_and_prose():
    assert extract_json('Sure! {"a": 1} Hope this helps') == {"a": 1}
    assert extract_json('```json\n{"a": 2}\n```') == {"a": 2}
    with pytest.raises(ValueError):
        extract_json("no json here")


def test_report_text_layout():
    details = {
        n: {"matched": [f"{n}-ok"], "missing": [f"{n}-gap"], "reasoning": ""}
        for n in ("skills", "experience", "education", "certifications")
    }
    text = build_report_text("Asha", 77.05, "strong", {"skills": 88, "experience": 85, "education": 90, "certifications": 20.5}, details, ["Fix A", "Fix B"])
    lines = text.split("\n")
    assert lines[0] == "ATS REPORT - Asha"
    assert lines[1] == "Overall: 77.05/100 (Strong fit)"
    assert lines[3] == "Skills 88 | Experience 85 | Education 90 | Certifications 20.5"
    assert "Recommendations:" in lines and lines[-1] == "2. Fix B"


def test_report_text_without_name_or_recommendations():
    details = {n: {"matched": [], "missing": [], "reasoning": ""} for n in ("skills", "experience", "education", "certifications")}
    text = build_report_text(None, 10.0, "weak", {"skills": 10, "experience": 10, "education": 10, "certifications": 10}, details, [])
    assert text.startswith("ATS REPORT - Candidate") and "none identified" in text and "Recommendations" not in text