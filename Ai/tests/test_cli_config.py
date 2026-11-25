import json

import pytest

from ats_ai import ConfigError, Settings
from ats_ai.__main__ import main

from conftest import FakeProvider, llm_payload


def _provider():
    return FakeProvider(
        [
            ("Rahul Sharma", llm_payload(88, 85, 90, 20, name="Rahul Sharma")),
            ("Priya Verma", llm_payload(40, 25, 45, 30, name="Priya Verma")),
        ]
    )


def test_cli_writes_the_output_file(tmp_path, example_request, capsys):
    src, dst = tmp_path / "in.json", tmp_path / "out.json"
    src.write_text(json.dumps(example_request), encoding="utf-8")

    assert main([str(src), "-o", str(dst)], provider=_provider()) == 0

    out = json.loads(dst.read_text(encoding="utf-8"))
    assert out["status"] == "partially_failed" and out["results"][0]["overall_score"] == 77.05
    assert "2/3 scored" in capsys.readouterr().out


def test_cli_prints_json_without_output_flag(tmp_path, example_request, capsys):
    src = tmp_path / "in.json"
    src.write_text(json.dumps(example_request), encoding="utf-8")
    assert main([str(src)], provider=_provider()) == 0
    assert json.loads(capsys.readouterr().out)["job_id"] == example_request["job_id"]


def test_cli_exit_code_2_for_rejected_request(tmp_path, example_request, capsys):
    example_request["jd_text"] = ""
    src = tmp_path / "in.json"
    src.write_text(json.dumps(example_request), encoding="utf-8")
    assert main([str(src)], provider=_provider()) == 2
    assert "jd_text is empty" in capsys.readouterr().err


def test_cli_exit_code_2_for_unreadable_file(tmp_path, capsys):
    assert main([str(tmp_path / "missing.json")]) == 2
    bad = tmp_path / "bad.json"
    bad.write_text("{not json", encoding="utf-8")
    assert main([str(bad)]) == 2


def test_cli_exit_code_3_without_api_key(tmp_path, example_request, monkeypatch, capsys):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    src = tmp_path / "in.json"
    src.write_text(json.dumps(example_request), encoding="utf-8")
    assert main([str(src)]) == 3
    assert "ANTHROPIC_API_KEY" in capsys.readouterr().err


def test_settings_defaults_match_env_example():
    s = Settings()
    assert (s.claude_model, s.temperature, s.max_output_tokens, s.timeout_seconds, s.max_retries) == ("claude-haiku-5-5", 0.0, 4096, 90.0, 2)
    assert (s.max_resumes_per_batch, s.max_parallel_resumes) == (20, 5)


def test_settings_read_environment(monkeypatch):
    for key, value in {
        "CLAUDE_MODEL": "claude-test",
        "LLM_TEMPERATURE": "0.3",
        "LLM_MAX_TOKENS": "1234",
        "LLM_TIMEOUT_SECONDS": "12",
        "LLM_MAX_RETRIES": "1",
        "MAX_RESUMES_PER_BATCH": "7",
        "MAX_PARALLEL_RESUMES": "3",
        "LOG_LEVEL": "debug",
    }.items():
        monkeypatch.setenv(key, value)
    s = Settings.from_env()
    assert (s.claude_model, s.temperature, s.max_output_tokens, s.timeout_seconds) == ("claude-test", 0.3, 1234, 12.0)
    assert (s.max_retries, s.max_resumes_per_batch, s.max_parallel_resumes, s.log_level) == (1, 7, 3, "DEBUG")


def test_settings_reject_bad_values(monkeypatch):
    monkeypatch.setenv("LLM_MAX_TOKENS", "lots")
    with pytest.raises(ConfigError):
        Settings.from_env()
    with pytest.raises(ConfigError):
        Settings(weights={"skills": 50, "experience": 50, "education": 50, "certifications": 50})
