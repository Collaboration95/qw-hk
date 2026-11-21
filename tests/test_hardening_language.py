"""Newspaper and briefing language, checked through registration and dated replay."""
import pytest

from recallpress.__main__ import execute, parser


def command(work, *args):
    return execute(parser().parse_args([*map(str, args), "--workspace", str(work)]))


# A stable control permits inspecting unlinked candidates through the CLI.
@pytest.mark.parametrize("sentence,expected", [
    ("Manufacturing showed no year-on-year growth in 3Q 2025.", "now_wrong"),
    ("Manufacturing barely moved in the third quarter of 2025.", "review"),
    ("Manufacturing outpaced services in Q3 2025.", "review"),
    ("Manufacturing roughly doubled in Q3 2025.", "review"),
    ("Manufacturing did not remain flat in Q3 2025.", "review"),
    ("Manufacturing might have stalled in Q3 2025.", "review"),
    ("At the time, manufacturing was flat in Q3 2025.", "still_true"),
    ("In October MTI said manufacturing was flat in Q3 2025.", "still_true"),
    ("The advance estimate showed manufacturing stalled in Q3 2025.", "still_true"),
    ("Manufacturing stalled from July to September 2025.", "now_wrong"),
    ("Manufacturing stalled in fiscal Q3 2025.", "review"),
    ("制造业方面，manufacturing was flat in Q3 2025.", "review"),
    ("Manufacturing was flat year on year but grew quarter on quarter in Q3 2025.", "review"),
    ("Manufacturing grew by 0.0 percentage points in Q3 2025.", "review"),
    ("Manufacturing was flat at 0.0% and services grew 2.0% in Q3 2025.", "review"),
    ("The advance estimate predicted manufacturing might stay flat in Q3 2025.", "review"),
    ("The advance estimate was wrong about manufacturing being flat in Q3 2025.", "review"),
    ("Manufacturing would have stalled in Q3 2025 without new orders.", "review"),
    ("Manufacturing was flat in Q3 2025?", "review"),
    ("Manufacturing grew in Q2 but was flat in Q3 2025.", "review"),
    ("Manufacturing was flat in Q3 2025 according to MTI in October.", "still_true"),
])
def test_manufacturing_language(tmp_path, sentence, expected):
    doc = tmp_path / "bulletin.md"
    doc.write_text("Sample publication\nServices grew 0.6% quarter on quarter in Q1 2025.\n" + sentence)
    reg = command(tmp_path, "register", doc, "--registered-on", "2025-10-22")
    result = command(tmp_path, "check", "--offline", "--as-of", "2025-11-21")
    by_id = {c["claim_id"]: c for c in reg["claims"]}
    verdicts = [v for v in result["verdicts"] if by_id[v["claim_id"]]["sentence"] == sentence]
    if expected == "review":
        assert (any(c["sentence"] == sentence and c["reason"] for c in reg["unlinked"])
                or len(verdicts) == 1 and verdicts[0]["needs_review"]), (reg, verdicts)
    else:
        assert len(verdicts) == 1 and verdicts[0]["status"] == expected, (reg, verdicts)
        c = by_id[verdicts[0]["claim_id"]]
        assert (c["series_id"], c["period"]) == ("sg-gdp-manufacturing-yoy", "2025-Q3")


@pytest.mark.parametrize("phrase,status", [
    ("remained below 6%", "now_wrong"),
    ("was nowhere near certain to stay below 6%", "review"),
    ("was not consistently below 6%", "review"),
    ("was at most 6 percent", "now_wrong"),
    ("stayed below 6% but above 5%", "review"),
    ("was exactly 5.7%", "now_wrong"),
])
def test_bound_language(tmp_path, phrase, status):
    doc = tmp_path / "quarter.md"
    doc.write_text(f"GDP growth {phrase} in Q2 2026.\nQuarterly memo: GDP grew 5.7% in Q2 2026.")
    reg = command(tmp_path, "register", doc, "--registered-on", "2026-07-20")
    result = command(tmp_path, "check", "--offline", "--as-of", "2026-10-14")
    lookup = {v["claim_id"]: v["status"] for v in result["verdicts"]}
    actual = next((lookup[c["claim_id"]] for c in reg["claims"] if phrase in c["sentence"]), None)
    if status == "review":
        assert actual == "unchecked" or any(phrase in u["sentence"] for u in reg["unlinked"])
    else:
        assert actual == status
