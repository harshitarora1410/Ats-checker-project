"""See the package work WITHOUT an API key:  python scripts/demo_offline.py
Runs contracts/input.example.json through analyze() with a stand-in for Claude, then compares the
result with contracts/output.example.json. (For a real run use: python -m ats_ai input.json -o out.json)"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ats_ai import Settings, analyze  # noqa: E402
from ats_ai.providers import BaseProvider  # noqa: E402


def sec(score, matched, missing, reasoning):
    return {"score": score, "applicable": True, "matched": matched, "missing": missing, "reasoning": reasoning}


CANNED = {
    "Rahul Sharma": {
        "candidate_name": "Rahul Sharma",
        "skills": sec(88, ["Python", "FastAPI", "PostgreSQL", "Git"], ["AWS"], "Has every required skill; AWS is missing."),
        "experience": sec(85, ["4 years Python backend"], [], "Exceeds the 3+ years requirement."),
        "education": sec(90, ["B.Tech in Computer Science"], [], "Matches the required degree."),
        "certifications": sec(20, [], ["Cloud certification"], "No certifications listed."),
        "summary": "Strong backend profile; missing AWS and a cloud certification.",
        "recommendations": ["Add AWS experience", "Get a cloud certification", "Quantify impact in every role"],
    },
    "Priya Verma": {
        "candidate_name": "Priya Verma",
        "skills": sec(40, ["Python", "SQL"], ["FastAPI or Django", "REST API design"], "2 of 5 required skills."),
        "experience": sec(25, ["Python scripting"], ["3+ years backend"], "Data analysis, not backend."),
        "education": sec(45, ["B.Sc in Mathematics"], ["B.Tech in CS"], "Related, not the required degree."),
        "certifications": sec(30, ["Google Data Analytics"], ["Cloud certification"], "Not a cloud certification."),
        "summary": "Python and SQL only; no backend framework or API experience.",
        "recommendations": ["Build a FastAPI project", "Add Git and REST skills", "Highlight automation work"],
    },
}


class StandInForClaude(BaseProvider):
    name, model = "stand-in", "claude-haiku-5-5"

    def complete(self, system: str, user: str) -> str:
        for key, payload in CANNED.items():
            if key in user:
                return json.dumps(payload)
        raise RuntimeError("unexpected prompt")


def main() -> None:
    request = json.loads((ROOT / "contracts" / "input.example.json").read_text(encoding="utf-8"))
    expected = json.loads((ROOT / "contracts" / "output.example.json").read_text(encoding="utf-8"))
    out = analyze(request, provider=StandInForClaude(), settings=Settings())

    print(f"status={out['status']}  model={out['model_used']}  weights={out['section_weights']}")
    print(f"{'rank':<5}{'resume_id':<40}{'status':<8}{'overall':<9}{'verdict':<10}error")
    for r in out["results"]:
        print(f"{str(r['rank']):<5}{r['resume_id']:<40}{r['status']:<8}{str(r['overall_score']):<9}{str(r['verdict']):<10}{r['error_message'] or ''}")
    print("\n--- report_text of rank 1 ---\n" + out["results"][0]["report_text"])

    same_shape = list(out) == list(expected) and all(list(a) == list(b) for a, b in zip(out["results"], expected["results"]))
    same_numbers = [(r["rank"], r["overall_score"], r["verdict"], r["status"]) for r in out["results"]] == [
        (r["rank"], r["overall_score"], r["verdict"], r["status"]) for r in expected["results"]
    ]
    print(f"\nsame fields as output.example.json : {same_shape}")
    print(f"same ranks/scores/verdicts/status  : {same_numbers}")
    sys.exit(0 if same_shape and same_numbers else 1)


if __name__ == "__main__":
    main()
