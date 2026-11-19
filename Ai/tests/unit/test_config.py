import pytest

from ats_ai.config import ConfigError, load_settings

ENV_KEYS = [
    "ANTHROPIC_API_KEY", "CLAUDE_MODEL",
    "LLM_TEMPERATURE", "LLM_MAX_TOKENS", "LLM_TIMEOUT_SECONDS", "LLM_MAX_RETRIES",
    "MAX_RESUMES_PER_BATCH", "MAX_PARALLEL_RESUMES", "LOG_LEVEL",
]


@pytest.fixture(autouse=True)
def clean_env(monkeypatch, tmp_path):
    for key in ENV_KEYS:
        monkeypatch.delenv(key, raising=False)
    # point at an empty .env so a developer's real .env does not leak into tests
    empty = tmp_path / ".env"
    empty.write_text("")
    return empty


def test_defaults(clean_env):
    s = load_settings(clean_env)
    assert s.claude_model == "claude-haiku-5-5"
    assert s.llm_temperature == 0.0
    assert s.max_resumes_per_batch == 20


def test_reads_env(monkeypatch, clean_env):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-1234567890")
    monkeypatch.setenv("CLAUDE_MODEL", "claude-opus-5-5")
    monkeypatch.setenv("MAX_PARALLEL_RESUMES", "3")
    s = load_settings(clean_env)
    assert s.active_model == "claude-opus-5-5"
    assert s.max_parallel_resumes == 3
    s.require_api_key()  # does not raise


def test_missing_key_is_clear(clean_env):
    s = load_settings(clean_env)
    with pytest.raises(ConfigError, match="ANTHROPIC_API_KEY"):
        s.require_api_key()


@pytest.mark.parametrize(
    "key,value",
    [
        ("LOG_LEVEL", "LOUD"),
        ("LLM_TEMPERATURE", "2"),
        ("MAX_RESUMES_PER_BATCH", "21"),
        ("LLM_MAX_RETRIES", "abc"),
    ],
)
def test_invalid_values(monkeypatch, clean_env, key, value):
    monkeypatch.setenv(key, value)
    with pytest.raises(ConfigError):
        load_settings(clean_env)


def test_masked_hides_key(monkeypatch, clean_env):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-secret-value-9999")
    masked = load_settings(clean_env).masked()
    assert "secret" not in masked["anthropic_api_key"]