import json
from pathlib import Path

import pytest
from docx import Document
from pptx import Presentation
from pptx.util import Inches

from recallpress import live
from recallpress.storage import load


def write_md(tmp_path, text):
    path = tmp_path / "brief.md"
    path.write_text(text)
    return path


def check(cli, day):
    return cli("check", "--offline", "--as-of", day)


def tree(folder):
    return {p.relative_to(folder): (p.read_bytes(), p.stat().st_mtime_ns) for p in folder.rglob("*") if p.is_file()}


def test_quiet_reversal_and_unaffected(cli, tmp_path):
    source = write_md(tmp_path, "Manufacturing stalled in Q3 2025. Services grew 2.0% in Q3 2025.")
    cli("register", source, "--registered-on", "2025-10-20")
    work = tmp_path / "workspace"
    original = tree(work)
    for _ in range(2):
        assert check(cli, "2025-11-20")["no_change"]
    assert tree(work) == original
    result = check(cli, "2025-11-21")
    assert result["replay"] and result["series_checked"] == 2
    assert [v["status"] for v in result["verdicts"]] == ["now_wrong", "unaffected"]
    assert result["changes"][0]["old"] == 0
    assert result["changes"][0]["new"] == 5
    after = tree(work)
    assert check(cli, "2025-11-22")["no_change"]
    assert tree(work) == after


def test_threshold_on_both_sides_and_decisions(cli, tmp_path):
    source = write_md(tmp_path, "GDP growth stayed under 6% in Q2 2026, at 5.7% year on year.")
    cli("register", source, "--registered-on", "2026-07-15")
    for day, expected, previous, new in [("2026-08-11", "number_only", 5.7, 5.9), ("2026-10-14", "now_wrong", 5.9, 6.2)]:
        result = check(cli, day)
        v = result["verdicts"][0]
        assert v["status"] == expected
        assert (result["changes"][0]["old"], result["changes"][0]["new"]) == (previous, new)
        args = ["--run", result["run_id"]]
        cli("judge", *args, "--claim", v["claim_id"], "--status", expected, "--reason", f"Checked {new} against 6%.")
        cli("fix", *args)
        stored = load(tmp_path / "workspace/runs" / result["run_id"] / "result.json")["verdicts"][0]
        assert str(new) in stored["replacement_sentence"]
        if expected == "number_only":
            assert "under 6%" in stored["replacement_sentence"]
        assert cli("decide", *args, "--claim", v["claim_id"], "apply")["decision"] == "applied"
        assert cli("decide", *args, "--claim", v["claim_id"], "skip")["decision"] == "skipped"
        assert Path(cli("map", *args)["map"]).exists()


def test_dated_never_rewritten(cli, tmp_path):
    path = write_md(tmp_path, "As first reported in October, manufacturing output was flat in Q3 2025.")
    cli("register", path, "--registered-on", "2025-10-20")
    run = check(cli, "2025-11-22")
    v = run["verdicts"][0]
    assert v["status"] == "still_true"
    args = ["--run", run["run_id"]]
    judged = cli("judge", *args, "--claim", v["claim_id"], "--status", "now_wrong", "--reason", "Proposed rewrite.")
    assert (judged["status"], judged["rule_status"], judged["agent_status"]) == ("still_true", "still_true", "now_wrong")
    assert judged["needs_review"] and judged["disagreement"]
    assert cli("fix", *args)["replacement_files"] == 0
    with pytest.raises(ValueError, match="no replacement"):
        cli("decide", *args, "--claim", v["claim_id"], "apply")


@pytest.mark.parametrize("fmt", ["pptx", "docx"])
def test_office_edits_preserve_formatting(cli, tmp_path, fmt):
    path = tmp_path / ("report." + fmt)
    if fmt == "docx":
        doc = Document()
        p = doc.add_paragraph()
        doc.add_paragraph("This paragraph stays verbatim.")
        def add(text):
            return p.add_run(text)
    else:
        doc = Presentation()
        slide = doc.slides.add_slide(doc.slide_layouts[6])
        p = slide.shapes.add_textbox(0, 0, Inches(9), Inches(1)).text_frame.paragraphs[0]
        slide.shapes.add_textbox(0, Inches(2), Inches(9), Inches(1)).text_frame.text = "This paragraph stays verbatim."
        def add(text):
            run = p.add_run()
            run.text = text
            return run
    add("GDP grew ").font.italic = True
    add("5.7").font.bold = True
    add("% in Q2 2026. Keep this sentence.")
    doc.save(path)
    before = path.read_bytes()
    cli("register", path, "--registered-on", "2026-07-14")
    run = check(cli, "2026-08-11")
    args = ["--run", run["run_id"]]
    cli("fix", *args)
    v = load(tmp_path / "workspace/runs" / run["run_id"] / "result.json")["verdicts"][0]
    target = tmp_path / "workspace" / v["replacement_file"]
    if fmt == "docx":
        ps = Document(target).paragraphs
        p, other, source = ps[0], ps[1].text, ps[2].text
    else:
        shapes = Presentation(target).slides[0].shapes
        p, other, source = shapes[0].text_frame.paragraphs[0], shapes[1].text, shapes[2].text
    assert [r.text for r in p.runs] == ["GDP grew ", "5.9", "% in Q2 2026. Keep this sentence."]
    assert p.runs[0].font.italic and p.runs[1].font.bold
    assert other == "This paragraph stays verbatim."
    assert all(s in source for s in ("5.9%", "Fixture release", "2026-08-11"))
    assert path.read_bytes() == before
    before_again = tree(target.parent)
    cli("fix", *args)
    assert tree(target.parent) == before_again


def test_claim_file_validates_original_and_source(cli, tmp_path):
    path = write_md(tmp_path, "The October advance estimate put manufacturing growth at 0.0% in Q3 2025.")
    c = {"sentence": path.read_text(), "claim_id": "agent-1", "series_id": "manufacturing", "period": "2025-Q3",
         "value_cited": 0, "vintage_cited": "2025-10-14", "stance": "dated",
         "assertion": {"type": "level", "detail": "0.0%"}}
    supplied = tmp_path / "claims.json"
    def register(row):
        supplied.write_text(json.dumps({"claims": [row]}))
        return cli("register", path, "--claims", supplied, "--registered-on", "2025-10-20")
    assert register(c)["claims"][0]["claim_id"] == "agent-1"
    for bad in [{"sentence":"A different sentence."}, {"value_cited":5}, {"stance":"current"}, {"vintage_cited":"2025-11-21"}]:
        with pytest.raises(ValueError):
            register(c | bad)


def test_rank_needs_agent(cli, tmp_path):
    path = write_md(tmp_path, "Manufacturing ranked second in Q3 2025.")
    cli("register", path, "--registered-on", "2025-10-20")
    run = check(cli, "2025-11-21")
    verdict = run["verdicts"][0]
    assert verdict["needs_review"] and verdict["rule_status"] == "needs_review"
    assert cli("fix", "--run", run["run_id"])["replacement_files"] == 0


def test_live_refresh_records_provenance_and_stops_on_failure(cli, tmp_path, monkeypatch):
    path = write_md(tmp_path, "GDP grew 5.7% in Q2 2026.")
    cli("register", path, "--registered-on", "2026-07-14")
    def offline(resource):
        raise ValueError("Official source unavailable")
    monkeypatch.setattr(live, "dataset", offline)
    with pytest.raises(ValueError, match="Official source unavailable"):
        cli("check")
    assert not (tmp_path / "workspace/runs").exists()
    monkeypatch.setattr(live, "observed_today", lambda: "2026-11-02")
    monkeypatch.setattr(live, "dataset", lambda rid: ("2026-11-01", [{"DataSeries": "Overall", "20262Q":"6.3"}]))
    result = cli("check", "--as-of", "2026-11-02")
    assert result["changes"][0]["new"] == 6.3
    assert result["changes"][0]["new_published"] == "2026-11-02"
    assert result["changes"][0]["evidence"]["dataset_updated"] == "2026-11-01"
    assert check(cli, "2026-11-02")["no_change"]


def test_comparison_checks_revision_to_reference_period(cli, tmp_path, series):
    archive_path = series / "manufacturing.json"
    archive = load(archive_path)
    first = archive["observations"][0]["vintages"][0]
    archive["observations"].append({"period":"2025-Q2", "vintages":[
        first | {"value": 2.0}, first | {"value": -1.0, "published":"2025-10-30"}]})
    archive_path.write_text(json.dumps(archive))
    path = write_md(tmp_path, "Manufacturing growth in Q3 2025 was slower than in Q2.")
    row = cli("register", path, "--registered-on", "2025-10-20")["claims"][0]
    assert row["assertion"]["reference"]["period"] == "2025-Q2"
    run = check(cli, "2025-10-30")
    assert run["changes"][0]["period"] == "2025-Q2"
    assert run["verdicts"][0]["status"] == "now_wrong"
    assert cli("fix", "--run", run["run_id"])["replacement_files"] == 1


def test_republication_cannot_reissue_a_revision(cli, tmp_path, series):
    p = series / "manufacturing.json"
    s = load(p)
    vs = s["observations"][0]["vintages"]
    vs.append(vs[-1] | {"published": "2026-01-02"})
    p.write_text(json.dumps(s))
    cli("register", write_md(tmp_path, "Manufacturing stalled in Q3 2025."), "--registered-on", "2025-10-20")
    run = check(cli, "2026-01-03")
    assert run["changes"][0]["new_published"] == "2025-11-21"
    assert check(cli, "2025-11-22")["no_change"]


def test_agent_review_removes_superseded_draft(cli, tmp_path):
    path = write_md(tmp_path, "Manufacturing stalled in Q3 2025.")
    cli("register", path, "--registered-on", "2025-10-20")
    run = check(cli, "2025-11-21")
    args = ["--run", run["run_id"]]
    report = cli("fix", *args)
    v = load(Path(report["result"]))["verdicts"][0]
    draft = tmp_path / "workspace" / v["replacement_file"]
    assert draft.is_file()
    reviewed = cli("judge", *args, "--claim", v["claim_id"], "--status", "still_true", "--reason", "Editor's dated context.")
    assert reviewed["rule_status"] == "now_wrong" and reviewed["disagreement"]
    assert not draft.exists() and "replacement_file" not in reviewed
