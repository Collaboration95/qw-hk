import json
from pathlib import Path

from test_hardening_language import command


def test_review_and_fix_in_same_publication(tmp_path):
    doc = tmp_path / "two-claims.md"
    doc.write_text("GDP ranked second in Q2 2026.\nGDP expanded by 5.7% in Q2 2026.")
    command(tmp_path, "register", doc, "--registered-on", "2026-07-17")
    run = command(tmp_path, "check", "--offline", "--as-of", "2026-08-11")
    assert [v["status"] for v in run["verdicts"]] == ["unchecked", "number_only"]
    command(tmp_path, "fix", "--run", run["run_id"])
    page = Path(command(tmp_path, "map", "--run", run["run_id"])["map"]).read_text()
    assert 'class="json"' in page and 'class="actions"' in page


def test_matching_text_in_two_locations_keeps_unreviewed_copy(tmp_path):
    doc = tmp_path / "two-quotes.md"
    sentence = "The national accounts showed expansion of 5.7% in Q2 2026."
    doc.write_text(sentence + "\n" + sentence)
    supplied = tmp_path / "checked.json"
    supplied.write_text(json.dumps([{"sentence": sentence, "location":"line 1",
        "series_id":"sg-gdp-overall-yoy", "period":"2026-Q2", "value_cited":5.7,
        "vintage_cited":"2026-07-14", "stance":"current", "assertion":{"type":"direction","detail":"up"}}]))
    result = command(tmp_path, "register", doc, "--registered-on", "2026-07-18", "--claims", supplied)
    assert [c["location"] for c in result["unlinked"]] == ["line 2"]


def test_invalid_input_has_actionable_error(tmp_path):
    import subprocess
    import sys
    doc = tmp_path / "example.md"
    doc.write_text("Manufacturing output was flat in Q3 2025.")
    supplied = tmp_path / "rows.json"
    supplied.write_text(json.dumps([{"sentence":doc.read_text()}]))
    result = subprocess.run([sys.executable, "-m", "recallpress", "register", doc, "--claims", supplied,
                             "--workspace", tmp_path], capture_output=True, text=True)
    assert result.returncode and "missing" in result.stderr.lower() and "series_id" in result.stderr


def test_unchanged_after_skipped_quiet_check(tmp_path):
    p = tmp_path / "unchanged.md"
    p.write_text("GDP grew by 6.2% year on year in 2Q 2026.")
    command(tmp_path, "register", p, "--registered-on", "2026-10-15")
    run = command(tmp_path, "check", "--offline", "--as-of", "2026-10-16")
    assert run["no_change"] and run["verdicts"][0]["status"] == "unaffected"
