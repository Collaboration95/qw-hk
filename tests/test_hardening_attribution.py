import pytest

from test_hardening_language import command


@pytest.mark.parametrize("sentence,expected", [
    ("The first estimate put manufacturing at 5.0% in Q3 2025.", "review"),
    ("The advance estimate put manufacturing at 0.0% in Q3 2025.", "still_true"),
    ("MTI said manufacturing output was flat in Q3 2025.", "review"),
    ("As originally reported, manufacturing ranked first in Q3 2025.", "review"),
    ("In the initial estimate, manufacturing grew by 0.0% in Q3 2025.", "review"),
    ("As originally reported in November, manufacturing was flat in Q3 2025.", "review"),
    ("The November report put Q3 2025 manufacturing at 5.0%.", "still_true"),
    ("Manufacturing recorded exactly 5.0% in Q3 2025.", "now_wrong"),
    ("Manufacturing output grew by 5.0% in 3Q 2025.", "number_only"),
])
def test_dated_release_identity(tmp_path, sentence, expected):
    p = tmp_path / "after-release.md"
    p.write_text("# Sample industry record\n" + sentence)
    reg = command(tmp_path, "register", p, "--registered-on", "2025-11-25")
    result = command(tmp_path, "check", "--offline", "--as-of", "2026-01-02")
    if expected == "review":
        assert reg["unlinked"] or result["verdicts"][0]["status"] == "unchecked"
    else:
        assert result["verdicts"][0]["status"] == expected
