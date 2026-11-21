"""Generate real Office packages and compare corrected XML with independent readers."""
import subprocess
import sys
from pathlib import Path
from zipfile import ZipFile

import pytest
from docx import Document
from docx.oxml import OxmlElement
from lxml import etree
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from pptx.util import Inches

from recallpress.storage import ROOT, load
from test_hardening_language import command

GDP = "GDP expanded by 5.7% year on year in Q2 2026"
SPLIT = "GDP grew by 5.7% year on year in Q2 2026."
NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def generate_office(folder):
    ppt = Presentation()
    for _ in range(60):
        slide = ppt.slides.add_slide(ppt.slide_layouts[6])
    def textbox(y):
        return slide.shapes.add_textbox(0, Inches(y), Inches(8), Inches(.8)).text_frame
    p = textbox(0).paragraphs[0]
    p.add_run().text = "GDP expanded by "
    r = p.add_run()
    r.font.bold = True
    r.text = "5.7"
    p.add_run().text = "% year on year in Q2 2026."
    p = textbox(1).paragraphs[0]
    p.add_run().text = "GDP grew by 5.7% year on year"
    p.add_line_break()
    p.add_run().text = "in Q2 2026."
    table = slide.shapes.add_table(1, 1, 0, Inches(2), Inches(8), Inches(1)).table
    table.cell(0, 0).text = GDP + " (table)."
    slide.notes_slide.notes_text_frame.text = GDP + " (speaker note)."
    data = CategoryChartData()
    data.categories = ["Q2"]
    data.add_series("Sample", (5.7,))
    chart = slide.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, 0, Inches(4), Inches(6), Inches(2), data).chart
    chart.has_title = True
    chart.chart_title.text_frame.text = GDP + " (chart caption)."
    pptpath = folder / "sample-slides.pptx"
    ppt.save(pptpath)

    doc = Document()
    p = doc.add_paragraph()
    p.add_run("GDP expanded by ")
    p.add_run("5.7").bold = True
    p.add_run("% year on year in Q2 2026.")
    p = doc.add_paragraph("GDP ")
    ins = OxmlElement("w:ins")
    r = p.add_run("possibly ")
    ins.append(r._r)
    p._p.append(ins)
    p.add_run("expanded by 5.7% year on year in Q2 2026.")
    doc.add_table(1, 1).cell(0, 0).text = GDP + " (Word table)."
    p = doc.add_paragraph("Sample footnote")
    p.add_run()._r.append(etree.fromstring(f'<w:footnoteReference xmlns:w="{NS["w"]}" w:id="1"/>'))
    docpath = folder / "sample-paper.docx"
    doc.save(docpath)
    with ZipFile(docpath) as z:
        parts = {n: z.read(n) for n in z.namelist()}
    parts["word/footnotes.xml"] = (f'<w:footnotes xmlns:w="{NS["w"]}"><w:footnote w:id="1">'
        f'<w:p><w:r><w:t>{GDP} (footnote).</w:t></w:r></w:p></w:footnote></w:footnotes>').encode()
    rels = etree.fromstring(parts["word/_rels/document.xml.rels"])
    etree.SubElement(rels, "{*}Relationship".replace("*", rels.nsmap[None]), Id="rIdNote",
                     Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes", Target="footnotes.xml")
    parts["word/_rels/document.xml.rels"] = etree.tostring(rels)
    content = etree.fromstring(parts["[Content_Types].xml"])
    etree.SubElement(content, "{%s}Override" % content.nsmap[None], PartName="/word/footnotes.xml",
                     ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml")
    parts["[Content_Types].xml"] = etree.tostring(content)
    with ZipFile(docpath, "w") as z:
        for n, data in parts.items():
            z.writestr(n, data)
    return pptpath, docpath


def test_office_coverage(tmp_path):
    slides, paper = generate_office(tmp_path)
    for path, tails in [(slides, ["(table).", "(speaker note).", "(chart caption)."]),
                        (paper, ["(footnote).", "(Word table)."])]:
        reg = command(tmp_path, "register", path, "--registered-on", "2026-07-18")
        seen = [c["sentence"] for c in reg["claims"] + reg["unlinked"]]
        for tail in tails:
            assert any(s.endswith(tail) for s in seen), tail
        if path == slides:
            assert SPLIT in seen
        else:
            assert any("possibly" in c["sentence"] and c["reason"] for c in reg["unlinked"])
            assert sum(c["sentence"] == GDP + "." for c in reg["claims"]) == 1
    run = command(tmp_path, "check", "--offline", "--as-of", "2026-08-11")
    command(tmp_path, "fix", "--run", run["run_id"])
    r = load(tmp_path / "runs" / run["run_id"] / "result.json")
    assert all(v.get("replacement_file") for v in r["verdicts"] if v["status"] == "number_only")


@pytest.mark.parametrize("ext", ["pptx","docx"])
def test_xml_delta(tmp_path, ext):
    slides, paper = generate_office(tmp_path)
    p = slides if ext == "pptx" else paper
    reg = command(tmp_path, "register", p, "--registered-on", "2026-07-18")
    run = command(tmp_path, "check", "--offline", "--as-of", "2026-08-11")
    report = command(tmp_path, "fix", "--run", run["run_id"])
    by_id = {c["claim_id"]: c for c in reg["claims"]}
    original = p.read_bytes()
    for v in load(Path(report["result"]))["verdicts"]:
        if not v.get("replacement_file"):
            continue
        draft = tmp_path / v["replacement_file"]
        with ZipFile(p) as before, ZipFile(draft) as after:
            assert after.testzip() is None
            assert set(before.namelist()) == set(after.namelist())
            modified = []
            for name in after.namelist():
                if name.endswith((".xml", ".rels")):
                    etree.fromstring(after.read(name))
                if before.read(name) != after.read(name):
                    modified.append(name)
            assert len(modified) == 1, modified
            part = modified[0]
            a, b = [etree.fromstring(z.read(part)) for z in (before, after)]
            # Undo only the documented source addition and the one numeric token.
            source = b.xpath("//*[local-name()='t' and text()=$line]", line=v["source_line"])
            assert len(source) == 1
            node = source[0]
            container = next(node.iterancestors("{%s}%s" % (NS["w"] if ext=="docx" else NS["p"], "p" if ext=="docx" else "sp")))
            container.getparent().remove(container)
            left = a.xpath("//*[local-name()='t']")
            right = b.xpath("//*[local-name()='t']")
            assert len(left) == len(right)
            pairs = [(l,r) for l,r in zip(left,right) if l.text != r.text]
            assert len(pairs) == 1, by_id[v["claim_id"]]
            l,r = pairs[0]
            assert r.text == l.text.replace("5.7", "5.9", 1)
            r.text = l.text
            assert etree.tostring(a, method="c14n") == etree.tostring(b, method="c14n")
        (Presentation if ext=="pptx" else Document)(draft)
    assert original == p.read_bytes()


@pytest.mark.parametrize("kind", ["empty", "broken"])
def test_invalid_deck_message(tmp_path, kind):
    p = tmp_path / "sample.pptx"
    if kind == "empty":
        Presentation().save(p)
    else:
        p.write_bytes(b"Incomplete sample slide deck")
    out = subprocess.run([sys.executable,"-m","recallpress","register",p,"--workspace",tmp_path],
                         cwd=ROOT, capture_output=True, text=True)
    assert out.returncode and "Traceback" not in out.stderr
    assert ("has no slides" if kind=="empty" else "could not be opened") in out.stderr
    assert not (tmp_path / "register.json").exists()
