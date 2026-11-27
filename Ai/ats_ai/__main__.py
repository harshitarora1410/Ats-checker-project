"""CLI:  python -m ats_ai input.json -o output.json   (JSON file in, JSON file out)"""
from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from .config import Settings
from .errors import ConfigError, RequestError
from .providers import BaseProvider
from .scorer import analyze

EXIT_OK, EXIT_BAD_REQUEST, EXIT_CONFIG = 0, 2, 3


def main(argv: list[str] | None = None, *, provider: BaseProvider | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m ats_ai", description="Score resumes against a job description.")
    parser.add_argument("input", help="request JSON file (see contracts/input.example.json)")
    parser.add_argument("-o", "--output", help="where to write the response JSON (default: print it)")
    args = parser.parse_args(argv)

    try:
        settings = Settings.from_env()
        logging.basicConfig(level=settings.log_level, format="%(levelname)s %(name)s: %(message)s", stream=sys.stderr)
        try:
            request = json.loads(Path(args.input).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as e:
            print(f"Cannot read the input file: {e}", file=sys.stderr)
            return EXIT_BAD_REQUEST
        response = analyze(request, provider=provider, settings=settings)
    except RequestError as e:
        print("Request rejected, nothing was scored:", file=sys.stderr)
        for problem in e.problems:
            print(f"  - {problem}", file=sys.stderr)
        return EXIT_BAD_REQUEST
    except ConfigError as e:
        print(f"Configuration error: {e}", file=sys.stderr)
        return EXIT_CONFIG

    text = json.dumps(response, indent=2, ensure_ascii=False)
    if args.output:
        Path(args.output).write_text(text + "\n", encoding="utf-8")
        print(f"{response['status']}: {response['succeeded']}/{response['total_resumes']} scored -> {args.output}")
    else:
        print(text)
    return EXIT_OK


if __name__ == "__main__":
    sys.exit(main())