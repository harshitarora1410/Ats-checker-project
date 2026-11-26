import copy
import json
import threading
import time
from pathlib import Path

import pytest

from ats_ai.providers import BaseProvider

CONTRACTS = Path(__file__).resolve().parents[1] / "contracts"


def section(score, matched=("a",), missing=("b",), reasoning="because", applicable=True):
    return {"score": score, "applicable": applicable, "matched": list(matched), "missing": list(missing), "reasoning": reasoning}


def llm_payload(skills, experience, education, certifications, name="Test Person", **extra):
    """What Claude is expected to return for one resume."""
    cert = certifications if isinstance(certifications, dict) else section(certifications)
    payload = {
        "candidate_name": name,
        "skills": section(skills),
        "experience": section(experience),
        "education": section(education),
        "certifications": cert,
        "summary": "Short summary.",
        "recommendations": ["Do A", "Do B", "Do C"],
    }
    payload.update(extra)
    return payload


class FakeProvider(BaseProvider):
    """Offline stand-in for Claude. rules = [(text_that_appears_in_the_prompt, reply)].
    A reply can be a dict (sent as JSON), a str, an Exception (raised), or a list of those
    (one per call; the last one repeats)."""

    name = "fake"
    model = "fake-model"

    def __init__(self, rules, delay=0.0):
        self.rules = [(key, list(r) if isinstance(r, list) else [r]) for key, r in rules]
        self.delay = delay
        self.calls = {key: 0 for key, _ in rules}
        self.prompts = []
        self.max_active = 0
        self._active = 0
        self._lock = threading.Lock()

    def complete(self, system, user):
        with self._lock:
            self._active += 1
            self.max_active = max(self.max_active, self._active)
            self.prompts.append(user)
        try:
            if self.delay:
                time.sleep(self.delay)
            for key, replies in self.rules:
                if key in user:
                    with self._lock:
                        self.calls[key] += 1
                        reply = replies.pop(0) if len(replies) > 1 else replies[0]
                    if isinstance(reply, Exception):
                        raise reply
                    return reply if isinstance(reply, str) else json.dumps(reply)
            raise AssertionError("FakeProvider got a prompt that matches no rule")
        finally:
            with self._lock:
                self._active -= 1


@pytest.fixture
def example_request():
    return json.loads((CONTRACTS / "input.example.json").read_text(encoding="utf-8"))


@pytest.fixture
def example_response():
    return json.loads((CONTRACTS / "output.example.json").read_text(encoding="utf-8"))


@pytest.fixture
def make_request(example_request):
    """Build a small valid request: make_request(("id-1", "text one"), ("id-2", "text two"), ...)."""

    def _make(*resumes, **overrides):
        req = copy.deepcopy(example_request)
        req["resumes"] = [{"resume_id": rid, "resume_text": text} for rid, text in resumes]
        req.update(overrides)
        return req

    return _make
