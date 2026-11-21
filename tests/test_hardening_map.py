"""Build the same maps for pytest and the headless Chrome viewport check."""
import sys
from pathlib import Path

from test_hardening_language import command


def make_map(folder, count):
    folder.mkdir(parents=True, exist_ok=True)
    work = folder / "workspace"
    for i in range(count):
        doc = folder / f"edition-{i}.md"
        doc.write_text(f"# Sample publication {i + 1} — Quarterly industrial enquiries " +
                       "Reference" * 12 + "\nManufacturing stagnated year on year in 3Q 2025.")
        command(work, "register", doc, "--registered-on", "2025-10-19")
    run = command(work, "check", "--offline", "--as-of", "2025-11-21", "--record")["run_id"]
    command(work, "fix", "--run", run)
    return Path(command(work, "map", "--run", run)["map"])


def test_empty_map(tmp_path):
    page = make_map(tmp_path, 0).read_text()
    assert "No publications registered" in page
    assert 'class="doc-link ' not in page and 'class="actions"' not in page


def test_review_only_publication(tmp_path):
    doc = tmp_path / "fiscal.md"
    doc.write_text("# Sample fiscal bulletin\nManufacturing output stalled in fiscal Q3 2025.")
    reg = command(tmp_path, "register", doc, "--registered-on", "2025-10-16")
    assert not reg["claims"] and len(reg["unlinked"]) == 1
    for day in ("2025-11-20", "2025-11-21"):
        if day.endswith("21"):
            another = tmp_path / "annual.md"
            another.write_text("Manufacturing was flat in Q3 2025.")
            command(tmp_path, "register", another, "--registered-on", "2025-10-16")
        run = command(tmp_path, "check", "--as-of", day, "--offline", "--record")["run_id"]
        text = Path(command(tmp_path, "map", "--run", run)["map"]).read_text()
        assert reg["unlinked"][0]["sentence"] in text and reg["unlinked"][0]["reason"] in text


if __name__ == "__main__":
    folder = Path(sys.argv[1])
    for n in (0,1,12,40):
        page = make_map(folder / str(n), n)
        (folder / f"{n}.html").write_bytes(page.read_bytes())
