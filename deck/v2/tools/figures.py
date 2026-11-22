from datetime import date
from html import escape
import json
from pathlib import Path
import re
import sys

DECK = Path(__file__).resolve().parents[1]
REPO = DECK.parents[1]
SITE = REPO / "site" / "v2"
ASSETS = DECK / "src" / "assets"

sys.dont_write_bytecode = True
sys.path.insert(0, str(SITE))
from render_v2 import LONG, ORDER, d, fmt, q

entries = json.loads((REPO / "site/collections/revisions.json").read_text())
entry = next(e for e in entries if e["slug"] == "sg-gdp-manufacturing-yoy-2025-q3")


def write_chart():
    width, height = 1136, 493
    x_axis, x_first, x_last, x_end = 85, 109, 1032, 1095
    baseline = 388
    readings = [v for v in entry["vintages"] if v["change_from_previous"] != 0]
    first, last = [date.fromisoformat(r["published"]) for r in (readings[0], readings[-1])]
    span = (last - first).days

    def y(value):
        return baseline - 52 * value

    points = []
    for reading in readings:
        offset = (date.fromisoformat(reading["published"]) - first).days
        x = x_first + (x_last - x_first) * offset / span
        points.append((x, y(reading["value"]), reading))

    grid = []
    for val in (0, 2, 4, 6):
        axis_y = y(val)
        grid.append(f'<path d="M{x_axis} {axis_y}H{x_end}" stroke="#dcd8d2"/>')
        grid.append(f'<text x="63" y="{axis_y + 10}" font-size="29" fill="#555" text-anchor="end">{val}%</text>')
    grid.append(f'<path d="M{x_axis} {y(6)}V{baseline}" stroke="#dcd8d2"/>')

    line = [f"M{x_first} {baseline}"]
    marks = []
    for i, (x, point_y, reading) in enumerate(points):
        if i:
            line.append(f"H{x:.1f}V{point_y:.1f}")
        fill = "#fff" if i == 0 else "#111110"
        value = fmt(reading["value"], "percent")
        label_y = point_y + 48 if i == len(points) - 1 else point_y - 26
        day_label, year = d(reading["published"]).rsplit(" ", 1)
        marks.extend([
            f'<circle cx="{x:.1f}" cy="{point_y:.1f}" r="7" fill="{fill}" stroke="#111110" stroke-width="3"/>',
            f'<text x="{x:.1f}" y="{label_y:.1f}" font-size="38" font-weight="650" text-anchor="middle">{value}</text>',
            f'<path d="M{x:.1f} {baseline + 14}v9" stroke="#b7b3ad" stroke-width="2"/>',
            f'<text x="{x:.1f}" y="{height - 43}" font-size="31" fill="#555" text-anchor="middle">{day_label}</text>',
            f'<text x="{x:.1f}" y="{height - 10}" font-size="26" fill="#555" text-anchor="middle">{year}</text>',
        ])
        if i == 0:
            marks.append(f'<text x="{x:.1f}" y="{label_y - 47:.1f}" font-size="29" fill="#555">First estimate</text>')
    line.append(f"H{x_end}")
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">',
           *grid, f'<path d="{"".join(line)}" fill="none" stroke="#111110" stroke-width="3.5" stroke-linejoin="round"/>',
           *marks, "</svg>"]
    (ASSETS / "history.svg").write_text("\n".join(svg) + "\n")


def write_grid():
    periods = sorted({e["period"] for e in entries})
    by = {(e["series_id"], e["period"]): e for e in entries}
    head = "".join(f'<th scope="col">{q(p)}</th>' for p in periods)
    rows = []
    for series in ORDER:
        heading = LONG[series].replace(", year on year", " · YoY").replace(", quarter on quarter", " · QoQ")
        values = []
        for period in periods:
            item = by[series, period]
            style = ' class="grid-focus"' if item is entry else ' class="grid-same"' if not item["ever_revised"] else ""
            values.append(f'<td{style}>{fmt(item["current_value"], item["unit"])}</td>')
        rows.append(f'<tr><th scope="row">{escape(heading)}</th>{"".join(values)}</tr>')
    return "<thead><tr><td></td>" + head + "</tr></thead>\n<tbody>\n" + "\n".join(rows) + "\n</tbody>"


def insert(path, start, end, content):
    page = path.read_text()
    head, body = page.split(start, 1)
    _, tail = body.split(end, 1)
    path.write_text(f"{head}{start}\n{content}\n{end}{tail}")


def brand_assets():
    media = REPO / "docs/media/brand"
    original = (SITE / "src/header.html").read_text()
    fallback = re.search(r'<a class="mark"[^>]*>(<svg.*?</svg>)', original).group(1)
    fallback = fallback.replace('width="20" height="20" ', 'xmlns="http://www.w3.org/2000/svg" ')
    fallback = fallback.replace("#E2502E", "#C93A1B")
    mark = media / "mark.svg"
    lockup = media / "lockup.svg"
    (ASSETS / "mark.svg").write_text(mark.read_text() if mark.exists() else fallback + "\n")
    (ASSETS / "lockup.svg").write_text(lockup.read_text() if lockup.exists() else
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 298 56">'
        + fallback.replace('viewBox="0 0 20 20"', 'width="56" height="56" viewBox="0 0 20 20"')
        + '<text x="74" y="41" font-family="Inter" font-size="37" font-weight="650" letter-spacing="-1.3" fill="#111110">Recall Press</text></svg>\n')


write_chart()
slides = DECK / "src" / "slides"
insert(slides / "07-record.html", "<!-- figures -->", "<!-- /figures -->", write_grid())
brand_assets()
