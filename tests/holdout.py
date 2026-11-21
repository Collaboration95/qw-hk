"""Run explicitly, once, after freezing the rules. Normal pytest discovery excludes this file."""
from datetime import datetime
import re

import pytest

from caseflow import ROOT, load, run_case
from recallpress.__main__ import execute, parser
from recallpress.documents import open_document


KEYS = sorted((ROOT / "data/cases/holdout").glob("*.json"))


@pytest.mark.parametrize("path", KEYS, ids=lambda p: p.stem)
def test_held_out_case(path, tmp_path):
    # Each key supplies independent publication text used for rule-only registration.
    run_case(path, tmp_path)


def test_surface_unseen_publication(tmp_path):
    publications = sorted(p for p in (ROOT / "samples/unseen").glob("*") if p.suffix in (".pptx", ".docx", ".md"))
    assert publications
    for publication in publications:
        before = publication.read_bytes()
        text = "\n".join(block.text for block in open_document(publication)[1])
        # If another lane supplied a matching key, run the full scored case on the actual file.
        key = next((path for path in KEYS if all(c["sentence"] in text for c in load(path)["claims"])
                    and len(load(path)["claims"]) >= 4), None)
        if key:
            run_case(key, tmp_path, publication=publication)
            continue
        printed = re.search(r"\b(\d{1,2} [A-Za-z]{3,9} 20\d{2})\b", text)
        date_args = []
        if printed:
            date_args = ["--registered-on", datetime.strptime(printed[1], "%d %B %Y").date().isoformat()]
        args = ["--workspace", str(tmp_path / publication.stem)]
        claims = execute(parser().parse_args(["register", str(publication), *date_args, *args]))["claims"]
        assert len(claims) >= 4 and len({c["series_id"] for c in claims}) >= 2
        assert all(c["sentence"] and c["location"] for c in claims)
        run = execute(parser().parse_args(["check", "--offline", *args]))
        assert len(run["verdicts"]) == len(claims)
        if not run["no_change"]:
            for command in ("fix", "map"):
                execute(parser().parse_args([command, "--run", run["run_id"], *args]))
        assert publication.read_bytes() == before
