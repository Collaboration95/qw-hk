"""Render an offline Recall Press map from a SPEC §5 run and register."""

import argparse
import base64
import difflib
import html
import json
import re
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
VERDICTS = {
    "now_wrong": "Now wrong",
    "number_only": "Number changed, claim still holds",
    "still_true": "Still true",
    "unaffected": "Not affected",
    "unchecked": "Needs editor review",
}
FIXABLE = ("now_wrong", "number_only")
MIME = {
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".md": "text/markdown",
}
SYMBOLS = {"now_wrong": "!", "number_only": "≈", "still_true": "✓", "unaffected": "–", "unchecked": "?"}


def esc(value):
    return html.escape(str(value), quote=True)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def nice_date(raw):
    try:
        return date.fromisoformat(raw[:10]).strftime("%d %b %Y").lstrip("0")
    except (TypeError, ValueError):
        return str(raw or "Date unavailable")


def nice_period(raw):
    match = re.fullmatch(r"(\d{4})-(Q[1-4])", raw)
    return f"{match[2]} {match[1]}" if match else raw


def external_link(url, label):
    if url and urlsplit(url).scheme in {"http", "https"} and urlsplit(url).netloc:
        return f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{esc(label)} <span aria-hidden="true">↗</span></a>'
    return ""


def trigger_line(result):
    if result.get("replay") or result.get("trigger") == "replay":
        published = {c["new_published"] for c in result["changes"]}
        if any(day != result["as_of"] for day in published):
            return "Historical replay as of " + nice_date(result["as_of"])
        if len(published) == 1:
            return "Replay of a real revision published " + nice_date(published.pop())
        if published:
            dates = ", ".join(nice_date(day) for day in sorted(published))
            return "Replay of real revisions published " + dates
        return "Historical replay · " + nice_date(result["as_of"])
    return {"schedule": "Scheduled check", "email": "Check from a release email", "manual": "Manual check"}.get(
        result["trigger"], "Publication check"
    )


def figure(change):
    series_id = change["series_id"]
    archive = {}
    if re.fullmatch(r"[\w.-]+", series_id):
        path = HERE.parent / "data" / "series" / (series_id + ".json")
        if path.is_file():
            archive = read_json(path)
    observation = next((o for o in archive.get("observations", []) if o["period"] == change["period"]), {})
    vintages = {v["published"]: v for v in observation.get("vintages", [])}
    title = change.get("title") or archive.get("title") or series_id.replace("-", " ")
    unit = change.get("unit", archive.get("unit", ""))
    source_url = change.get("url") or vintages.get(change["new_published"], {}).get("url")
    source = external_link(source_url, "Official release")

    def reading(side):
        published = change[side + "_published"]
        release = change.get(side + "_release") or vintages.get(published, {}).get("release") or "Release"
        value = change[side]
        if isinstance(value, (int, float)):
            value = format(value, ",")
        release_text = re.sub(r"\b\d{4}-Q[1-4]\b", r'<span class="nowrap">\g<0></span>', esc(release))
        gap = "" if unit in ("%", "") else " "
        return f'''<div class="reading {side}"><b>{esc(value)}{gap}{esc(unit)}</b>
            <span class="release">{release_text}</span><time>{esc(nice_date(published))}</time></div>'''

    return f'''<article class="figure"><div class="figure-title">
      <p class="kicker">Revised figure <span> / </span> {esc(nice_period(change["period"]))}</p>
      <h1>{esc(title)}</h1>{source}</div><div class="readings">
      {reading("old")}<span class="arrow" aria-label="revised to">→</span>{reading("new")}</div></article>'''


def sentence_diff(before, after):
    # Keep whitespace and punctuation verbatim. Treat a percentage as one editorial change.
    pattern = r"\d+(?:[.,]\d+)*(?:%)?|\w+(?:[’']\w+)*|\s+|[^\w\s]"
    left, right = re.findall(pattern, before), re.findall(pattern, after)
    old, new = [], []
    for kind, a, b, c, d in difflib.SequenceMatcher(None, left, right, autojunk=False).get_opcodes():
        lhs, rhs = esc("".join(left[a:b])), esc("".join(right[c:d]))
        old.append(f"<del>{lhs}</del>" if lhs and kind != "equal" else lhs)
        new.append(f"<ins>{rhs}</ins>" if rhs and kind != "equal" else rhs)
    return "".join(old), "".join(new)


def attachment(verdict, result_dir, workspace):
    name = verdict.get("replacement_file")
    if not name:
        return ""
    path = Path(name)
    if path.suffix.lower() not in MIME:
        return ""
    for candidate in (workspace / path, result_dir / path):
        candidate = candidate.resolve()
        if candidate.is_relative_to(workspace) and candidate.is_file():
            data = base64.b64encode(candidate.read_bytes()).decode("ascii")
            suffix = candidate.suffix.lower()
            return f'''<a class="download" download="{esc(candidate.name)}" href="data:{MIME[suffix]};base64,{data}">
                <span aria-hidden="true">↓</span> Replacement {suffix[1:].upper()}</a>'''
    return '<span class="missing">Replacement file unavailable</span>'


def claim_section(claim, verdict, result_dir, workspace, multiple_changes):
    status = verdict.get("status", "unchecked")
    label = VERDICTS[status]
    location = re.sub(r", paragraph 1$", "", claim["location"])
    if multiple_changes:
        location += " · " + nice_period(claim["period"])
    header = f'''<div class="claim-meta"><span class="location">{esc(location)}</span>
        <span class="badge {status}"><i aria-hidden="true">{SYMBOLS[status]}</i>{label}</span></div>'''
    if verdict.get("disagreement"):
        label_review = '<span class="review">Editor review requested</span>'
        header += label_review
    reason = f'<p class="reason">{esc(verdict["reason"])}</p>' if verdict.get("reason") else ""
    if verdict.get("already_issued") or status not in FIXABLE or claim.get("stance") == "dated" or not verdict.get("replacement_sentence"):
        return f'<section class="claim">{header}<p class="unchanged">{esc(claim["sentence"])}</p>{reason}</section>'

    proposed = verdict["replacement_sentence"]
    old, new = sentence_diff(claim["sentence"], proposed)
    file_link = attachment(verdict, result_dir, workspace)
    decision = verdict.get("decision", "pending")
    claim_id = esc(claim["claim_id"])
    return f'''<section class="claim editable" data-claim="{claim_id}" data-decision="{esc(decision)}">
      {header}<div class="diff"><div><p class="label">Published</p><p class="sentence">{old}</p></div>
      <div><p class="label">Replacement</p><p class="sentence proposal">{new}</p></div></div>
      <label class="edit-box" hidden>Edit replacement sentence<textarea rows="3">{esc(proposed)}</textarea></label>
      {reason}<div class="file-row">{file_link}</div>
      <div class="actions" aria-label="Decision for {claim_id}"><button type="button" data-action="apply">Apply fix</button>
      <button type="button" data-action="skip">Skip</button><button type="button" data-action="edit">Edit first</button></div>
      <p class="state" role="status"></p></section>'''


def release_context(context):
    v = context["vintage"]
    link = external_link(v["url"], "Official release")
    note = "Cited by a publication in this run." if context["linked"] else "No publication in this run cites this figure yet."
    return f'''<article class="figure"><div class="figure-title"><p class="kicker">Published figure / {esc(nice_period(context["period"]))}</p>
      <h1>{esc(context["title"])}</h1>{link}</div><div class="reading new"><b>{esc(v["value"])}{esc(context["unit"])}</b>
      <span class="release">{esc(v["release"])} · {esc(nice_date(v["published"]))}</span><span>{note}</span></div></article>'''


def review_items(doc):
    return "".join(f'<p class="reason"><b>Needs review · {esc(item["location"])}</b><br>'
                   f'{esc(item["sentence"])}<br>{esc(item["reason"])}</p>' for item in doc.get("unlinked", []))


def map_body(result, register, result_dir, workspace):
    context = release_context(result["context"]) if result.get("context") else ""
    if result["no_change"]:
        n = result["series_checked"]
        banner = f'<section class="figures">{context}</section>' if context else ""
        if not register["documents"]:
            return banner + ('<section class="quiet"><h1>No publications registered for this date</h1>'
                             '<p>Register a publication to check its figures.</p></section>')
        names = "".join(f'<li>{esc(d["title"])}{review_items(d)}</li>'  for d in register["documents"])
        unlinked = result.get("unlinked_count", 0)
        pending = ("<p>One sentence still needs a source.</p>" if unlinked == 1 else
                   f"<p>{unlinked} sentences still need a source.</p>" if unlinked else "")
        skipped = {v["claim_id"] for v in result.get("verdicts", []) if v.get("previously_skipped")}
        titles = {d["document_id"]: d["title"] for d in register["documents"]}
        for c in register["claims"]:
            if c["claim_id"] in skipped:
                pending += f'<p>Earlier decision · Skipped · {esc(titles[c["document_id"]])}, {esc(c["location"])}</p>'
        headline = "No new revision" if n else "No linked figures to check"
        return f'''{banner}<section class="quiet"><h1><i aria-hidden="true">✓</i>{headline}</h1>
            <p>Checked {esc(n)} series. No replacement files issued.</p></section>
            <section class="coverage"><h2>Publications checked</h2><ul>{names}</ul>{pending}</section>'''
    verdicts = {v["claim_id"]: v for v in result["verdicts"]}
    by_doc = defaultdict(list)
    for claim in register["claims"]:
        by_doc[claim["document_id"]].append((claim, verdicts.get(claim["claim_id"], {})))
    counts = defaultdict(int)
    fixes = 0
    docs = []
    for doc in register["documents"]:
        pairs = by_doc[doc["document_id"]]
        if doc.get("registered", "")[:10] > result["as_of"] and not any(v for _, v in pairs):
            continue
        # A publication's most urgent verdict decides its count and map position.
        order = ("now_wrong", "unchecked", "number_only", "still_true", "unaffected")
        pairs = [(c, v | {"status": "unaffected"} if v.get("already_issued") else v) for c, v in pairs]
        pairs.sort(key=lambda p: order.index(p[1].get("status", "unchecked")))
        primary = pairs[0][1].get("status", "unchecked") if pairs else "unchecked"
        counts[primary] += 1
        fixes += any(v.get("status") in FIXABLE for _, v in pairs)
        sections = []
        for c, v in pairs:
            section = claim_section(c, v, result_dir, workspace, len(result["changes"]) > 1)
            if sections and v.get("status") in FIXABLE:
                label = f'{esc(c["location"])} · {VERDICTS[v["status"]]}'
                section = f'<details class="additional"><summary>{label}</summary>{section}</details>'
            sections.append(section)
        sections = "".join(sections)
        ext = Path(doc["path"]).suffix.lstrip(".").upper()
        title = esc(doc["title"])
        anchor = "publication-" + esc(doc["document_id"])
        link = f'''<a href="#{anchor}" class="doc-link {primary}"><span>{title}</span>
            <small>{esc(ext)} · {VERDICTS[primary]}</small></a>'''
        unlinked = review_items(doc)
        card = f'''<article class="document" id="{anchor}" tabindex="-1"><header class="doc-head">
            <div class="filetype"><i aria-hidden="true"></i>{esc(ext)}</div><h3>{title}</h3>{unlinked}</header>
            {sections}</article>'''
        docs.append((order.index(primary), link, card))
    n = len(docs)
    stats = [f'{n} document{"s" if n != 1 else ""} checked', f'{fixes} {"needs" if fixes == 1 else "need"} a fix']
    if counts["still_true"]:
        stats.append(f'{counts["still_true"]} still true')
    if counts["unaffected"]:
        stats.append(f'{counts["unaffected"]} not affected')
    if counts["unchecked"]:
        stats.append(f'{counts["unchecked"]} awaiting a verdict')
    changes = sorted(result["changes"], key=lambda c: (c["new_published"], c["period"]), reverse=True)
    figures = context or figure(changes[0])
    remaining = changes if context else changes[1:]
    if remaining:
        others = "".join(figure(c) for c in remaining)
        label = "Revisions affecting earlier publications" if context else "Other revised figures"
        figures += f'<details class="other"><summary>{label} ({len(remaining)})</summary>{others}</details>'
    docs.sort(key=lambda d: d[0])
    links = "".join(link for _, link, _ in docs)
    cards = "".join(card for _, _, card in docs)
    export = '''<details class="export"><summary>Decision JSON</summary>
        <textarea class="json" aria-label="Decision JSON to copy" readonly rows="4"></textarea>
        <button class="copy" type="button">Copy JSON</button><span class="copy-status" role="status"></span></details>''' if fixes else ""
    return f'''<section class="figures">{figures}</section><section class="publications">
        <div class="map-heading"><h2>Publication map</h2><p>{esc(" · ".join(stats))}</p></div>
        <div class="map-grid"><nav aria-label="Publications">{links}</nav><div>{cards}</div></div></section>{export}'''


def render(result_path, register_path, out_path):
    """Write one offline HTML file, including available original-format replacement files."""
    result_path, register_path, out_path = map(Path, (result_path, register_path, out_path))
    result = read_json(result_path)
    register = result["register_snapshot"] if "register_snapshot" in result else read_json(register_path)
    body = map_body(result, register, result_path.resolve().parent, register_path.resolve().parent)
    css = (HERE / "map.css").read_text(encoding="utf-8")
    js = (HERE / "decisions.js").read_text(encoding="utf-8")
    page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><title>Recall Press · Publication map</title><style>{css}</style></head>
<body><main class="press" data-run="{esc(result.get("run_id", ""))}"><header class="masthead">
<div class="wordmark"><span class="press-mark" aria-hidden="true"><i></i><i></i><i></i></span>Recall Press</div>
<p class="trigger">{esc(trigger_line(result))}</p></header>{body}</main><script>{js}</script></body></html>'''
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")
    return out_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ("result", "register", "out"):
        parser.add_argument(arg, type=Path)
    args = parser.parse_args()
    render(args.result, args.register, args.out)
