# Build src/lib/20-grid.json for slide 5: one cell per series-quarter with two or more dated readings,
# changed = any reading differs from the one before it (the "ever revised" count in data/revision-stats.json).
import json, glob, os
root = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "series")
rows = []
for f in sorted(glob.glob(os.path.join(root, "*.json"))):
    s = json.load(open(f)); cells = []
    for o in s["observations"]:
        v = [x["value"] for x in o["vintages"] if x.get("value") is not None]
        if len(v) < 2: continue
        cells.append(int(any(a != b for a, b in zip(v, v[1:]))))
    rows.append({"id": s["series_id"], "cells": cells})
n = sum(len(r["cells"]) for r in rows); c = sum(sum(r["cells"]) for r in rows)
json.dump({"rows": rows, "n": n, "changed": c}, open(os.path.join(os.path.dirname(__file__), "..", "src", "lib", "20-grid.json"), "w"))
print(n, c)
