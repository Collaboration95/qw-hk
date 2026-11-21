"""Editorial selections, page copy, structured data and local HTML presentation."""
import json
import os
import re
from html import escape, unescape
from urllib.parse import urlsplit

NAME = "Revisionpedia"
INTRO = "Look up a Singapore economic figure to see what was first reported, what it says now and which official releases changed it."
FEATURE = "sg-gdp-manufacturing-yoy-2025-q3"
# Editorial selections identify questions only. Every answer is read from its record.
HIGHLIGHTS = [
    "sg-gdp-manufacturing-qoq-2025-q1", FEATURE, "sg-employment-change-2026-q1",
    "sg-gdp-overall-qoq-2026-q1", "sg-gdp-overall-yoy-2026-q2", "sg-gdp-manufacturing-yoy-2025-q2",
    "sg-gdp-construction-qoq-2025-q3", "sg-gdp-construction-yoy-2026-q1",
    "sg-gdp-overall-yoy-2025-q4", "sg-unemployment-2026-q2",
]
PROMPTS = [*HIGHLIGHTS[:8], "sg-unemployment-2026-q2", "sg-employment-change-2026-q2",
           "sg-gdp-services-qoq-2025-q3", "sg-gdp-services-yoy-2026-q2"]
FORM_COPY = """Ask Recall Press to cover a figure in your briefing. Register the slide once. When a later official figure changes its meaning or number, the service prepares a corrected copy with the source for your review.

**Pilot for one briefing.** For an editor of a recurring Singapore briefing that quotes quarterly GDP or sector growth. Send one slide, Word note or Markdown page you have already published and expect to reuse. Within two working days you get the sentences we linked, each with its series, quarter and dated source. After the next official release you get either a note that nothing changed or a corrected editable copy with the reason, for you to apply, skip or edit. No fee is set for the pilot; any fee for later editions is agreed with you first.

## Send an enquiry

Choose “Cover my briefing” or “Report a correction”. Give the indicator or record, a reply address and a short note. For a correction, include the official source and the date that supports your change. You can describe a slide without uploading the deck.

<!-- enquiry-form -->

Sending an enquiry does not enrol you in a paid plan."""
METHOD = """A correction starts with the same indicator, quarter and comparison basis. Real GDP growth from the previous quarter is seasonally adjusted. Growth from a year earlier is a different series.

## Read the release history

The first figure is the earliest one in this archive. GDP histories begin with the advance estimate. Labour histories can begin later. “Current” is the latest archived official value as of the record’s check date. A later release can repeat an earlier value. The last change date is the last time the value actually moved.

For a data.gov.sg snapshot, “first observed” dates the archive’s reading of the changed table. The agency may have published the change earlier. An archived release supplies its own publication date.

## Count a revision

A comparable quarter has at least two dated readings. “Ever revised” counts any difference between consecutive readings, even one later reversed. The indicator frequency, average and maximum compare first with current. The average uses the absolute difference and includes quarters with zero change.

For rates, subtract the old rate from the new rate to get percentage points. Employment change is measured in people. A sign change moves between negative, zero and positive. A cutoff crossing changes whether a number is strictly below the indicator’s briefing cutoff. Equality counts on the upper side. These cutoffs are editorial examples. Each step in a record shows its crossings, and the first-to-current summary compares only the endpoints.

## Correct the wording

A change from contraction to growth can reverse a headline. If growth is still positive, a sentence may need just a new number. If the slide explicitly says what the agency reported on a particular date, keep the dated statement and add the later reading separately.

The service keeps the original document. The editor can apply the proposed change, edit it or skip it. [Ask about coverage](/cover-my-briefing/) or [report a correction](/cover-my-briefing/?intent=correction)."""


def save(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def dump(path, obj):
    save(path, json.dumps(obj, ensure_ascii=False, indent=2))


def fmt(r, n):
    return f"{n:,.0f} people" if r["unit"] == "persons" else f"{n:.1f}%"


def period(r):
    y, q = r["period"].split("-")
    return f"{q} {y}"


def md_link(label, url):
    return f"[{label}]({url})"


def values(r):
    return f"{fmt(r, r['first_value'])} → {fmt(r, r['current_value'])}"


def example_summary(r):
    return md_link(r["indicator"] + ", " + period(r), r["path"]) + " · " + values(r)


def evidence(r):
    return (md_link("First archived figure, " + r["first_date"], r["first_url"]) + " · " +
            md_link("Latest evidence, " + r["current_date"] + " (" + r["current_date_kind"] + ")", r["current_url"]))


def latest_step(r):
    vs = r["vintages"]
    i = max(i for i,v in enumerate(vs) if v["change_from_previous"])
    v = vs[i]
    return (md_link(r["indicator"] + ", " + period(r), r["path"]) + " · " +
            fmt(r, vs[i-1]["value"]) + " → " + fmt(r, v["value"]) + " · " +
            md_link(v["date_kind"] + " " + v["published"], v["url"]))


def schema_template(group):
    fields = {"@context": "https://schema.org", "@type": "FAQPage" if group == "revisions" else "Dataset",
              "url": "{{path}}", "name": "{{title}}", "inLanguage": "en-SG"}
    if group == "revisions":
        return fields | {"mainEntity": [{"@type":"Question", "name":"{{title}}",
                         "acceptedAnswer":{"@type":"Answer","text":"{{answer}}"}}],
                         "citation": [{"@type":"CreativeWork","url":"{{first_url}}"},
                                      {"@type":"CreativeWork","url":"{{current_url}}"}]}
    return fields | {"description":"{{description}} {{frequency_summary}}", "creditText":"{{attribution}}",
                     "variableMeasured":"{{title}}", "spatialCoverage":{"@type":"Place","name":"Singapore"},
                     "isBasedOn":{"@type":"Dataset","name":"{{dataset}}","url":"{{dataset_url}}",
                                  "license":"{{licence_url}}","creator":{"@type":"Organization","name":"{{agency}}"}}}


def fill_schema(template, row):
    if isinstance(template, dict):
        return {k: fill_schema(v, row) for k,v in template.items()}
    if isinstance(template, list):
        return [fill_schema(v, row) for v in template]
    return re.sub(r"{{(\w+)}}", lambda m: str(row[m[1]]), template)


def write_schema(site, revisions, indicators):
    for group, rows, key in [("revisions", revisions, FEATURE), ("indicators", indicators, FEATURE.rsplit("-",2)[0])]:
        template = schema_template(group)
        dump(site/"schema"/f"{group}-template.json", template)
        example = next(r for r in rows if r["slug"] == key)
        dump(site/"schema"/f"{group}-example.json", fill_schema(template, example))
    home = [("Home", "/")]
    for name, template, example in [
        ("collection-list", collection_schema("{{title}}", "{{path}}", [("{{item_title}}", "{{item_path}}")]),
         collection_schema("Indicators", "/indicators/", [(i["title"],i["path"]) for i in indicators])),
        ("breadcrumbs", breadcrumb_schema([("{{crumb_title}}", "{{crumb_path}}")]),
         breadcrumb_schema(home + [("Indicators", "/indicators/"), (indicators[0]["title"],indicators[0]["path"])]))
    ]:
        dump(site/"schema"/f"{name}-template.json", template)
        dump(site/"schema"/f"{name}-example.json", example)


def breadcrumb_schema(crumbs):
    return {"@context":"https://schema.org", "@type":"BreadcrumbList",
            "itemListElement":[{"@type":"ListItem","position":i,"name":name,"item":path}
                               for i,(name,path) in enumerate(crumbs, 1)]}


def collection_schema(title, path, entries):
    return {"@context":"https://schema.org", "@type":"CollectionPage","name":title,"url":path,
            "mainEntity":{"@type":"ItemList","itemListElement":[
                {"@type":"ListItem","position":i,"name":name,"url":url}
                for i,(name,url) in enumerate(entries, 1)]}}


def markdown_html(text):
    """Render the headings, paragraphs, bullet lists and named slots used by the page files."""
    parts = []
    def inline(line):
        return re.sub(r"\[([^\]]+)\]\(([^\s)]+)\)", r'<a href="\2">\1</a>', escape(line))
    for block in text.strip().split("\n\n"):
        if block.startswith("<!--"):
            parts.append(block)
        elif block.startswith("## "):
            parts.append("<h2>" + inline(block[3:]) + "</h2>")
        elif block.startswith("- "):
            parts.append("<ul>" + "".join("<li>" + inline(l[2:]) + "</li>" for l in block.splitlines()) + "</ul>")
        else:
            parts.append("<p>" + inline(block) + "</p>")
    return "\n".join(parts)


def cms_link(text, path):
    return f'<a href="{escape(path)}">{escape(text)}</a>'


def listing(rows):
    return "<ul>" + "".join("<li>"+cms_link(r["title"], r["path"])+"</li>" for r in rows) + "</ul>"


def localize(body, path):
    directory = path.strip("/")
    def replace(m):
        u = urlsplit(unescape(m[1]))
        local = os.path.relpath(u.path.strip("/") + "/index.html" if u.path.strip("/") else "index.html",
                                directory or ".")
        suffix = ("?" + u.query if u.query else "") + ("#" + u.fragment if u.fragment else "")
        return f'href="{escape(local + suffix)}"'
    return re.sub(r'href="(/[^"]*)"', replace, body)


def render(site, route, title, body, css, *, parent=None, schema=None):
    links = (cms_link("Indicators", "/indicators/") + cms_link("Revisions", "/revisions/") +
             cms_link("Cover my briefing", "/cover-my-briefing/"))
    crumb = cms_link("Home", "/")
    if parent:
        crumb += " / " + cms_link(*parent)
    crumbs = "" if route == "/" else f'<p class="crumb">{crumb} / {escape(title)}</p>'
    body = localize(f'<header><div class="wrap"><div><a class="brand" href="/">{NAME}</a>'
                    '<small class="descriptor">Singapore economic revisions</small></div>'
                    f'<nav aria-label="Main">{links}</nav></div></header><main><div class="wrap">{crumbs}{body}'
                    '</div></main><footer><div class="wrap"><span>Local preview · Recall Press</span>'
                    '<nav aria-label="Footer"><a href="/how-corrections-work/">How corrections work</a>'
                    '<a href="/sources-and-licences/">Sources and licences</a><a href="/about/">About</a>'
                    '<a href="/cover-my-briefing/?intent=correction">Report a correction</a></nav></div></footer>', route)
    schemas = [schema] if schema else []
    if route != "/":
        trail = [("Home","/")] + ([parent] if parent else []) + [(title,route)]
        schemas.append(breadcrumb_schema(trail))
    ld = "".join('<script type="application/ld+json">'+json.dumps(item,ensure_ascii=False).replace("<","\\u003c")+"</script>" for item in schemas)
    save(site / "preview" / route.strip("/") / "index.html",
         f'<!doctype html><html lang="en-SG"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         f'<meta name="referrer" content="no-referrer"><title>{escape(title)} | {NAME}</title>'
         f'<style>{css}</style>{ld}</head><body>{body}</body></html>')


def form_preview():
    return """<p class="meta">Offline form preview. Submissions open on the published site.</p>
<fieldset disabled><legend>Enquiry</legend><label for="intent">Reason</label><select id="intent">
<option value="coverage">Cover my briefing</option><option value="correction">Report a correction</option></select>
<label for="record">Indicator or record</label><input id="record">
<label for="reply">Reply email</label><input id="reply" type="email">
<label for="note">What should the editor check?</label><textarea id="note" rows="3"></textarea>
<label><input type="checkbox"> You may contact me about this enquiry.</label><button disabled>Send enquiry</button></fieldset>
<script>const p=new URLSearchParams(location.search);document.getElementById('record').value=p.get('record')||'';
if(p.get('intent')==='correction')document.getElementById('intent').value='correction';</script>"""


def stats_line(revs):
    comparable = len(revs)
    net = sum(r["net_change"] != 0 for r in revs)
    changed = sum(r["ever_revised"] for r in revs)
    crosses = sum(r["crossed_sign"] or r["crossed_threshold"] for r in revs)
    ever = sum(r["ever_crossed_sign"] or r["ever_crossed_threshold"] for r in revs)
    return (f"{comparable} series–quarter records have multiple readings. {changed} changed at least once. "
            f"{net} still differ from their first figure. {crosses} crossed zero or a briefing cutoff from first to current. "
            f"Counting intermediate changes as well brings the crossing count to {ever}.")


def make_home(revs, inds, feature, checked):
    latest = sorted((r for r in revs if r["last_change_date"]),
                    key=lambda r: (r["last_change_date"], r["period"]), reverse=True)[:5]
    biggest = []
    for unit in ("%", "persons"):
        group = sorted((r for r in revs if r["unit"] == unit), key=lambda r: -r["absolute_change"])
        biggest.extend(group[:3])
    indicator_list = "\n".join("- " + md_link(i["title"],i["path"]) + f" · {i['comparable_periods']} quarters" for i in inds)
    lead = (f"{INTRO}\n\n{stats_line(revs)} Browse {len(inds)} indicators. Archive checked {checked}.")
    return (lead + "\n\n## Did the headline change?\n\n" + feature["answer"] + " " +
            md_link("Read the dated releases", feature["path"]) + ".\n\n## Search by indicator\n\n<!-- indicator-search -->\n\n" +
            indicator_list + "\n\n## Latest revisions\n\nOrdered by the date the value last changed in the archive. "
            "A table snapshot uses the date the change was first observed.\n\n" +
            "\n".join("- " + latest_step(r) for r in latest) +
            "\n\n## Biggest revisions\n\nLargest absolute changes from first to current, ranked separately for rates and employment counts.\n\n" +
            "\n".join("- " + example_summary(r) for r in biggest) + "\n\n" +
            md_link("Browse all revision records", "/revisions/") + " · " + md_link("How corrections work","/how-corrections-work/") + ".")


def preview_home(copy, inds, revs, feature, checked):
    kpis = [(len(inds), "indicators"), (sum(r["ever_revised"] for r in revs), "quarters revised"),
            (sum(r["crossed_sign"] or r["crossed_threshold"] for r in revs), "first-to-current crossings")]
    hero = (f'<section class="hero"><div><p class="meta">Singapore · Checked {checked}</p><h1>Which figures changed?</h1>'
            f'<p class="lead">{INTRO}</p></div><aside class="feature"><h2>{escape(feature["indicator"])}, {period(feature)}</h2>'
            f'<strong>{values(feature)}</strong><p>First reported → current figure</p>'
            + cms_link("Read the release history",feature["path"]) + '</aside></section><div class="stats">' +
            "".join(f"<div><b>{n}</b>{label}</div>" for n,label in kpis) + "</div>")
    lower = markdown_html("## Search by indicator" + copy.split("## Search by indicator",1)[1])
    lower = lower.replace("<!-- indicator-search -->", '<label for="q">Find an indicator</label>'
                          '<input id="q" class="searchbox" type="search" placeholder="Try manufacturing or employment">'
                          '<p id="matches" class="meta" role="status"></p>').replace("<ul>", "<ul data-indicators>", 1)
    script = r"""<script>const q=document.querySelector('#q'),statusLine=document.querySelector('#matches');
const entries=[...document.querySelectorAll('[data-indicators] li')];
q.addEventListener('input',()=>{const terms=q.value.trim().toLowerCase().split(/\s+/);
for(const item of entries)item.hidden=!terms.every(term=>item.textContent.toLowerCase().includes(term));
const n=entries.filter(item=>!item.hidden).length;statusLine.textContent=q.value?n+' matching indicator'+(n===1?'':'s'):'';});</script>"""
    return hero + f"<p>{stats_line(revs)}</p>" + lower + script


def source_copy(inds):
    tables = {i["dataset_url"]: i for i in inds}
    return ("The figures come from Singapore government tables and dated official releases. Revisionpedia is an independent directory "
            "and is not affiliated with any government agency.\n\n## Current tables\n\n" +
            "\n".join("- " + md_link(i["dataset"],url) + " · " + i["agency"] + " · accessed " + i["accessed"]
                      for url,i in tables.items()) + "\n\nContains information from data.gov.sg made available under the " +
            md_link(inds[0]["licence"],inds[0]["licence_url"]) + ".\n\n## Dated evidence\n\n"
            "Each release in a record links to the original table or document, identifies the row or chart, credits the agency "
            "and gives the access date and terms for that source. The open data licence applies to the data.gov.sg tables. "
            "Agency releases have their own terms. Employment counts in thousands are converted to people for comparison.\n\n"
            "A release can revise earlier quarters even when its title names a newer quarter. "
            "The archive records the period of the figure inside the release. "
            "[Report a correction](/cover-my-briefing/?intent=correction) with the record and its source.")


def editorial_files(site, by_slug, revs, checked):
    sections = ["# Ten revisions that changed a briefing", f"Archive checked {checked}. {stats_line(revs)}",
                "Editor’s selection across growth, jobs and unemployment. The order gives priority to reversals and cutoffs "
                "that change a headline, then substantial moves and a revision that later reversed. People and percentage points use separate units."]
    for i,key in enumerate(HIGHLIGHTS,1):
        r = by_slug[key]
        sections += [f"## {i}. {r['indicator']}, {period(r)}", values(r) + ". " + r["slide_impact"], evidence(r) + " · " +
                     md_link("Full record", "preview" + r["path"] + "index.html")]
        if r["ever_revised"] and not r["net_change"]:
            v = next(v for v in r["vintages"] if v["value"] != r["first_value"])
            sections.append(f"The intervening figure was {fmt(r,v['value'])}. " + md_link(v["release"],v["url"]))
    save(site/"revision-highlights.md", "\n\n".join(sections))
    notes = ["# AI Visibility questions", f"Answer key checked {checked}. Enter only the question heading in the tracker. "
             "The two answers below are official figures from the local archive. Record engine, run date, verbatim answer and citations separately. "
             "Classify the figure as current, first, intermediate, other or no numerical answer. A citation and a correct answer are separate outcomes."]
    for i,key in enumerate(PROMPTS,1):
        r = by_slug[key]
        notes += [f"## {i}. {r['title']}",
                  f"- First archived answer — {fmt(r,r['first_value'])}. " + md_link(r["first_date"],r["first_url"]) +
                  f"\n- Current official answer — {fmt(r,r['current_value'])}. " + md_link(r["current_date"]+" ("+r["current_date_kind"]+")",r["current_url"])]
        steps = [v for v in r["vintages"][1:-1] if v["change_from_previous"] and v["value"] not in (r["first_value"],r["current_value"])]
        if steps:
            notes[-1] += "\n- Intermediate readings — " + ", ".join(md_link(fmt(r,v["value"])+" on "+v["published"],v["url"]) for v in steps) + "."
    save(site/"visibility-prompts.md","\n\n".join(notes))


def build_pages(site, revs, inds, checked):
    by_slug = {r["slug"]:r for r in revs}
    featured = by_slug[FEATURE]
    css = (site/"templates"/"preview.css").read_text(encoding="utf-8")
    pages = {
        "home": ("Which Singapore economic figures changed?", make_home(revs, inds, featured, checked)),
        "how-corrections-work": ("How corrections work", METHOD),
        "cover-my-briefing": ("Cover my briefing", FORM_COPY),
        "sources-and-licences": ("Sources and licences", source_copy(inds)),
        "about": ("About Revisionpedia", "Recall Press is a one-person company. Its editor maintains Revisionpedia for people "
                  "who need to know whether a slide about Singapore’s economy still holds up.\n\n"
                  "The figures and their dated sources are public. Example slides and briefing sentences are labelled as samples. "
                  "They illustrate how a revision affects wording.\n\n"
                  "[How corrections work](/how-corrections-work/) · [Cover my briefing](/cover-my-briefing/) · "
                  "[Report a correction](/cover-my-briefing/?intent=correction).")
    }
    for slug,(title,copy) in pages.items():
        save(site/"pages"/f"{slug}.md", f"# {title}\n\n{copy}")
        if slug == "home":
            render(site,"/",title,preview_home(copy,inds,revs,featured,checked),css)
        else:
            render(site,f"/{slug}/",title,f"<h1>{title}</h1>"+markdown_html(copy).replace("<!-- enquiry-form -->",form_preview()),css)
    for group, rows in [("revisions",revs),("indicators",inds)]:
        for r in rows:
            summary = r.get("answer",r.get("description"))
            snap = ""
            if group == "revisions":
                snap = '<div class="snapshot">' + "".join(
                    f"<div><small>{label}</small><span>{fmt(r, r[key])}</span><small>{r[date]} · {kind}</small></div>"
                    for label,key,date,kind in [("First archived","first_value","first_date",r["vintages"][0]["date_kind"]),
                                               ("Current","current_value","current_date",r["current_date_kind"])]) + "</div>"
            body = (f"<article><h1>{escape(r['title'])}</h1><p class='lead'>{escape(summary)}</p>{snap}"
                    f"{r['body_html']}</article>")
            render(site,r["path"],r["title"],body,css,parent=(group.title(),f"/{group}/"),schema=fill_schema(schema_template(group),r))
        links = []
        for name in sorted({r["category"] for r in rows}):
            subset = [r for r in rows if r["category"] == name]
            route = f"/{group}/category/{name.lower().replace(' ','-')}/"
            links.append(cms_link(f"{name} ({len(subset)})",route))
            render(site,route,name,f"<h1>{name}</h1>"+listing(subset),css,parent=(group.title(),f"/{group}/"),
                   schema=collection_schema(name,route,[(r["title"],r["path"]) for r in subset]))
        route = f"/{group}/"
        render(site,route,group.title(),f"<h1>{group.title()}</h1><p>"+ " · ".join(links)+"</p>"+listing(rows),css,
               schema=collection_schema(group.title(),route,[(r["title"],r["path"]) for r in rows]))
    editorial_files(site,by_slug,revs,checked)
