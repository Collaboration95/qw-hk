"""Revisionpedia v2 renderer.

render_figure_body(entry) -> str   the new `body_html` for one revisions.json entry
plain_answer(entry) -> str         one-sentence direct answer (replacement for the `answer` field)
python3 render_v2.py               rebuilds blocks/ and preview/ from src/ and site/collections/*.json
"""
from __future__ import annotations

import html
import json
import re
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
REVISIONS = REPO / "site" / "collections" / "revisions.json"

FONT_IMPORT = ("@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@"
               "0,6..72,400..700;1,6..72,400..600&family=Caveat:wght@500;600&display=swap');")

# Colour roles. Contrast on --rp-paper: ink 15.0:1, quiet 6.5:1, red 5.8:1.
TOKENS = """{cls}{{--rp-paper:#F4EFE6;--rp-sheet:#FCFAF6;--rp-ink:#1D1B18;--rp-quiet:#5B5449;--rp-line:#DCD3C4;
--rp-red:#B0271B;--rp-red-wash:rgba(176,39,27,.07);--rp-night:#1D1B18;--rp-night-quiet:#B9B0A2;--rp-red-light:#F08A7E;
--rp-serif:'Newsreader',Georgia,'Times New Roman',serif;--rp-hand:'Caveat','Bradley Hand',cursive;
--rp-ease:cubic-bezier(.22,1,.36,1);
font-family:var(--rp-serif);color:var(--rp-ink);font-size:18px;line-height:1.55;
font-optical-sizing:auto;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}}
{cls} *,{cls} *::before,{cls} *::after{{box-sizing:border-box}}
{cls} ::selection{{background:rgba(176,39,27,.16)}}"""

SHORT = {  # series_id -> (name, measure) for grid rows and readouts
    "sg-gdp-overall-yoy": ("GDP", "annual"),
    "sg-gdp-overall-qoq": ("GDP", "quarterly"),
    "sg-gdp-manufacturing-yoy": ("Manufacturing", "annual"),
    "sg-gdp-manufacturing-qoq": ("Manufacturing", "quarterly"),
    "sg-gdp-services-yoy": ("Services", "annual"),
    "sg-gdp-services-qoq": ("Services", "quarterly"),
    "sg-gdp-construction-yoy": ("Construction", "annual"),
    "sg-gdp-construction-qoq": ("Construction", "quarterly"),
    "sg-employment-change": ("Jobs added", "people"),
    "sg-unemployment": ("Unemployment", "rate"),
}
ORDER = list(SHORT)
LONG = {  # checker dropdown labels
    "sg-gdp-overall-yoy": "GDP, year on year",
    "sg-gdp-overall-qoq": "GDP, quarter on quarter",
    "sg-gdp-manufacturing-yoy": "Manufacturing, year on year",
    "sg-gdp-manufacturing-qoq": "Manufacturing, quarter on quarter",
    "sg-gdp-services-yoy": "Services, year on year",
    "sg-gdp-services-qoq": "Services, quarter on quarter",
    "sg-gdp-construction-yoy": "Construction, year on year",
    "sg-gdp-construction-qoq": "Construction, quarter on quarter",
    "sg-employment-change": "Jobs added, quarter on quarter",
    "sg-unemployment": "Unemployment rate",
}
SUBJECT = {  # sentence subject for slide lines
    "overall": "The economy", "manufacturing": "Manufacturing", "services": "Services",
    "construction": "Construction",
}

e_ = html.escape


# ---------- formatting ----------

def d(iso: str) -> str:
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {date(y, m, dd):%b} {y}"


def q(period: str) -> str:
    y, qq = period.split("-")
    return f"{qq} {y}"


def fmt(v: float, unit: str, signed: bool = False) -> str:
    if unit == "persons":
        s = f"{abs(v):,.0f}"
        return ("−" if v < 0 else "+" if signed and v > 0 else "") + s
    s = f"{abs(v):.1f}%"
    return ("−" if v < 0 else "+" if signed and v > 0 else "") + s


def sector(entry) -> str:
    m = re.match(r"sg-gdp-(\w+)-", entry["series_id"])
    return m.group(1) if m else ""


def verb(v: float) -> str:
    return "grew" if v > 0 else "shrank" if v < 0 else "stalled"


def changed_values(entry):
    """Readings where the number actually changed (first reading always kept)."""
    out = []
    for v in entry["vintages"]:
        if not out or abs(v["value"] - out[-1]["value"]) > 1e-9:
            out.append(v)
    return out


def flipped(entry) -> bool:
    return bool(entry["crossed_sign"] or entry["crossed_threshold"])


# ---------- copy ----------

def big_answer(entry) -> str:
    """Large-type answer: '4.6% growth. First published as 0.0%.' (old number struck)."""
    u, n, f = entry["unit"], entry["current_value"], entry["first_value"]
    sid = entry["series_id"]
    if u == "persons":
        head = f"{fmt(abs(n), u)} {'more' if n >= 0 else 'fewer'} jobs."
    elif sid == "sg-unemployment":
        head = f"{fmt(n, u)} unemployment."
    else:
        head = f"{fmt(abs(n), u)} {'growth' if n > 0 else 'fall' if n < 0 else 'no growth'}."
        if n == 0:
            head = "No growth (0.0%)."
    if abs(n - f) < 1e-9:
        tail = "Unchanged since first published."
        if len(changed_values(entry)) > 1:
            tail = "Back to its first published number."
        return f'<strong>{e_(head)}</strong> <span>{tail}</span>'
    return (f'<strong>{e_(head)}</strong> <span>First estimate: '
            f'<s class="rp2-pencil">{e_(fmt(f, u))}</s>.</span>')


def plain_answer(entry) -> str:
    """One-sentence direct answer for AI search (no banned words)."""
    u, n, f = entry["unit"], entry["current_value"], entry["first_value"]
    name, meas = SHORT[entry["series_id"]]
    per = q(entry["period"])
    if u == "persons":
        now = f"total employment {'rose' if n >= 0 else 'fell'} by {fmt(abs(n), u)} people"
    elif entry["series_id"] == "sg-unemployment":
        now = f"Singapore’s overall unemployment rate was {fmt(n, u)}"
    else:
        what = "Singapore’s economy" if name == "GDP" else f"Singapore’s {name.lower()} sector"
        span = "from a year earlier" if meas == "annual" else "from the previous quarter"
        now = f"{what} {verb(n)} {fmt(abs(n), u)} {span}" if n else f"{what} did not grow {span}"
    first = (f"first published as {fmt(f, u)} on {d(entry['first_date'])}" if abs(n - f) > 1e-9
             else f"the same as first published on {d(entry['first_date'])}")
    return f"In {per}, {now}, by the latest release ({d(entry['current_date'])}); {first}."


def slide_line(entry) -> str:
    """What this means for your slide, one sentence."""
    u, n, f = entry["unit"], entry["current_value"], entry["first_value"]
    sid = entry["series_id"]
    if abs(n - f) < 1e-9:
        return f"A slide quoting {fmt(f, u)} still holds."
    if entry["crossed_sign"] and u == "%" and sector(entry):
        subj = SUBJECT[sector(entry)]
        return (f"A slide that said “{subj.lower() if subj != 'The economy' else 'the economy'} {verb(f)}” "
                f"is now wrong. It {verb(n)} {fmt(abs(n), u)}.").replace("“the economy", "“The economy") \
            .replace("“manufacturing", "“Manufacturing").replace("“services", "“Services") \
            .replace("“construction", "“Construction")
    if entry["crossed_threshold"]:
        t = entry["threshold"]
        tt = f"{t:,.0f} people" if u == "persons" else f"{t:.1f}%"
        side = "below" if f < t else "at or above"
        return f"A slide that put it {side} {tt} is now wrong. It is {fmt(n, u)}."
    diff = abs(n - f)
    dd = f"{diff:,.0f} people" if u == "persons" else f"{diff:.1f} points"
    return f"A slide quoting {fmt(f, u)} is out by {dd}. It is now {fmt(n, u)}."


# ---------- indicator page ----------

IND_SUBJECT = {  # series_id -> sentence subject for the indicator headline
    "sg-gdp-overall-yoy": "GDP growth",
    "sg-gdp-overall-qoq": "Quarterly GDP growth",
    "sg-gdp-manufacturing-yoy": "Manufacturing growth",
    "sg-gdp-manufacturing-qoq": "Quarterly manufacturing growth",
    "sg-gdp-services-yoy": "Services growth",
    "sg-gdp-services-qoq": "Quarterly services growth",
    "sg-gdp-construction-yoy": "Construction growth",
    "sg-gdp-construction-qoq": "Quarterly construction growth",
    "sg-employment-change": "Job gains",
    "sg-unemployment": "The unemployment rate",
}


def indicator_headline(indicator_id: str, entries=None) -> str:
    """A true one-line claim from the data, e.g. 'Manufacturing growth was revised in 5 of 6 quarters.'
    Counts quarters revised at least once after first publication (the same test as the home page's 57 of 60)."""
    entries = entries if entries is not None else load()
    six = [e for e in entries if e["series_id"] == indicator_id]
    n = sum(bool(e["ever_revised"]) for e in six)
    subj = IND_SUBJECT[indicator_id]
    if n == 0:
        return f"{subj} {'have' if subj.endswith('gains') else 'has'} not been revised since first published."
    span = "every quarter" if n == len(six) else f"{n} of {len(six)} quarters"
    was = "were" if subj.endswith("gains") else "was"
    return f"{subj} {was} revised in {span}."


# ---------- step chart (server-rendered SVG) ----------

def _days(iso: str) -> int:
    y, m, dd = (int(x) for x in iso.split("-"))
    return date(y, m, dd).toordinal()


def step_svg(entry, w: int = 640, h: int = 230, fs: int = 15, cls: str = "", end_label: str = "now",
             t_range: tuple | None = None) -> str:
    vs = entry["vintages"]
    u = entry["unit"]
    vals = [v["value"] for v in vs]
    lo, hi = min(vals), max(vals)
    if lo > 0 and lo < (hi - lo) * 1.2:
        lo = 0.0
    if hi < 0:
        hi = 0.0
    span = (hi - lo) or abs(hi) or 1.0
    lo -= span * 0.12
    hi += span * 0.12
    padl, padr, padt, padb = 8, 96 if w > 420 else 84, fs * 2.2, fs * 2.4
    t0, t1 = _days(vs[0]["published"]), _days(vs[-1]["published"])
    t1 = max(t1 + 40, t0 + 60)
    if t_range:
        t0, t1 = t_range[0], t_range[1]
    X = lambda t: padl + (t - t0) / (t1 - t0) * (w - padl - padr)
    Y = lambda v: padt + (hi - v) / (hi - lo) * (h - padt - padb)
    pts = [(X(_days(v["published"])), Y(v["value"]), v) for v in vs]
    flat, jumps = [], []
    for i, (x, y, v) in enumerate(pts):
        xe = pts[i + 1][0] if i + 1 < len(pts) else w - padr + 18
        flat.append(f"M{x:.1f} {y:.1f}H{xe:.1f}")
        if i + 1 < len(pts) and abs(pts[i + 1][2]["value"] - v["value"]) > 1e-9:
            jumps.append(f"M{xe:.1f} {y:.1f}V{pts[i + 1][1]:.1f}")
    parts = []
    if lo < 0 < hi:
        z = Y(0)
        zl = (f'<text class="zl" x="{w - padr + 24}" y="{z + fs * .35:.1f}">0</text>'
              if abs(z - Y(vals[-1])) > fs * 1.3 else "")
        parts.append(f'<line class="z" x1="{padl}" x2="{w - padr + 18}" y1="{z:.1f}" y2="{z:.1f}"/>{zl}')
    parts.append(f'<path class="flat" d="{"".join(flat)}"/>')
    if jumps:
        parts.append(f'<path class="jump" pathLength="1" d="{"".join(jumps)}"/>')
    for i, (x, y, v) in enumerate(pts):
        tip = f"{fmt(v['value'], u)} · {d(v['published'])} · {v['release']}"
        r = 4.5 if i in (0, len(pts) - 1) else 3
        c = "p0" if i == 0 else "pn" if i == len(pts) - 1 else "p"
        parts.append(f'<circle class="{c}" cx="{x:.1f}" cy="{y:.1f}" r="{r}"><title>{e_(tip)}</title></circle>')
    x0, y0, v0 = pts[0]
    xn, yn, vn = pts[-1]
    above0 = y0 - fs * 0.9 > fs or y0 > h - padb - fs
    ly0 = y0 - fs * 0.8 if (y0 - fs * 1.6 > 0) else y0 + fs * 1.6
    if t_range and x0 - padl > fs * 3.6:  # shared axis: first value sits left of its ring, clear of the line
        parts.append(f'<text class="l0" x="{x0 - 10:.1f}" y="{y0 + fs * .35:.1f}" text-anchor="end">'
                     f'{e_(fmt(v0["value"], u))}</text>')
    else:
        parts.append(f'<text class="l0" x="{x0:.1f}" y="{ly0:.1f}">{e_(fmt(v0["value"], u))}</text>')
    parts.append(f'<text class="ln" x="{w - padr + 24}" y="{yn + fs * .35:.1f}">{e_(fmt(vn["value"], u))}'
                 f'<tspan class="lnow" dx="6">{end_label}</tspan></text>')
    if t_range:  # one common axis for every card: its two ends
        a0, a1 = date.fromordinal(t_range[0]), date.fromordinal(t_range[2] if len(t_range) > 2 else t_range[1])
        parts.append(f'<text class="dt" x="{padl}" y="{h - fs * .5:.1f}">{a0:%b} {a0.year}</text>')
        parts.append(f'<text class="dt" x="{w - padr + 18}" y="{h - fs * .5:.1f}" text-anchor="end">'
                     f'{a1:%b} {a1.year}</text>')
    else:
        parts.append(f'<text class="dt" x="{padl}" y="{h - fs * .5:.1f}">{d(vs[0]["published"])}</text>')
        parts.append(f'<text class="dt" x="{w - padr + 18}" y="{h - fs * .5:.1f}" text-anchor="end">'
                     f'{d(vs[-1]["published"])}</text>')
    label = (f"Step chart of {len(vs)} releases: first published {fmt(v0['value'], u)} on "
             f"{d(vs[0]['published'])}, now {fmt(vn['value'], u)}.")
    return (f'<svg class="rp2-step {cls}" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" '
            f'aria-label="{e_(label)}" style="font-size:{fs}px">{"".join(parts)}</svg>')


# ---------- figure body ----------

def render_figure_body(entry) -> str:
    u = entry["unit"]
    vs = entry["vintages"]
    rows = []
    prev = None
    for v in vs:
        if prev is None:
            note = "first estimate"
        elif abs(v["value"] - prev) < 1e-9:
            note = "same"
        else:
            diff = v["value"] - prev
            note = (f"{'+' if diff > 0 else '−'}{abs(diff):,.0f} people" if u == "persons"
                    else f"{'+' if diff > 0 else '−'}{abs(diff):.1f} points")
        cls = ' class="chg"' if prev is not None and abs(v["value"] - prev) > 1e-9 else ""
        rows.append(f'<li{cls}><b>{e_(fmt(v["value"], u))}</b><span class="dd">{d(v["published"])}</span>'
                    f'<span class="nt">{e_(note)}</span><a href="{e_(v["url"])}" rel="noopener">'
                    f'{e_(re.sub(r" — (\d{4})-Q(\d)", r", Q\2 \1", v["release"]))}</a></li>')
        prev = v["value"]
    n_changes = len(changed_values(entry)) - 1
    summ = (f"See all {len(vs)} releases ({n_changes} changed the number)"
            if n_changes else f"See all {len(vs)} releases")
    licence = entry.get("licence", "")
    src = (f'Source: <a href="{e_(entry.get("dataset_url", ""))}" rel="noopener">SingStat via data.gov.sg</a> '
           f'and MTI releases · {e_(licence)}')
    return (
        f'<p class="rp2-answer">{big_answer(entry)}</p>'
        f'<p class="rp2-dates">{d(entry["first_date"])} → {d(entry["current_date"])}</p>'
        f'<figure class="rp2-chart">{step_svg(entry, 680, 250, 15, "wide")}'
        f'{step_svg(entry, 358, 210, 13, "narrow")}</figure>'
        f'<p class="rp2-slide"><span>For your slide</span> {e_(slide_line(entry))}</p>'
        f'<details class="rp2-history"><summary>{summ}</summary><ol>{"".join(rows)}</ol></details>'
        f'<p class="rp2-source">{src}</p>'
    )


# ---------- home: grid + checker data ----------

def load():
    return json.loads(REVISIONS.read_text())


def grid_html(entries) -> str:
    by = {(e["series_id"], e["period"]): e for e in entries}
    periods = sorted({e["period"] for e in entries})
    head = "".join(f'<span class="qh">{q(p).replace(" ", "<br>")}</span>' for p in periods)
    out = [f'<div class="rows" role="list"><div class="hd" aria-hidden="true"><span></span>{head}</div>']
    for sid in ORDER:
        name, meas = SHORT[sid]
        cells = []
        for p in periods:
            e = by[(sid, p)]
            state = "flip" if flipped(e) else "chg" if e["ever_revised"] else "same"
            f, n = fmt(e["first_value"], e["unit"]), fmt(e["current_value"], e["unit"])
            lab = f"{name} {meas}, {q(p)}: first {f}, now {n}"
            cells.append(f'<a class="c {state}" href="{e["path"]}" data-f="{e_(f)}" data-n="{e_(n)}" '
                         f'data-t="{e_(name + " " + meas + " · " + q(p))}" aria-label="{e_(lab)}">'
                         f'<span>{e_(n)}</span></a>')
        grp = " g" if sid in ("sg-gdp-manufacturing-yoy", "sg-gdp-services-yoy",
                              "sg-gdp-construction-yoy", "sg-employment-change") else ""
        out.append(f'<div class="row{grp}" role="listitem"><span class="rl"><b>{name}</b> {meas if meas in ("annual", "quarterly") else ""}</span>'
                   f'{"".join(cells)}</div>')
    out.append("</div>")
    return "".join(out)


def checker_data(entries) -> str:
    rows = []
    for e in entries:
        rows.append({
            "s": e["slug"], "k": e["series_id"], "p": e["period"], "u": e["unit"],
            "f": e["first_value"], "n": e["current_value"], "x": flipped(e), "sg": bool(e["crossed_sign"]),
            "t": e["threshold"], "path": e["path"],
            "v": [[v["value"], v["published"]] for v in e["vintages"]],
        })
    return json.dumps({"series": [[k, LONG[k]] for k in ORDER], "rows": rows},
                      ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


# ---------- build ----------

def inject(text: str) -> str:
    text = text.replace("__FONTS__", FONT_IMPORT)
    return re.sub(r"__TOKENS\((\.[\w-]+)\)__", lambda m: TOKENS.format(cls=m.group(1)), text)


def build():
    entries = load()
    hero = next(e for e in entries if e["slug"] == "sg-gdp-manufacturing-yoy-2025-q3")
    assert sum(e["ever_revised"] for e in entries) == 57 and sum(flipped(e) for e in entries) == 18
    subs = {"__GRID__": grid_html(entries), "__DATA__": checker_data(entries)}
    blocks = {}
    for src in sorted((HERE / "src").glob("*.html")):
        t = inject(src.read_text())
        for k, v in subs.items():
            t = t.replace(k, v)
        (HERE / "blocks" / src.name).write_text(t)
        blocks[src.stem] = t

    shell = (HERE / "preview" / "_shell.html").read_text()

    def page(title, desc, body):
        return (shell.replace("{{page_title}}", e_(title)).replace("{{page_desc}}", e_(desc))
                .replace("{{header}}", blocks["header"]).replace("{{footer}}", blocks["footer"])
                .replace("{{body}}", body))

    home = "\n".join(blocks[k] for k in sorted(blocks) if k.startswith("home-"))
    (HERE / "preview" / "index.html").write_text(page(
        "Revisionpedia · Singapore’s official figures, and every change",
        "Singapore’s official economic figures change after they are published. Revisionpedia shows what each "
        "figure first said, what it says now, and every official release in between.", home))

    tpl = blocks["figure-template"]
    fields = {
        "title": hero["title"], "answer": plain_answer(hero), "indicator": hero["indicator"],
        "period": q(hero["period"]), "body_html": render_figure_body(hero), "path": hero["path"],
        "series_id": hero["series_id"], "slug": hero["slug"],
    }
    fig = re.sub(r"\{\{(\w+)\}\}", lambda m: fields.get(m.group(1), m.group(0)) if m.group(1) in fields
                 else m.group(0), tpl)
    (HERE / "preview" / "figure.html").write_text(page(hero["title"], plain_answer(hero), fig))

    # indicator page prototype: Manufacturing year on year, six quarters
    sid = "sg-gdp-manufacturing-yoy"
    six = sorted((e for e in entries if e["series_id"] == sid), key=lambda e: e["period"])
    for s in ORDER:  # every indicator gets a true headline
        print(f"  {s}: {indicator_headline(s, entries)}")
    t_all = [_days(v["published"]) for e in six for v in e["vintages"]]
    t_range = (min(t_all), max(t_all) + 40, max(t_all))  # (axis start, axis end, last release)
    cards = "".join(
        f'<a class="q" href="{e["path"]}"><span class="qq">{q(e["period"])}</span>'
        f'<span class="fn">{"<s class=\"rp2-pencil\">" + e_(fmt(e["first_value"], e["unit"])) + "</s> → " if abs(e["first_value"] - e["current_value"]) > 1e-9 else ""}'
        f'<b>{e_(fmt(e["current_value"], e["unit"]))}</b></span>'
        f'{step_svg(e, 360, 160, 15, "mini", "now", t_range)}</a>' for e in six)
    lede = (f"{LONG[sid].split(', ')[1].capitalize() if ', ' in LONG[sid] else LONG[sid]}, "
            f"{q(six[0]['period'])} to {q(six[-1]['period'])}. <b>Red</b> marks each change.")
    ind = (blocks["indicator-template"].replace("__CARDS__", cards)
           .replace("__HEADLINE__", e_(indicator_headline(sid, entries))).replace("__LEDE__", lede))
    (HERE / "preview" / "indicator.html").write_text(page("Manufacturing, year on year", "", ind))
    (HERE / "preview" / "cover.html").write_text(page("Cover my briefing", "", blocks["cover-my-briefing"]))


if __name__ == "__main__":
    build()
    print("built")
