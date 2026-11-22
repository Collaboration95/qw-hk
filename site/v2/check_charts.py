"""python3 site/v2/check_charts.py: every step chart point's x must match its release date on a linear axis
(first estimate = left edge, latest release = axis end, where the 'now' dot sits). Prints the hero figure's points."""
import re
import render_v2 as R

SIZES = {"figure wide": (680, 250, 15, None), "figure narrow": (358, 220, 13, None), "home wide": (640, 250, 14, None),
         "home narrow": (358, 210, 13, None), "how wide": (560, 210, 13, None), "indicator card": (360, 176, 15, "v")}
entries = R.load()
worst = 0.0
for e in entries:
    vr = None
    six = [x for x in entries if x["series_id"] == e["series_id"]]
    vals = [v["value"] for x in six for v in x["vintages"]]
    for name, (w, h, fs, shared) in SIZES.items():
        g = R.chart_geometry(e, w, h, fs, "now", (min(vals), max(vals)) if shared else None)
        t0, t1, x0, x1 = g["t0"], g["t1"], g["padl"], g["x_end"]
        for x, y, v in g["pts"]:
            want = x0 + (R._days(v["published"]) - t0) / (t1 - t0) * (x1 - x0) if t1 > t0 else x1
            worst = max(worst, abs(x - want))
        assert abs(g["pts"][-1][0] - x1) < 1e-6, e["slug"]               # now dot at the axis end
        assert g["y_top"] - 1e-6 <= min(p[1] for p in g["pts"]), e["slug"]  # inside the plot
        assert max(p[1] for p in g["pts"]) <= g["y_base"] + 1e-6, e["slug"]
        if shared:
            top = max(v["value"] for v in e["vintages"])
            if top == max(vals):
                assert abs(g["Y"](top) - g["y_top"]) < 1e-6  # scale max -> plot top
        svg = R.step_svg(e, w, h, fs, v_range=(min(vals), max(vals)) if shared else None)
        path = re.search(r'class="flat" d="([^"]*)"', svg)
        if path:  # no line past the now dot
            ends = [float(m) for m in re.findall(r"H([\d.]+)", path.group(1))]
            assert max(ends) <= x1 + 0.05, (e["slug"], name, max(ends), x1)
print(f"60 figures x 6 chart sizes: max |x - x(date)| = {worst:.4f}px; now dot = axis end on every chart; no line past it")
hero = next(e for e in entries if e["slug"] == "sg-gdp-manufacturing-yoy-2025-q3")
for name in ("figure wide", "figure narrow"):
    w, h, fs, _ = SIZES[name]
    g = R.chart_geometry(hero, w, h, fs)
    print(f"\n{name} ({w}px): axis {R.d(hero['vintages'][0]['published'])} x={g['padl']} -> "
          f"{R.d(hero['vintages'][-1]['published'])} x={g['x_end']}")
    for x, y, v in g["pts"]:
        days = R._days(v["published"]) - g["t0"]
        print(f"  {v['published']}  day {days:>3}  x={x:7.2f}  ({(x - g['padl']) / (g['x_end'] - g['padl']):.3f} of axis)  {v['value']}")
