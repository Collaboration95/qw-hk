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
    "number_only": "Still true, new figure",
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


def checked_line(result):
    """One quiet date for the masthead; a replay says so because the date is not today's."""
    if result.get("replay") or result.get("trigger") == "replay":
        return "Replay as of " + nice_date(result["as_of"])
    return "Checked " + nice_date(result.get("finished") or result["as_of"])


def archive_for(series_id):
    if re.fullmatch(r"[\w.-]+", series_id or ""):
        path = HERE.parent / "data" / "series" / (series_id + ".json")
        if path.is_file():
            return read_json(path)
    return {}


def release_name(raw):
    """'Advance GDP estimates — 2025-Q3' reads as 'Advance GDP estimates'."""
    return re.sub(r"\s*[—-]\s*\d{4}-Q[1-4]$", "", raw or "").strip()


def number(value, unit):
    if isinstance(value, (int, float)):
        value = format(value, ",")
    gap = "" if unit in ("%", "") else " "
    return f"{value}{gap}{unit}"


def short_location(location):
    """'slide 4, Headline, paragraph 1' -> 'Slide 4'. The full location stays under Why."""
    head = location.split(",")[0].strip()
    if "notes" in location.lower() and "notes" not in head.lower():
        head += " notes"
    return head[:1].upper() + head[1:]


def figure(change):
    series_id = change["series_id"]
    archive = archive_for(series_id)
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
      <h3>{esc(title)} · {esc(nice_period(change["period"]))}</h3>{source}</div><div class="readings">
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


def attachment(name, result_dir, workspace, label=None):
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
                <span aria-hidden="true">↓</span> {label or ("Replacement " + suffix[1:].upper())}</a>'''
    return '<span class="missing">Replacement file unavailable</span>'


def matching_change(claim, changes):
    return next((c for c in changes if c["series_id"] == claim.get("series_id") and c["period"] == claim.get("period")), None)


def cited(claim, change):
    """What the publication relied on: its cited value and release, else the revision's old side."""
    value = claim.get("value_cited")
    published = claim.get("vintage_cited")
    if value is None or not published:
        return change["old"], change["old_published"], change.get("old_release")
    observation = next((o for o in archive_for(change["series_id"]).get("observations", [])
                        if o["period"] == change["period"]), {})
    vintage = next((v for v in observation.get("vintages", []) if v["published"] == published), {})
    release = vintage.get("release") or (change.get("old_release") if published == change["old_published"] else None)
    return value, published, release


def plain_change(claim, change):
    """One plain sentence built from fields: what the publication cited, and the latest official figure."""
    unit = change.get("unit", "")
    value, published, release = cited(claim, change)
    return (f'{esc(short_location(claim["location"]))} used {esc(number(value, unit))}, published {esc(nice_date(published))}. '
            f'The latest official figure is <b>{esc(number(change["new"], unit))}</b>, published {esc(nice_date(change["new_published"]))}.')


def why(claim, verdict):
    parts = [f'<p>{esc(verdict["reason"])}</p>' if verdict.get("reason") else "",
             f'<p class="where">Location: {esc(claim["location"])}</p>']
    return f'<details class="why"><summary>How we know</summary>{"".join(parts)}</details>'


def claim_section(claim, verdict, result_dir, workspace, changes):
    status = verdict.get("status", "unchecked")
    label = VERDICTS[status]
    location = short_location(claim["location"])
    if len(changes) > 1:
        location += " · " + nice_period(claim["period"])
    title = esc(claim["location"])
    if verdict.get("already_issued") or status not in FIXABLE or claim.get("stance") == "dated" or not verdict.get("replacement_sentence"):
        if status in ("unaffected", "still_true"):
            note = "" if status == "unaffected" else " · " + label.lower()
            detail = why(claim, verdict) if status == "still_true" else ""
            return f'''<section class="claim settled"><p class="unchanged">{esc(claim["sentence"])}</p>
                <p class="where" title="{title}">{esc(location)}{esc(note)}</p>{detail}</section>'''
        flag = '<span class="review">Editor review requested</span>' if verdict.get("disagreement") else ""
        reason = f'<p class="reason">{esc(verdict["reason"])}</p>' if verdict.get("reason") else ""
        return f'''<section class="claim"><div class="claim-meta"><span class="location" title="{title}">{esc(location)}</span>
            <span class="badge {status}">{label}</span></div>{flag}<p class="unchanged">{esc(claim["sentence"])}</p>{reason}</section>'''

    proposed = verdict["replacement_sentence"]
    old, new = sentence_diff(claim["sentence"], proposed)
    file_link = attachment(verdict.get("replacement_file"), result_dir, workspace)
    decision = verdict.get("decision", "pending")
    claim_id = esc(claim["claim_id"])
    change = matching_change(claim, changes)
    plain = f'<p class="plain">{plain_change(claim, change)}</p>' if change else ""
    flag = '<span class="review">Editor review requested</span>' if verdict.get("disagreement") else ""
    return f'''<section class="claim editable" data-claim="{claim_id}" data-decision="{esc(decision)}">
      <div class="claim-meta"><span class="location" title="{title}">{esc(location)}</span>
      <span class="badge {status}">{label}</span></div>{flag}
      <div class="diff"><div><p class="label">On the slide now</p><p class="sentence">{old}</p></div>
      <div><p class="label">Corrected</p><p class="sentence proposal">{new}</p></div></div>
      {plain}<label class="edit-box" hidden>Edit the corrected sentence<textarea rows="3">{esc(proposed)}</textarea></label>
      <div class="actions" aria-label="Decision for {claim_id}"><button type="button" data-action="apply">Apply fix</button>
      <button type="button" data-action="skip">Skip</button><button type="button" data-action="edit">Edit first</button>
      <span class="file-row">{file_link}</span></div>
      <p class="state" role="status"></p>{why(claim, verdict)}</section>'''


def release_context(context):
    v = context["vintage"]
    link = external_link(v["url"], "Official release")
    note = "Cited by a publication in this run." if context["linked"] else "No publication in this run cites this figure yet."
    return f'''<article class="figure"><div class="figure-title"><h3>{esc(context["title"])} · {esc(nice_period(context["period"]))}</h3>
      {link}</div><div class="reading new"><b>{esc(v["value"])}{esc(context["unit"])}</b>
      <span class="release">{esc(release_name(v["release"]))} · {esc(nice_date(v["published"]))}</span><span>{note}</span></div></article>'''


def review_items(doc):
    return "".join(f'<p class="reason"><b>Not checked · {esc(item["location"])}</b><br>'
                   f'{esc(item["sentence"])}<br>{esc(item["reason"])}</p>' for item in doc.get("unlinked", []))


def hero(claim, verdict, change, title, wrong_count):
    """The story a visitor needs first: what the publication relied on, and the figure now."""
    unit = change.get("unit", "")
    value, published, _ = cited(claim, change)
    if verdict.get("status") == "now_wrong":
        headline = (f"One sentence in {esc(title)} is now wrong." if wrong_count == 1
                    else f"{wrong_count} sentences in your publications are now wrong.")
    else:
        headline = f"A figure in {esc(title)} has changed."
    source = external_link(change.get("url"), "Official source")
    figure_title = change.get("title") or archive_for(change["series_id"]).get("title") or ""
    return f'''<section class="hero"><h1>{headline}</h1><div class="readings">
      <div class="reading old"><b>{esc(number(value, unit))}</b><span class="release">As published</span>
        <time class="nowrap">{esc(nice_date(published))}</time></div>
      <span class="arrow" aria-label="now">→</span>
      <div class="reading new"><b>{esc(number(change["new"], unit))}</b><span class="release">Latest official figure</span>
        <time class="nowrap">{esc(nice_date(change["new_published"]))}</time></div></div>
      <p class="hero-source">{esc(figure_title)} · {esc(nice_period(change["period"]))}{" · " if source else ""}{source}</p></section>'''


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
        headline = "No new revision." if n else "No linked figures to check."
        figures = "one official figure" if n == 1 else f"{n} official figures"
        return f'''{banner}<section class="quiet"><h1><i aria-hidden="true">✓</i>{headline}</h1>
            <p>Checked {esc(figures)}. No replacement files issued.</p></section>
            <section class="coverage"><h2>Publications checked</h2><ul>{names}</ul>{pending}</section>'''
    verdicts = {v["claim_id"]: v for v in result["verdicts"]}
    changes = result["changes"]
    by_doc = defaultdict(list)
    for claim in register["claims"]:
        by_doc[claim["document_id"]].append((claim, verdicts.get(claim["claim_id"], {})))
    updated = {item["document_id"]: item["file"] for item in result.get("updated_files", [])}
    order = ("now_wrong", "unchecked", "number_only", "still_true", "unaffected")
    counts = defaultdict(int)
    fixes = 0
    docs, featured, unchecked_elsewhere = [], [], []
    for doc in register["documents"]:
        pairs = by_doc[doc["document_id"]]
        if doc.get("registered", "")[:10] > result["as_of"] and not any(v for _, v in pairs):
            continue
        # A publication's most urgent verdict decides its count and map position.
        pairs = [(c, v | {"status": "unaffected"} if v.get("already_issued") else v) for c, v in pairs]
        pairs.sort(key=lambda p: order.index(p[1].get("status", "unchecked")))
        primary = pairs[0][1].get("status", "unchecked") if pairs else "unchecked"
        counts[primary] += 1
        fixable = any(v.get("status") in FIXABLE for _, v in pairs)
        fixes += fixable
        sections = []
        for c, v in pairs:
            section = claim_section(c, v, result_dir, workspace, changes)
            status = v.get("status")
            if status in FIXABLE and v.get("replacement_sentence") and not v.get("already_issued"):
                change = matching_change(c, changes)
                if change:
                    featured.append((order.index(status), c, v, change, doc["title"]))
            if sections and status in FIXABLE:
                short = "now wrong" if status == "now_wrong" else "new figure, sentence still holds"
                summary = f'{esc(short_location(c["location"]))} · {short}'
                section = f'<details class="additional"><summary>{summary}</summary>{section}</details>'
            sections.append(section)
        if pairs:
            unchecked_elsewhere.append(review_items(doc))
            unlinked = ""
        else:
            unlinked = review_items(doc)
        settled = all(v.get("status") in ("unaffected", "still_true") for _, v in pairs) and pairs
        summary_line = '<p class="doc-note">Nothing to change.</p>' if settled else ""
        sections = "".join(sections)
        ext = Path(doc["path"]).suffix.lstrip(".").upper()
        title = esc(doc["title"])
        anchor = "publication-" + esc(doc["document_id"])
        state = "Needs a fix" if fixable else VERDICTS[primary]
        link = f'''<a href="#{anchor}" class="doc-link {primary}"><span>{title}</span>
            <small>{esc(state)}</small></a>'''
        download = attachment(updated.get(doc["document_id"]), result_dir, workspace, "Updated deck (all fixes)")
        card = f'''<article class="document" id="{anchor}" tabindex="-1"><header class="doc-head">
            <div class="filetype"><i aria-hidden="true"></i>{esc(ext)}</div><h3>{title}</h3>{summary_line}{unlinked}{download}</header>
            {sections}</article>'''
        docs.append((order.index(primary), link, card))
    n = len(docs)
    heading = f'{n} publication{"s" if n != 1 else ""} checked. '
    if not featured:
        heading += ("Nothing needs a fix." if not fixes else "One needs a fix." if fixes == 1 else f"{fixes} need a fix.")
    stats = f'<p>{counts["unchecked"]} awaiting an editor</p>' if counts["unchecked"] else ""
    featured.sort(key=lambda f: f[0])
    shown = None
    if featured:
        _, claim, verdict, shown, title = featured[0]
        wrong = sum(1 for f in featured if f[2].get("status") == "now_wrong")
        top = hero(claim, verdict, shown, title, wrong)
    elif context:
        top = f'<section class="figures">{context}</section>'
    else:
        newest = sorted(changes, key=lambda c: (c["new_published"], c["period"]), reverse=True)
        shown = newest[0] if newest else None
        top = f'<section class="figures">{figure(shown)}</section>' if shown else ""
    remaining = [c for c in sorted(changes, key=lambda c: (c["new_published"], c["period"]), reverse=True) if c is not shown]
    more = []
    if featured and context:
        more.append(f'<details class="other"><summary>Latest release</summary><div class="figures">{context}</div></details>')
    if remaining:
        n_rem = len(remaining)
        label = ("Revisions affecting earlier publications" if context else
                 "1 other figure changed" if n_rem == 1 else f"{n_rem} other figures changed")
        more.append(f'<details class="other"><summary>{label}</summary>'
                    f'{"".join(figure(c) for c in remaining)}</details>')
    unchecked = "".join(unchecked_elsewhere)
    if unchecked:
        count = unchecked.count('class="reason"')
        label = "1 sentence not checked" if count == 1 else f"{count} sentences not checked"
        more.append(f'<details class="other"><summary>{label}</summary>{unchecked}</details>')
    if fixes:
        more.append('''<details class="export"><summary>Export decisions</summary>
        <textarea class="json" aria-label="Decisions to copy" readonly rows="4"></textarea>
        <button class="copy" type="button">Copy</button><span class="copy-status" role="status"></span></details>''')
    docs.sort(key=lambda d: d[0])
    links = "".join(link for _, link, _ in docs)
    cards = "".join(card for _, _, card in docs)
    footer = f'<div class="more">{"".join(more)}</div>' if more else ""
    return f'''{top}<section class="publications">
        <div class="map-heading"><h2>{esc(heading.strip())}</h2>{stats}</div>
        <div class="map-grid"><nav aria-label="Publications">{links}</nav><div>{cards}</div></div></section>{footer}'''


def render(result_path, register_path, out_path, note=None):
    """Write one offline HTML file, including available original-format replacement files."""
    result_path, register_path, out_path = map(Path, (result_path, register_path, out_path))
    result = read_json(result_path)
    register = result["register_snapshot"] if "register_snapshot" in result else read_json(register_path)
    body = map_body(result, register, result_path.resolve().parent, register_path.resolve().parent)
    css = (HERE / "map.css").read_text(encoding="utf-8")
    js = (HERE / "decisions.js").read_text(encoding="utf-8")
    footer = f'<footer class="note">{esc(note)}</footer>' if note else ""
    page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><title>Recall Press · Corrections</title>
<meta name="description" content="Which published sentences are now wrong, the corrected sentence, and its official source."><style>{css}</style></head>
<body><main class="press" data-run="{esc(result.get("run_id", ""))}"><header class="masthead">
<div class="brand"><div class="wordmark"><span class="press-mark" aria-hidden="true"><i></i><i></i><i></i></span>Recall Press</div>
<p class="tagline">Finds the sentences in your briefings that an official revision made wrong.</p></div>
<p class="trigger">{esc(checked_line(result))}</p></header>{body}{footer}</main><script>{js}</script></body></html>'''
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(page, encoding="utf-8")
    return out_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ("result", "register", "out"):
        parser.add_argument(arg, type=Path)
    parser.add_argument("--note", help="One quiet footer line, for example where the sample figures come from.")
    args = parser.parse_args()
    render(args.result, args.register, args.out, args.note)
