"""Run the public samples chronologically in one fresh workspace, entirely offline."""
import shutil
import tempfile
from pathlib import Path

from recallpress.__main__ import execute, parser
from recallpress.storage import ROOT, load

PUBLICATIONS = {
    "members-briefing-2025q3.pptx": "2025-10-20",
    "sales-outlook-2025q3.pptx": "2025-10-21",
    "board-paper-2025q3.docx": "2025-10-22",
    "members-newsletter-2025q3.md": "2025-10-21",
    "midyear-briefing-2026q2.pptx": "2026-07-16",
    "committee-note-2026q2.md": "2026-07-16",
}
WATCH = "october-briefing-2026q3.pptx"
DAYS = ("2025-11-21", "2026-07-14", "2026-08-11", "2026-10-14", "2026-10-16")


def run_demo(project):
    archive = project / "data/series"
    work = project / "workspace"
    shutil.copytree(ROOT / "data/series", archive)
    def cli(command, *args):
        flags = ["--series-dir", str(archive)] if command in ("register", "check") else []
        return execute(parser().parse_args([command, *map(str, args), "--workspace", str(work), *flags]))
    for name, day in (PUBLICATIONS | {WATCH: "2026-10-19"}).items():
        cli("register", ROOT / "samples" / name, "--registered-on", day)
    for day in DAYS:
        focus = ["--context", "sg-gdp-overall-yoy", "2026-Q2"] if day == "2026-07-14" else []
        result = cli("check", "--offline", "--as-of", day, "--trigger", "replay", "--record", *focus)
        args = ["--run", result["run_id"]]
        cli("fix", *args)
        page = Path(cli("map", *args)["map"])
        yield day, page, load(page.with_name("result.json"))


if __name__ == "__main__":
    parent = ROOT / "workspace"
    parent.mkdir(exist_ok=True)
    project = Path(tempfile.mkdtemp(prefix="demo-", dir=parent))
    for day, page, result in run_demo(project):
        print(f"\nHistorical replay · {day} · {result['series_checked']} series")
        if day == "2026-07-14":
            value = result["context"]["vintage"]["value"]
            print(f"Q2 GDP advance estimate {value}%. The two July publications appear from 16 July.")
        if result["no_change"]:
            print("No new revision. No corrected files.")
        print("Map:", page)
        for v in result["verdicts"]:
            if v.get("replacement_file"):
                print("Corrected:", project / "workspace" / v["replacement_file"])
        for item in result["updated_files"]:
            print("Updated deck:", project / "workspace" / item["file"])
    print(f"\nOctober 2026 briefing registered for live checks in {project}")
