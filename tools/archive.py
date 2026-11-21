"""Local storage, publication statistics and units used by both archive commands."""
import json
import os
import tempfile
from decimal import Decimal
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
LICENCE = "Singapore Open Data Licence v1.0"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path, obj):
    content = json.dumps(obj, ensure_ascii=False, allow_nan=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as f:
        tmp = Path(f.name)
        try:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
            f.close()
            tmp.chmod(path.stat().st_mode & 0o777 if path.exists() else 0o644)
            os.replace(tmp, path)
        finally:
            tmp.unlink(missing_ok=True)


def revision_statistics(series):
    rows = []
    for entry in sorted(series, key=lambda s: s["series_id"]):
        threshold = entry["revision_threshold"]
        deltas = []
        sign_crossings = threshold_crossings = either = ever = 0
        for obs in entry["observations"]:
            vs = [Decimal(str(v["value"])) for v in obs["vintages"]]
            if len(vs) < 2:
                continue
            first, last = vs[0], vs[-1]
            deltas.append(abs(last - first))
            ever += len(set(vs)) > 1
            sign = first.compare(0) != last.compare(0)
            cross = (first < threshold) != (last < threshold)
            sign_crossings += sign
            threshold_crossings += cross
            either += sign or cross
        count = len(deltas)
        changed = sum(x != 0 for x in deltas)
        rows.append(dict(
            series_id=entry["series_id"], periods=len(entry["observations"]),
            comparable_periods=count, single_vintage_periods=len(entry["observations"]) - count,
            revised_periods=changed, ever_revised_periods=ever,
            fraction_revised=round(changed / count, 6) if count else None,
            mean_absolute_revision=float(round(sum(deltas) / count, 6)) if count else None,
            maximum_absolute_revision=float(max(deltas)) if count else None,
            revision_unit="percentage points" if entry["unit"] == "%" else entry["unit"],
            threshold=threshold, sign_crossings=sign_crossings,
            threshold_crossings=threshold_crossings, sign_or_threshold_crossings=either,
        ))
    return {
        "as_of": max(v["accessed"] for s in series for o in s["observations"] for v in o["vintages"]),
        "method": "Each period with at least two dated vintages has equal weight. Compare its first archived value with its latest. Absolute revisions include unchanged periods. A sign crossing changes the sign category (negative, zero, positive). A threshold crossing changes the truth of value < threshold. Thresholds are illustrative briefing cutoffs in the original unit. Ever-revised counts any change between releases, including changes later reversed.",
        "series": rows,
    }
