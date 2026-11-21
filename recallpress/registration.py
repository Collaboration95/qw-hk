import hashlib
import re

from .documents import open_document, sentences
from .rules import ASSERTIONS, DATED, extract, infer_assertion, measured_values
from .storage import fingerprint, load, safe_id, save, visible


def read_register(workspace):
    path = workspace / "register.json"
    return load(path) if path.exists() else {"documents": [], "claims": []}


def validate_supplied(raw, candidates, blocks, document_id, archive, day):
    rows = raw.get("claims") if isinstance(raw, dict) else raw
    if not isinstance(rows, list) or not rows:
        raise ValueError("Supply a nonempty JSON array of claims or an object with a claims array")
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Each claim must be a JSON object with a sentence and its source.")
        required = ("sentence", "series_id", "period", "value_cited", "vintage_cited", "stance", "assertion")
        missing = [name for name in required if name not in row]
        if missing:
            raise ValueError("This claim is missing required fields: " + ", ".join(missing))
        sent = row["sentence"]
        hits = [c for c in candidates if c["sentence"] == sent]
        if not isinstance(sent, str) or not sent.strip():
            raise ValueError("Supply the exact, nonempty sentence from the original")
        if not hits:
            for i, block in enumerate(blocks):
                for m in re.finditer(re.escape(sent), block.text):
                    hits.append({"sentence": sent, "document_id": document_id, "location": block.location,
                                 "anchor": {"block": i, "start": m.start()}})
        if len(hits) > 1:
            hits = [c for c in hits if row.get("anchor") == c["anchor"] or row.get("location") == c["location"]]
        if len(hits) != 1:
            raise ValueError(f"Expected a unique exact sentence in the original: {sent!r}")
        block = blocks[hits[0]["anchor"]["block"]]
        if block.review:
            raise ValueError(f"{block.location}: {block.review}")
        series = archive.get(row["series_id"])
        vintages = visible(series, row["period"], day) if series else []
        if not any(v["published"] == row["vintage_cited"] and v["value"] == row["value_cited"] for v in vintages):
            raise ValueError(f"Value, series, period and vintage must match an archived release on or before {day}")
        figures = measured_values(sent)
        assertion = infer_assertion(sent)
        value = row["value_cited"]
        if len(figures) == 1 and value != figures[0] and not (
            assertion.get("detail") == "down" and value == -figures[0]
        ):
            raise ValueError("The supplied archived value does not match the number in the sentence")
        if row["stance"] not in ("current", "dated") or (DATED.search(sent) and row["stance"] != "dated"):
            raise ValueError(f"Check the stance for {sent!r}")
        a = row["assertion"]
        if not isinstance(a, dict) or a.get("type") not in ASSERTIONS:
            raise ValueError("Choose an assertion type from direction, threshold, level, comparison or rank")
        claim = hits[0] | {k: row[k] for k in ("series_id", "period", "vintage_cited", "value_cited", "stance")}
        # The agent can supply a richer predicate; recover threshold structure
        # from the sentence when it supplies only the SPEC type and detail.
        inferred = hits[0].get("assertion", assertion)
        claim["assertion"] = {"detail": ""} | (inferred if inferred.get("type") == a["type"] else {}) | a
        ref = claim["assertion"].get("reference")
        if ref:
            other = archive.get(ref["series_id"])
            if not other or not any(v["value"] == ref["value_cited"] and v["published"] == ref["vintage_cited"]
                                    for v in visible(other, ref["period"], day)):
                raise ValueError("Comparison reference does not match an archived vintage")
        if "claim_id" in row:
            claim["claim_id"] = safe_id(row["claim_id"])
        yield claim


def register(workspace, path, day, archive, claims_file=None):
    path = path.resolve(strict=True)
    before = fingerprint(path)
    _, blocks = open_document(path)
    register = read_register(workspace)
    doc_id = re.sub(r"[^a-z0-9]+", "-", path.stem.lower()).strip("-")[:100] or "document"
    other_paths = {d["document_id"]: d["path"] for d in register["documents"]}
    if other_paths.get(doc_id, str(path)) != str(path):
        doc_id += "-" + hashlib.sha256(str(path).encode()).hexdigest()[:10]
    candidates, missing, found = [], [], []
    title = next((b.text.strip().lstrip("# ").strip() for b in blocks
                  if ", title," in b.location.lower() or b.text.startswith("# ")), None)
    if title is None:
        title = next((b.text.strip() for b in blocks if b.text.strip()
                      and not b.text.lower().startswith("sample publication")), path.stem)
    heading = ""
    for i, block in enumerate(blocks):
        context = " ".join((heading, title, re.sub(r"(\d{4})q([1-4])", r"\1 Q\2", path.stem, flags=re.I)))
        for sentence, offset in sentences(block):
            base = {"document_id": doc_id, "location": block.location, "sentence": sentence,
                    "anchor": {"block": i, "start": offset}}
            fields, err = extract(sentence, context, archive, day)
            if block.review and (fields or err):
                fields, err = None, block.review
            if fields:
                found.append(base | fields)
            elif err:
                missing.append({"sentence": sentence, "location": block.location, "anchor": base["anchor"], "reason": err})
            candidates.append(base | (fields or {}))
        if block.text.lstrip().startswith("#") or ", title," in block.location.lower():
            heading = block.text.strip()
    if claims_file:
        found = list(validate_supplied(load(claims_file), candidates, blocks, doc_id, archive, day))
        verified = {(c["anchor"]["block"], c["anchor"]["start"], c["sentence"]) for c in found}
        missing = [m for m in missing if (m["anchor"]["block"], m["anchor"]["start"], m["sentence"]) not in verified]
    if not found and not missing:
        raise ValueError("No statistical claims were found. Read the document and supply the claims with --claims.")
    others = [c for c in register["claims"] if c["document_id"] != doc_id]
    ids = {c["claim_id"] for c in others}
    anchors = set()
    for claim in found:
        anchor = tuple(claim["anchor"].values())
        if anchor in anchors:
            raise ValueError(f"Duplicate supplied sentence at {claim['location']}")
        anchors.add(anchor)
        claim.setdefault("claim_id", f"{doc_id}-c{len(anchors)}")
        if claim["claim_id"] in ids:
            raise ValueError(f"Duplicate claim_id {claim['claim_id']}")
        ids.add(claim["claim_id"])
    if before != fingerprint(path):
        raise ValueError("Original changed during registration; retry")
    document = dict(document_id=doc_id, title=title, path=str(path), registered=day, sha256=before, unlinked=missing)
    updated = {"documents": [d for d in register["documents"] if d["document_id"] != doc_id] + [document],
               "claims": others + found}
    save(workspace / "register.json", updated)
    return {"document_id": doc_id, "claims": found, "unlinked": missing}
