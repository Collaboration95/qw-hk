import json
import shutil
import subprocess
import sys

from recallpress.storage import ROOT


def test_relocated_skill_replay(tmp_path):
    skill = tmp_path / "Installed Skill"
    shutil.copytree(ROOT / "skills/recall-press", skill, ignore=shutil.ignore_patterns("__pycache__"))
    workspace = tmp_path / "Project files"
    def cli(*args):
        result = subprocess.run([sys.executable, "-I", skill / "run.py", *map(str, args), "--workspace", workspace],
                                cwd=tmp_path, capture_output=True, text=True)
        assert result.returncode == 0, result.stderr
        return json.loads(result.stdout)
    doc = skill / "samples/members-briefing-2025q3.pptx"
    registered = cli("register", doc, "--registered-on", "2025-10-20")
    assert {c["series_id"] for c in registered["claims"]} == {"sg-gdp-services-qoq", "sg-gdp-manufacturing-yoy"}
    result = cli("check", "--offline", "--as-of", "2025-11-21", "--trigger", "replay")
    eligible = next(v for v in result["verdicts"] if v["status"] == "now_wrong")
    assert "5.0" in eligible["reason"]
    args = ["--run", result["run_id"]]
    vote = cli("judge", *args, "--claim", eligible["claim_id"], "--status", "now_wrong", "--reason", "5.0% is positive growth.")
    assert not vote["disagreement"]
    assert cli("fix", *args)["replacement_files"] == 1
    from pathlib import Path
    output = Path(cli("map", *args)["map"]).read_text()
    assert "5.0%" in output and "base64," in output
    export = tmp_path / "decisions.json"
    wording = "Manufacturing output grew 5.0% year on year in Q3 2025."
    export.write_text(json.dumps({"run_id": result["run_id"], "decisions": [{
        "claim_id": eligible["claim_id"], "decision": "apply", "replacement_sentence": wording}]}))
    assert cli("decide", "--from", export)["recorded"] == 1
    stored = json.loads((workspace / "runs" / result["run_id"] / "result.json").read_text())
    v = next(v for v in stored["verdicts"] if v["claim_id"] == eligible["claim_id"])
    assert (v["decision"], v["replacement_sentence"], v["agent_reason"]) == ("applied", wording, vote["agent_reason"])
    from recallpress.documents import open_document
    assert wording in [b.text for b in open_document(workspace / v["replacement_file"])[1]]
    assert cli("decide", "--from", export)["recorded"] == 1
    assert cli("check", "--offline", "--as-of", "2025-11-22")["no_change"]
    # Without the optional Surface renderer the same run still produces a map.
    shutil.rmtree(skill / "web")
    assert "<table>" in Path(cli("map", *args)["map"]).read_text()

def test_distributable_matches_sources():
    bundle = ROOT / "skills/recall-press"
    sources = [*ROOT.glob("recallpress/*.py"), *ROOT.glob("data/series/*.json"),
               *(p for p in (ROOT / "samples").rglob("*") if p.suffix in (".pptx", ".docx", ".md")),
               *(ROOT / "web" / name for name in ("__init__.py", "apply_decisions.py", "decisions.js", "map.css", "render_map.py"))]
    expected = {p.relative_to(ROOT): p for p in sources}
    actual = {p.relative_to(bundle) for directory in ("recallpress", "web", "data", "samples")
              for p in (bundle / directory).rglob("*") if p.is_file() and "__pycache__" not in p.parts and p.name != ".DS_Store"}
    assert actual == expected.keys(), "Run skills/recall-press/sync.sh"
    for relative, source in expected.items():
        dest = bundle / relative
        assert not dest.is_symlink() and dest.read_bytes() == source.read_bytes(), relative
    assert (bundle / "requirements.txt").read_bytes() == (ROOT / "recallpress/requirements.txt").read_bytes()
