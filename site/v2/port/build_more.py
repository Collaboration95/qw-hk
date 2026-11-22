"""Build the five remaining v2 pages for Revisionpedia (Figures index, all figures, How it works, About, Sources).

python3 site/v2/port/build_more.py

Writes only under site/v2/port/:
  payload/{10,8,6,7,4}.json   {"pageId","slug","layout":[rawHtml blocks],"meta":{title,description}}
  more.css                    the NEW rules only (scoped to .rp2-pg), also appended to global.css
  global.after.css            global.live.css (fresh get_global_styles read) + more.css
  preview/more-*.html         pages inside the live chrome (live/header.live.html + footer.html), for shoot_more.mjs
Copy rules: site/v2/BRIEF.md. Data: site/collections/revisions.json (real values only).
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
sys.path.insert(0, str(PORT))
import render_v2 as R  # noqa: E402
import build_port as B  # noqa: E402

e_ = html.escape
ROOT = ".rp2-pg"
HERO = "sg-gdp-manufacturing-yoy-2025-q3"
GROUPS = {"sg-gdp-overall-qoq": 0, "sg-gdp-manufacturing-qoq": 0, "sg-gdp-services-qoq": 0,
          "sg-gdp-construction-qoq": 0, "sg-unemployment": 0}  # last row of each ledger group
MEAS = {"annual": "year on year", "quarterly": "quarter on quarter", "people": "added each quarter",
        "rate": "rate, end of quarter"}
NAME = {"sg-employment-change": "Jobs", "sg-unemployment": "Unemployment"}

# ---------------------------------------------------------------- CSS (new rules only)
CSS = r"""
body:has(.rp2-pg){background:#F4EFE6}
:where(.rp2-pg) :is(h1,h2,h3,p,ol,ul,li,dl,dt,dd,figure,a,b,strong,em,i,s,small,span,aside,nav,hr){all:revert}
:where(.rp2-pg) svg{display:revert;vertical-align:revert}
:where(.rp2-pg) a:hover{color:inherit;text-decoration:revert}
.rp2-pg{--rp-paper:#F4EFE6;--rp-sheet:#FCFAF6;--rp-ink:#1D1B18;--rp-quiet:#5B5449;--rp-line:#DCD3C4;--rp-red:#B0271B;
 --rp-red-wash:rgba(176,39,27,.07);--rp-serif:'Newsreader',Georgia,'Times New Roman',serif;--rp-hand:'Caveat','Bradley Hand',cursive;
 --rp-ease:cubic-bezier(.22,1,.36,1);--rp-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 1px 2px rgba(60,40,20,.08),0 12px 32px -10px rgba(60,40,20,.14);
 font-family:var(--rp-serif);color:var(--rp-ink);font-size:18px;line-height:1.55;font-optical-sizing:auto;-webkit-font-smoothing:antialiased;
 background:var(--rp-paper);padding:72px 32px 112px}
.rp2-pg *,.rp2-pg *::before,.rp2-pg *::after{box-sizing:border-box}
.rp2-pg ::selection{background:rgba(176,39,27,.16)}
.rp2-pg .in{max-width:1200px;margin:0 auto}
.rp2-pg.narrow .in{max-width:760px}
.rp2-pg h1{font-size:clamp(34px,4.2vw,56px);line-height:1.06;letter-spacing:-.025em;font-weight:600;margin:0;max-width:20ch;text-wrap:balance}
.rp2-pg .lede{margin:16px 0 0;font-size:20px;color:var(--rp-quiet);max-width:52ch;text-wrap:pretty}
.rp2-pg .lede b{color:var(--rp-ink);font-weight:600}
.rp2-pg a{color:var(--rp-ink);text-decoration-thickness:1px;text-underline-offset:4px;text-decoration-color:var(--rp-quiet)}
.rp2-pg a:focus-visible{outline:2px dotted var(--rp-red);outline-offset:3px}
.rp2-pg .num{font-variant-numeric:lining-nums tabular-nums}
.rp2-pg s{text-decoration:line-through;text-decoration-color:var(--rp-red);text-decoration-thickness:2px;color:var(--rp-quiet)}
.rp2-pg .more{display:inline-flex;align-items:center;min-height:44px;margin-top:32px;font-size:17px}
.rp2-pg .more::after{content:"→";margin-left:8px;transition:transform .2s var(--rp-ease)}
@media (hover:hover){.rp2-pg .more:hover::after{transform:translateX(3px)}}
.rp2-pg .key{display:flex;flex-wrap:wrap;gap:6px 20px;margin:20px 0 0;padding:0;list-style:none;font-size:15px;color:var(--rp-quiet)}
.rp2-pg .key li{display:flex;align-items:center;gap:8px}
.rp2-pg .key svg{flex:none}
/* Figures index: one ledger row per indicator */
.rp2-pg .ledger{list-style:none;margin:40px 0 0;padding:0;border-top:1.5px solid var(--rp-ink)}
.rp2-pg .ledger li{border-bottom:1px solid var(--rp-line)}
.rp2-pg .ledger li.g{border-bottom:1.5px solid var(--rp-ink)}
.rp2-pg .ledger a,.rp2-pg .qh{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px) 130px 24px;gap:40px;align-items:center;min-height:76px;padding:10px 12px;margin:0 -12px;text-decoration:none;border-radius:2px;transition:background .15s var(--rp-ease)}
.rp2-pg .ledger .nm{font-size:21px;font-weight:600;line-height:1.2}
.rp2-pg .ledger .nm span{display:block;font-size:15px;font-weight:400;color:var(--rp-quiet);margin-top:2px}
.rp2-pg .ledger svg{display:block;width:100%;height:auto;overflow:visible}
.rp2-pg .qh{min-height:0;margin:40px 0 0;padding:0 0 8px;font-size:13px;color:var(--rp-quiet);font-variant-numeric:lining-nums}
.rp2-pg .qh>span:nth-child(2){white-space:nowrap;display:grid;grid-template-columns:repeat(6,1fr);text-align:center}
.rp2-pg .qh+.ledger{margin-top:0}
.rp2-pg .ledger .ct{font-size:16px;color:var(--rp-quiet);font-variant-numeric:lining-nums}
.rp2-pg .ledger .ct b{color:var(--rp-ink);font-weight:600;font-size:21px;margin-right:4px}
.rp2-pg .ledger .ar{font-size:20px;color:var(--rp-quiet);transition:transform .2s var(--rp-ease),color .2s}
@media (hover:hover){.rp2-pg .ledger a:hover{background:var(--rp-sheet)}.rp2-pg .ledger a:hover .ar{transform:translateX(3px);color:var(--rp-red)}}
.rp2-pg .tk path,.rp2-pg .tk line{stroke:var(--rp-red);stroke-width:2;stroke-linecap:round}
.rp2-pg .tk .z{stroke:var(--rp-line);stroke-width:1;stroke-dasharray:2 3}
.rp2-pg .tk circle{r:4px}
.rp2-pg .tk .u{r:3.5px}
.rp2-pg .tk .f{fill:var(--rp-paper);stroke:var(--rp-ink);stroke-width:1.5}
.rp2-pg .tk .n{fill:var(--rp-red)}
.rp2-pg .tk .u{fill:var(--rp-ink)}
.rp2-pg .tk text{font:13px var(--rp-serif);fill:var(--rp-quiet)}
/* All figures: grouped list */
.rp2-pg .groups{margin:48px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px 72px}
.rp2-pg .grp h2{margin:0;font-size:20px;font-weight:600;line-height:1.25;border-bottom:1.5px solid var(--rp-ink)}
.rp2-pg .grp h2 a{text-decoration:none;min-height:44px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.rp2-pg .grp h2 span{font-size:15px;font-weight:400;color:var(--rp-quiet)}
@media (hover:hover){.rp2-pg .grp h2 a:hover span{color:var(--rp-red)}}
.rp2-pg .grp ol{list-style:none;margin:0;padding:0}
.rp2-pg .grp li{border-bottom:1px solid var(--rp-line)}
.rp2-pg .grp li a{display:grid;grid-template-columns:84px minmax(0,1fr);align-items:center;min-height:44px;padding:0 8px;margin:0 -8px;text-decoration:none;font-variant-numeric:lining-nums tabular-nums;border-radius:2px}
.rp2-pg .grp .qq{font-size:15px;color:var(--rp-quiet)}
.rp2-pg .grp .v{font-size:18px;text-align:right}
.rp2-pg .grp .v b{font-weight:600}
.rp2-pg .grp .v .to{color:var(--rp-quiet);margin:0 8px}
.rp2-pg .grp .v small{font-size:15px;color:var(--rp-quiet);margin-left:8px}
.rp2-pg .grp li.fl a{background:var(--rp-red-wash)}
.rp2-pg .grp li.fl b{color:var(--rp-red)}
@media (hover:hover){.rp2-pg .grp li a:hover{background:var(--rp-sheet)}.rp2-pg .grp li.fl a:hover{background:rgba(176,39,27,.12)}}
/* How it works */
.rp2-pg .steps{list-style:none;margin:48px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr 1.25fr;background:var(--rp-sheet);border-radius:3px;box-shadow:var(--rp-shadow);counter-reset:st}
.rp2-pg .steps>li{padding:28px 28px 30px;position:relative;counter-increment:st}
.rp2-pg .steps>li+li{border-left:1px solid var(--rp-line)}
.rp2-pg .steps>li+li::before{content:"→";position:absolute;left:-12px;top:30px;width:24px;height:24px;line-height:22px;text-align:center;background:var(--rp-sheet);color:var(--rp-quiet);font-size:16px}
.rp2-pg .steps h2{margin:0;font-size:18px;font-weight:600;line-height:1.3}
.rp2-pg .steps h2::before{content:counter(st);display:inline-block;width:1.4em;color:var(--rp-red);font-family:var(--rp-hand);font-size:24px;line-height:1}
.rp2-pg .steps .val{margin:20px 0 0;font-size:44px;font-weight:600;letter-spacing:-.03em;line-height:1;font-variant-numeric:lining-nums}
.rp2-pg .steps .val .to{font-weight:400;color:var(--rp-quiet);font-size:.6em;margin:0 6px}
.rp2-pg .steps .val s{font-weight:400}
.rp2-pg .steps .dt{margin:10px 0 0;font-size:15px;color:var(--rp-quiet)}
.rp2-pg .slide{margin:20px 0 0;padding:14px 16px 16px;border:1px solid var(--rp-line);border-radius:2px;background:#fff;font-size:20px;font-weight:600;line-height:1.35;position:relative}
.rp2-pg .slide small{display:block;font-size:13px;font-weight:400;color:var(--rp-quiet);margin-bottom:6px;letter-spacing:.01em}
.rp2-pg .slide s{color:var(--rp-ink);font-weight:600;text-decoration-thickness:3px}
.rp2-pg .slide i{white-space:nowrap;font-family:var(--rp-hand);font-style:normal;color:var(--rp-red);font-size:28px;font-weight:600;display:inline-block;transform:rotate(-3deg);margin-left:4px;line-height:1}
.rp2-pg .flip{margin:32px 0 0;font-size:18px;max-width:60ch}
.rp2-pg .flip b{font-weight:600;color:var(--rp-red)}
.rp2-pg .rp{margin:56px 0 0;padding:32px 0 0;border-top:1.5px solid var(--rp-ink);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px 48px;align-items:center}
.rp2-pg .rp h2{margin:0;font-size:26px;font-weight:600;letter-spacing:-.015em;line-height:1.2}
.rp2-pg .rp p{margin:8px 0 0;color:var(--rp-quiet);max-width:56ch}
.rp2-pg .rp p b{color:var(--rp-ink);font-weight:600}
.rp2-pg .btn2{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 28px;background:var(--rp-ink);color:var(--rp-paper);font-size:18px;font-weight:600;text-decoration:none;border-radius:2px;white-space:nowrap}
.rp2-pg .btn2::after{content:"→";margin-left:10px;transition:transform .2s var(--rp-ease)}
@media (hover:hover){.rp2-pg .btn2:hover{background:#000;color:var(--rp-paper)}.rp2-pg .btn2:hover::after{transform:translateX(3px)}}
/* About + Sources */
.rp2-pg .body{margin:28px 0 0;max-width:58ch}
.rp2-pg .body p{margin:0 0 14px;font-size:19px}
.rp2-pg .body p.q{color:var(--rp-quiet);font-size:17px}
.rp2-pg .sig{margin:36px 0 0;display:flex;align-items:baseline;gap:14px;padding-top:20px;border-top:1px solid var(--rp-line);font-size:16px;color:var(--rp-quiet)}
.rp2-pg .sig b{font-family:var(--rp-hand);font-weight:600;font-size:30px;color:var(--rp-ink);line-height:1}
.rp2-pg .src{list-style:none;margin:40px 0 0;padding:0;border-top:1.5px solid var(--rp-ink)}
.rp2-pg .src li{padding:16px 0;border-bottom:1px solid var(--rp-line);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 24px;align-items:baseline}
.rp2-pg .src a{font-weight:600;font-size:17px;line-height:1.35}
.rp2-pg .src span{font-size:15px;color:var(--rp-quiet)}
.rp2-pg .src .ac{white-space:nowrap;font-variant-numeric:lining-nums}
.rp2-pg .kind{margin:44px 0 0;padding-bottom:10px;border-bottom:1.5px solid var(--rp-ink);font-size:20px;font-weight:600;line-height:1.25}
.rp2-pg .src{margin:0;border-top:0}
.rp2-pg .rel{margin:14px 0 0;font-size:17px;max-width:58ch}
.rp2-pg .att{margin:32px 0 0;padding:18px 20px;background:var(--rp-sheet);box-shadow:var(--rp-shadow);border-left:3px solid var(--rp-red);border-radius:2px;font-size:17px}
.rp2-pg .att small{display:block;font-size:13px;color:var(--rp-quiet);margin-bottom:4px}
.rp2-pg .notes{margin:24px 0 0;padding:0;list-style:none;font-size:16px;color:var(--rp-quiet)}
.rp2-pg .notes li{margin:0 0 6px;padding-left:18px;position:relative}
.rp2-pg .notes li::before{content:"–";position:absolute;left:0}
@media (prefers-reduced-motion:reduce){.rp2-pg *{transition:none!important}}
@media (max-width:900px){
 .rp2-pg{padding:40px 16px 72px}
 .rp2-pg .lede{font-size:18px}
 .rp2-pg .ledger a{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"nm ct" "sp sp";gap:6px 16px;padding:14px 8px;margin:0 -8px}
 .rp2-pg .ledger .nm{grid-area:nm;font-size:19px}.rp2-pg .ledger .ct{grid-area:ct;text-align:right}.rp2-pg .ledger svg{grid-area:sp}.rp2-pg .qh{display:none}.rp2-pg .qh+.ledger{margin-top:28px}.rp2-pg .ledger .ar{display:none}
 .rp2-pg .groups{grid-template-columns:1fr;gap:36px}
 .rp2-pg .steps{grid-template-columns:1fr}
 .rp2-pg .steps>li{padding:22px 20px 24px}
 .rp2-pg .steps>li+li{border-left:0;border-top:1px solid var(--rp-line)}
 .rp2-pg .steps>li+li::before{content:"↓";left:20px;top:-12px}
 .rp2-pg .steps .val{font-size:38px}
 .rp2-pg .rp{grid-template-columns:1fr}
 .rp2-pg .src li{grid-template-columns:1fr}
 .rp2-pg .src .ac{white-space:normal}
}
"""


# ---------------------------------------------------------------- data helpers

def load():
    entries = R.load()
    by = {}
    for e in entries:
        by.setdefault(e["series_id"], []).append(e)
    for v in by.values():
        v.sort(key=lambda e: e["period"])
    return entries, by


def changed(e):
    return abs(e["first_value"] - e["current_value"]) > 1e-9


def label(sid):
    name, meas = R.SHORT[sid]
    return NAME.get(sid, name), MEAS[meas]


def ticks(six, w=420, h=56):
    """Six quarters, one column each: ring = first estimate, red dot = now, red line = the change.
    Unchanged quarters are a single ink dot. Shared scale per indicator; dashed zero line when it spans zero."""
    vals = [x for e in six for x in (e["first_value"], e["current_value"])]
    lo, hi = min(vals), max(vals)
    if lo > 0 and lo < (hi - lo):
        lo = 0.0
    if hi < 0:
        hi = 0.0
    pad = 6
    span = (hi - lo) or 1.0
    Y = lambda v: pad + (hi - v) / span * (h - 2 * pad)
    step = w / 6
    parts = []
    if lo < 0 < hi:
        parts.append(f'<line class="z" x1="0" x2="{w}" y1="{Y(0):.0f}" y2="{Y(0):.0f}"/>')
    tips = []
    for i, e in enumerate(six):
        x = step * i + step / 2
        u = e["unit"]
        yf, yn = Y(e["first_value"]), Y(e["current_value"])
        t = f"{R.q(e['period'])}: {R.fmt(e['first_value'], u)} → {R.fmt(e['current_value'], u)}"
        if changed(e):
            parts.append(f'<path d="M{x:.0f} {yf:.0f}V{yn:.0f}"/>'
                         f'<circle class="f" cx="{x:.0f}" cy="{yf:.0f}"/>'
                         f'<circle class="n" cx="{x:.0f}" cy="{yn:.0f}"><title>{e_(t)}</title></circle>')
        else:
            parts.append(f'<circle class="u" cx="{x:.0f}" cy="{yn:.0f}"><title>'
                         f'{e_(R.q(e["period"]) + ": " + R.fmt(e["current_value"], u) + ", unchanged")}</title></circle>')
        tips.append(t)
    aria = f"{sum(changed(e) for e in six)} of 6 quarters now differ from the first estimate"
    return (f'<svg class="tk" viewBox="0 0 {w} {h}" role="img" aria-label="{e_(aria)}">'
            + "".join(parts) + "</svg>")


KEY = ('<ul class="key"><li><svg width="14" height="30" viewBox="0 0 14 30" class="tk" aria-hidden="true">'
       '<path d="M7 6V24"/><circle class="f" cx="7" cy="6" r="4"/><circle class="n" cx="7" cy="24" r="4"/>'
       '</svg>First estimate → now</li><li><svg width="14" height="14" viewBox="0 0 14 14" class="tk" aria-hidden="true">'
       '<circle class="u" cx="7" cy="7" r="3.5"/></svg>Unchanged</li></ul>')


# ---------------------------------------------------------------- pages

def page_figures(entries, by):
    n_rev = sum(bool(e["ever_revised"]) for e in entries)
    rows = []
    for sid in R.ORDER:
        six = by[sid]
        name, meas = label(sid)
        k = sum(bool(e["ever_revised"]) for e in six)
        g = ' class="g"' if sid in GROUPS else ""
        rows.append(f'<li{g}><a href="/indicators/{sid}/"><span class="nm">{e_(name)}<span>{e_(meas)}</span></span>{ticks(six)}'
                    f'<span class="ct"><b>{k} of {len(six)}</b>revised</span><span class="ar" aria-hidden="true">→</span></a></li>')
    head = f"{n_rev} of {len(entries)} quarters were revised after first publication."
    qh = "".join(f"<span>{R.q(e['period']).replace(' 20', ' ’')}</span>" for e in by[R.ORDER[0]])
    html_ = (f'<section class="rp2-pg figs"><div class="in"><h1>{e_(head)}</h1>'
             f'<p class="lede">Ten Singapore indicators, six quarters each. Pick one to see every release.</p>{KEY}'
             f'<p class="qh" aria-hidden="true"><span></span><span>{qh}</span><span></span><span></span></p><ol class="ledger">{"".join(rows)}</ol>'
             f'<a class="more" href="/revisions/">All {len(entries)} figures, first estimate and now</a></div></section>')
    meta = {"title": "Figures: how often Singapore's economic numbers are revised",
            "description": f"{head} Ten Singapore indicators (GDP by sector, jobs, unemployment), six quarters each, "
                           "first estimate against the latest release."}
    return html_, meta, head


def page_all(entries, by):
    n_ch = sum(changed(e) for e in entries)
    groups = []
    for sid in R.ORDER:
        name, meas = label(sid)
        lis = []
        for e in reversed(by[sid]):
            u = e["unit"]
            fl = " fl" if R.flipped(e) else ""
            if changed(e):
                v = (f'<s>{e_(R.fmt(e["first_value"], u))}</s><span class="to" aria-label="now">→</span>'
                     f'<b>{e_(R.fmt(e["current_value"], u))}</b>')
            else:
                v = f'<b>{e_(R.fmt(e["current_value"], u))}</b><small>unchanged</small>'
            lis.append(f'<li class="{fl.strip()}"><a href="{e["path"]}"><span class="qq">{R.q(e["period"])}</span>'
                       f'<span class="v">{v}</span></a></li>'.replace(' class=""', ""))
        groups.append(f'<section class="grp"><h2><a href="/indicators/{sid}/">{e_(name)}, {e_(meas)}'
                      f'<span aria-hidden="true">→</span></a></h2><ol>{"".join(lis)}</ol></section>')
    head = f"{n_ch} of {len(entries)} figures now differ from their first estimate."
    html_ = (f'<section class="rp2-pg all"><div class="in"><h1>{e_(head)}</h1>'
             f'<p class="lede">First estimate → now, newest quarter first. <b style="color:var(--rp-red)">Red</b> '
             f'means the change flipped a headline.</p><div class="groups">{"".join(groups)}</div></div></section>')
    meta = {"title": "All 60 figures: first estimate and now",
            "description": f"{head} Every Singapore GDP, jobs and unemployment figure Revisionpedia follows, "
                           "first estimate against the latest release."}
    return html_, meta, head


def page_how(entries, by):
    h = next(e for e in entries if e["slug"] == HERO)
    vs = R.changed_values(h)
    n_flip = sum(R.flipped(e) for e in entries)
    head = "A figure can change after you quote it."
    html_ = (
        f'<section class="rp2-pg narrow how"><div class="in" style="max-width:1200px"><h1>{head}</h1>'
        f'<p class="lede">Manufacturing growth, Q3 2025, year on year: one real figure, start to finish.</p>'
        f'<ol class="steps">'
        f'<li><h2>It is first estimated.</h2><p class="val">{R.fmt(vs[0]["value"], "%")}</p>'
        f'<p class="dt">{R.d(vs[0]["published"])}</p></li>'
        f'<li><h2>Later releases revise it.</h2><p class="val"><s>{R.fmt(vs[1]["value"], "%")}</s>'
        f'<span class="to">→</span>{R.fmt(h["current_value"], "%")}</p>'
        f'<p class="dt">{R.d(vs[1]["published"])} → now, {len(vs) - 1} changes</p></li>'
        f'<li><h2>A sentence on the first number may now be wrong.</h2>'
        f'<p class="slide"><small>Your slide, Oct 2025</small>Manufacturing <s>stalled</s> <i>grew 4.6%</i> in Q3 2025.</p></li>'
        f'</ol>'
        f'<p class="flip"><b>Flipped a headline:</b> the change crossed zero or a round number such as 5%, '
        f'so the words must change. {n_flip} of {len(entries)} figures did.</p>'
        f'<a class="more" href="{h["path"]}">Every release for this figure</a>'
        f'<div class="rp"><div><h2>Recall Press checks your deck for this.</h2>'
        f'<p>Send a deck. When a figure in it is revised, you get <b>the sentence, its source and a corrected PPTX</b>.</p>'
        f'</div><a class="btn2" href="/cover-my-briefing/">Send a deck</a></div></div></section>')
    meta = {"title": "How it works: when an official figure changes",
            "description": "Singapore's official figures are first estimated, then revised in later releases. "
                           "Example: manufacturing growth for Q3 2025 was first 0.0%, then 5.0%, now 4.6%."}
    return html_, meta, head


def page_about():
    head = "One independent publisher runs Revisionpedia."
    html_ = (f'<section class="rp2-pg narrow about"><div class="in"><h1>{head}</h1><div class="body">'
             f'<p>Recall Press is a one-person company in Singapore. Its editor keeps Revisionpedia for people who quote '
             f'Singapore’s economic figures.</p>'
             f'<p>It is independent and not affiliated with any government agency.</p>'
             f'<p class="q">The figures and their sources are public. Sample slides and sentences are written for '
             f'demonstration.</p></div>'
             f'<p class="sig"><b>Recall Press</b><span>Singapore · <a href="/cover-my-briefing/?intent=correction">'
             f'Report a correction</a></span></p></div></section>')
    meta = {"title": "About Revisionpedia",
            "description": "Revisionpedia is run by Recall Press, an independent one-person company in Singapore. "
                           "It is not affiliated with any government agency."}
    return html_, meta, head


def page_sources(entries):
    inds = json.loads((REPO / "site" / "collections" / "indicators.json").read_text())
    seen = {}
    for i in inds:
        seen.setdefault(i["dataset_url"], i)
    acc = R.d(next(iter(seen.values()))["accessed"])
    rows = "".join(
        f'<li><a href="{e_(i["dataset_url"])}" rel="noopener">{e_(i["dataset"])}</a>'
        f'<span class="ac">accessed {R.d(i["accessed"])}</span><span>{e_(i["agency"])}</span></li>'
        for i in sorted(seen.values(), key=lambda i: i["dataset"]))
    head = "Every number comes from an official source."
    html_ = (f'<section class="rp2-pg narrow srcs"><div class="in"><h1>{head}</h1>'
             f'<p class="lede">Revisionpedia is independent and not affiliated with any government agency.</p>'
             f'<h2 class="kind">Tables on data.gov.sg</h2><ul class="src">{rows}</ul>'
             f'<h2 class="kind">Official releases</h2><p class="rel">MTI, SingStat and MOM releases date the earlier '
             f'numbers. Each figure page links the release behind every number.</p>'
             f'<p class="att"><small>Attribution</small>Contains information from data.gov.sg made available under the '
             f'<a href="https://data.gov.sg/open-data-licence" rel="noopener">Singapore Open Data Licence v1.0</a>.</p>'
             f'<ul class="notes"><li>The licence covers the data.gov.sg tables. Agency releases have their own terms.</li>'
             f'<li>Employment counts in thousands are shown in people.</li>'
             f'<li>Tables last read {acc}. Next GDP release: 24 Nov 2026.</li></ul>'
             f'<a class="more" href="/cover-my-briefing/?intent=correction">Report a correction</a></div></section>')
    meta = {"title": "Sources and licences",
            "description": "Revisionpedia's figures come from SingStat tables on data.gov.sg (Singapore Open Data "
                           "Licence v1.0) and dated MTI, SingStat and MOM releases. Independent, not government."}
    return html_, meta, head


# ---------------------------------------------------------------- build

BANNED = re.compile(r"\b(series|vintages?|archived?|records?|dataset|threshold|cutoff|snapshot|observed|intermediate|"
                    r"category|first to current|pp)\b", re.I)


def visible(h):
    h = re.sub(r"<(script|style|svg)[^>]*>.*?</\1>", " ", h, flags=re.S)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def build():
    entries, by = load()
    pages = [
        (10, "indicators", "figures", *page_figures(entries, by)),
        (8, "revisions", "all", *page_all(entries, by)),
        (6, "how-corrections-work", "how", *page_how(entries, by)),
        (7, "about", "about", *page_about()),
        (4, "sources-and-licences", "sources", *page_sources(entries)),
    ]
    css = B.minify_css(CSS)
    (PORT / "more.css").write_text("\n/* ---- Revisionpedia v2 · more pages (.rp2-pg) ---- */\n" + css + "\n")
    live = (PORT / "global.live.css").read_text()
    after = live.rstrip() + "\n" + (PORT / "more.css").read_text()
    (PORT / "global.after.css").write_text(after)
    g = (PORT / "global.css").read_text()
    if "more pages (.rp2-pg)" not in g:
        (PORT / "global.css").write_text(g.rstrip() + "\n" + (PORT / "more.css").read_text())

    header = (PORT / "live" / "header.live.html").read_text().replace('src="/locale-switch.js"',
                                                                         'src="../live/locale-switch.js"')
    footer = (PORT / "footer.html").read_text()
    report = []
    for pid, slug, name, body, meta, head in pages:
        body = B.minify_html(body)
        layout = [{"blockType": "rawHtml", "blockName": f"rp2-{name}", "html": body, "containerWidth": "full"}]
        payload = {"pageId": pid, "slug": slug, "layout": layout, "meta": meta}
        s = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        (PORT / "payload" / f"{pid}.json").write_text(s)
        words = len(visible(body).split())
        bad = sorted(set(m.group(0).lower() for m in BANNED.finditer(visible(body) + " " + meta["description"])))
        report.append((pid, slug, len(s.encode()), words, len(head.split()), bad))
        page = B.SHELL.format(title=e_(meta["title"]), header=header, footer=footer,
                              blocks=f'<div class="w-full">{body}</div>').replace(
            'href="../global.after.css"', 'href="../global.after.css?v=more"')
        (PORT / "preview" / f"more-{name}.html").write_text(page)
    print(f"more.css {len(css.encode()):,} B   global.after.css {len(after.encode()):,} B")
    for pid, slug, b, w, hw, bad in report:
        print(f"page {pid:>2} /{slug}/  payload {b:,} B  visible words {w}  headline words {hw}  banned {bad or '-'}")


if __name__ == "__main__":
    build()
