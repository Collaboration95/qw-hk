"""Rebuild fixture attachments and standalone examples from the original publications."""

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Inches, Pt

from render_map import HERE, read_json, render


def build(directory):
    register, result = (read_json(directory / name) for name in ("register.json", "result.json"))
    claims = {c["claim_id"]: c for c in register["claims"]}
    docs = {d["document_id"]: d for d in register["documents"]}
    for verdict in result["verdicts"]:
        if not verdict.get("replacement_file"):
            continue
        claim = claims[verdict["claim_id"]]
        doc = docs[claim["document_id"]]
        source = directory / doc["path"]
        deck = Presentation(source)
        hits = [(slide, run) for slide in deck.slides for shape in slide.shapes if shape.has_text_frame
                for p in shape.text_frame.paragraphs for run in p.runs if run.text == claim["sentence"]]
        if len(hits) != 1:
            raise ValueError(f"Expected one exact sentence for {claim['claim_id']} in {source.name}")
        slide, run = hits[0]
        run.text = verdict["replacement_sentence"]
        change = next(c for c in result["changes"] if (c["series_id"], c["period"]) == (claim["series_id"], claim["period"]))
        series = read_json(HERE.parent / "data" / "series" / (change["series_id"] + ".json"))
        vintage = next(v for o in series["observations"] if o["period"] == claim["period"]
                       for v in o["vintages"] if v["published"] == change["new_published"])
        note = slide.shapes.add_textbox(Inches(.84), Inches(6.91), Inches(11.68), Inches(.39))
        note.name = "Correction source"
        frame = note.text_frame
        frame.margin_top = frame.margin_left = 0
        citation = frame.paragraphs[0].add_run()
        citation.text = f"Revised source · MTI · {vintage['release']} · {vintage['published']}"
        citation.hyperlink.address = vintage["url"]
        citation.font.name, citation.font.size = "Arial", Pt(12)
        citation.font.color.rgb = RGBColor.from_string("545865")
        target = directory / verdict["replacement_file"]
        target.parent.mkdir(parents=True, exist_ok=True)
        deck.save(target)
    render(directory / "result.json", directory / "register.json", HERE / "examples" / (directory.name + ".html"))


if __name__ == "__main__":
    for fixture in sorted((HERE / "fixtures").iterdir()):
        if fixture.is_dir():
            build(fixture)
