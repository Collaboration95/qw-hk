import pytest

from caseflow import ROOT, run_case


@pytest.mark.parametrize("path", sorted((ROOT / "data/cases").glob("*.json")), ids=lambda p: p.stem)
def test_public_case(path, tmp_path):
    run_case(path, tmp_path)
