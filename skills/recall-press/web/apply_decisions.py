"""Import a map export while the engine holds the workspace lock."""
if __name__ == "__main__":
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from recallpress import engine
from recallpress.storage import load


def import_decisions(payload, workspace):
    run = payload["run_id"]
    path = engine.result_path(workspace, run)
    result = load(path)
    by_claim = {v["claim_id"]: v for v in result["verdicts"]}
    decisions = payload["decisions"]
    if not isinstance(decisions, list):
        raise ValueError("Expected a decisions array")
    seen = set()
    approved = []
    for item in decisions:
        claim, action = item["claim_id"], item["decision"]
        verdict = by_claim[claim]
        if claim in seen or action not in ("apply", "skip"):
            raise ValueError(f"Duplicate or invalid decision for {claim}")
        if verdict["status"] not in engine.FIXABLE or verdict.get("already_issued"):
            raise ValueError(f"No eligible replacement for {claim}")
        if "replacement_sentence" in item:
            wording = item["replacement_sentence"]
            if action != "apply" or not isinstance(wording, str) or not wording.strip():
                raise ValueError(f"Invalid edited sentence for {claim}")
            if wording.strip() != verdict.get("replacement_sentence"):
                verdict["editor_replacement"] = wording.strip()
        if action == "apply":
            approved.append(verdict)
        verdict["decision"] = {"apply": "applied", "skip": "skipped"}[action]
        seen.add(claim)
    engine.save_drafts(workspace, path, result, approved)
    return {"recorded": len(decisions), **engine.render_map(workspace, run)}


if __name__ == "__main__":
    from recallpress.__main__ import main
    sys.argv[1:1] = ["decide", "--from"]
    raise SystemExit(main())
