import base64
import json
import re
import shutil
from html import unescape
from pathlib import Path

import pytest

from demo import DAYS, PUBLICATIONS, WATCH, run_demo
from recallpress import live
from recallpress.__main__ import execute, parser
from recallpress.documents import open_document
from recallpress.storage import ROOT, fingerprint, load


@pytest.fixture(scope="module")
def replay(tmp_path_factory):
    return {day: (page, run) for day, page, run in run_demo(tmp_path_factory.mktemp("six-publications"))}


def key(case, when, claim):
    checks = load(ROOT / f"data/cases/{case}.json")["checks"]
    return next(v["status"] for c in checks if c["as_of"] == when for v in c["expected"] if v["claim_id"] == claim)


@pytest.mark.parametrize("day", DAYS)
def test_all_publications_against_releases(day, replay):
    page, run = replay[day]
    work = page.parents[2]
    html = page.read_text()
    # Sample sentences are paraphrases of A and B. Other claims use their own
    # printed period and the two dated official observations in each result.
    a, b, c = "2025-11-21", "2026-08-11", "2026-10-16"
    flat = key("A", a, "a1")
    dated = key("A", a, "a2")
    same = key("C", c, "c1")
    number = key("B", b, "b1")
    gdp = day in DAYS[2:]
    expected = {
        "members-briefing-2025q3": [key("A", a, "a3") if day == a else number, flat],
        "sales-outlook-2025q3": [flat, same if day == a else number],
        "board-paper-2025q3": [dated],
        "members-newsletter-2025q3": [same, dated],
    }
    if gdp:
        expected = {doc: [same] * len(statuses) for doc, statuses in expected.items()}
        expected.update({"midyear-briefing-2026q2": [same if day == c else key("B", day, "b1")],
                         "committee-note-2026q2": [same if day == c else dated]})
    statuses = {f"{doc}-c{i}": status for doc, values in expected.items() for i, status in enumerate(values, 1)}
    assert {v["claim_id"]: v["status"] for v in run["verdicts"]} == statuses
    assert run["no_change"] == (day == c)
    assert run["replay"] and run["as_of"] == day
    register = load(work / "register.json")
    assert {Path(d["path"]).name for d in register["documents"]} == set(PUBLICATIONS) | {WATCH}
    docs = {d["document_id"]: d["title"] for d in register["documents"]}
    assert set(expected) == {d["document_id"] for d in run["register_snapshot"]["documents"]}
    for doc, title in docs.items():
        assert (title in unescape(html)) == (doc in expected)
    if day == c:
        assert "No new revision" in html and "Checked 3 official figures" in html
        assert not (page.parent / "out").exists()
        assert all(v["status"] == same for v in run["verdicts"])
        return
    assert set(re.findall(r'<article class="document" id="publication-([^"]+)"', html)) == set(expected)
    for doc, values in expected.items():
        priority = next(s for s in ("now_wrong", "number_only", "still_true", "unaffected") if s in values)
        assert f'href="#publication-{doc}" class="doc-link {priority}"' in html
    files = [work / v["replacement_file"] for v in run["verdicts"] if v.get("replacement_file")]
    assert len(files) == sum(s in ("now_wrong", "number_only") for s in statuses.values())
    assert {base64.b64decode(s) for s in re.findall(r';base64,([^"]+)"', html)} == {p.read_bytes() for p in files}
    if day == a:
        assert [(ch["period"], ch["old"], ch["new"]) for ch in run["changes"]] == [
            ("2025-Q3", 0.0, 5.0), ("2025-Q2", 5.0, 5.1)]
    elif day in DAYS[2:4]:
        assert [(ch["old"], ch["new"]) for ch in run["changes"]] == ([(5.7, 5.9)] if day == b else [(5.9, 6.2)])
    else:
        assert run["context"]["vintage"]["value"] == 5.7 and "<b>5.7%</b>" in html
        assert "No publication in this run cites this figure yet" in html
        assert all(ch["new_published"] <= day for ch in run["changes"])
        assert all("2026q2" not in doc for doc in expected)
        gdp_series = load(ROOT / "data/series/sg-gdp-overall-yoy.json")
        advance = next(o for o in gdp_series["observations"] if o["period"] == "2026-Q2")["vintages"][0]
        assert (advance["published"], advance["value"]) == (day, 5.7)


def test_november_watch_in_temporary_archive(tmp_path, monkeypatch):
    original = ROOT / "data/series"
    before = {p.name: fingerprint(p) for p in original.glob("*.json")}
    series = tmp_path / "series"
    shutil.copytree(original, series)
    work = tmp_path / "workspace"
    def cli(command, *args):
        flags = ["--series-dir", str(series)] if command in ("check", "register") else []
        return execute(parser().parse_args([command, *map(str, args), "--workspace", str(work), *flags]))
    rows = cli("register", ROOT / "samples" / WATCH, "--registered-on", "2026-10-19")["claims"]
    event = next(e for e in load(ROOT / "data/release-calendar.json")["releases"] if e["release"] == "GDP, 3Q 2026")
    assert {r["series_id"] for r in rows} == set(event["tracked_series"]) and len(rows) == 8
    assert cli("check", "--offline", "--as-of", "2026-11-19")["no_change"]
    # Return simulated official-table rows only to this test's isolated live adapter.
    tables = {}
    for row in rows:
        meta = load(series / (row["series_id"] + ".json"))["source"]
        value = -1.0 if row["series_id"] == "sg-gdp-overall-yoy" else row["value_cited"]
        tables.setdefault(meta["api_resource_id"], []).append({meta["api_row_field"]: meta["api_row"], "20263Q": str(value)})
    monkeypatch.setattr(live, "dataset", lambda resource: (event["date"], tables[resource]))
    monkeypatch.setattr(live, "observed_today", lambda: event["date"])
    monkeypatch.setattr("recallpress.__main__.observed_today", lambda: event["date"])
    result = cli("check", "--trigger", "schedule", "--record")
    assert result["series_checked"] == 8
    assert [(v["old"], v["new"]) for v in result["changes"]] == [(5.4, -1.0)]
    [wrong] = [v for v in result["verdicts"] if v["status"] != "unaffected"]
    assert wrong["status"] == "now_wrong"
    args = ["--run", result["run_id"]]
    assert cli("fix", *args)["replacement_files"] == 1
    assert "base64," in Path(cli("map", *args)["map"]).read_text()
    v = next(v for v in load(work / "runs" / result["run_id"] / "result.json")["verdicts"] if v["claim_id"] == wrong["claim_id"])
    text = [b.text for b in open_document(work / v["replacement_file"])[1]]
    assert v["replacement_sentence"] in text and "fell 1.0%" in v["replacement_sentence"]
    quiet = cli("check", "--trigger", "schedule", "--record")
    assert quiet["no_change"] and quiet["issued"] == []
    assert cli("check", "--trigger", "schedule", "--record") == quiet
    assert {p.name: fingerprint(p) for p in original.glob("*.json")} == before


def test_hold_supersedes_unverified_draft(cli, tmp_path):
    p = tmp_path / "test.md"
    p.write_text("GDP grew 5.7% in Q2 2026.")
    c = cli("register", p, "--registered-on", "2026-07-16")["claims"][0]
    r = cli("check", "--as-of", "2026-08-11", "--offline")
    args = ["--run", r["run_id"]]
    assert cli("fix", *args)["replacement_files"] == 1
    v = cli("judge", *args, "--claim", c["claim_id"], "--hold", "--reason", "The surrounding text needs a baseline.")
    assert v["needs_review"] and v["status"] == "unchecked" and "replacement_file" not in v
    assert cli("fix", *args)["replacement_files"] == 0
    assert "Needs editor review" in Path(cli("map", *args)["map"]).read_text()


def test_invalid_batch_preserves_files_and_decisions(cli, tmp_path):
    pubs = []
    for name in ("brief", "handout"):
        doc = tmp_path / (name + ".md")
        doc.write_text("GDP grew 5.7% in Q2 2026.")
        pubs.append(doc)
        cli("register", doc, "--registered-on", "2026-07-16")
    r = cli("check", "--as-of", "2026-08-11", "--offline")
    run = r["run_id"]
    cli("fix", "--run", run)
    work = tmp_path / "workspace"
    page = Path(cli("map", "--run", run)["map"])
    snapshot = {p: p.read_bytes() for p in page.parent.rglob("*") if p.is_file()}
    payload = {"run_id": run, "decisions": [{"claim_id": v["claim_id"], "decision": "apply",
               "replacement_sentence": "GDP grew 5.9% year on year in Q2 2026."} for v in r["verdicts"]]}
    export = tmp_path / "export.json"
    export.write_text(json.dumps(payload))
    pubs[1].write_text("New edition")
    with pytest.raises(ValueError, match="changed after registration"):
        cli("decide", "--from", export)
    assert {p: p.read_bytes() for p in page.parent.rglob("*") if p.is_file()} == snapshot
    pubs[1].write_text("GDP grew 5.7% in Q2 2026.")
    assert cli("decide", "--from", export)["recorded"] == 2
    applied = load(page.with_name("result.json"))["verdicts"]
    assert all(v["decision"] == "applied" for v in applied)
    assert all((work / v["replacement_file"]).is_file() for v in applied)


def test_fresh_outlook_rules_registration(tmp_path):
    deck = ROOT / "samples/fresh/chamber-outlook-2026q2.pptx"
    result = execute(parser().parse_args(["register", str(deck), "--registered-on", "2026-08-14",
                                          "--series-dir", str(ROOT / "data/series"), "--workspace", str(tmp_path)]))
    assert [(c["series_id"], c["value_cited"], c["vintage_cited"], c["stance"], c["assertion"]["type"])
            for c in result["claims"]] == [
        ("sg-gdp-overall-yoy", 5.9, "2026-08-11", "current", "level"),
        ("sg-gdp-services-yoy", 4.9, "2026-08-11", "current", "threshold"),
        ("sg-employment-change", 14000, "2026-08-11", "current", "direction"),
        ("sg-unemployment", 2.0, "2026-08-11", "current", "level"),
        ("sg-gdp-manufacturing-yoy", 12.2, "2026-07-14", "dated", "level"),
    ]
    assert {c["period"] for c in result["claims"]} == {"2026-Q2"}
