import json

import pytest

from ats_ai import ConfigError, RequestError, Settings, analyze
from ats_ai.providers import ProviderError

from conftest import FakeProvider, llm_payload, section

S = Settings()


def example_provider():
    return FakeProvider(
        [
            ("Rahul Sharma", llm_payload(88, 85, 90, 20, name="Rahul Sharma")),
            ("Priya Verma", llm_payload(40, 25, 45, 30, name="Priya Verma")),
        ]
    )


# ---------- the contract example, end to end ----------
def test_contract_example_values(example_request):
    out = analyze(example_request, provider=example_provider(), settings=S)

    assert out["status"] == "partially_failed"
    assert (out["total_resumes"], out["succeeded"], out["failed"]) == (3, 2, 1)
    assert out["model_used"] == "fake-model"
    assert out["section_weights"] == {"skills": 35, "experience": 35, "education": 15, "certifications": 15}

    rahul, priya, empty = out["results"]
    assert (rahul["rank"], rahul["overall_score"], rahul["verdict"]) == (1, 77.05, "strong")
    assert (priya["rank"], priya["overall_score"], priya["verdict"]) == (2, 34.0, "weak")
    assert rahul["section_scores"] == {"skills": 88, "experience": 85, "education": 90, "certifications": 20}
    assert rahul["report_text"].startswith("ATS REPORT - Rahul Sharma\nOverall: 77.05/100 (Strong fit)")
    assert "Skills 88 | Experience 85 | Education 90 | Certifications 20" in rahul["report_text"]

    assert empty["status"] == "failed" and empty["error_message"] == "Resume text is empty"
    assert empty["rank"] is None
    assert all(empty[k] is None for k in ("candidate_name", "overall_score", "verdict", "summary", "section_scores", "details", "report_text"))


def test_output_has_exactly_the_keys_of_the_contract_example(example_request, example_response):
    out = analyze(example_request, provider=example_provider(), settings=S)

    assert list(out) == list(example_response)
    for got, want in zip(out["results"], example_response["results"]):
        assert list(got) == list(want)
        if want["details"]:
            assert list(got["details"]) == list(want["details"])
            assert list(got["details"]["skills"]) == list(want["details"]["skills"])
            assert list(got["section_scores"]) == list(want["section_scores"])


def test_response_is_plain_json(example_request):
    out = analyze(example_request, provider=example_provider(), settings=S)
    assert json.loads(json.dumps(out)) == out


# ---------- the whole request is rejected, nothing is scored ----------
@pytest.mark.parametrize(
    "mutate, expected",
    [
        (lambda r: r.update(jd_text="   "), "jd_text is empty"),
        (lambda r: r.update(resumes=[]), "1 to 20"),
        (lambda r: r.update(resumes=[{"resume_id": f"id{i}", "resume_text": "x"} for i in range(21)]), "1 to 20"),
        (lambda r: r["resumes"][1].update(resume_id=r["resumes"][0]["resume_id"]), "duplicate resume_id"),
        (lambda r: r.update(section_weights={"skills": 50, "experience": 30, "education": 10, "certifications": 5}), "add up to 100"),
        (lambda r: r.update(section_weights={"skills": 100}), "exactly the keys"),
        (lambda r: r.update(contract_version="2.0"), "contract_version"),
        (lambda r: r.pop("job_id"), "job_id"),
    ],
)
def test_request_rejected(example_request, mutate, expected):
    mutate(example_request)
    provider = example_provider()
    with pytest.raises(RequestError) as err:
        analyze(example_request, provider=provider, settings=S)
    assert expected in str(err.value)
    assert provider.prompts == []  # nothing was sent to Claude


def test_request_must_be_an_object():
    with pytest.raises(RequestError):
        analyze(["not", "an", "object"], settings=S)


# ---------- failures stay on the one resume ----------
def test_invalid_output_is_retried_then_marked_failed_others_still_scored(make_request):
    req = make_request(("r-bad", "Bad Person resume"), ("r-ok", "Good Person resume"))
    provider = FakeProvider([("Bad Person", "this is not json"), ("Good Person", llm_payload(80, 80, 80, 80))])
    out = analyze(req, provider=provider, settings=S)

    bad = next(r for r in out["results"] if r["resume_id"] == "r-bad")
    good = next(r for r in out["results"] if r["resume_id"] == "r-ok")
    assert bad["status"] == "failed" and bad["error_message"] == "AI response failed validation after retries"
    assert good["status"] == "done" and good["overall_score"] == 80.0
    assert provider.calls["Bad Person"] == 3  # 1 call + 2 retries (contract section 5)
    assert out["status"] == "partially_failed"
    assert out["results"][-1]["resume_id"] == "r-bad"  # failed ones last


def test_retry_prompt_contains_the_error_and_second_try_can_succeed(make_request):
    req = make_request(("r1", "Some Person resume"))
    provider = FakeProvider([("Some Person", ["oops", llm_payload(70, 70, 70, 70)])])
    out = analyze(req, provider=provider, settings=S)
    assert out["results"][0]["status"] == "done"
    assert provider.calls["Some Person"] == 2
    assert "could not be used" in provider.prompts[1]


def test_score_out_of_range_is_rejected_and_retried(make_request):
    req = make_request(("r1", "Some Person resume"))
    provider = FakeProvider([("Some Person", [llm_payload(150, 70, 70, 70), llm_payload(90, 70, 70, 70)])])
    out = analyze(req, provider=provider, settings=S)
    assert out["results"][0]["section_scores"]["skills"] == 90


def test_code_fenced_json_is_accepted(make_request):
    req = make_request(("r1", "Some Person resume"))
    provider = FakeProvider([("Some Person", "```json\n" + json.dumps(llm_payload(60, 60, 60, 60)) + "\n```")])
    assert analyze(req, provider=provider, settings=S)["results"][0]["overall_score"] == 60.0


def test_provider_error_marks_resume_failed_without_leaking_details(make_request):
    req = make_request(("r1", "Some Person resume"))
    provider = FakeProvider([("Some Person", ProviderError("AuthenticationError sk-ant-SECRET-123"))])
    out = analyze(req, provider=provider, settings=S)
    assert out["status"] == "failed"
    assert out["results"][0]["error_message"] == "AI service error, please try again"
    assert "SECRET" not in json.dumps(out)


def test_unexpected_exception_in_one_resume_does_not_break_the_batch(make_request):
    req = make_request(("r1", "Boom Person resume"), ("r2", "Fine Person resume"))
    provider = FakeProvider([("Boom Person", RuntimeError("bug")), ("Fine Person", llm_payload(70, 70, 70, 70))])
    out = analyze(req, provider=provider, settings=S)
    by_id = {r["resume_id"]: r for r in out["results"]}
    assert by_id["r1"]["error_message"] == "Unexpected error while scoring this resume"
    assert by_id["r2"]["status"] == "done"


def test_all_resumes_empty_needs_no_api_key(make_request, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    out = analyze(make_request(("r1", ""), ("r2", "   ")), settings=S)
    assert out["status"] == "failed" and out["failed"] == 2 and out["succeeded"] == 0
    assert out["model_used"] == S.claude_model


def test_missing_api_key_is_a_config_error_not_a_failed_resume(make_request, monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(ConfigError):
        analyze(make_request(("r1", "Some Person resume")), settings=S)


# ---------- ranking and weights ----------
def test_ranking_tie_breaks_skills_then_input_order(make_request):
    # A, B and C all score 70.0 overall. A has the higher skills score; B and C are identical.
    req = make_request(("B", "Bee resume"), ("A", "Ay resume"), ("C", "See resume"))
    provider = FakeProvider(
        [
            ("Bee", llm_payload(60, 80, 70, 70)),
            ("Ay", llm_payload(80, 60, 70, 70)),
            ("See", llm_payload(60, 80, 70, 70)),
        ]
    )
    out = analyze(req, provider=provider, settings=S)
    assert [(r["resume_id"], r["rank"], r["overall_score"]) for r in out["results"]] == [("A", 1, 70.0), ("B", 2, 70.0), ("C", 3, 70.0)]


def test_ranking_tie_break_experience_when_skills_also_tie(make_request):
    weights = {"skills": 40, "experience": 30, "education": 15, "certifications": 15}
    req = make_request(("E", "Eee resume"), ("D", "Dee resume"), section_weights=weights)
    provider = FakeProvider([("Eee", llm_payload(80, 60, 50, 50)), ("Dee", llm_payload(80, 70, 40, 40))])
    out = analyze(req, provider=provider, settings=S)
    assert [r["overall_score"] for r in out["results"]] == [65.0, 65.0]
    assert [r["resume_id"] for r in out["results"]] == ["D", "E"]  # D has the higher experience score


def test_custom_weights_are_used_and_returned(make_request):
    weights = {"skills": 50, "experience": 30, "education": 10, "certifications": 10}
    req = make_request(("r1", "Some Person resume"), section_weights=weights)
    out = analyze(req, provider=FakeProvider([("Some Person", llm_payload(100, 50, 0, 0))]), settings=S)
    assert out["section_weights"] == weights
    assert out["results"][0]["overall_score"] == 65.0  # (100*50 + 50*30) / 100


def test_not_applicable_section_counts_as_fully_met(make_request):
    req = make_request(("r1", "Some Person resume"))
    no_certs = section(None, matched=(), missing=(), reasoning="", applicable=False)
    out = analyze(req, provider=FakeProvider([("Some Person", llm_payload(80, 60, 70, no_certs))]), settings=S)
    r = out["results"][0]
    assert r["section_scores"]["certifications"] == 100.0
    assert r["overall_score"] == 74.5  # (80*35 + 60*35 + 70*15 + 100*15) / 100
    assert r["verdict"] == "moderate"
    assert r["details"]["certifications"]["reasoning"] == "Not required by the job description."


def test_long_input_is_truncated_before_sending(make_request):
    provider = FakeProvider([("AAAA", llm_payload(70, 70, 70, 70))])
    analyze(make_request(("r1", "AAAA" * 20_000)), provider=provider, settings=Settings(max_input_chars=1000))
    assert "[...truncated...]" in provider.prompts[0]
    assert len(provider.prompts[0]) < 5000


def test_parallelism_is_capped(make_request):
    resumes = [(f"r{i}", f"Person{i} resume") for i in range(6)]
    provider = FakeProvider([(f"Person{i}", llm_payload(70, 70, 70, 70)) for i in range(6)], delay=0.05)
    out = analyze(make_request(*resumes), provider=provider, settings=Settings(max_parallel_resumes=2))
    assert out["succeeded"] == 6
    assert provider.max_active == 2  # parallel, but never more than the limit


def test_results_keep_input_resume_ids_and_job_id(make_request):
    out = analyze(make_request(("r1", "Some Person resume"), job_id="job-123"), provider=FakeProvider([("Some Person", llm_payload(70, 70, 70, 70))]), settings=S)
    assert out["job_id"] == "job-123" and out["contract_version"] == "1.0"
    assert out["results"][0]["resume_id"] == "r1"
