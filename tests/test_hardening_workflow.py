import io
import json
import shutil
import subprocess
import sys
from http.client import IncompleteRead
from pathlib import Path
from urllib.error import HTTPError, URLError

import pytest

from recallpress import live
from recallpress.storage import ROOT, fingerprint, load, read_series
from test_hardening_language import command


def test_concurrent_issues_and_skip(tmp_path):
    work = tmp_path / "shared workspace"
    docs = []
    for name in ("circular", "notice", "communique"):
        p = tmp_path / (name + ".md")
        p.write_text("Manufacturing was unchanged in 3Q 2025.")
        d = command(work, "register", p, "--registered-on", "2025-10-23")
        assert command(work, "register", p, "--registered-on", "2025-10-23") == d
        docs.append(d)
    args = [sys.executable, "-m", "recallpress", "check", "--offline", "--as-of", "2025-11-21", "--workspace", work]
    processes = [subprocess.Popen(args, stdout=subprocess.PIPE, cwd=ROOT) for _ in range(2)]
    reports = [json.loads(proc.communicate(timeout=20)[0]) for proc in processes]
    assert all(p.returncode == 0 for p in processes)
    issued, quiet = sorted(reports, key=lambda r: r["no_change"])
    assert len(issued["issued"]) == 3 and quiet["no_change"]
    assert len(list(work.glob("runs/*/result.json"))) == 1
    run = issued["run_id"]
    assert command(work, "fix", "--run", run)["replacement_files"] == 3
    skip = docs[0]["claims"][0]["claim_id"]
    command(work, "decide", "--run", run, "--claim", skip, "skip")
    report = command(work, "check", "--offline", "--as-of", "2025-11-22", "--record")
    assert report["no_change"] and not report["issued"]
    quiet_map = Path(command(work, "map", "--run", report["run_id"])["map"]).read_text()
    assert "Earlier decision · Skipped" in quiet_map.split("<script>")[0]
    assert not (work / "runs" / report["run_id"] / "out").exists()
    revised = command(work, "check", "--offline", "--as-of", "2026-04-14")
    assert len(revised["issued"]) == 3
    assert [(c["old"], c["new"]) for c in revised["changes"]] == [(5,4.6)]


def test_reversion_and_already_revised(tmp_path, series):
    p = series / "manufacturing.json"
    s = load(p)
    vs = s["observations"][0]["vintages"]
    vs.extend([vs[0] | {"published": "2025-12-01"}, vs[1] | {"published": "2025-12-15"}])
    p.write_text(json.dumps(s))
    def cli(*args):
        return command(tmp_path, *args, "--series-dir", series)
    a, b = tmp_path / "early.md", tmp_path / "late.md"
    a.write_text("Manufacturing showed zero growth in Q3 2025.")
    b.write_text("Manufacturing expanded by 5.0% in Q3 2025.")
    cli("register", a, "--registered-on", "2025-10-21")
    cli("register", b, "--registered-on", "2025-11-22")
    def check(d):
        return cli("check", "--offline", "--as-of", d)
    assert [v["status"] for v in check("2025-11-22")["verdicts"]] == ["now_wrong", "unaffected"]
    reverted = check("2025-12-01")
    assert [v["status"] for v in reverted["verdicts"]] == ["still_true", "now_wrong"]
    output = Path(command(tmp_path, "map", "--run", reverted["run_id"])["map"]).read_text()
    assert "dated statement" not in output.lower()
    assert check("2025-12-02")["no_change"]
    again = check("2025-12-15")
    assert [v["status"] for v in again["verdicts"]] == ["now_wrong","still_true"]
    assert [(c["old"], c["new"]) for c in again["changes"]] == [(0,5)]
    assert check("2025-12-16")["no_change"]


@pytest.mark.parametrize("failure", ["429", "offline", "interrupted", "bad-schema"])
def test_refresh_preserves_archive(tmp_path, monkeypatch, failure):
    folder = tmp_path / "archive"
    shutil.copytree(ROOT / "data/series", folder)
    before = {p.name: fingerprint(p) for p in folder.iterdir() if p.suffix == ".json"}
    archive = read_series(folder)
    pairs = [("sg-gdp-manufacturing-yoy", "2025-Q3"), ("sg-unemployment", "2025-Q3")]
    sleeps, urls = [], []
    class Transport:
        def open(self, request, timeout):
            url = request.full_url
            urls.append(url)
            assert request.get_header("User-agent") == "statistics-client/1.0"
            series = archive[pairs[0][0]]
            rid = series["source"]["api_resource_id"]
            if rid in url:
                data = ({"data": {"datasetId": rid, "lastUpdatedAt": "2027-01-01T00:00:00+08:00"}}
                        if "metadata" in url else
                        {"success": True, "result": {"resource_id": rid, "total": 1, "records": [
                         {series["source"]["api_row_field"]: series["source"]["api_row"], "20253Q":"9.9"}]}})
                return io.BytesIO(json.dumps(data).encode())
            if failure == "429":
                raise HTTPError(url, 429, "Busy", {"Retry-After":"3"}, None)
            if failure == "offline":
                raise URLError("network disconnected")
            if failure == "interrupted":
                raise IncompleteRead(b"")
            return io.BytesIO(b'{"data":null}')
    monkeypatch.setattr(live, "build_opener", lambda *_: Transport())
    monkeypatch.setattr(live.time, "sleep", sleeps.append)
    monkeypatch.setattr(live, "observed_today", lambda: "2027-01-02")
    with pytest.raises(ValueError, match="(?i)(official source|official table|data.gov.sg)"):
        live.refresh(folder, archive, pairs)
    assert sleeps == ([3,3] if failure == "429" else [])
    assert len(urls) == (5 if failure == "429" else 3)
    assert {p.name: fingerprint(p) for p in folder.glob("*.json")} == before
    assert read_series(folder) == archive


def test_clean_python_bundle(tmp_path):
    skill = tmp_path / "skill copy"
    shutil.copytree(ROOT / "skills/recall-press", skill)
    paths = [skill / "samples/members-briefing-2025q3.pptx", skill / "samples/board-paper-2025q3.docx"]
    # -I -S disables user and environment site packages, including python-pptx.
    py = [sys.executable, "-I", "-S"]
    subprocess.run([*py, "-c", "import importlib.util as u; assert all(u.find_spec(n) is None for n in ('pptx','docx','lxml'))"],
                   check=True, cwd=tmp_path)
    def cli(*args):
        return json.loads(subprocess.check_output([*py, skill/"run.py", *args, "--workspace", tmp_path/"project"],
                                                  cwd=tmp_path, text=True))
    for p in paths:
        assert cli("register", p, "--registered-on", "2025-10-23")["claims"]
    run = cli("check", "--offline", "--as-of", "2025-11-21")["run_id"]
    assert cli("fix","--run",run)["replacement_files"] == 1
    assert "base64," in Path(cli("map","--run",run)["map"]).read_text()
