#!/usr/bin/env python3
"""Build the Hashmeta imports and offline reading copy from the local statistical archive."""
import csv
import json
from datetime import date
from decimal import Decimal
from html import escape
from pathlib import Path
from urllib.parse import urlencode

from directory_pages import build_pages, write_schema

SITE = Path(__file__).resolve().parent
DATA = SITE.parent / "data"
SECTORS = {"overall": "Singapore’s economy", "manufacturing": "Singapore’s manufacturing sector",
           "construction": "Singapore’s construction sector", "services": "Singapore’s services sector"}


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def day(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d:%b %Y}"


def quarter(key):
    year, q = key.split("-")
    return f"{q} {year}"


def change(a, b):
    return float(Decimal(str(b)) - Decimal(str(a)))


def value(n, unit):
    return f"{n:,.0f} people" if unit == "persons" else f"{n:.1f}%"


def amount(n, unit):
    if unit == "persons":
        return f"{n:,.0f} people"
    return f"{n:.1f} percentage point" + ("" if n == 1 else "s")


def crossings(a, b, cutoff):
    def sign(x):
        return (x > 0) - (x < 0)
    return sign(a) != sign(b), (a < cutoff) != (b < cutoff)


def link(label, href):
    return f'<a href="{escape(href, quote=True)}">{escape(label)}</a>'


def profile(sid):
    if sid == "sg-employment-change":
        return ("Total employment change", "Labour market",
                "It counts the change in total employment in Singapore, in people, from the previous quarter.")
    if sid == "sg-unemployment":
        return ("Overall unemployment", "Labour market",
                "It measures the share of Singapore’s labour force unemployed at quarter end, after seasonal adjustment.")
    _, _, sector, basis = sid.split("-")
    label = {"overall": "Overall GDP", "services": "Services GDP",
             "manufacturing": "Manufacturing GDP", "construction": "Construction GDP"}[sector]
    yoy = basis == "yoy"
    comparison = ("the same quarter a year earlier" if yoy else
                  "the preceding quarter, after seasonal adjustment and without annualising the rate")
    return (label + (" · year on year" if yoy else " · quarter on quarter"),
            "Annual growth" if yoy else "Quarterly growth",
            f"It measures the change in real output for {SECTORS[sector]} compared with {comparison}.")


def copy_for(sid, period, first, latest):
    p = quarter(period)
    f, n = first["value"], latest["value"]
    first_wording = f"the first archived figure of {value(f, '%' if sid != 'sg-employment-change' else 'persons')} on {day(first['published'])}"
    if sid == "sg-employment-change":
        title = f"How much did total employment change in Singapore in {p}?"
        action = "rose by" if n >= 0 else "fell by"
        statement = f"total employment {action} {value(abs(n), 'persons')} from the previous quarter"
        if n == 0:
            statement = "total employment was unchanged from the previous quarter"
    elif sid == "sg-unemployment":
        title = f"What was Singapore’s overall unemployment rate at the end of {p}?"
        statement = f"Singapore’s seasonally adjusted unemployment rate was {n:.1f}% at quarter end"
    else:
        _, _, sector, basis = sid.split("-")
        subj = SECTORS[sector]
        yoy = basis == "yoy"
        compare = "a year earlier" if yoy else "the previous quarter"
        title = f"Did {subj} grow in {p} compared with {compare}?"
        verb = "grew" if n > 0 else "shrank"
        statement = (f"{subj} {verb} {abs(n):.1f}% from {compare}" if n else
                     f"{subj} was flat compared with {compare}")
        if not yoy:
            statement += " after seasonal adjustment"
    return title, f"In {p}, {statement}, compared with {first_wording}."


def slide_copy(sid, vintages, threshold):
    f, n = vintages[0]["value"], vintages[-1]["value"]
    unit = "persons" if sid == "sg-employment-change" else "%"
    if f == n:
        if any(v["value"] != f for v in vintages):
            return "A slide using the first figure is numerically right again. An assertion that the estimate never changed would be wrong."
        return "A slide using the first figure still gives the same number in every release shown."
    sign, cutoff = crossings(f, n, threshold)
    fmt = lambda x: value(x, unit)
    if sign and sid.startswith("sg-gdp-"):
        direction = lambda x: "growth" if x > 0 else "a contraction" if x < 0 else "flat output"
        return f"A slide describing {direction(f)} would give the wrong direction. The current figure shows {direction(n)}."
    if cutoff:
        relation = lambda x: "below" if x < threshold else "at or above"
        return f"A slide putting the figure {relation(f)} {fmt(threshold)} would now be wrong. It is {relation(n)} that cutoff."
    verb = "understates" if n > f else "overstates"
    return f"A slide quoting {fmt(f)} {verb} the current figure by {amount(abs(change(f, n)), unit)}."


def source_fields(source):
    return {k: source[k] for k in ("agency", "dataset", "dataset_url", "licence", "licence_url", "accessed")} | {
        "attribution": (f"Contains information from {source['dataset']} ({source['agency']}), accessed "
                        f"on {day(source['accessed'])} from data.gov.sg under the {source['licence']}.")
    }


def credits(r):
    return (f"<p>{escape(r['attribution'])} {link('Dataset and current table', r['dataset_url'])} · "
            f"{link('Table licence', r['licence_url'])}.</p>")


def actions(r):
    base = "/cover-my-briefing/?" + urlencode({"record": r["slug"]})
    return ("<p>" + link("Cover my briefing", base + "&intent=coverage") + " · " +
            link("Report a correction", base + "&intent=correction") + "</p>")


def history(obs, cutoff):
    editions = []
    vs = sorted(obs["vintages"], key=lambda v: v["published"])
    for i, v in enumerate(vs):
        prior = vs[i-1]["value"] if i else v["value"]
        sign, threshold = crossings(prior, v["value"], cutoff)
        editions.append({k: v[k] for k in ("value", "published", "release", "url", "accessed", "agency",
                                           "licence", "licence_url", "locator")} | {
            "date_kind": "first observed" if "dataset_updated" in v or "snapshot" in v["release"].lower() else "published",
            "change_from_previous": change(prior, v["value"]) if i else None,
            "crossed_sign": sign, "crossed_threshold": threshold,
        })
    return editions


def comparison_text(r):
    checks = []
    if r["crossed_sign"]:
        checks.append("The sign changed (zero is its own category).")
    else:
        checks.append("The sign stayed the same.")
    t = value(r["threshold"], r["unit"])
    if r["crossed_threshold"]:
        checks.append(f'The figure moved across the “below {t}” cutoff.')
    else:
        checks.append(f'The figure stayed on the same side of the “below {t}” cutoff.')
    return " ".join(checks)


def revision(s, obs, cutoff):
    sid, period = s["series_id"], obs["period"]
    vs = history(obs, cutoff)
    first, last = vs[0], vs[-1]
    delta = change(first["value"], last["value"])
    sign, threshold = crossings(first["value"], last["value"], cutoff)
    changed = [v for v in vs if v["change_from_previous"]]
    title, answer = copy_for(sid, period, first, last)
    label, category, _ = profile(sid)
    slug = f"{sid}-{period.lower()}"
    r = dict(slug=slug, path=f"/revisions/{slug}/", title=title, answer=answer, series_id=sid,
             indicator=label, category=category, period=period, unit=s["unit"],
             first_value=first["value"], first_date=first["published"], first_url=first["url"],
             current_value=last["value"], current_date=last["published"], current_date_kind=last["date_kind"],
             current_url=last["url"], last_change_date=changed[-1]["published"] if changed else None,
             net_change=delta, absolute_change=abs(delta),
             revision_unit="persons" if s["unit"] == "persons" else "percentage points",
             direction="up" if delta > 0 else "down" if delta < 0 else "unchanged",
             ever_revised=bool(changed), threshold=cutoff, crossed_sign=sign, crossed_threshold=threshold,
             ever_crossed_sign=any(v["crossed_sign"] for v in vs),
             ever_crossed_threshold=any(v["crossed_threshold"] for v in vs),
             slide_impact=slide_copy(sid, vs, cutoff), vintages=vs, **source_fields(s["source"]))
    r["last_checked"] = max(r["accessed"], *(v["accessed"] for v in vs))
    rows = []
    for v in vs:
        delta_step = v["change_from_previous"]
        note = "First archived figure" if delta_step is None else "Repeated"
        if delta_step:
            note = f"{'Up' if delta_step > 0 else 'Down'} {amount(abs(delta_step), s['unit'])}"
            if v["crossed_sign"]:
                note += " · sign changed"
            if v["crossed_threshold"]:
                note += " · crossed briefing cutoff"
        rows.append(f"<li><strong>{value(v['value'], s['unit'])}</strong> · {day(v['published'])} "
                    f"({escape(v['date_kind'])}) · {note}<br>{link(v['release'], v['url'])}<br>"
                    f"{escape(v['locator'])}. {escape(v['agency'])}. Accessed {day(v['accessed'])}. "
                    f"{link(v['licence'], v['licence_url'])}.</li>")
    r["body_html"] = (
        f"<h2>What changes on a sample slide?</h2><p>{escape(r['slide_impact'])}</p>"
        f"<p>First to current: {r['direction']} · {amount(abs(delta), s['unit'])}. {escape(comparison_text(r))}</p>"
        f"<h2>Release history</h2><ol>{''.join(rows)}</ol><h2>Sources</h2>"
        + credits(r) + f"<p>Last checked {day(r['last_checked'])}. "
        + link(label, f"/indicators/{sid}/") + " · " + link("How corrections work", "/how-corrections-work/") +
        ".</p>" + actions(r))
    return r


def next_release(calendar, sid, as_of):
    matches = [r for r in calendar["releases"] if sid in r["tracked_series"] and r.get("end_date", r["date"]) >= as_of]
    if not matches:
        return [], f"No upcoming release is listed in the calendar checked on {day(calendar['accessed'])}."
    earliest = min(r["date"] for r in matches)
    matches = [r for r in matches if r["date"] == earliest]
    phrases = []
    for r in matches:
        when = day(r["date"])
        if r["date_type"] == "window":
            when += f" to {day(r['end_date'])} (release window)"
        elif r["date_type"] == "no_later_than":
            when = "by " + when
        if r.get("time_sgt"):
            when += " at " + r["time_sgt"] + " SGT"
        phrases.append(f"{r['release']} — {when}")
    return matches, ". ".join(phrases) + "."


def indicator(s, stats, calendar, records, as_of):
    sid, unit = s["series_id"], s["unit"]
    label, category, description = profile(sid)
    events, schedule = next_release(calendar, sid, as_of)
    matching = sorted(records, key=lambda r: r["period"], reverse=True)
    num, denom = stats["revised_periods"], stats["comparable_periods"]
    # Block mixed editions if the archive grows before its summary is rebuilt.
    expected = (denom, num, stats["ever_revised_periods"], stats["sign_or_threshold_crossings"])
    actual = (len(matching), sum(r["net_change"] != 0 for r in matching), sum(r["ever_revised"] for r in matching),
              sum(r["crossed_sign"] or r["crossed_threshold"] for r in matching))
    if actual != expected or s["revision_threshold"] != stats["threshold"]:
        raise ValueError(f"Archive and statistics disagree for {sid}: {actual} vs {expected}")
    mean = stats["mean_absolute_revision"]
    avg = f"{mean:,.0f} people" if unit == "persons" else f"{mean:.2f} percentage points"
    freq = (f"The current figure differs from the first in {num} of {denom} comparable quarters. "
            f"Across those {denom} quarters the absolute change averaged about {avg} "
            f"and reached {amount(stats['maximum_absolute_revision'], unit)} at most.")
    r = dict(slug=sid, path=f"/indicators/{sid}/", title=label, category=category, description=description,
             frequency_summary=freq, **{k:v for k,v in stats.items() if k != "series_id"},
             next_release=schedule, calendar_entries=events, revision_paths=[r["path"] for r in matching],
             last_checked=as_of, **source_fields(s["source"]))
    sources = " · ".join(link(k, url) for k,url in dict.fromkeys(
        (k, e[field]) for e in events for k,field in (("Release calendar","url"), ("Official announcement","announcement_url"))
        if field in e))
    r["body_html"] = (f"<h2>How often does it change?</h2><p>{escape(freq)}</p>"
                      f"<p>{stats['ever_revised_periods']} of {denom} comparable quarters changed at least once between releases. "
                      f"Each quarter counts once in the average, including a zero change. {link('How corrections work', '/how-corrections-work/')}.</p>"
                      f"<h2>Next scheduled release</h2><p>{escape(schedule)} {sources}</p>"
                      f"<p>Calendar checked {day(calendar['accessed'])}. A scheduled release can repeat an earlier figure.</p>"
                      "<h2>Quarters with comparable figures</h2><ul>" +
                      "".join(f"<li>{link(row['title'],row['path'])}</li>" for row in matching) +
                      "</ul><h2>Sources</h2>" + credits(r) + f"<p>Last checked {day(as_of)}.</p>" + actions(r))
    return r


def write_collection(name, records):
    dest = SITE / "collections"
    dest.mkdir(exist_ok=True)
    (dest / f"{name}.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (dest / f"{name}.csv").open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=records[0].keys())
        writer.writeheader()
        for record in records:
            writer.writerow({k: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, bool)) else v
                             for k,v in record.items()})


def main():
    stats = read(DATA / "revision-stats.json")
    calendar = read(DATA / "release-calendar.json")
    by_id = {s["series_id"]: s for s in stats["series"]}
    revisions, indicators = [], []
    for path in sorted((DATA / "series").glob("*.json")):
        s = read(path)
        records = [revision(s, obs, s["revision_threshold"]) for obs in s["observations"] if len(obs["vintages"]) >= 2]
        revisions.extend(records)
        indicators.append(indicator(s, by_id[s["series_id"]], calendar, records, stats["as_of"]))
    if {i["slug"] for i in indicators} != by_id.keys() or len(revisions) != len({r["slug"] for r in revisions}):
        raise ValueError("Series inventory or unique record slugs failed to reconcile")
    write_collection("revisions", revisions)
    write_collection("indicators", indicators)
    write_schema(SITE, revisions, indicators)
    build_pages(SITE, revisions, indicators, stats["as_of"])
    print(f"Built {len(revisions)} comparable quarters across {len(indicators)} indicators (checked {stats['as_of']}).")


if __name__ == "__main__":
    main()
