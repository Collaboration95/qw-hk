"""Post-freeze acceptance. Generate labelled samples, then score once per fresh workspace."""
import argparse
import json
import tempfile
from collections import Counter
from pathlib import Path

from docx import Document
from pptx import Presentation
from pptx.util import Inches

from recallpress.__main__ import execute, parser
from recallpress.storage import ROOT, load

SAMPLES = ROOT / "samples/hardening"
# Expected: verdict, series, observation period, original value. "review" requires
# evidence outside the archive. An unlinked candidate always counts as a deferral.
M = "sg-gdp-manufacturing-yoy"
MQ = "sg-gdp-manufacturing-qoq"
G = "sg-gdp-overall-yoy"
GQ = "sg-gdp-overall-qoq"
S = "sg-gdp-services-yoy"
SQ = "sg-gdp-services-qoq"
C = "sg-gdp-construction-yoy"
CQ = "sg-gdp-construction-qoq"
U = "sg-unemployment"
E = "sg-employment-change"
Q = "2025-Q3"
J = "2026-Q2"
W, N, D, A = "now_wrong", "number_only", "still_true", "unaffected"

BATCH = [
    ("autumn-floor.pptx", "Autumn floor briefing", "2025-10-24", "2025-11-21", [
        ("Manufacturing output stood still over July to September 2025.", W,M,Q,0),
        ("At the time, Q3 2025 manufacturing output showed zero growth year on year.", D,M,Q,0),
        ("In the third quarter of 2025, construction output expanded 3.1% year on year.", N,C,Q,3.1),
        ("Services output rose 0.2% quarter over quarter in 3Q 2025.", N,SQ,Q,.2),
        ("Manufacturing grew 6.1 per cent quarter on quarter in the third quarter of 2025.", N,MQ,Q,6.1),
        ("For Q1 2025, services output expanded 0.6% quarter on quarter.", A,SQ,"2025-Q1",.6),
        ("A weak order book masked what was effectively a standstill for factories.", "review"),
        ("Manufacturing and services seemed neck and neck in Q3 2025.", "review"),
    ]),
    ("midyear-minutes.docx", "Midyear planning minutes", "2026-07-21", "2026-10-14", [
        ("In the second quarter of 2026 Singapore GDP growth remained under 6 per cent.", W,G,J,5.7),
        ("The July release put GDP growth at 5.7 per cent in Q2 2026.", D,G,J,5.7),
        ("Construction grew 6.2% year over year in 2Q 2026.", N,C,J,6.2),
        ("Services stayed below 5 per cent year on year during Q2 2026.", W,S,J,4.6),
        ("Overall GDP expanded by 1.1% quarter on quarter in Q2 2026.", N,GQ,J,1.1),
        ("Output in manufacturing rose by exactly 12.2% year on year in 2Q 2026.", W,M,J,12.2),
        ("The GDP forecast assumed growth of at least 6% for Q2 2026.", "review"),
        ("Q2 2026 GDP grew more quickly than household spending.", "review"),
    ]),
    ("labour-correspondence.md", "Labour correspondence", "2026-08-17", "2026-11-19", [
        ("In Q2 2026 total employment grew by 14,000 persons.", N,E,J,14000),
        ("For 2Q 2026 the overall unemployment rate was exactly 2.0%.", W,U,J,2),
        ("The overall unemployment rate was at most 2% in Q2 2026.", N,U,J,2),
        ("The August release put Q2 2026 employment change at 14,000 people.", D,E,J,14000),
        ("Q3 2025 overall unemployment was 2.0 per cent.", A,U,Q,2),
        ("In Q2 2026 the unemployment rate stayed below 2.1 per cent.", N,U,J,2),
        ("Employment change almost reached 15,000 persons in the second quarter of 2026.", "review"),
        ("第二季度的就业人数有所增加。", "review"),
    ]),
    ("winter-reading.docx", "Winter reading notes", "2025-11-26", "2026-01-02", [
        ("The November survey put manufacturing at 5.0% year on year in 3Q 2025.", D,M,Q,5),
        ("Year-on-year manufacturing growth in Q3 2025 was exactly 5.0 per cent.", W,M,Q,5),
        ("Manufacturing grew by 5% year over year in the third quarter of 2025.", N,M,Q,5),
        ("In Q3 2025 manufacturing output grew 11.3% quarter on quarter.", N,MQ,Q,11.3),
        ("Services output stood at 3.9% year-on-year growth in Q3 2025.", N,S,Q,3.9),
        ("The third quarter of 2025 saw GDP grow at a 4.2% annual pace.", N,G,Q,4.2),
        ("Construction contracted 0.7% quarter on quarter in the third quarter of 2025.", W,CQ,Q,-.7),
        ("The revised manufacturing figure for Q3 2025 practically doubled the consensus.", "review"),
    ]),
    ("margin-notes.md", "Margin notes on a release", "2026-07-22", "2026-08-11", [
        ("GDP growth was lower than 6 per cent for the second quarter of 2026.", N,G,J,5.7),
        ("In 2Q 2026 the services sector grew by 4.6 per cent year on year.", N,S,J,4.6),
        ("Singapore GDP grew 5.7% year on year in 2Q 2026, the advance estimate showed.", D,G,J,5.7),
        ("Construction growth was at least 6.0 per cent year on year in the second quarter of 2026.", W,C,J,6.2),
        ("Quarter on quarter, Q2 2026 manufacturing grew 5.3%.", N,MQ,J,5.3),
        ("Q2 2026 GDP growth topped 5% but fell short of 6%.", N,G,J,5.7),
        ("No one claimed that Q2 2026 GDP growth was above 6%.", "review"),
        ("Q2 2026 GDP rose two percentage points relative to the private forecast.", "review"),
    ]),
]


def generate():
    SAMPLES.mkdir(exist_ok=True)
    for name, title, _, _, rows in BATCH:
        path = SAMPLES / name
        label = "Sample publication for the hardening exercise"
        if path.suffix == ".md":
            path.write_text("\n\n".join([f"# {title}", label, *(r[0] for r in rows)]) + "\n")
        elif path.suffix == ".docx":
            d = Document()
            d.add_heading(title, 0)
            d.add_paragraph(label)
            for i, (text, *_) in enumerate(rows):
                if i == 3:
                    d.add_table(1,1).cell(0,0).text = text
                else:
                    d.add_paragraph(text)
            d.save(path)
        else:
            d = Presentation()
            cover = d.slides.add_slide(d.slide_layouts[0])
            cover.shapes.title.text = title
            cover.placeholders[1].text = label
            for text, *_ in rows:
                slide = d.slides.add_slide(d.slide_layouts[6])
                p = slide.shapes.add_textbox(Inches(.6), Inches(2), Inches(8.6), Inches(2)).text_frame.paragraphs[0]
                first, space, rest = text.partition(" ")
                p.add_run().text = first + space
                p.add_run().text = rest
            d.save(path)


def score():
    records, extras = [], []
    with tempfile.TemporaryDirectory() as tmp:
        for name, title, day, asof, rows in BATCH:
            work = Path(tmp) / Path(name).stem
            def cli(*args):
                return execute(parser().parse_args([*map(str,args),"--workspace",str(work)]))
            reg = cli("register", SAMPLES/name, "--registered-on", day)
            result = cli("check", "--offline", "--as-of", asof, "--record")
            cli("fix", "--run", result["run_id"])
            cli("map", "--run", result["run_id"])
            verdicts = {v["claim_id"]:v for v in load(work/"runs"/result["run_id"]/"result.json")["verdicts"]}
            claims = {c["sentence"]: c for c in reg["claims"]}
            unlinked = {c["sentence"]: c for c in reg["unlinked"]}
            expected = {r[0] for r in rows}
            extras.extend((name, c["sentence"]) for c in reg["claims"] + reg["unlinked"] if c["sentence"] not in expected)
            for i,(sentence, gold, *link) in enumerate(rows, 1):
                c = claims.get(sentence, {})
                v = verdicts.get(c.get("claim_id"), {})
                actual = v.get("status")
                if actual == "unchecked" or sentence in unlinked:
                    outcome = "left for agent"
                elif not actual:
                    outcome = "missed"
                elif (actual == gold and [c["series_id"], c["period"], c["value_cited"]] == link
                      and c["stance"] == ("dated" if gold == D else "current")):
                    outcome = "right"
                else:
                    outcome = "confident-wrong"
                records.append(dict(document=name, row=i, sentence=sentence, gold=gold, linked=bool(c),
                                    actual=actual or ("unlinked" if sentence in unlinked else "missed"), outcome=outcome,
                                    reason=v.get("reason") or unlinked.get(sentence,{}).get("reason")))
    return {"totals":dict(Counter(r["outcome"] for r in records)), "extra_candidates":extras, "claims":records}


if __name__ == "__main__":
    arg = argparse.ArgumentParser()
    arg.add_argument("action", choices=["generate", "score"])
    args = arg.parse_args()
    if args.action == "generate":
        generate()
    else:
        print(json.dumps(score(), indent=2, ensure_ascii=False))
