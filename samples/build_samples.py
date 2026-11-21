"""Build Recall Press's editable sample publications. Run with the repo .venv."""

from datetime import datetime
from pathlib import Path

from docx import Document
from docx.shared import Inches as WordInches, Pt as WordPt, RGBColor as WordColor
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parent
SAMPLE = "Sample publication for demonstration"
PAPER, INK, MUTED, PEACH, INDIGO = "FBF8F1", "272939", "545865", "F0C5A1", "302F48"
SERIF, SANS = "Georgia", "Arial"

# The October and November 2025 releases agree on this seasonally adjusted rate.
SERVICES = "Services grew 0.6% quarter on quarter in Q1 2025, seasonally adjusted."
MANUFACTURING = "Manufacturing stalled year on year in Q3 2025."
SALES = "Manufacturing output was flat year on year in Q3 2025."
BOARD = "As first reported in the October advance estimate, manufacturing output was flat year on year in Q3 2025."
GDP = "GDP growth stayed under 6% in Q2 2026, at 5.7% year on year."
DATED_GDP = "The July advance estimate put Q2 2026 GDP growth at 5.7% year on year."
OCT = "Ministry of Trade and Industry · Advance GDP estimates · 14 October 2025"
JUL = "Ministry of Trade and Industry · Advance GDP estimates · 14 July 2026"


def box(slide, name, content, x, y, w, h, size, color=INK, font=SANS, bold=False, align=None):
    shape = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    shape.name = name
    frame = shape.text_frame
    frame.word_wrap = True
    frame.margin_top = frame.margin_bottom = frame.margin_left = frame.margin_right = 0
    frame.vertical_anchor = MSO_ANCHOR.TOP
    para = frame.paragraphs[0]
    if align:
        para.alignment = align
    run = para.add_run()
    run.text = content
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    return shape


def rule(slide, y, color):
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(.83), Inches(y), Inches(11.68), Inches(.015))
    line.name = "Editorial rule"
    line.line.fill.background()
    line.fill.solid()
    line.fill.fore_color.rgb = RGBColor.from_string(color)


def metadata(document, title, day):
    properties = document.core_properties
    properties.title = title
    properties.author = "Recall Press"
    properties.last_modified_by = "Recall Press"
    properties.subject = SAMPLE
    properties.created = properties.modified = datetime.fromisoformat(day)


def briefing(path, title, date_label, day, subtitle, leaves):
    """A cover and a sequence of evidence pages. All copy stays in native text boxes."""
    deck = Presentation()
    deck.slide_width, deck.slide_height = Inches(13.333), Inches(7.5)
    metadata(deck, title, day)

    def page(dark):
        slide = deck.slides.add_slide(deck.slide_layouts[6])
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = RGBColor.from_string(INDIGO if dark else PAPER)
        return slide

    cover = page(True)
    rule(cover, 1.18, "777282")
    box(cover, "Title", title, .8, 2.0, 11.55, 2.15, 58, PAPER, SERIF)
    box(cover, "Sample label", SAMPLE, .84, .58, 10, .4, 16, PEACH)
    box(cover, "Subtitle", subtitle, .85, 4.6, 11, .95, 24, PAPER)
    box(cover, "Issue date", date_label, .85, 6.45, 9, .42, 18, PEACH, bold=True)
    for number, (section, headline, body, source) in enumerate(leaves, 2):
        slide = page(False)
        box(slide, "Section", section.upper(), .84, .55, 9.5, .45, 16, MUTED, bold=True)
        box(slide, "Folio", f"{number} / {len(leaves)+1}", 10.8, .55, 1.7, .45, 16, MUTED, align=PP_ALIGN.RIGHT)
        rule(slide, 1.15, "CBC6BB")
        box(slide, "Headline", headline, .8, 1.65, 11.6, 2.55, 44, INK, SERIF)
        box(slide, "Body", body, .86, 4.46, 10.9, 1.30, 24, MUTED)
        box(slide, "Source", source, .86, 6.43, 11.65, .46, 15, MUTED)
    path.parent.mkdir(parents=True, exist_ok=True)
    deck.save(path)


def board_paper():
    doc = Document()
    metadata(doc, "Board paper on member enquiries", "2025-10-22")
    section = doc.sections[0]
    section.page_width, section.page_height = WordInches(8.27), WordInches(11.69)
    section.top_margin, section.bottom_margin = WordInches(1.0), WordInches(.85)
    section.left_margin = section.right_margin = WordInches(1.0)
    normal = doc.styles["Normal"]
    normal.font.name, normal.font.size = SANS, WordPt(13)
    normal.font.color.rgb = WordColor.from_string(INK)
    normal.paragraph_format.space_after = WordPt(10)
    normal.paragraph_format.line_spacing = 1.20

    def paragraph(text, size=13, font=SANS, color=INK, bold=False, before=0):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = WordPt(before)
        r = p.add_run(text)
        r.font.name, r.font.size, r.font.bold = font, WordPt(size), bold
        r.font.color.rgb = WordColor.from_string(color)

    paragraph(SAMPLE, 10, color=MUTED)
    paragraph("Board paper on member enquiries", 32, SERIF, before=16)
    paragraph("22 October 2025   /   For the board meeting", 11, color=MUTED)
    paragraph("Decision requested", 17, SERIF, before=12)
    paragraph("Approve a short set of notes for the membership desk ahead of the November economic survey.")
    paragraph("What members heard", 17, SERIF, before=10)
    paragraph(BOARD)
    paragraph("That was the figure available when the quarterly briefing went to members. The meeting record should preserve what the board knew on that date.")
    paragraph("Questions for the desk", 17, SERIF, before=10)
    paragraph("Ask which industry the member supplies and whether the enquiry concerns orders, deliveries or output. Record the release date alongside any figure quoted.")
    paragraph(OCT, 10, color=MUTED, before=18)
    doc.save(ROOT / "board-paper-2025q3.docx")


def october_watch():
    source = "Ministry of Energy, Trade and Industry · Advance GDP estimates · 14 October 2026"
    # Each sentence links one of the eight GDP rows in the November release calendar.
    briefing(ROOT / "october-briefing-2026q3.pptx", "October economy briefing",
             "19 October 2026", "2026-10-19", "Singapore  /  Third quarter of 2026", [
        ("National accounts", "GDP grew 5.4% year on year in Q3 2026.",
         "GDP grew 1.1% quarter on quarter in Q3 2026, seasonally adjusted.", source),
        ("Manufacturing", "Manufacturing grew 7.5% year on year in Q3 2026.",
         "Manufacturing fell 0.9% quarter on quarter in Q3 2026, seasonally adjusted.", source),
        ("Construction", "Construction grew 8.8% year on year in Q3 2026.",
         "Construction grew 3.4% quarter on quarter in Q3 2026, seasonally adjusted.", source),
        ("Services", "Services grew 5.2% year on year in Q3 2026.",
         "Services grew 1.2% quarter on quarter in Q3 2026, seasonally adjusted.", source),
    ])


def main():
    october_watch()
    briefing(ROOT / "members-briefing-2025q3.pptx", "Members’ quarterly economy briefing",
             "October 2025", "2025-10-20", "Singapore  /  Third quarter of 2025", [
        ("The quarter", "Reading the October estimate", "The advance estimate covers July to September. It draws mainly on the first two months of the quarter.", OCT),
        ("Services benchmark", SERVICES, "The opening quarter gives service businesses a benchmark for discussions about demand earlier this year.", OCT),
        ("Manufacturing", MANUFACTURING, "Here, output is measured against the same quarter a year earlier. Members can use the annual comparison when discussing activity with suppliers.", OCT),
        ("Factory activity", "Different orders across factory floors", "Electronics output expanded. Biomedical and general manufacturing weighed on the sector as a whole.", OCT),
        ("Next release", "The November economic survey", "Bring the October briefing to the next meeting. The full-quarter survey will include information received after the advance estimate.", "Editorial calendar · October 2025"),
    ])
    briefing(ROOT / "sales-outlook-2025q3.pptx", "Sales team market brief",
             "October 2025", "2025-10-21", "Talking points for account teams  /  Singapore", [
        ("Industrial accounts", SALES, "Ask buyers about order timing and their pipeline before using the national figure to frame a sales conversation.", OCT),
        ("Services accounts", SERVICES, "Use the quarterly rate as background for the conversation. A customer’s own purchasing cycle sets the timing of the next order.", OCT),
    ])
    board_paper()
    (ROOT / "members-newsletter-2025q3.md").write_text(
        SAMPLE + "\n\n# Members’ newsletter\n\n21 October 2025\n\n"
        "Year-on-year manufacturing growth in Q3 2025 was slower than in Q2. The October advance estimate put Q3 manufacturing growth at 0.0% year on year. "
        "For the next members’ discussion, bring an example of a delivery moved across quarter-end.\n\n"
        + OCT + "\n", encoding="utf-8")
    briefing(ROOT / "midyear-briefing-2026q2.pptx", "Midyear economy briefing",
             "July 2026", "2026-07-16", "Singapore  /  Second quarter of 2026", [
        ("National accounts", GDP, "The six per cent mark is the reference point for this quarter’s member discussion.", JUL),
        ("Member discussion", "A question for the next roundtable", "How much of the change in turnover came from prices, and how much from the volume of goods or services sold?", "Membership research desk · July 2026"),
    ])
    (ROOT / "committee-note-2026q2.md").write_text(
        SAMPLE + "\n\n# Midyear committee note\n\n16 July 2026\n\n" + DATED_GDP +
        " This is the reading the committee had when it agreed the agenda for the midyear roundtable.\n\n" + JUL + "\n",
        encoding="utf-8")
    briefing(ROOT / "unseen" / "roundtable-reading.pptx", "Roundtable reading",
             "October 2025", "2025-10-23", "Singapore  /  Background for the chair", [
        ("Factories", "Manufacturing output showed no year-on-year growth in Q3 2025.", "Year-on-year manufacturing growth was below 1% in Q3 2025.", OCT),
        ("National accounts", "GDP expanded by 2.9% year on year in Q3 2025.", "The October advance estimate put year-on-year GDP growth at 2.9% for Q3 2025.", OCT),
    ])


if __name__ == "__main__":
    main()
