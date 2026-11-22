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

FONTS_HREF = ("https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;"
              "1,6..72,400..600&family=Caveat:wght@500;600&display=swap")
ROOTS = [".rp2-head", ".rp2-foot", ".rp2-hero", ".rp2-grid", ".rp2-check", ".rp2-recall",
         ".rp2-fig", ".rp2-ind", ".rp2-cover"]
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
/* ---- Revisionpedia v2 · appended. Every rule below is scoped to a .rp2-* root or to a page that contains one. ---- */
.site-header-wrapper{{position:sticky;top:0;z-index:50}}
body:has(.rp2-hero,.rp2-fig,.rp2-ind,.rp2-cover){{background:#F4EFE6}}
/* undo the platform preflight + global element rules inside v2 blocks, so they render as designed */
:where({ALL}) :is(h1,h2,h3,h4,p,ol,ul,li,dl,dt,dd,figure,a,b,strong,em,i,s,small,button,input,select,textarea,label,summary,details,hr){{all:revert}}
:where({ALL}) svg{{display:revert;vertical-align:revert}}
:where({ALL}) a:hover{{color:inherit;text-decoration:revert}}
html:has(.rp2-hero){{scroll-padding-top:72px}}
"""

# The cover page keeps the live Hashmeta form block (block id below). These rules lay that block out next to the v2
# copy and restyle its form to the v2 look without touching its HTML. Scoped to pages that contain .rp2-cover.
FORM_BLOCK_ID = "6b014fa164950600078336ae"
COVER_FORM_CSS = """
main.page-main-content:has(.rp2-cover){display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);column-gap:72px;align-items:start;max-width:1200px;width:100%;margin:0 auto;padding:72px 32px 112px;box-sizing:border-box}
main.page-main-content:has(.rp2-cover)>:not(.w-full){display:none}
main.page-main-content:has(.rp2-cover) .rp2-cover{padding:0;background:none}
main.page-main-content:has(.rp2-cover) .rp2-cover .in{display:block}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry{background:none;padding:0;font-family:var(--rp-serif);color:#1D1B18;--rp-serif:'Newsreader',Georgia,'Times New Roman',serif}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry section{max-width:none;padding:0;animation:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry :is(h2,.instruction){display:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .enquiry-form{border:0;padding:40px;background:#FCFAF6;border-radius:3px;box-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 1px 2px rgba(60,40,20,.08),0 12px 32px -8px rgba(60,40,20,.16)}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry label{font-family:inherit;font-size:15px;font-weight:400;color:#5B5449}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .input{min-height:52px;font-family:inherit;font-size:18px;background:#fff;border:1.5px solid #8A8172;border-radius:2px;padding:10px 14px;color:#1D1B18}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .input:focus{border-color:#1D1B18}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry :is(.input,.btn,input[type=checkbox]):focus-visible{outline:2px dotted #B0271B;outline-offset:3px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry input[type=checkbox]{width:20px;height:20px;accent-color:#1D1B18}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .btn{min-height:52px;font-family:inherit;font-size:18px;font-weight:600;background:#1D1B18;color:#F4EFE6;border:0;border-radius:2px;padding:0 28px;filter:none}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .btn:hover{background:#000;color:#F4EFE6}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .form-status{font-family:inherit;font-size:16px}
@media (max-width:900px){main.page-main-content:has(.rp2-cover){grid-template-columns:1fr;row-gap:40px;padding:40px 16px 72px}
main.page-main-content:has(.rp2-cover) .page-block-send-enquiry .enquiry-form{padding:24px 20px}}
"""


# ---------- helpers ----------

def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};,>])\s*", r"\1", css)
    css = re.sub(r";}", "}", css)
    return css.strip()


def minify_html(h: str) -> str:
    h = re.sub(r"<!--(?!\s*HASHMETA).*?-->", "", h, flags=re.S)
    h = re.sub(r">\s+<", "><", h)
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
    for name in ["header", "footer", "home-01-hero", "home-02-grid", "home-03-checker", "home-04-recall",
                 "figure-template", "indicator-template", "cover-my-briefing"]:
        css, body = split_block(name)
        css_parts.append(f"/* {name} */\n{css}")
        bodies[name] = body
    subs = {"__GRID__": R.grid_html(entries), "__DATA__": R.checker_data(entries)}
    for k in bodies:
        for a, b in subs.items():
            bodies[k] = bodies[k].replace(a, b)

    # --- global.css ---
    tokens = R.TOKENS.format(cls=f":is({ALL})")
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
    grid = bodies["home-02-grid"].replace("document.currentScript.previousElementSibling",
                                          "document.getElementById('figures')")
    home_blocks = []
    for name, body in [("hero", bodies["home-01-hero"]), ("grid", grid), ("checker", bodies["home-03-checker"]),
                       ("recall-press", bodies["home-04-recall"])]:
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
        six = sorted((e for e in entries if e["series_id"] == sid), key=lambda e: e["period"])
        t_all = [R._days(v["published"]) for e in six for v in e["vintages"]]
        t_range = (min(t_all), max(t_all) + 40, max(t_all))
        cards = "".join(
            f'<a class="q" href="{e["path"]}"><span class="qq">{R.q(e["period"])}</span>'
            f'<span class="fn">{"<s class=\"rp2-pencil\">" + e_(R.fmt(e["first_value"], e["unit"])) + "</s> → " if abs(e["first_value"] - e["current_value"]) > 1e-9 else ""}'
            f'<b>{e_(R.fmt(e["current_value"], e["unit"]))}</b></span>'
            f'{clean_copy(round_svg(R.step_svg(e, 360, 160, 15, "mini", "now", t_range)))}</a>' for e in six)
        long = R.LONG[sid]
        lede = (f"{long.split(', ')[1].capitalize() if ', ' in long else long}, "
                f"{R.q(six[0]['period'])} to {R.q(six[-1]['period'])}. <b>Red</b> marks each change.")
        head = R.indicator_headline(sid, entries)
        body = (itpl.replace("__CARDS__", cards).replace("__HEADLINE__", e_(head)).replace("__LEDE__", lede))
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
    form_block = next(b for b in live3["layout"] if b["id"] == FORM_BLOCK_ID)
    cover_layout = [{"blockType": "rawHtml", "blockName": "rp2-cover",
                     "html": re.sub(r"<!-- HASHMETA.*?-->", "", cover_html), "containerWidth": "full"},
                    form_block]
    write("cover.json", json.dumps(cover_layout, ensure_ascii=False, indent=1))
    manifest.append({"pageId": 3, "slug": "cover-my-briefing", "file": "cover.json", "kind": "cover",
                     "bytes": bytes_(cover_layout[0]["html"]), "kept_block_ids": [FORM_BLOCK_ID],
                     "dropped_block_ids": [b["id"] for b in live3["layout"] if b["id"] != FORM_BLOCK_ID],
                     "meta": {"title": "Cover my briefing",
                              "description": "Send one briefing and Recall Press watches every Singapore figure in it. "
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
