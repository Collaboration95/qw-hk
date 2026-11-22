"""Build the Hashmeta port package for Revisionpedia v2.

python3 site/v2/port/build_port.py

Reads site/v2/src/*.html (via render_v2.py) and site/collections/*.json, writes only under
site/v2/port/:
  global.css         v2 CSS to APPEND to the site's global CSS (all rules scoped to .rp2-* roots)
  global.after.css   global.before.css + global.css: the full value for update_global_styles
  header.html        full rawHtml for update_header   (fonts <link>, /locale-switch.js, v2 header)
  footer.html        full rawHtml for update_footer
  home.json          layout array for the home page (id 1)
  figures/<slug>.html + .meta.json      60 figure pages
  indicators/<id>.html + .meta.json     10 indicator pages
  cover.html, cover.json                cover-my-briefing (id 3); cover.json keeps the live form block
  manifest.json      every page to update: pageId, slug, files, bytes
  preview/*.html     pages wrapped the way Hashmeta renders them (see live/*.html)
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

PORT = Path(__file__).resolve().parent
V2 = PORT.parent
REPO = V2.parent.parent
sys.path.insert(0, str(V2))
import render_v2 as R  # noqa: E402

SITE = "https://revisionpedia.geo.hashmeta.tech"
LIVE = PORT / "live"
e_ = html.escape

FONTS_HREF = R.FONTS_HREF
ROOTS = [".rp2-head", ".rp2-foot", ".rp2-hero", ".rp2-run", ".rp2-hist", ".rp2-grid", ".rp2-end",
         ".rp2-fig", ".rp2-ind", ".rp2-cover", ".rp2-pg"]
HOME = [("hero", "home-01-hero"), ("run", "home-02-run"), ("history", "home-03-history"), ("grid", "home-04-grid"),
        ("end", "home-05-end")]
ALL = ",".join(ROOTS)

# Hashmeta/Next wrappers observed on the live site (live/fig.html, live/cover.html):
#   <body> (flex column, background hsl(var(--background)))
#   <header class="site-header-wrapper">  header rawHtml  </header>
#   <main class="page-main-content "><div class="container"><div class="max-w-[48rem]"></div></div>
#      <div>  rawHtml block with containerWidth "none" (the JSON-LD)  </div>
#      <div class="w-full">  each rawHtml block with containerWidth "full"  </div> ...
#   </main><footer class="mt-auto site-footer-wrapper">  footer rawHtml  </footer>
# Stylesheets: Next CSS with a Tailwind v3 preflight (unlayered: h1-h6 font-size/weight inherit, p/figure/dl margin 0,
# ol/ul list-style none, svg display block), the Tailwind v4 browser runtime (layered utilities + preflight), then
# /global-styles.css (Hashmeta global CSS: h1-h6 font-family/size, a colour + a:hover, .btn ...).
SHIELD = f"""
/* ---- Recall Press v3 · appended. Every rule below is scoped to a .rp2-* root or to a page that contains one. ---- */
.site-header-wrapper{{position:sticky;top:0;z-index:50}}
html:has(.rp2-head),body:has(.rp2-hero,.rp2-fig,.rp2-ind,.rp2-cover,.rp2-pg){{background:#fff;color-scheme:light}}
/* undo the platform preflight + global element rules inside v2 blocks, so they render as designed */
:where({ALL}) :is(h1,h2,h3,h4,p,ol,ul,li,dl,dt,dd,figure,a,b,strong,em,i,s,small,span,time,nav,aside,button,input,select,textarea,label,summary,details,hr){{all:revert}}
:where({ALL}) svg{{display:revert;vertical-align:revert}}
:where({ALL}) a:hover{{color:inherit;text-decoration:revert}}
html:has(.rp2-hero){{scroll-padding-top:72px}}
"""

# The cover page keeps the live Hashmeta form block (block id below). These rules lay that block out next to the v2
# copy and restyle its form to the v2 look without touching its HTML. Scoped to pages that contain .rp2-cover.
FORM_BLOCK_ID = "6b014fa164950600078336ae"
COVER_FORM_CSS = """
main.page-main-content:has(.rp2-cover){display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);column-gap:72px;align-items:start;max-width:1216px;width:100%;margin:0 auto;padding:80px 32px 128px;box-sizing:border-box}
main.page-main-content:has(.rp2-cover)>:not(.w-full){display:none}
main.page-main-content:has(.rp2-cover) .rp2-cover{padding:0;background:none}
main.page-main-content:has(.rp2-cover) .rp2-cover .in{display:block}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry{background:none;padding:0;font-family:'Inter',ui-sans-serif,system-ui,sans-serif;color:#111110;letter-spacing:-.011em}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry section{max-width:none;padding:0;animation:none;opacity:1;transform:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry :is(h2,.instruction){display:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .enquiry-form{border:0;padding:32px;border-radius:12px;background:#fff;box-shadow:0 0 0 1px rgba(17,17,16,.07),0 1px 2px rgba(17,17,16,.05),0 24px 60px -24px rgba(60,35,20,.22)}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .form-grid{display:grid;gap:18px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .form-field{display:flex;flex-direction:column;gap:6px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry label{font-family:inherit;font-size:13px;font-weight:500;color:#111110}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry label .opt{font-weight:400;color:#6B6862;margin-left:4px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .input{min-height:44px;font-family:inherit;font-size:15px;background:#fff;border:0;box-shadow:inset 0 0 0 1px rgba(17,17,16,.14),0 1px 2px rgba(17,17,16,.04);border-radius:9px;padding:10px 12px;color:#111110}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry textarea.input{min-height:96px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .input::placeholder{color:#8A8780}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .input:focus{box-shadow:inset 0 0 0 1px #111110;outline:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry :is(.input,.btn):focus-visible{outline:2px solid #C93A1B;outline-offset:3px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .btn{margin-top:22px;min-height:44px;font-family:inherit;font-size:15px;font-weight:550;background:#111110;color:#fff;border:0;border-radius:10px;padding:0 18px;filter:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .btn:hover{background:#2A2926;color:#fff}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .form-note{margin:12px 0 0;font-size:13px;color:#6B6862}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .form-status{font-family:inherit;font-size:14px}
@media (max-width:900px){main.page-main-content:has(.rp2-cover){grid-template-columns:1fr;row-gap:32px;padding:48px 16px 88px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .enquiry-form{padding:20px}
main.page-main-content:has(.rp2-cover) :is(.w-full:has(.rp2-cover),.rp2-cover,.rp2-cover .in,.rp2-cover .cp){display:contents}
main.page-main-content:has(.rp2-cover) .rp2-cover h1{order:1}
main.page-main-content:has(.rp2-cover) .w-full:has(.page-block-send-enquiry){order:2}
main.page-main-content:has(.rp2-cover) .rp2-cover dl{order:3;margin:8px 0 0}
main.page-main-content:has(.rp2-cover) .rp2-cover .eg{order:4;margin:0}}
"""

# The live form block's markup, rewritten to three visible fields. Field names are the ones the block's own submit
# script already posts (it sends every FormData entry to /api/form-submissions, form "1"); the fields the pilot no
# longer asks for stay as hidden inputs with defaults, so a server that requires them still gets a value.
COVER_FORM = """<form class="site-form" data-payload-form-id="1">
  <input type="hidden" name="intent" value="coverage">
  <input type="hidden" name="name" value="Not given">
  <input type="hidden" name="organisation" value="">
  <input type="hidden" name="record" value="">
  <input type="hidden" name="consent" value="true">
  <div class="form-grid">
  <div class="form-field"><label for="fe-email">Email</label><input class="input" type="email" id="fe-email" name="email" autocomplete="email" placeholder="you@company.com" required></div>
  <div class="form-field"><label for="fe-publication">Link to your deck</label><input class="input" type="text" inputmode="url" id="fe-publication" name="publication" placeholder="https://" required></div>
  <div class="form-field"><label for="fe-message">Anything we should check? <span class="opt">Optional</span></label><textarea class="input" id="fe-message" name="message" rows="4"></textarea></div>
  </div>
  <button type="submit" class="btn btn-primary">Send a deck</button>
  <p class="form-status" role="status" aria-live="polite" hidden></p>
</form>"""


def cover_form(block: dict) -> dict:
    h = block["html"]
    a = h.index('<form class="site-form" data-payload-form-id="1">')
    b = h.index("</form>", a) + len("</form>")
    h = h[:a] + COVER_FORM + h[b:]
    subs = [
        # a report-a-correction link (?intent=correction) needs no deck: relabel the two fields
        ("if (intent === 'correction' || intent === 'coverage') f.querySelector('[name=\"intent\"]').value = intent;",
         "if (intent === 'correction' || intent === 'coverage') f.querySelector('[name=\"intent\"]').value = intent;\n"
         "    if (intent === 'correction') { var pu = f.querySelector('[name=\"publication\"]'); pu.required = false;"
         " f.querySelector('label[for=\"fe-publication\"]').innerHTML = 'Link to the figure <span class=\"opt\">Optional</span>';"
         " f.querySelector('label[for=\"fe-message\"]').textContent = 'What should we correct? Give the official link and release date.';"
         " f.querySelector('[name=\"message\"]').required = true; f.querySelector('[type=\"submit\"]').textContent = 'Send correction'; }"),
        ("new FormData(f).forEach(function (v, k) { sd.push({ field: k, value: String(v) }); });\n    sd.push({ field: 'source'",
         "new FormData(f).forEach(function (v, k) { sd.push({ field: k, value: String(v) }); });\n"
         "    sd.forEach(function (x) { if (x.field === 'message' && !x.value.trim()) x.value = 'Please check every figure in this deck.'; });\n"
         "    sd.push({ field: 'source'"),
        ("show('Thank you. Your enquiry has been received and goes to the directory editor for follow-up. Sending an enquiry does not enrol you in a paid plan.', 'success');",
         "show('Thank you. We will reply to your email within two working days.', 'success');"),
    ]
    for x, y in subs:
        assert x in h, x[:60]
        h = h.replace(x, y)
    return {**block, "html": h}



# ---------- helpers ----------

def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    return css.strip()


def minify_html(h: str) -> str:
    h = re.sub(r"<!--(?!\s*HASHMETA).*?-->", "", h, flags=re.S)
    h = re.sub(r">\s*\n\s*<", "><", h)  # line breaks between tags go; a space inside a line is kept (it is text)
    h = re.sub(r">[ \t]{2,}<", "> <", h)
    h = re.sub(r"\n\s*", "\n", h)
    return h.strip()


def minify_js(js: str) -> str:
    return "\n".join(l.strip() for l in js.splitlines() if l.strip())


def split_block(name: str):
    """src/<name>.html -> (css, html_without_style). Fonts/tokens placeholders are dropped (global)."""
    t = (V2 / "src" / f"{name}.html").read_text()
    m = re.search(r"<style>(.*?)</style>", t, re.S)
    css = m.group(1).replace("__FONTS__", "")
    css = re.sub(r"__TOKENS\((\.[\w-]+)\)__", "", css)
    body = t[:m.start()] + t[m.end():]
    body = re.sub(r"<script>(.*?)</script>", lambda s: "<script>" + minify_js(s.group(1)) + "</script>", body, flags=re.S)
    return css, body


def bytes_(s: str) -> int:
    return len(s.encode("utf-8"))


def write(rel: str, s: str):
    p = PORT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s)
    return bytes_(s)


def page_ids():
    d = json.loads((LIVE / "list_pages.json").read_text())
    return {p["slug"]: p["id"] for p in d["pages"]}


def ld_graph(path: str, name: str, desc: str, answer: str | None = None) -> str:
    """Same @graph the collection build emitted (live get_page) minus the site-wide nodes, with the new description.
    Figure pages become QAPage + Question/acceptedAnswer (the v2 template's structured data) in the same graph."""
    url = f"{SITE}{path}"
    main = {"@type": "Thing", "name": name, "url": url, "description": desc, "@id": f"{url}#main",
            "mainEntityOfPage": {"@id": url}}
    page_type = "ItemPage"
    if answer:
        main = {"@type": "Question", "name": name, "url": url, "@id": f"{url}#main", "answerCount": 1,
                "acceptedAnswer": {"@type": "Answer", "text": answer, "url": url},
                "mainEntityOfPage": {"@id": url}}
        page_type = "QAPage"
    g = [main,
         {"@type": page_type, "@id": url, "url": url, "name": name, "description": desc, "inLanguage": "en",
          "isPartOf": {"@id": f"{SITE}/#website"}, "breadcrumb": {"@id": f"{url}#breadcrumb"},
          "mainEntity": {"@id": f"{url}#main"}},
         {"@type": "BreadcrumbList", "@id": f"{url}#breadcrumb", "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": "Revisionpedia", "item": f"{SITE}/"},
             {"@type": "ListItem", "position": 2, "name": name, "item": url}]}]
    # WebSite + Organization nodes dropped: the platform already emits them site-wide (live/home.html, #website and
    # #organization ids), and isPartOf references #website by @id.
    j = json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False, separators=(",", ":"))
    return '<script type="application/ld+json">' + j.replace("</", "<\\/") + "</script>"


def round_svg(h: str) -> str:
    """Round the step charts' 1-decimal coordinates to whole px (sub-pixel loss only), about 10% fewer bytes."""
    def svg(m):
        return re.sub(r"(?<![\d.])(\d+)\.(\d)(?!\d|%)", lambda n: str(round(float(n.group(0)))), m.group(0))
    def attrs(m):  # only inside geometry attributes, never in text/labels
        return re.sub(r'\b(d|cx|cy|x|y|x1|x2|y1|y2)="([^"]*)"', lambda a: f'{a.group(1)}="{svg(a)[len(a.group(1))+2:-1]}"', m.group(0))
    h = re.sub(r"<svg[^>]*>.*?</svg>", attrs, h, flags=re.S)
    # the narrow chart only shows at <=720px (touch): its hover tooltips duplicate the wide chart's, so drop them
    return re.sub(r'<svg class="rp2-step narrow".*?</svg>', lambda m: re.sub(r"<title>.*?</title>", "", m.group(0)),
                  h, flags=re.S)


# release labels from the data that use words the copy rules ban on visible text
RELEASE_WORDING = {"data.gov.sg snapshot, first observed on this date": "data.gov.sg table update"}


def clean_copy(h: str) -> str:
    for a, b in RELEASE_WORDING.items():
        h = h.replace(a, b)
    return h


def fill(tpl: str, fields: dict) -> str:
    return re.sub(r"\{\{(\w+)\}\}", lambda m: fields.get(m.group(1), m.group(0)), tpl)


# ---------- build ----------

def build():
    entries = R.load()
    indicators = json.loads((REPO / "site" / "collections" / "indicators.json").read_text())
    ids = page_ids()
    css_parts, bodies = [], {}
    for name in ["header", "footer", *(src for _, src in HOME), "figure-template", "indicator-template",
                 "cover-my-briefing"]:
        css, body = split_block(name)
        css_parts.append(f"/* {name} */\n{css}")
        bodies[name] = body
    subs = R.home_subs(entries)
    for k in bodies:
        for a, b in subs.items():
            bodies[k] = bodies[k].replace(a, b)

    # --- global.css ---
    tokens = R.tokens(f":is({ALL})")
    css = "\n".join(css_parts)
    css = re.sub(r"\.btn\b", ".cta", css)  # header button: .btn collides with Hashmeta's global .btn
    glob = SHIELD + minify_css(tokens) + "\n" + minify_css(css) + "\n/* cover page: live form block */\n" + \
        minify_css(COVER_FORM_CSS) + "\n"
    out = {}
    out["global.css"] = write("global.css", glob)
    before = (PORT / "global.before.css").read_text()
    write("global.after.css", before.rstrip() + "\n" + glob)

    # --- header / footer ---
    hb = bodies["header"]
    hb = re.sub(r"<header class=\"rp2-head\">", '<div class="rp2-head">', hb).replace("</header>", "</div>")
    hb = hb.replace('class="btn"', 'class="cta"')
    header = ('<script src="/locale-switch.js"></script>'
              '<link rel="preconnect" href="https://fonts.googleapis.com">'
              '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
              f'<link rel="stylesheet" href="{FONTS_HREF}">' + minify_html(hb))
    out["header.html"] = write("header.html", header)
    fb = bodies["footer"].replace('<footer class="rp2-foot">', '<div class="rp2-foot">').replace("</footer>", "</div>")
    fb = fb.replace('<a href="/about/">About</a>',
                    '<a href="/about/">About</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a>')
    out["footer.html"] = write("footer.html", minify_html(fb))

    # --- home ---
    bodies["home-04-grid"] = bodies["home-04-grid"].replace("document.currentScript.previousElementSibling",
                                                            "document.getElementById('figures')")
    home_blocks = []
    for name, body in [(n, bodies[src]) for n, src in HOME]:
        home_blocks.append({"blockType": "rawHtml", "blockName": name, "html": minify_html(body),
                            "containerWidth": "full"})
    home_json = json.dumps(home_blocks, ensure_ascii=False, indent=1)
    write("home.json", home_json)
    manifest = [{"pageId": ids["home"], "slug": "home", "file": "home.json", "kind": "home",
                 "bytes": sum(bytes_(b["html"]) for b in home_blocks)}]

    # --- figure pages ---
    tpl = minify_html(bodies["figure-template"])
    tpl = re.sub(r'<script type="application/ld\+json">.*?</script>', "", tpl, flags=re.S)  # JSON-LD: own block
    fig_sizes = []
    for e in entries:
        ans = R.plain_answer(e)
        body = fill(tpl, {"title": e_(e["title"]), "body_html": clean_copy(round_svg(R.render_figure_body(e)))})
        rel = f"figures/{e['slug']}.html"
        n = write(rel, body)
        ld = ld_graph(f"/revisions/{e['slug']}", e["title"], ans, answer=ans)
        meta = {"pageId": ids[f"revisions/{e['slug']}"], "slug": f"revisions/{e['slug']}",
                "meta": {"title": e["title"], "description": ans}, "jsonld_block_html": ld}
        write(f"figures/{e['slug']}.meta.json", json.dumps(meta, ensure_ascii=False, indent=1))
        fig_sizes.append((n, bytes_(ld)))
        manifest.append({"pageId": meta["pageId"], "slug": meta["slug"], "file": rel,
                         "meta": f"figures/{e['slug']}.meta.json", "kind": "figure", "bytes": n,
                         "jsonld_bytes": bytes_(ld)})

    # --- indicator pages (same code path as render_v2.build's Manufacturing prototype) ---
    itpl = minify_html(bodies["indicator-template"])
    ind_sizes = []
    by_slug = {i["slug"]: i for i in indicators}
    for sid in R.ORDER:
        head = R.indicator_headline(sid, entries)
        body = R.indicator_body(sid, entries, itpl, post=lambda s: clean_copy(round_svg(s)))
        rel = f"indicators/{sid}.html"
        n = write(rel, body)
        ind = by_slug[sid]
        desc = f"{head} {ind['description']}"
        ld = ld_graph(f"/indicators/{sid}", ind["title"], desc)
        meta = {"pageId": ids[f"indicators/{sid}"], "slug": f"indicators/{sid}",
                "meta": {"title": ind["title"], "description": desc}, "jsonld_block_html": ld}
        write(f"indicators/{sid}.meta.json", json.dumps(meta, ensure_ascii=False, indent=1))
        ind_sizes.append((n, bytes_(ld)))
        manifest.append({"pageId": meta["pageId"], "slug": meta["slug"], "file": rel,
                         "meta": f"indicators/{sid}.meta.json", "kind": "indicator", "bytes": n,
                         "jsonld_bytes": bytes_(ld)})

    # --- cover ---
    cb = bodies["cover-my-briefing"]
    cb = re.sub(r"<!--.*?-->\s*<form.*?</form>",
                f"<!-- HASHMETA FORM BLOCK STAYS HERE: keep layout block id {FORM_BLOCK_ID} (send-enquiry) unchanged, "
                f"as the next block after this one. global.css places it in the right-hand column. -->",
                cb, flags=re.S)
    # the grid lives on <main> (global.css), so the copy column is the whole block
    cover_html = minify_html(cb)
    write("cover.html", cover_html)
    live3 = json.loads((LIVE / "get_page_3.json").read_text())
    form_block = cover_form(next(b for b in live3["layout"] if b["id"] == FORM_BLOCK_ID))
    cover_layout = [{"blockType": "rawHtml", "blockName": "rp2-cover",
                     "html": re.sub(r"<!-- HASHMETA.*?-->", "", cover_html), "containerWidth": "full"},
                    form_block]
    write("cover.json", json.dumps(cover_layout, ensure_ascii=False, indent=1))
    manifest.append({"pageId": 3, "slug": "cover-my-briefing", "file": "cover.json", "kind": "cover",
                     "bytes": bytes_(cover_layout[0]["html"]), "kept_block_ids": [FORM_BLOCK_ID],
                     "dropped_block_ids": [b["id"] for b in live3["layout"] if b["id"] != FORM_BLOCK_ID],
                     "meta": {"title": "Cover my briefing",
                              "description": "Send one deck and Recall Press watches every source it cites. "
                                             "Pilot: no fee, results within two working days."}})

    for k, f in [("header", "header.html"), ("footer", "footer.html"), ("global_css_appended", "global.css")]:
        manifest.append({"kind": k, "file": f, "bytes": bytes_((PORT / f).read_text())})
    recipe = ("figure/indicator page layout = [{blockType:'rawHtml', html: meta.jsonld_block_html, containerWidth:'none'}, "
              "{blockType:'rawHtml', html: <file>, containerWidth:'full'}]; meta = meta.meta (title, description). "
              "home/cover: layout = the JSON file as is. global: update_global_styles(styles = global.after.css).")
    (PORT / "manifest.json").write_text(json.dumps({"site": SITE, "recipe": recipe, "pages": manifest},
                                                   ensure_ascii=False, indent=1))

    # --- previews ---
    build_previews(header, minify_html(fb), home_blocks, cover_layout)

    avg = lambda xs: sum(xs) / len(xs)
    print(f"global.css appended: {out['global.css']:,} B   header {out['header.html']:,} B   footer {out['footer.html']:,} B")
    print(f"home blocks: " + ", ".join(f"{b['blockName']} {bytes_(b['html']):,}" for b in home_blocks))
    print(f"figures: body avg {avg([a for a, _ in fig_sizes]):,.0f} B (max {max(a for a, _ in fig_sizes):,}), "
          f"json-ld avg {avg([b for _, b in fig_sizes]):,.0f} B, total/page avg {avg([a + b for a, b in fig_sizes]):,.0f} B")
    print(f"indicators: body avg {avg([a for a, _ in ind_sizes]):,.0f} B (max {max(a for a, _ in ind_sizes):,}), "
          f"json-ld avg {avg([b for _, b in ind_sizes]):,.0f} B")
    print(f"cover block: {bytes_(cover_layout[0]['html']):,} B (+ kept form block {bytes_(form_block['html']):,} B)")


SHELL = """<!doctype html><html class="__variable_fb8f2c __variable_f910ec" lang="en" dir="ltr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}</title>
<link rel="stylesheet" href="../live/next-c688e8ff6f4c4e28.css"><link rel="stylesheet" href="../live/next-34daaa51324022bb.css">
<link rel="stylesheet" href="../live/next-d61da687db648e05.css"><link rel="stylesheet" href="../global.after.css">
<style>html{{opacity:1}}/* the live app reveals <html> from JS after hydration */</style>
</head><body><div hidden=""></div><header class="site-header-wrapper">{header}</header><main class="page-main-content "><div class="container"><div class="max-w-[48rem]"></div></div>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>{blocks}</main><footer class="mt-auto site-footer-wrapper">{footer}</footer></body></html>"""


def build_previews(header, footer, home_blocks, cover_layout):
    header = header.replace('src="/locale-switch.js"', 'src="../live/locale-switch.js"')

    def page(title, blocks):
        inner = "".join(f'<div>{h}</div>' if w == "none" else f'<div class="w-full">{h}</div>' for h, w in blocks)
        return SHELL.format(title=e_(title), header=header, footer=footer, blocks=inner)

    write("preview/index.html", page("Home", [(b["html"], "full") for b in home_blocks]))
    slug = "sg-gdp-manufacturing-yoy-2025-q3"
    m = json.loads((PORT / f"figures/{slug}.meta.json").read_text())
    write("preview/figure.html", page(m["meta"]["title"], [(m["jsonld_block_html"], "none"),
                                                           ((PORT / f"figures/{slug}.html").read_text(), "full")]))
    m = json.loads((PORT / "indicators/sg-gdp-manufacturing-yoy.meta.json").read_text())
    write("preview/indicator.html", page(m["meta"]["title"], [(m["jsonld_block_html"], "none"),
                                                               ((PORT / "indicators/sg-gdp-manufacturing-yoy.html").read_text(), "full")]))
    m = json.loads((PORT / "indicators/sg-employment-change.meta.json").read_text())
    write("preview/indicator-jobs.html", page(m["meta"]["title"], [(m["jsonld_block_html"], "none"),
                                                                    ((PORT / "indicators/sg-employment-change.html").read_text(), "full")]))
    write("preview/cover.html", page("Cover my briefing", [(b["html"], "full") for b in cover_layout]))
    write("preview/terms.html", page("Terms", [((LIVE / "terms_block.html").read_text()
                                                 if (LIVE / "terms_block.html").exists() else
                                                 "<section><div class=\"container\"><h1>Terms and Conditions</h1>"
                                                 "<p>Hashmeta page untouched by v2.</p></div></section>", "full")]))


if __name__ == "__main__":
    build()
