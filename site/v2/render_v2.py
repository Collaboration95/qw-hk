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

FONTS_HREF = "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..700&display=swap"
FONT_IMPORT = f"@import url('{FONTS_HREF}');"

# The v3 system (tokens + shared UI kit), every selector prefixed with __R__. Contrast notes in src/system.css.
SYSTEM_CSS = (HERE / "src" / "system.css").read_text()


def tokens(cls: str) -> str:
    """The system CSS scoped to one root selector (a block class, or :is(all roots) in the port)."""
    return SYSTEM_CSS.replace("__R__", cls)


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
MEAS_WORDS = {"annual": "year on year", "quarterly": "quarter on quarter"}
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
    first = f"{fmt(f, u)}, {d(entry['first_date'])}"
    if abs(n - f) < 1e-9:
        tail = f"Unchanged since the first estimate, {d(entry['first_date'])}"
        if len(changed_values(entry)) > 1:
            tail = f"Revised, then back to the first estimate ({first})"
        return f'<strong>{e_(head)}</strong> <span>{e_(tail)}</span>'
    return f'<strong>{e_(head)}</strong> <span>First estimate {e_(first)}</span>'



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


def indicator_body(sid: str, entries, tpl: str, post=lambda s: s) -> str:
    """Indicator page: six quarter cards, one shared value scale (top = highest release, baseline = lowest or 0).
    Each card's time axis runs from its own first estimate to its own latest release, so 'now' sits at the axis end.
    The scale is stated once, in one line under the lede."""
    six = sorted((e for e in entries if e["series_id"] == sid), key=lambda e: e["period"])
    v_all = [v["value"] for e in six for v in e["vintages"]]
    v_range = (min(v_all), max(v_all))
    u = six[0]["unit"]
    cards = "".join(
        f'<a class="q" href="{e["path"]}"><span class="qq">{q(e["period"])}</span>'
        f'<span class="fn"><b>{e_(fmt(e["current_value"], u))}</b>'
        f'{"<small>first " + e_(fmt(e["first_value"], u)) + "</small>" if abs(e["first_value"] - e["current_value"]) > 1e-9 else "<small>never revised</small>" if not e["ever_revised"] else "<small>back to first</small>"}</span>'
        f'{post(step_svg(e, 360, 176, 15, "mini", "now", v_range=v_range, short_dates=True))}</a>'
        for e in six)
    long = LONG[sid]
    lede = (f"{long.split(', ')[1].capitalize() if ', ' in long else long}, "
            f"{q(six[0]['period'])} to {q(six[-1]['period'])}. Every release, first estimate to now.")
    lo, hi = v_range
    if lo > 0 and lo < (hi - lo) * 1.2:  # the same rule as chart_geometry
        lo = 0.0
    a, b = fmt(lo, u), fmt(hi, u)
    if lo == 0:
        a = "0"
    elif lo > 0 and u != "persons":
        a = a.rstrip("%")
    scale = f"All charts on one scale, {a}{'–' if lo >= 0 else ' to '}{b}."
    return (tpl.replace("__CARDS__", cards).replace("__HEADLINE__", e_(indicator_headline(sid, entries)))
            .replace("__LEDE__", lede).replace("__SCALE__", e_(scale)))


# ---------- step chart (server-rendered SVG) ----------

def _days(iso: str) -> int:
    y, m, dd = (int(x) for x in iso.split("-"))
    return date(y, m, dd).toordinal()


def chart_geometry(entry, w: int, h: int, fs: int, end_label: str = "now", v_range: tuple | None = None,
                   step_labels=False):
    """Pure geometry, shared by step_svg and the numeric check: x is linear in days from the first estimate
    (x = left edge) to the latest release (x = plot right edge); y is linear from the scale max (plot top) to
    the scale min (baseline)."""
    vs = entry["vintages"]
    u = entry["unit"]
    vals = [v["value"] for v in vs]
    lo, hi = v_range or (min(vals), max(vals))
    if lo > 0 and lo < (hi - lo) * 1.2:
        lo = 0.0
    if hi < 0:
        hi = 0.0
    if hi - lo < 1e-9:
        lo, hi = lo - 1, hi + 1
    lab_w = max(len(fmt(vals[-1], u)) + len(end_label) + 1, 6) * fs * 0.6
    padr = round(16 + lab_w)
    padt = fs * (2.0 if step_labels else 1.1)
    padb = fs * 2.5
    t0, t1 = _days(vs[0]["published"]), _days(vs[-1]["published"])
    x_end = w - padr
    y_top, y_base = padt, h - padb
    Y = lambda v: y_top + (hi - v) / (hi - lo) * (y_base - y_top)
    l0w = len(fmt(vals[0], u)) * fs * 0.62 + 6
    lead = False
    for padl in (6, round(l0w + 8)):
        X = (lambda t, padl=padl: padl + (t - t0) / (t1 - t0) * (x_end - padl)) if t1 > t0 else (lambda t: x_end)
        pts = [(X(_days(v["published"])), Y(v["value"]), v) for v in vs]
        # shared-scale cards: a first value on the baseline with a jump right beside it is labelled left of its
        # ring (not tucked against the jump), so the plot starts after room for that label
        if lead or not v_range or len(pts) < 2:
            break
        x0, y0 = pts[0][0], pts[0][1]
        if not (y0 + fs * 1.45 > y_base + fs * 0.4 and pts[1][1] < y0 - fs * 1.6 and pts[1][0] - x0 < l0w):
            break
        lead = True
    return dict(vs=vs, u=u, vals=vals, lo=lo, hi=hi, padl=padl, padr=padr, x_end=x_end, y_top=y_top,
                y_base=y_base, X=X, Y=Y, pts=pts, t0=t0, t1=t1, lead=lead)


def step_svg(entry, w: int = 640, h: int = 230, fs: int = 15, cls: str = "", end_label: str = "now",
             v_range: tuple | None = None, step_labels=False, tips: bool = True, scale_labels: bool = False,
             short_dates: bool = False) -> str:
    """Step chart of every release, each at its true date. step_labels: False, True/'changed' (value on each step
    that changed) or 'extremes' (only the highest value; phones). v_range: a shared value scale (indicator page);
    scale_labels prints its two ends. The line ends at the 'now' dot, which sits above the end-date label."""
    g = chart_geometry(entry, w, h, fs, end_label, v_range, step_labels)
    vs, u, vals, pts, Y = g["vs"], g["u"], g["vals"], g["pts"], g["Y"]
    lo, hi, padl, x_end = g["lo"], g["hi"], g["padl"], g["x_end"]
    flat, jumps, wjumps = [], [], []
    t = entry.get("threshold")
    side = ((lambda v: (v > 0) - (v < 0)) if entry.get("crossed_sign") else
            (lambda v: v < t) if entry.get("crossed_threshold") and t is not None else None)
    for i, (x, y, v) in enumerate(pts[:-1]):
        xe = pts[i + 1][0]
        nv = pts[i + 1][2]["value"]
        flat.append(f"M{x:.1f} {y:.1f}H{xe:.1f}")
        if abs(nv - v["value"]) > 1e-9:  # red only where the words change (sign, or the figure's round number)
            (wjumps if side and side(nv) != side(v["value"]) else jumps).append(f"M{xe:.1f} {y:.1f}V{pts[i + 1][1]:.1f}")
    xn, yn, vn = pts[-1]
    x0, y0, v0 = pts[0]
    gx = x_end + 10  # gutter text x
    parts = []
    # guide lines: the shared scale's top and baseline, and zero when it falls inside
    guides = []
    if v_range:
        guides += [g["y_top"], g["y_base"]]
    if lo <= 0 <= hi and not any(abs(Y(0) - gy) < 1 for gy in guides):
        guides.append(Y(0))
    for gy in guides:
        parts.append(f'<line class="z" x1="{padl}" x2="{x_end:.1f}" y1="{gy:.1f}" y2="{gy:.1f}"/>')
    if scale_labels and v_range:
        for val, gy in ((hi, g["y_top"]), (lo, g["y_base"])):
            if abs(gy - yn) > fs * 1.15:
                parts.append(f'<text class="zl sc" x="{gx}" y="{gy + fs * .35:.1f}">{e_(fmt(val, u))}</text>')
    elif not v_range and lo < 0 < hi and abs(Y(0) - yn) > fs * 1.3 and not any(abs(v) < 1e-9 for v in vals):
        parts.append(f'<text class="zl" x="{gx}" y="{Y(0) + fs * .35:.1f}">{e_(fmt(0, u))}</text>')
    if flat:
        parts.append(f'<path class="flat" d="{"".join(flat)}"/>')
    if jumps:
        parts.append(f'<path class="jump" d="{"".join(jumps)}"/>')
    if wjumps:
        parts.append(f'<path class="jump w" d="{"".join(wjumps)}"/>')
    # step labels
    labelled = []
    if step_labels == "extremes":
        top = max(range(len(pts)), key=lambda i: (vals[i], -i))
        if 0 < top < len(pts) - 1 and abs(vals[top] - vals[-1]) > 1e-9 and abs(vals[top] - vals[0]) > 1e-9:
            labelled = [top]
    elif step_labels:
        last_lx = x0 + fs * 2.6
        for i, (x, y, v) in enumerate(pts):
            if (0 < i < len(pts) - 1 and abs(v["value"] - pts[i - 1][2]["value"]) > 1e-9
                    and abs(v["value"] - vals[-1]) > 1e-9 and x - last_lx > fs * 0.4 and xn - x > fs * 2.8):
                labelled.append(i)
                last_lx = x + 6 + len(fmt(v["value"], u)) * fs * 0.6
    for i in labelled:
        x, y, v = pts[i]
        up = pts[i - 1][2]["value"] < v["value"]
        ly = y - fs * 0.7 if up or y + fs * 1.5 > g["y_base"] else y + fs * 1.35
        parts.append(f'<text class="lv" x="{x + 6:.1f}" y="{ly:.1f}">{e_(fmt(v["value"], u))}</text>')
    for i, (x, y, v) in enumerate(pts):
        r = 4.5 if i in (0, len(pts) - 1) else 3
        c = "p0" if i == 0 else "pn" if i == len(pts) - 1 else "p"
        t_ = f"<title>{e_(fmt(v['value'], u) + ' · ' + d(v['published']) + ' · ' + v['release'])}</title>" if tips else ""
        parts.append(f'<circle class="{c}" cx="{x:.1f}" cy="{y:.1f}" r="{r}">{t_}</circle>' if t_ else
                     f'<circle class="{c}" cx="{x:.1f}" cy="{y:.1f}" r="{r}"/>')
    # first value: above its ring, or below when there is no room or the first jump rises beside it
    l0 = fmt(v0["value"], u)
    ly0 = y0 - fs * 0.8 if y0 - fs * 1.7 > 0 else y0 + fs * 1.45
    if len(pts) > 1 and pts[1][1] < y0 - fs and pts[1][0] - x0 < len(l0) * fs * 0.62 + 6:
        ly0 = y0 + fs * 1.45
    lx0 = x0 - 4
    if ly0 > y0 and ly0 > g["y_base"] + fs * 0.4:  # no room below either (ring on the baseline)
        ly0 = y0 - fs * 0.8
        if len(pts) > 1 and pts[1][1] < y0 - fs * 1.6 and pts[1][0] - x0 < len(l0) * fs * 0.62 + 6:
            lx0, ly0 = pts[1][0] + 6, y0 - fs * 0.35  # tuck it right of the jump, under the risen line
    if g["lead"]:
        parts.append(f'<text class="l0" x="{x0 - 8:.1f}" y="{y0 + fs * .35:.1f}" text-anchor="end">{e_(l0)}</text>')
    elif len(pts) > 1:
        parts.append(f'<text class="l0" x="{lx0:.1f}" y="{ly0:.1f}">{e_(l0)}</text>')
    parts.append(f'<text class="ln" x="{gx}" y="{yn + fs * .35:.1f}">{e_(fmt(vn["value"], u))}'
                 f'<tspan class="lnow" dx="6">{end_label}</tspan></text>')
    fd = (lambda iso: f"{date.fromisoformat(iso):%b %Y}") if short_dates else d
    yd = h - fs * .45
    if len(pts) > 1:
        dx0 = padl - 4 if g["lead"] else x0 - 4  # the start date stays at the card's left edge
        parts.append(f'<text class="dt" x="{dx0:.1f}" y="{yd:.1f}">{fd(vs[0]["published"])}</text>')
    parts.append(f'<text class="dt" x="{xn + 4.5:.1f}" y="{yd:.1f}" text-anchor="end">{fd(vs[-1]["published"])}</text>')
    label = (f"Step chart of {len(vs)} releases from {d(vs[0]['published'])} to {d(vs[-1]['published'])}: "
             f"first published {fmt(v0['value'], u)}, now {fmt(vn['value'], u)}.")
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
            note = "first"
        elif abs(v["value"] - prev) < 1e-9:
            note = "same"
        else:
            diff = v["value"] - prev
            note = (f"{'+' if diff > 0 else '−'}{abs(diff):,.0f}" if u == "persons"
                    else f"{'+' if diff > 0 else '−'}{abs(diff):.1f}")
        cls = ' class="chg"' if prev is not None and abs(v["value"] - prev) > 1e-9 else ""
        rel = re.sub(r" — (\d{4})-Q(\d)", r", Q\2 \1", v["release"])
        rows.append(f'<tr{cls}><td>{d(v["published"])}</td><td>{e_(fmt(v["value"], u))}</td>'
                    f'<td><a href="{e_(v["url"])}" rel="noopener"><span>{e_(rel)}</span><small>{d(v["published"])}</small></a></td><td>{e_(note)}</td></tr>')
        prev = v["value"]
    licence = entry.get("licence", "")
    src = (f'Source: <a href="{e_(entry.get("dataset_url", ""))}" rel="noopener">SingStat via data.gov.sg</a> '
           f'and MTI releases · {e_(licence)}')
    n_rel = len(vs)
    return (
        f'<p class="rp2-answer">{big_answer(entry)}</p>'
        f'<p class="rp2-dates">{n_rel} releases · latest {d(entry["current_date"])}</p>'
        f'<figure class="rp2-chart">{step_svg(entry, 680, 250, 15, "wide", step_labels=True, tips=False)}'
        f'{step_svg(entry, 358, 220, 13, "narrow", step_labels="extremes", tips=False)}</figure>'
        f'<p class="rp2-slide"><span>For your slide</span> {e_(slide_line(entry))}</p>'
        f'<table class="rp2-rel"><caption>Every release</caption><thead><tr><th>Date</th><th>Value</th><th>Release</th>'
        f'<th>Change</th></tr></thead><tbody>{"".join(rows)}</tbody></table>'
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
            if sid == "sg-gdp-manufacturing-yoy" and p == "2025-Q3":
                state += " on"  # the cell the readout names
            f, n = fmt(e["first_value"], e["unit"]), fmt(e["current_value"], e["unit"])
            m = MEAS_WORDS.get(meas, "")
            lab = f"{name}{', ' + m if m else ''}, {q(p)}: first {f}, now {n}"
            cells.append(f'<a class="c {state}" href="{e["path"]}" data-f="{e_(f)}" data-n="{e_(n)}" '
                         f'data-t="{e_(name + (", " + m if m else "") + " · " + q(p))}" aria-label="{e_(lab)}">'
                         f'<span>{e_(n)}</span></a>')
        grp = " g" if sid in ("sg-gdp-manufacturing-yoy", "sg-gdp-services-yoy",
                              "sg-gdp-construction-yoy", "sg-employment-change") else ""
        out.append(f'<div class="row{grp}" role="listitem"><span class="rl"><b>{name}</b> {MEAS_WORDS.get(meas, "")}</span>'
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


RELEASE_SHORT = {"Advance GDP estimates": "Advance estimate", "Economic Survey of Singapore": "Economic Survey"}


def release_short(release: str) -> str:
    name = re.sub(r" — .*", "", release)
    return RELEASE_SHORT.get(name, name)


def hist_html(entry) -> str:
    """Home 'figure history' fragment: the step chart (wide + narrow) and the releases that changed the number."""
    u = entry["unit"]
    ch = changed_values(entry)
    rows, prev = [], None
    for v in ch:
        delta = "first" if prev is None else (("+" if v["value"] > prev else "−") + f"{abs(v['value'] - prev):.1f}")
        cls = ' class="now"' if v is ch[-1] else ""
        rows.append(f'<li{cls}><span class="d">{d(v["published"])}</span><b>{e_(fmt(v["value"], u))}</b>'
                    f'<span class="r">{e_(release_short(v["release"]))}</span><span class="c">{delta}</span></li>')
        prev = v["value"]
    rest = len(entry["vintages"]) - len(ch)
    more = f'<li class="more"><span>+ {rest} later releases, unchanged</span></li>' if rest else ""
    chart = f'<div class="chart">{step_svg(entry, 640, 250, 14, "wide")}{step_svg(entry, 358, 210, 13, "narrow")}</div>'
    return chart, f'<ol class="rel">{"".join(rows)}{more}</ol>'


def home_subs(entries) -> dict:
    """Placeholders the home blocks use, filled from revisions.json (shared by render_v2 and the port)."""
    hero = next(e for e in entries if e["slug"] == "sg-gdp-manufacturing-yoy-2025-q3")
    chart, rel = hist_html(hero)
    return {"__GRID__": grid_html(entries), "__HIST_CHART__": chart, "__HIST_LIST__": rel}


# ---------- build ----------

def inject(text: str) -> str:
    text = text.replace("__FONTS__", FONT_IMPORT)
    return re.sub(r"__TOKENS\((\.[\w-]+)\)__", lambda m: tokens(m.group(1)), text)


def build():
    entries = load()
    hero = next(e for e in entries if e["slug"] == "sg-gdp-manufacturing-yoy-2025-q3")
    assert sum(e["ever_revised"] for e in entries) == 57 and sum(flipped(e) for e in entries) == 18
    subs = home_subs(entries)
    blocks = {}
    for old in (HERE / "blocks").glob("*.html"):
        old.unlink()
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
        "Recall Press · Your sources change. Your deck updates itself.",
        "When a report or release your deck cites is revised, Recall Press rewrites the sentence and hands "
        "back the updated deck. Live today for 10 Singapore indicators.", home))

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
    ind = indicator_body(sid, entries, blocks["indicator-template"])
    (HERE / "preview" / "indicator.html").write_text(page("Manufacturing, year on year", "", ind))
    (HERE / "preview" / "cover.html").write_text(page("Cover my briefing", "", blocks["cover-my-briefing"]))


if __name__ == "__main__":
    build()
    print("built")
