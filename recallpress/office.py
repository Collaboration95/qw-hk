"""Read Office text in display order and patch only the edited package part."""
import difflib
import posixpath
from dataclasses import dataclass
from xml.dom import Node, minidom
from xml.parsers.expat import ExpatError
from xml.sax.saxutils import escape
from zipfile import BadZipFile, ZipFile


BASE = "http://schemas.openxmlformats.org/"
A = BASE + "drawingml/2006/main"
P = BASE + "presentationml/2006/main"
W = BASE + "wordprocessingml/2006/main"
R = BASE + "officeDocument/2006/relationships"


def children(node, ns, tag):
    return [c for c in node.childNodes if c.namespaceURI == ns and c.localName == tag]


def descendants(node, ns, tag):
    return node.getElementsByTagNameNS(ns, tag)


@dataclass
class Block:
    text: str
    location: str
    part: str = ""
    spans: tuple = ()
    review: str = ""


def paragraph(p, ns, location, part, review=""):
    spans = []
    for node in p.getElementsByTagName("*"):
        if node.namespaceURI != ns:
            continue
        if node.localName == "t":
            text = "".join(n.data for n in node.childNodes if n.nodeType == Node.TEXT_NODE)
            spans.append((node, text))
        elif node.localName in ("br", "cr", "tab"):
            spans.append((None, " "))
        elif node.localName in ("ins", "del", "moveFrom", "moveTo", "fld", "fldChar", "instrText",
                                "drawing", "fldSimple", "footnoteReference", "endnoteReference"):
            review = "Read this paragraph in the original. It contains tracked changes, a field or an embedded item."
    if any(n is None for n, _ in spans):
        review = "Read the complete sentence across the line break in the original before editing."
    return Block("".join(t for _, t in spans), location, part, tuple(spans), review)


def word_blocks(container, part, prefix="", review=""):
    i = 0
    for node in container.childNodes:
        if node.namespaceURI != W:
            continue
        if node.localName == "p":
            i += 1
            yield paragraph(node, W, f"{prefix}paragraph {i}", part, review)
        elif node.localName == "tbl":
            i += 1
            for r, row in enumerate(children(node, W, "tr"), 1):
                for c, cell in enumerate(children(row, W, "tc"), 1):
                    yield from word_blocks(cell, part, f"{prefix}table {i}, row {r}, cell {c}, ", review)
        elif node.localName in ("ins", "moveTo", "sdt", "sdtContent"):
            yield from word_blocks(node, part, prefix, "Review the tracked or controlled text in Word before editing.")


def drawing_paragraphs(frame, prefix, part, review=""):
    blocks = [paragraph(p, A, f"{prefix}, paragraph {i}", part, review)
              for i, p in enumerate(children(frame, A, "p"), 1)]
    # A hard return can split one sentence. Keep it together for review and
    # retain the block positions used by registrations of older editions.
    for i in range(len(blocks) - 1):
        a, b = blocks[i], blocks[i + 1]
        if a.text and a.text[-1] not in ".!?" and b.text[:1].islower():
            b.text = a.text.rstrip() + " " + b.text.lstrip()
            b.review = "Read the sentence across both slide paragraphs before editing."
            a.text = ""
    yield from blocks


def shapes(group, prefix, part):
    for shape in group.childNodes:
        if shape.namespaceURI != P:
            continue
        props = descendants(shape, P, "cNvPr")
        if not props:
            continue
        label = f"{prefix}, {props[0].getAttribute('name')}"
        if shape.localName == "grpSp":
            yield from shapes(shape, label, part)
            continue
        for frame in children(shape, P, "txBody"):
            yield from drawing_paragraphs(frame, label, part)
        for table in descendants(shape, A, "tbl"):
            for r, row in enumerate(children(table, A, "tr"), 1):
                for c, cell in enumerate(children(row, A, "tc"), 1):
                    if any(cell.getAttribute(key) in ("1", "true") for key in ("hMerge", "vMerge")):
                        continue
                    for frame in children(cell, A, "txBody"):
                        yield from drawing_paragraphs(frame, f"{label}, row {r}, cell {c}", part)


def relations(package, part):
    folder, name = posixpath.split(part)
    relfile = posixpath.join(folder, "_rels", name + ".rels")
    if relfile not in package.namelist():
        return {}
    root = minidom.parseString(package.read(relfile))
    return {r.getAttribute("Id"): (r.getAttribute("Type").rsplit("/", 1)[-1],
            posixpath.normpath(posixpath.join(folder, r.getAttribute("Target"))).lstrip("/"))
            for r in root.documentElement.childNodes if r.nodeType == Node.ELEMENT_NODE
            and r.getAttribute("TargetMode") != "External"}


def read_office(path):
    blocks, extra = [], []
    try:
        with ZipFile(path) as package:
            if path.suffix.lower() == ".docx":
                part = "word/document.xml"
                body, = descendants(minidom.parseString(package.read(part)), W, "body")
                blocks.extend(word_blocks(body, part))
                for role, note in relations(package, part).values():
                    if role in ("footnotes", "endnotes"):
                        notes = minidom.parseString(package.read(note))
                        for n in descendants(notes, W, role[:-1]):
                            if n.getAttributeNS(W, "type") in ("separator", "continuationSeparator"):
                                continue
                            extra.extend(word_blocks(n, note, f"{role[:-1]} {n.getAttributeNS(W, 'id')}, ",
                                                     "Check the note in Word before editing it."))
                return None, blocks + extra
            part = "ppt/presentation.xml"
            pres = minidom.parseString(package.read(part))
            slides = descendants(pres, P, "sldId")
            if not slides:
                raise ValueError("This presentation has no slides.")
            links = relations(package, part)
            for i, slide in enumerate(slides, 1):
                _, name = links[slide.getAttributeNS(R, "id")]
                root = minidom.parseString(package.read(name))
                group, = descendants(root, P, "spTree")
                blocks.extend(shapes(group, f"slide {i}", name))
                for role, target in relations(package, name).values():
                    if role == "notesSlide":
                        notes = minidom.parseString(package.read(target))
                        for shape in descendants(notes, P, "sp"):
                            if any(p.getAttribute("type") == "body" for p in descendants(shape, P, "ph")):
                                for frame in children(shape, P, "txBody"):
                                    extra.extend(drawing_paragraphs(frame, f"slide {i}, speaker notes", target))
                    elif role == "chart":
                        chart = minidom.parseString(package.read(target))
                        for j, p in enumerate(descendants(chart, A, "p"), 1):
                            extra.append(paragraph(p, A, f"slide {i}, chart text {j}", target,
                                                   "Check this caption against the chart and its data before editing."))
            size, = descendants(pres, P, "sldSz")
            return (int(size.getAttribute("cx")), int(size.getAttribute("cy"))), blocks + extra
    except (BadZipFile, KeyError, ExpatError, IndexError) as exc:
        raise ValueError(f"{path.name} could not be opened. Export a fresh Office copy and try again.") from exc


def edit_spans(block, offset, old, new):
    bounds = []
    cursor = 0
    for node, value in block.spans:
        if value:
            bounds.append((cursor, cursor + len(value), node))
        cursor += len(value)
    for op, a, b, c, d in reversed(difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes()):
        if op == "equal":
            continue
        start, end = offset + a, offset + b
        hits = [span for span in bounds if span[1] > start and span[0] < end]
        if not hits:
            pos = max(offset, start - 1)
            hits = [next(span for span in bounds if span[0] <= pos < span[1])]
        for i, (left, right, node) in enumerate(hits):
            text = node.firstChild.data if node.firstChild else ""
            value = text[:max(0, start-left)] + (new[c:d] if i == 0 else "") + text[min(right-left, end-left):]
            if node.firstChild:
                node.firstChild.data = value
            else:
                node.appendChild(node.ownerDocument.createTextNode(value))
            if node.namespaceURI == W and value and value != value.strip():
                node.setAttribute("xml:space", "preserve")


def patch_office(path, target, block, size, start, old, new, source):
    if block.review:
        raise ValueError(block.review)
    edit_spans(block, start, old, new)
    tree = next(n.ownerDocument for n, t in block.spans if n is not None)
    text = escape(source)
    if size is None:
        fragment = f'<w:p xmlns:w="{W}"><w:r><w:rPr><w:sz w:val="16"/></w:rPr><w:t>{text}</w:t></w:r></w:p>'
        body, = descendants(tree, W, "body")
        sections = children(body, W, "sectPr")
        body.insertBefore(minidom.parseString(fragment).documentElement, sections[0] if sections else None)
    elif tree.documentElement.localName == "notes":
        frame = next(n for n, _ in block.spans if n is not None)
        while frame.localName != "txBody":
            frame = frame.parentNode
        fragment = f'<a:p xmlns:a="{A}"><a:r><a:t>{text}</a:t></a:r></a:p>'
        frame.appendChild(minidom.parseString(fragment).documentElement)
    else:
        width, height = size
        sid = 1 + max(int(n.getAttribute("id")) for n in descendants(tree, P, "cNvPr"))
        fragment = f'''<p:sp xmlns:p="{P}" xmlns:a="{A}">
<p:nvSpPr><p:cNvPr id="{sid}" name="Source {sid}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="182880" y="{height-274320}"/><a:ext cx="{width-365760}" cy="237744"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
<p:txBody><a:bodyPr tIns="0" bIns="0"/><a:lstStyle/><a:p><a:r><a:rPr sz="800"/><a:t>{text}</a:t></a:r></a:p></p:txBody></p:sp>'''
        group, = descendants(tree, P, "spTree")
        ext = children(group, P, "extLst")
        group.insertBefore(minidom.parseString(fragment).documentElement, ext[0] if ext else None)
    with ZipFile(path) as original, ZipFile(target, "w") as edited:
        edited.comment = original.comment
        for entry in original.infolist():
            data = tree.toxml(encoding="utf-8") if entry.filename == block.part else original.read(entry)
            edited.writestr(entry, data)
