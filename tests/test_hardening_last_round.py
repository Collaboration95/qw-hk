"""Fresh checks before freezing the classifier."""
from pathlib import Path

import pytest
from pptx import Presentation
from pptx.util import Inches

from test_hardening_language import command


@pytest.mark.parametrize("text,want", [
    ("For 3Q 2025, manufacturing showed no year-on-year growth.", "now_wrong"),
    ("The original estimate apparently overstated manufacturing in 3Q 2025 by 5%.", "review"),
    ("During Q3 2025, manufacturing may have remained flat.", "review"),
    ("Manufacturing was unchanged in Q3 2025, according to SingStat in October.", "still_true"),
    ("GDP growth was no higher than 6% in the second quarter of 2026.", "now_wrong"),
    ("GDP growth was well under 6 percentage points in Q2 2026.", "review"),
    ("GDP grew 5.9% year on year in Q2 2026.", "nowrong-newer"),
    ("Manufacturing never outpaced services in 3Q 2025.", "review"),
])
def test_new_wording(tmp_path, text, want):
    p = tmp_path / "late-note.md"
    p.write_text("Sample publication\n" + text)
    gdp = "2026" in text
    reg = command(tmp_path, "register", p, "--registered-on",
                  "2026-08-12" if want=="nowrong-newer" else "2026-07-20" if gdp else "2025-10-23")
    r = command(tmp_path, "check", "--offline", "--as-of",
                "2026-08-12" if want=="nowrong-newer" else "2026-10-14" if gdp else "2025-11-21")
    if want == "review":
        assert reg["unlinked"] or r["verdicts"][0]["needs_review"]
    else:
        assert r["verdicts"][0]["status"] == ("unaffected" if want=="nowrong-newer" else want)


def test_sentence_across_slide_paragraphs(tmp_path):
    p = tmp_path / "speaker-handout.pptx"
    doc = Presentation()
    slide = doc.slides.add_slide(doc.slide_layouts[6])
    box = slide.shapes.add_textbox(0,0,Inches(9),Inches(2)).text_frame
    box.text = "The initial estimate put manufacturing output\nat 0.0% in Q3 2025."
    doc.save(p)
    reg = command(tmp_path, "register", p, "--registered-on", "2025-10-18")
    assert len(reg["unlinked"]) == 1 and "across" in reg["unlinked"][0]["reason"]
    assert "output at 0.0%" in reg["unlinked"][0]["sentence"]
    assert not reg["claims"]
