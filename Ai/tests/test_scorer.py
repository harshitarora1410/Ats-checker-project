import json

import pytest

from ats_ai import ScoringError, Settings, score
from ats_ai.providers import BaseProvider, ProviderError
from ats_ai.scorer import compute_overall, extract_json, verdict_for
from ats_ai.schemas import SectionScore


def _payload(skills=80, experience=60, education=100, certifications=None):
    def sec(s):
        return {"score": s, "matched": ["a"], "missing": ["b"], "reason": "r"}

    return {
        "skills": sec(skills),
        "experience": sec(experience),
        "education": sec(education),
        "certifications": sec(certifications),
        "summary": "ok",
    }


class FakeProvider(BaseProvider):
    name = "fake"
    model = "fake-1"

    def __init__(self, *replies):
        self.replies = list(replies)
        self.calls = []

    def complete(self, system, user):
        self.calls.append(user)
        reply = self.replies.pop(0)
        if isinstance(reply, Exception):
            raise reply
        return reply if isinstance(reply, str) else json.dumps(reply)


S = Settings()


def test_weights_renormalise_when_section_not_applicable():
    # skills 80*.35 + exp 60*.35 + edu 100*.15 = 64 ; weights used = .85 -> 75.29 -> 75
    res = score("resume", "jd", provider=FakeProvider(_payload()), settings=S)
    assert res.overall_score == 75
    assert res.verdict == "Strong fit"
    assert res.sections["certifications"].score is None


def test_all_sections_scored():
    res = score("r", "j", provider=FakeProvider(_payload(certifications=40)), settings=S)
    # 28 + 21 + 15 + 6 = 70
    assert res.overall_score == 70
    assert res.verdict == "Moderate fit"


def test_code_fenced_json_is_accepted():
    raw = "```json\n" + json.dumps(_payload(certifications=50)) + "\n```"
    res = score("r", "j", provider=FakeProvider(raw), settings=S)
    assert res.overall_score > 0


def test_retries_once_on_invalid_output_then_succeeds():
    p = FakeProvider("not json at all", _payload(certifications=50))
    res = score("r", "j", provider=p, settings=S)
    assert len(p.calls) == 2
    assert "could not be used" in p.calls[1]
    assert res.provider == "fake"


def test_fails_after_retries_exhausted():
    p = FakeProvider("nope", "still nope")
    with pytest.raises(ScoringError):
        score("r", "j", provider=p, settings=S)


def test_out_of_range_score_is_rejected():
    bad = _payload(skills=150)
    with pytest.raises(ScoringError):
        score("r", "j", provider=FakeProvider(bad, bad), settings=S)


def test_provider_error_becomes_scoring_error():
    with pytest.raises(ScoringError):
        score("r", "j", provider=FakeProvider(ProviderError("boom")), settings=S)


def test_empty_inputs_rejected():
    with pytest.raises(ScoringError):
        score("  ", "jd", provider=FakeProvider(), settings=S)
    with pytest.raises(ScoringError):
        score("resume", "", provider=FakeProvider(), settings=S)


def test_float_scores_are_rounded():
    p = _payload(skills=79.6, certifications=50)
    res = score("r", "j", provider=FakeProvider(p), settings=S)
    assert res.sections["skills"].score == 80


def test_verdict_boundaries():
    assert verdict_for(75, S) == "Strong fit"
    assert verdict_for(74, S) == "Moderate fit"
    assert verdict_for(50, S) == "Moderate fit"
    assert verdict_for(49, S) == "Weak fit"


def test_extract_json_with_surrounding_prose():
    assert extract_json('Here you go: {"a": 1} thanks') == {"a": 1}


def test_compute_overall_all_none_raises():
    secs = {k: SectionScore(score=None) for k in ("skills", "experience", "education", "certifications")}
    with pytest.raises(ScoringError):
        compute_overall(secs, S)


def test_invalid_weights_rejected():
    with pytest.raises(ValueError):
        Settings(weights={"skills": 0.5, "experience": 0.5, "education": 0.5, "certifications": 0.5})