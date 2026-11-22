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
.rp2-pg{background:var(--rp-paper);padding:80px 32px 128px}
.rp2-pg .in{max-width:1152px;margin:0 auto}
.rp2-pg.narrow .in{max-width:760px}
.rp2-pg h1{font-size:clamp(36px,4.4vw,58px);line-height:1.05;letter-spacing:-.03em;font-weight:580;margin:0;max-width:18ch;text-wrap:balance}
.rp2-pg .lede{margin:18px 0 0;font-size:18px;color:var(--rp-quiet);max-width:52ch;text-wrap:pretty}
.rp2-pg .lede b{color:var(--rp-ink);font-weight:550}
.rp2-pg a{color:var(--rp-ink)}
.rp2-pg .num{font-variant-numeric:tabular-nums}
.rp2-pg s{text-decoration:none;position:relative;color:var(--rp-dim);white-space:nowrap}
.rp2-pg s::after{content:"";position:absolute;left:-2px;right:-2px;top:54%;height:1.5px;border-radius:1px;background:var(--rp-red)}
.rp2-pg .more{margin-top:32px}
.rp2-pg .key{display:flex;flex-wrap:wrap;gap:6px 22px;margin:28px 0 0;padding:0;list-style:none;font-size:13px;color:var(--rp-quiet)}
.rp2-pg .key li{display:flex;align-items:center;gap:8px}
.rp2-pg .key i{display:inline-grid;place-items:center;min-width:34px;height:22px;padding:0 5px;border-radius:5px;flex:none;font-style:normal;font-size:12px;font-weight:550;color:var(--rp-ink);font-variant-numeric:tabular-nums;box-shadow:inset 0 0 0 1px var(--rp-line)}
.rp2-pg .key i:empty{min-width:0;width:12px;height:12px;padding:0;border-radius:3px}
.rp2-pg .key i.flip{color:var(--rp-red);font-weight:650;background:rgba(201,58,27,.06);box-shadow:none}
.rp2-pg .key i.same{color:var(--rp-dim);font-weight:450}
/* Figures index: one row per indicator, the home grid's cells */
.rp2-pg .ledger{list-style:none;margin:0;padding:0;border-top:1px solid var(--rp-line)}
.rp2-pg .ledger li{border-bottom:1px solid var(--rp-line)}
.rp2-pg .ledger li.g{border-bottom-color:var(--rp-line2)}
.rp2-pg .ledger a,.rp2-pg .qh{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,540px) 112px 16px;gap:32px;align-items:center;min-height:72px;padding:10px 16px;margin:0 -16px;text-decoration:none;border-radius:10px;transition:background-color .15s}
.rp2-pg .ledger .nm{font-size:16px;font-weight:550;line-height:1.25;letter-spacing:-.015em}
.rp2-pg .ledger .nm span{display:block;font-size:13px;font-weight:400;color:var(--rp-dim);margin-top:2px}
.rp2-pg .cs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;font-variant-numeric:tabular-nums}
.rp2-pg .cs>span{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:48px;border-radius:7px;line-height:1.15}
.rp2-pg .cs b{font-size:13.5px;font-weight:550}
.rp2-pg .cs s{font-size:11px;margin-top:2px}
.rp2-pg .cs .flip{background:rgba(201,58,27,.06)}
.rp2-pg .cs .flip b{color:var(--rp-red);font-weight:650}
.rp2-pg .cs .same b{color:var(--rp-dim);font-weight:450}
.rp2-pg .cs .cap{box-shadow:inset 0 0 0 1.5px var(--rp-ink)}
.rp2-pg .qh{min-height:0;margin:40px -16px 0;padding:0 16px 10px;font-size:12px;color:var(--rp-dim)}
.rp2-pg .qh .cs>span{min-height:0;background:none;box-shadow:none}
.rp2-pg .ledger .ct{font-size:13px;color:var(--rp-dim);font-variant-numeric:tabular-nums}
.rp2-pg .ledger .ct b{display:block;color:var(--rp-ink);font-weight:600;font-size:16px}
.rp2-pg .ledger .ar{font-size:16px;color:var(--rp-dim);transition:transform .2s var(--rp-ease),color .2s}
@media (hover:hover){.rp2-pg .ledger a:hover{background:var(--rp-bg2)}.rp2-pg .ledger a:hover .ar{transform:translateX(3px);color:var(--rp-ink)}}
/* All figures: grouped list */
.rp2-pg .groups{margin:48px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px 64px}
.rp2-pg .grp h2{margin:0;font-size:15px;font-weight:600;line-height:1.25;letter-spacing:-.015em;border-bottom:1px solid var(--rp-line2)}
.rp2-pg .grp h2 a{text-decoration:none;min-height:44px;display:flex;justify-content:space-between;align-items:center;gap:12px}
.rp2-pg .grp h2 span{font-weight:400;color:var(--rp-dim)}
@media (hover:hover){.rp2-pg .grp h2 a:hover span{color:var(--rp-ink)}}
.rp2-pg .grp ol{list-style:none;margin:0;padding:0}
.rp2-pg .grp li{border-bottom:1px solid var(--rp-line)}
.rp2-pg .grp li a{display:grid;grid-template-columns:84px minmax(0,1fr);align-items:center;min-height:44px;padding:0 10px;margin:0 -10px;text-decoration:none;font-variant-numeric:tabular-nums;border-radius:8px;font-size:14px}
.rp2-pg .grp .qq{color:var(--rp-dim);font-size:13px}
.rp2-pg .grp .v{text-align:right}
.rp2-pg .grp .v b{font-weight:600}
.rp2-pg .grp .v .to{color:var(--rp-dim);margin:0 8px}
.rp2-pg .grp .v small{font-size:13px;color:var(--rp-dim);margin-left:8px}
.rp2-pg .grp li.fl b{color:var(--rp-red)}
@media (hover:hover){.rp2-pg .grp li a:hover{background:var(--rp-bg2)}}
/* How it works: feature rows, each with its own UI fragment */
.rp2-pg .feats{list-style:none;margin:88px 0 0;padding:0}
.rp2-pg .feat{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:40px 72px;align-items:center;padding:72px 0;border-top:1px solid var(--rp-line)}
.rp2-pg .feat h2{margin:0;font-size:clamp(26px,2.6vw,36px);line-height:1.1;letter-spacing:-.025em;font-weight:580;max-width:16ch;text-wrap:balance}
.rp2-pg .feat .fs{margin:16px 0 0;font-size:17px;line-height:1.5;color:var(--rp-quiet);max-width:38ch;text-wrap:pretty}
.rp2-pg .panel{border-radius:12px;background:var(--rp-bg2);box-shadow:inset 0 0 0 1px var(--rp-line)}
.rp2-pg .fb{padding:22px 24px}
.rp2-pg .file{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:14px;align-items:center}
.rp2-pg .file .ic{width:40px;height:48px;border-radius:7px;background:#fff;box-shadow:inset 0 0 0 1px var(--rp-line2),0 1px 2px rgba(17,17,16,.05);display:grid;place-items:end center;padding-bottom:7px;font-size:9px;font-weight:650;letter-spacing:.04em;color:var(--rp-red)}
.rp2-pg .file b{display:block;font-weight:550;font-size:14px;color:var(--rp-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rp2-pg .file>span>span{font-size:12px;color:var(--rp-dim)}
.rp2-pg .st{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--rp-quiet);white-space:nowrap}
.rp2-pg .st.bad{color:var(--rp-red)}
.rp2-pg .slides{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:20px}
.rp2-pg .slides i{position:relative;aspect-ratio:16/10;border-radius:5px;background:#fff;box-shadow:inset 0 0 0 1px var(--rp-line2),0 1px 2px rgba(17,17,16,.04);display:flex;flex-direction:column;gap:3px;padding:7px 8px;font-style:normal;overflow:hidden}
.rp2-pg .slides em{font-style:normal;font-size:9px;line-height:1.2;font-weight:600;letter-spacing:-.01em;color:var(--rp-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rp2-pg .slides b{font-size:14px;line-height:1;font-weight:650;letter-spacing:-.03em;color:var(--rp-ink);font-variant-numeric:tabular-nums}
.rp2-pg .slides i>span{position:absolute;right:6px;bottom:4px;font-size:9.5px;color:var(--rp-dim)}
.rp2-pg .slides i.on{box-shadow:inset 0 0 0 1.5px rgba(17,17,16,.4)}
.rp2-pg .slides i.bad{box-shadow:inset 0 0 0 1.5px var(--rp-red)}
.rp2-pg .slides i.bad>span{color:var(--rp-red)}
.rp2-pg .map{list-style:none;margin:0;padding:0}
.rp2-pg .map li{display:grid;grid-template-columns:minmax(0,1.1fr) 20px minmax(0,1fr);gap:12px;align-items:center;padding:12px 0;font-size:13px}
.rp2-pg .map li+li{border-top:1px solid var(--rp-line)}
.rp2-pg .map .s{color:var(--rp-ink)}
.rp2-pg .map .s small{display:block;color:var(--rp-dim);font-size:11.5px;margin-bottom:2px}
.rp2-pg .map .a{color:var(--rp-dim);text-align:center}
.rp2-pg .chip{display:inline-flex;flex-wrap:wrap;align-items:center;gap:2px 8px;padding:6px 10px;border-radius:8px;background:#fff;box-shadow:inset 0 0 0 1px var(--rp-line2);color:var(--rp-quiet);font-size:12px;line-height:1.35}
.rp2-pg .chip b{color:var(--rp-ink);font-weight:600}
.rp2-pg .chip small{flex-basis:100%;font-size:11.5px;color:var(--rp-dim)}
.rp2-pg .chip.off{background:none;box-shadow:inset 0 0 0 1px var(--rp-line2);color:var(--rp-dim)}
.rp2-pg .rp2-step.narrow{display:none}
.rp2-pg .vs{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid var(--rp-line)}
.rp2-pg .vs li{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;min-height:44px;border-bottom:1px solid var(--rp-line);font-size:13px;font-variant-numeric:tabular-nums}
.rp2-pg .vs li>span:first-child{color:var(--rp-dim)}
.rp2-pg .vs .mv{color:var(--rp-ink)}
.rp2-pg .vs .mv em{font-style:normal;color:var(--rp-dim);margin-left:10px}
.rp2-pg .vs .out{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:6px;font-size:12px;font-weight:550;box-shadow:inset 0 0 0 1px var(--rp-line2);color:var(--rp-quiet);background:#fff}
.rp2-pg .vs .out.bad{color:var(--rp-red);background:#FFF1EC;box-shadow:inset 0 0 0 1px var(--rp-red-line)}
.rp2-pg .say{margin:0;font-size:19px;line-height:1.38;font-weight:550;letter-spacing:-.022em}
.rp2-pg .say s{color:var(--rp-quiet)}
.rp2-pg .say s::after{height:2px}
.rp2-pg .src{margin:12px 0 0;font-size:12.5px;color:var(--rp-dim)}
.rp2-pg .acts{display:flex;gap:8px;margin-top:18px;flex-wrap:wrap}
.rp2-pg .acts .b1,.rp2-pg .acts .b2{min-height:30px;height:30px;padding:0 10px;border-radius:8px;font-size:12.5px;cursor:default}
.rp2-pg .vd{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:18px;padding-top:16px;border-top:1px solid var(--rp-line);font-size:13px}
.rp2-pg .end{margin-top:128px}
.rp2-pg.figs .end{margin-top:64px}
.rp2-pg .feats+.end{margin-top:0}
/* About + Sources */
.rp2-pg .facts{list-style:none;margin:48px 0 0;padding:0;border-top:1px solid var(--rp-line)}
.rp2-pg .facts li{display:grid;grid-template-columns:160px minmax(0,1fr);gap:16px;padding:16px 0;border-bottom:1px solid var(--rp-line);font-size:16px}
.rp2-pg .facts li span{color:var(--rp-dim);font-size:13px;padding-top:3px}
.rp2-pg .facts a{text-underline-offset:3px;text-decoration-color:rgba(17,17,16,.3);display:inline-block;padding:10px 0;margin:-10px 0}
.rp2-pg .srcs{list-style:none;margin:0;padding:0}
.rp2-pg .srcs li{padding:14px 0;border-bottom:1px solid var(--rp-line);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 24px;align-items:baseline}
.rp2-pg .srcs a{font-weight:500;font-size:15px;line-height:1.4;text-decoration:none;display:inline-block;padding:12px 0;margin:-12px 0}
.rp2-pg .srcs span{font-size:13px;color:var(--rp-dim)}
@media (hover:hover){.rp2-pg .srcs a:hover{text-decoration:underline;text-underline-offset:3px}}
.rp2-pg .kind{margin:56px 0 0;padding-bottom:12px;border-bottom:1px solid var(--rp-line2);font-size:15px;font-weight:600;line-height:1.25;letter-spacing:-.015em}
.rp2-pg .rel{margin:16px 0 0;font-size:15px;color:var(--rp-quiet);max-width:58ch}
.rp2-pg .att{margin:32px 0 0;padding:16px 18px;border-radius:12px;background:var(--rp-bg2);box-shadow:inset 0 0 0 1px var(--rp-line);font-size:14px;color:var(--rp-quiet)}
.rp2-pg .att a{color:var(--rp-ink);text-underline-offset:3px}
@media (max-width:900px){
 .rp2-pg{padding:48px 16px 88px}
 .rp2-pg .lede{font-size:17px}
 .rp2-pg .ledger a{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"nm ct" "cs cs";gap:10px 16px;padding:14px 8px;margin:0 -8px}
 .rp2-pg .ledger .nm{grid-area:nm}.rp2-pg .ledger .ct{grid-area:ct;text-align:right}.rp2-pg .ledger .cs{grid-area:cs}.rp2-pg .ledger .ar{display:none}
 .rp2-pg .ledger .ct b{display:inline;margin-right:4px}
 .rp2-pg .qh{grid-template-columns:1fr;margin:32px -8px 0;padding:0 8px 8px;position:sticky;top:56px;background:#fff;z-index:2}
 .rp2-pg .qh>span:not(.cs){display:none}
 .rp2-pg .cs{gap:3px}
 .rp2-pg .cs>span{min-height:44px}
 .rp2-pg .cs b{font-size:12.5px}
 .rp2-pg .cs s{display:none}
 .rp2-pg .groups{grid-template-columns:1fr;gap:36px}
 .rp2-pg .feats{margin-top:56px}
 .rp2-pg .feat{grid-template-columns:1fr;gap:28px;padding:48px 0}
 .rp2-pg .fb{padding:16px}
 .rp2-pg .slides{grid-template-columns:repeat(3,minmax(0,1fr))}
 .rp2-pg .map li{grid-template-columns:1fr;gap:6px}
 .rp2-pg .map .a{display:none}
 .rp2-pg .rp2-step.wide{display:none}.rp2-pg .rp2-step.narrow{display:block}
 .rp2-pg .vs li{grid-template-columns:48px minmax(0,1fr) auto;gap:8px}
 .rp2-pg .vs .mv em{display:block;margin:0}
 .rp2-pg .say{font-size:17px}
 .rp2-pg .end{margin-top:96px}
 .rp2-pg.figs .end{margin-top:48px}
 .rp2-pg .facts li{grid-template-columns:1fr;gap:2px}
 .rp2-pg .srcs li{grid-template-columns:1fr}
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


KEY = ('<ul class="key" aria-label="Key"><li><i class="flip">0.6</i>Sentence now wrong</li>'
       '<li><i class="chg">4.5</i>Number changed</li><li><i class="same">2.0</i>Never revised</li></ul>')


def end(h2, sub="Pilot: no fee, results within two working days."):
    """The closing band (system.css .end): a page-specific line, its subline, one button under it."""
    return (f'<div class="end"><div><h2 class="h2">{h2}</h2><p class="sub">{sub}</p></div>'
            '<a class="b1" href="/cover-my-briefing/">Send a deck</a></div>')


END = end("Send a deck once.<br> It keeps itself&nbsp;current.")


def cell(e):
    """One figure as the home grid draws it: the value now; the fill says what changed (see KEY)."""
    state = "flip" if R.flipped(e) else "chg" if e["ever_revised"] else "same"
    if e["slug"] == HERO:
        state += " cap"
    return f'<span class="{state}"><b>{e_(R.fmt(e["current_value"], e["unit"]))}</b></span>'


# ---------------------------------------------------------------- pages

def page_figures(entries, by):
    n_rev = sum(bool(e["ever_revised"]) for e in entries)
    rows = []
    for sid in R.ORDER:
        six = by[sid]
        name, meas = label(sid)
        k = sum(bool(e["ever_revised"]) for e in six)
        g = ' class="g"' if sid in GROUPS else ""
        aria = f"{name}, {meas}: {k} of {len(six)} quarters revised"
        rows.append(f'<li{g}><a href="/indicators/{sid}/" aria-label="{e_(aria)}"><span class="nm">{e_(name)}<span>{e_(meas)}</span></span>'
                    f'<span class="cs" aria-hidden="true">{"".join(cell(e) for e in six)}</span>'
                    f'<span class="ct"><b>{k} of {len(six)}</b>revised</span><span class="ar" aria-hidden="true">→</span></a></li>')
    head = f"{n_rev} of {len(entries)} figures were revised at least once."
    qh = "".join(f"<span>{R.q(e['period']).replace(' 20', ' ’')}</span>" for e in by[R.ORDER[0]])
    html_ = (f'<section class="rp2-pg figs"><div class="in"><h1>{e_(head)}</h1>'
             f'<p class="lede">Ten Singapore indicators, six quarters each. Pick one to see every release.</p>{KEY}'
             f'<p class="qh" aria-hidden="true"><span></span><span class="cs">{qh}</span><span></span><span></span></p><ol class="ledger">{"".join(rows)}</ol>'
             f'<a class="b3 more" href="/revisions/">All {len(entries)} figures as a list</a>{end("Cited any of these&nbsp;60?", "Send the deck. It updates itself when any of them change.")}</div></section>')
    meta = {"title": "Figures: how often Singapore's economic numbers are revised",
            "description": f"{head} Ten Singapore indicators (GDP by sector, jobs, unemployment), six quarters each, "
                           "first estimate against the latest release."}
    return html_, meta, head


def page_all(entries, by):
    n_rev = sum(bool(e["ever_revised"]) for e in entries)
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
            elif e["ever_revised"]:
                v = f'<b>{e_(R.fmt(e["current_value"], u))}</b><small>revised, then back</small>'
            else:
                v = f'<b>{e_(R.fmt(e["current_value"], u))}</b><small>never revised</small>'
            lis.append(f'<li class="{fl.strip()}"><a href="{e["path"]}"><span class="qq">{R.q(e["period"])}</span>'
                       f'<span class="v">{v}</span></a></li>'.replace(' class=""', ""))
        groups.append(f'<section class="grp"><h2><a href="/indicators/{sid}/">{e_(name)}, {e_(meas)}'
                      f'<span aria-hidden="true">→</span></a></h2><ol>{"".join(lis)}</ol></section>')
    head = f"{n_rev} of {len(entries)} figures were revised at least once."
    key = ('<ul class="key" aria-label="Key"><li><i class="flip"></i><span>Red: sentence now wrong</span></li></ul>')
    html_ = (f'<section class="rp2-pg all"><div class="in"><h1>{e_(head)}</h1>'
             f'<p class="lede"><b class="num">{n_ch}</b> still differ from their first estimate. First estimate → now, newest quarter first.</p>'
             f'{key}<div class="groups">{"".join(groups)}</div>'
             f'{end("Found one you quoted?", "Send the deck. It updates itself next time.")}</div></section>')
    meta = {"title": "All 60 figures: first estimate and now",
            "description": f"{head} {n_ch} still differ from their first estimate. Every Singapore GDP, jobs and "
                           "unemployment figure Recall Press follows, first estimate against the latest release."}
    return html_, meta, head


def win(title, body, label, dots=False, tag=""):
    bar = ('<div class="bar" aria-hidden="true"><span class="dots"><i></i><i></i><i></i></span>'
           f'<span class="ttl">{title}</span><span class="r"></span></div>' if dots else
           f'<div class="bar tab" aria-hidden="true"><span class="ttl">{title}</span>{tag}</div>')
    return f'<div class="win" role="img" aria-label="{e_(label)}">{bar}<div class="fb" aria-hidden="true">{body}</div></div>'


SLIDES = [  # the sample deck's six slides: title words and the figure each quotes (publications/members-briefing-2025q3.pptx)
    ("Members’ quarterly briefing", "Q3 2025"), ("Reading the October estimate", ""),
    ("Services, quarter on quarter", "0.6%"), ("Manufacturing, year on year", "0.0%"),
    ("Electronics output expanded", ""), ("The November economic survey", "")]


def page_how(entries, by):
    """How it works as a product page: four feature rows, each with its own UI fragment. Real run data only
    (workspace/qw-morning/runs/2026-11-21-68013a314ad1/result.json and revisions.json)."""
    h = next(e for e in entries if e["slug"] == HERO)
    chart = (B.round_svg(R.step_svg(h, 560, 210, 13, "wide", step_labels=True, tips=False))
             + B.round_svg(R.step_svg(h, 358, 220, 13, "narrow", step_labels=True, tips=False)))
    head = "Your deck keeps itself current."
    f1 = win("Send a deck",
             '<div class="file"><span class="ic">PPTX</span><span><b>members-briefing-2025q3.pptx</b>'
             '<span>6 slides · received 20 Oct 2025</span></span><span class="st"><span class="sd ok"></span>Watching</span></div>'
             '<div class="slides">' + "".join(
                 f'<i{" class=bad" if n == 4 else " class=on" if n == 3 else ""}><em>{t}</em>{"<b>" + v + "</b>" if v else ""}<span>{n}</span></i>'
                 for n, (t, v) in enumerate(SLIDES, 1)) + '</div>',
             "A deck received on 20 Oct 2025: members-briefing-2025q3.pptx, 6 slides, now kept current.")
    f2 = ('<div class="panel" role="img" aria-label="Slide 3 and slide 4 are linked to the figures they quote, as published on 14 Oct 2025; slide 5 has no matching figure.">'
          '<div class="fb" aria-hidden="true"><ul class="map">'
          '<li><span class="s"><small>Slide 3</small>Services grew 0.6% quarter on quarter in Q1 2025.</span><span class="a">→</span>'
          '<span class="chip"><b>0.6%</b>Services, q/q, Q1 2025<small>as published 14 Oct 2025</small></span></li>'
          '<li><span class="s"><small>Slide 4</small>Manufacturing stalled year on year in Q3 2025.</span><span class="a">→</span>'
          '<span class="chip"><b>0.0%</b>Manufacturing, y/y, Q3 2025<small>as published 14 Oct 2025</small></span></li>'
          '<li><span class="s"><small>Slide 5</small>Electronics output expanded.</span><span class="a">→</span>'
          '<span class="chip off">No matching figure</span></li></ul></div></div>')
    f3 = win("Manufacturing · Q3 2025",
             chart + '<ul class="vs">'
             '<li><span>Slide 4</span><span class="mv"><s>0.0%</s> → 4.6%<em>stalled → grew</em></span><span class="out bad">Sentence wrong</span></li>'
             '<li><span>Slide 3</span><span class="mv"><s>0.6%</s> → 0.7%<em>still growing</em></span><span class="out">Number only</span></li></ul>',
             "Manufacturing Q3 2025 went from 0.0% to 4.6%: it no longer stalled, it grew, so the words on slide 4 change. "
             "Services went from 0.6% to 0.7%, still growing, so only slide 3's number changes.")
    f4 = win("Slide 4 · rewritten",
             '<p class="say">Manufacturing <s>stalled</s> <span class="nw">grew 4.6%</span> year on year in Q3&nbsp;2025.</p>'
             '<p class="src">MTI · Advance GDP estimates · 14 Apr 2026</p>'
             '<p class="acts"><span class="b1">Approve <span class="kbd">↵</span></span><span class="b2">Skip <span class="kbd">S</span></span></p>'
             '<div class="vd"><div class="file" style="grid-template-columns:40px minmax(0,1fr)"><span class="ic">PPTX</span><span>'
             '<b>members-briefing-2025q3.pptx</b><span>updated copy · slide 4 rewritten</span></span></div></div>',
             "The rewritten sentence: Manufacturing grew 4.6% year on year in Q3 2025, source MTI, 14 Apr 2026, with the updated PPTX.")
    feats = [
        ("Send a deck once.", "PPTX or PDF. No re-uploads, no reminders to\u00a0set.", f1),
        ("Every sentence is linked to its source.", "The figure it quotes, its quarter and the release it came from.", f2),
        ("Checked the day a release lands.",
         "If it breaks the words, the sentence is rewritten. If not, only the number\u00a0changes.", f3),
        ("You approve. The deck updates.",
         "One click per slide. The rest of the deck stays as it\u00a0was.", f4),
    ]
    rows = "".join(f'<li class="feat"><div><h2>{e_(t)}</h2><p class="fs">{e_(s)}</p></div>{w}</li>' for t, s, w in feats)
    html_ = (
        f'<section class="rp2-pg how"><div class="in"><h1>{head}</h1>'
        f'<p class="lede">One sample briefing, from upload to the updated slide. Your only step is the last one.</p>'
        f'<ol class="feats">{rows}</ol>'
        f'{end("Try it on your next&nbsp;deck.")}</div></section>')
    meta = {"title": "How Recall Press works: your deck keeps itself current",
            "description": "Send a deck once. Recall Press links each sentence to the source it cites, rewrites the "
                           "sentence a revision breaks and hands back the updated PPTX for you to approve."}
    return html_, meta, head


def page_about():
    head = "Recall Press keeps your decks current on its own."
    facts = [("Who", "Independent, based in Singapore."),
             ("For", "Anyone who quotes official figures, reports or releases in decks and briefings."),
             ("Examples", "Figures and sources are public. The example deck is a sample."),
             ("Contact", '<a href="/cover-my-briefing/?intent=correction">Report a correction</a>')]
    html_ = (f'<section class="rp2-pg narrow about"><div class="in"><h1>{head}</h1>'
             f'<ul class="facts">' + "".join(f"<li><span>{a}</span><p style=\"margin:0\">{b}</p></li>" for a, b in facts) +
             f'</ul>{end("Start with one&nbsp;deck.")}</div></section>')
    meta = {"title": "About Recall Press",
            "description": "Recall Press keeps your decks and briefings current: when a source they cite "
                           "is revised, it rewrites the sentence for you to approve. Independent, based in Singapore."}
    return html_, meta, head


SOURCE_NAME = {  # data.gov.sg table titles in plain words
    "sg-gdp-construction-yoy": "GDP by industry, year on year, quarterly",
    "sg-gdp-construction-qoq": "GDP by industry, quarter on quarter, seasonally adjusted",
    "sg-employment-change": "Employment change by sector, quarterly",
    "sg-unemployment": "Unemployment rate, end of quarter, seasonally adjusted",
}


def page_sources(entries):
    inds = json.loads((REPO / "site" / "collections" / "indicators.json").read_text())
    seen = {}
    for i in inds:
        seen.setdefault(i["dataset_url"], i)
    rows = "".join(
        f'<li><a href="{e_(i["dataset_url"])}" rel="noopener">{e_(SOURCE_NAME[i["slug"]])}</a>'
        f'<span>{e_(i["agency"])}</span></li>'
        for i in sorted(seen.values(), key=lambda i: SOURCE_NAME[i["slug"]]))
    head = "Every number comes from an official source."
    html_ = (f'<section class="rp2-pg narrow srcp"><div class="in"><h1>{head}</h1>'
             f'<h2 class="kind">Tables on data.gov.sg</h2><ul class="srcs">{rows}</ul>'
             f'<h2 class="kind">Official releases</h2><p class="rel">Every earlier number links to its release '
             f'on the figure page.</p>'
             f'<p class="att">Contains information from data.gov.sg made available under the '
             f'<a href="https://data.gov.sg/open-data-licence" rel="noopener">Singapore Open Data Licence v1.0</a>. '
             f'Agency releases have their own terms.</p>'
             f'<a class="b3 more" href="/cover-my-briefing/?intent=correction">Report a correction</a>{END}</div></section>')
    meta = {"title": "Sources and licences",
            "description": "Recall Press figures come from SingStat tables on data.gov.sg (Singapore Open Data "
                           "Licence v1.0) and dated MTI, SingStat and MOM releases."}
    return html_, meta, head


# ---------------------------------------------------------------- build

BANNED = re.compile(r"\b(series|vintages?|archived?|archives?|records?|dataset|threshold|cutoff|snapshot|observed|"
                    r"intermediate|category|first to current|pp|manual live check|run now|ai-powered|run id)\b", re.I)


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
    marker = "\n/* ---- Recall Press v3 · more pages (.rp2-pg) ---- */\n"
    (PORT / "more.css").write_text(marker + css + "\n")
    g = (PORT / "global.css").read_text()
    g = re.split(r"\n/\* ---- (?:Revisionpedia v2|Recall Press v3) · more pages", g)[0].rstrip() + "\n"
    (PORT / "global.css").write_text(g + (PORT / "more.css").read_text())
    # the full value for update_global_styles: the site's own design base + every v3 rule (global.css)
    before = (PORT / "global.before.css").read_text()
    after = before.rstrip() + "\n" + (PORT / "global.css").read_text()
    (PORT / "global.after.css").write_text(after)

    header = (PORT / "header.html").read_text().replace('src="/locale-switch.js"', 'src="../live/locale-switch.js"')
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
