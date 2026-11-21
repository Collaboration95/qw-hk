import pytest

from test_hardening_language import command


@pytest.mark.parametrize("sentence,expected", [
    ("Q3 2025 manufacturing was far from flat.", "review"),
    ("Manufacturing denied that output stalled in Q3 2025.", "review"),
    ("No evidence suggests that manufacturing stalled in Q3 2025.", "review"),
    ("Manufacturing grew by 5.7% in FY2026 Q2.", "review"),
    ("GDP growth hardly remained below 6% in Q2 2026.", "review"),
    ("GDP growth ranged between 5.7% and 6.2% in Q2 2026.", "review"),
    ("GDP was forecast to stay below 6% in Q2 2026.", "review"),
    ("GDP growth was below 6% for most of Q2 2026.", "review"),
    ("GDP grew by exactly 5.7% in Q2 2026.", "now_wrong"),
    ("Inflation was flat in Q3 2025.", "review"),
    ("Manufacturing orders were flat in Q3 2025.", "review"),
    ("The manufacturing growth rate was unchanged in Q3 2025.", "review"),
    ("Nominal GDP grew 5.7% in Q2 2026.", "review"),
    ("GDP per capita grew 5.7% in Q2 2026.", "review"),
    ("Manufacturing stalled in Q3 2025, unlike services.", "review"),
    ("Since the advance estimate, GDP grew 5.7% in Q2 2026.", "review"),
    ("In May MTI said GDP grew 5.7% in Q2 2026.", "review"),
    ("In July MTI reported GDP grew 5.7% in Q2 2026.", "still_true"),
    ("GDP growth stood below 6% at the end of Q2 2026.", "review"),
    ("GDP grew 5.7% from one quarter to the next in Q2 2026.", "review"),
    ("Chart 1 records zero growth in manufacturing over July–September 2025.", "now_wrong"),
])
def test_scope(tmp_path, sentence, expected):
    gdp = "2026" in sentence
    doc = tmp_path / "sample.md"
    doc.write_text("# Manufacturing and national accounts\n" + sentence)
    reg = command(tmp_path, "register", doc, "--registered-on", "2026-07-19" if gdp else "2025-10-19")
    result = command(tmp_path, "check", "--offline", "--as-of", "2026-10-14" if gdp else "2025-11-21")
    by_id = {c["claim_id"]:c for c in reg["claims"]}
    status = next((v["status"] for v in result["verdicts"] if by_id[v["claim_id"]]["sentence"] == sentence), None)
    if expected == "review":
        assert status == "unchecked" or any(u["sentence"] == sentence and u["reason"] for u in reg["unlinked"]), status
    else:
        assert status == expected
