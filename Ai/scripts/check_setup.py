"""Phase 1 check:  python scripts/check_setup.py
Checks Python, packages, settings, and makes ONE tiny Claude call."""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def step(ok: bool, label: str, detail: str = "") -> bool:
    print(f"{'OK  ' if ok else 'FAIL'} {label}" + (f" - {detail}" if detail else ""))
    return ok


def main() -> int:
    ok = step(sys.version_info >= (3, 11), "Python 3.11+", sys.version.split()[0])

    for pkg in ("anthropic", "pydantic", "dotenv"):
        try:
            __import__(pkg)
            ok &= step(True, f"package {pkg}")
        except ImportError:
            ok &= step(False, f"package {pkg}", "run: pip install -r requirements.txt")
    if not ok:
        return 1

    from ats_ai.config import Settings
    from ats_ai.errors import ConfigError
    from ats_ai.providers import ProviderError, get_provider

    try:
        settings = Settings.from_env()
    except ConfigError as e:
        return 0 if step(False, "settings", str(e)) else 1
    step(True, "settings", f"model={settings.claude_model}, parallel={settings.max_parallel_resumes}")

    if not os.environ.get("ANTHROPIC_API_KEY", "").strip():
        step(False, "ANTHROPIC_API_KEY", "not set (put it in GitHub/Codespaces secrets or your shell)")
        return 1
    step(True, "ANTHROPIC_API_KEY", "set")

    try:
        reply = get_provider(settings).complete("Reply with the single word OK.", "ping")
    except ProviderError as e:
        step(False, "Claude call", str(e))
        return 1
    step(True, "Claude call", reply.strip()[:20])
    print("\nAll good.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
