"""ClaudeProvider tests with a fake client - no network, no API key needed."""

from types import SimpleNamespace

import pytest

from ats_ai.config import load_settings
from ats_ai.providers.base import LLMError
from ats_ai.providers.claude_provider import ClaudeProvider


class FakeMessages:
    def __init__(self, response=None, error=None):
        self.response, self.error, self.calls = response, error, []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self.error:
            raise self.error
        return self.response


def make_provider(tmp_path, response=None, error=None):
    env = tmp_path / ".env"
    env.write_text("")
    messages = FakeMessages(response, error)
    provider = ClaudeProvider(load_settings(env), client=SimpleNamespace(messages=messages))
    return provider, messages


def text_response(text, stop="end_turn"):
    return SimpleNamespace(content=[SimpleNamespace(type="text", text=text)], stop_reason=stop, usage=None)


def tool_response(data, name="submit_result"):
    return SimpleNamespace(
        content=[SimpleNamespace(type="tool_use", name=name, input=data)], stop_reason="tool_use", usage=None
    )


def test_generate_text(tmp_path):
    provider, messages = make_provider(tmp_path, text_response("OK"))
    assert provider.generate_text("sys", "hi") == "OK"
    assert messages.calls[0]["temperature"] == 0.0
    assert messages.calls[0]["system"] == "sys"


def test_generate_json_forces_tool(tmp_path):
    schema = {"type": "object", "properties": {"name": {"type": "string"}}}
    provider, messages = make_provider(tmp_path, tool_response({"name": "Priya"}))
    assert provider.generate_json("sys", "hi", schema=schema) == {"name": "Priya"}
    call = messages.calls[0]
    assert call["tool_choice"] == {"type": "tool", "name": "submit_result"}
    assert call["tools"][0]["input_schema"] == schema


def test_missing_tool_block_is_retryable(tmp_path):
    provider, _ = make_provider(tmp_path, text_response("no tool"))
    with pytest.raises(LLMError) as err:
        provider.generate_json("sys", "hi", schema={"type": "object"})
    assert err.value.retryable


def test_cut_off_reply(tmp_path):
    provider, _ = make_provider(tmp_path, text_response("partial", stop="max_tokens"))
    with pytest.raises(LLMError, match="LLM_MAX_TOKENS"):
        provider.generate_text("sys", "hi")


@pytest.mark.parametrize(
    "status,retryable,msg",
    [(401, False, "API key"), (404, False, "CLAUDE_MODEL"), (429, True, "rate limit"), (529, True, "server error")],
)
def test_error_mapping(tmp_path, status, retryable, msg):
    exc = Exception("boom")
    exc.status_code = status
    provider, _ = make_provider(tmp_path, error=exc)
    with pytest.raises(LLMError, match=msg) as err:
        provider.generate_text("sys", "hi")
    assert err.value.retryable is retryable


def test_health_check(tmp_path):
    provider, _ = make_provider(tmp_path, text_response("OK"))
    assert provider.health_check() is True
