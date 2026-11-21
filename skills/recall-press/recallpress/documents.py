"""Anchor each sentence to a paragraph and character offset in the original file."""
import re
from pathlib import Path

from .office import Block, patch_office, read_office


def open_document(path):
    suffix = path.suffix.lower()
    if suffix == ".md":
        text = path.read_bytes().decode("utf-8")
        lines = text.splitlines(keepends=True)
        return lines, [Block(line, f"line {i}") for i, line in enumerate(lines, 1)]
    if suffix in (".docx", ".pptx"):
        return read_office(path)
    raise ValueError("Supported documents are .pptx, .docx and .md")


def sentences(block):
    # Keep decimal points inside numbers. Headings and slide titles need no full stop.
    for match in re.finditer(r"[^\n\r\v]+?(?:[.!?](?=\s|$)|(?=[\n\r\v]|$))", block.text):
        text = match.group().strip()
        text = re.sub(r"^(?:#{1,6}|[-*]|\d+\.)\s+", "", text)
        if text:
            yield text, block.text.index(text, match.start())


def make_copy(path: Path, target, claim, replacement, source):
    doc, blocks = open_document(path)
    anchor = claim["anchor"]
    block = blocks[anchor["block"]] if anchor["block"] < len(blocks) else None
    if block is None or block.location != claim["location"]:
        matches = [b for b in blocks if b.location == claim["location"]]
        if len(matches) != 1:
            raise ValueError("The sentence moved. Register this edition again.")
        block = matches[0]
    start, old = anchor["start"], claim["sentence"]
    if block.text[start:start + len(old)] != old:
        raise ValueError(f"Sentence moved at {claim['location']}; register the new edition")
    if path.suffix.lower() == ".md":
        doc[anchor["block"]] = block.text[:start] + replacement + block.text[start + len(old):]
        newline = "\r\n" if any(line.endswith("\r\n") for line in doc) else "\n"
        body = "".join(doc)
        separator = newline if body.endswith(newline) else newline * 2
        target.write_bytes((body + separator + source + newline).encode())
        return
    patch_office(path, target, block, doc, start, old, replacement, source)
