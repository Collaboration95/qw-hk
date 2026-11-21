#!/usr/bin/env python3
"""Check archive provenance, coverage, revision statistics and dated answer keys offline."""
import argparse
import math
import operator
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

from archive import DATA, LICENCE, read, revision_statistics


def require(condition, message):
    if not condition:
        raise ValueError(message)


def fields(obj, required):
    require(isinstance(obj, dict), "expected a JSON object")
    for key in required.split():
        require(key in obj, f"missing field {key}")
        require(obj[key] is not None and obj[key] != "", f"empty field {key}")


def iso(day):
    require(isinstance(day, str) and date.fromisoformat(day).isoformat() == day, f"invalid ISO date {day}")
    return day


def url(value):
    require(isinstance(value, str), f"invalid source URL {value!r}")
    parts = urlsplit(value)
    require(parts.scheme == "https" and (parts.hostname or "").endswith(".gov.sg")
            and not parts.username and not parts.password,
            f"invalid source URL {value}")


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def period_number(period, frequency):
    if frequency == "quarterly":
        m = re.fullmatch(r"(\d{4})-Q([1-4])", period)
        require(m, f"invalid quarter {period}")
        return 4 * int(m[1]) + int(m[2])
    m = re.fullmatch(r"(\d{4})-(0[1-9]|1[0-2])", period)
    require(m, f"invalid month {period}")
    return 12 * int(m[1]) + int(m[2])


def inspect_series(path, obj):
    fields(obj, "series_id title unit source observations revision_threshold")
    sid = obj["series_id"]
    require(sid == path.stem and re.fullmatch(r"[a-z0-9-]+", sid), "filename and series_id must match")
    require(all(isinstance(obj[k], str) and obj[k].strip() for k in ("title", "unit")), "invalid title/unit")
    require(number(obj["revision_threshold"]), "invalid revision threshold")
    src = obj["source"]
    fields(src, "agency dataset dataset_url api_resource_id licence dataset_id api_row api_row_field frequency licence_url accessed")
    rid = src["api_resource_id"]
    require(re.fullmatch(r"d_[0-9a-f]{32}", rid) and rid == src["dataset_id"], "invalid resource mapping")
    require(src["dataset_url"] == f"https://data.gov.sg/datasets/{rid}/view", "dataset_url does not identify resource")
    require(src["licence"] == LICENCE and src["licence_url"] == "https://data.gov.sg/open-data-licence", "check dataset licence")
    require(src["frequency"] in ("monthly", "quarterly"), "unrecognised frequency")
    iso(src["accessed"])
    require(isinstance(obj["observations"], list) and obj["observations"], "no observations")
    previous = None
    singles, holes = [], []
    for o in obj["observations"]:
        fields(o, "period vintages")
        index = period_number(o["period"], src["frequency"])
        require(previous is None or index > previous, f"duplicate or unsorted period {o['period']}")
        if previous is not None and index > previous + 1:
            holes.append(f"{index - previous - 1} period(s) missing before {o['period']}")
        previous = index
        vs = o["vintages"]
        require(isinstance(vs, list) and vs, f"no vintages for {o['period']}")
        if len(vs) == 1:
            singles.append(o["period"])
        last = ""
        for v in vs:
            fields(v, "value published release url quote accessed")
            require(number(v["value"]), f"invalid value at {o['period']}")
            for k in ("release", "quote"):
                require(isinstance(v[k], str) and bool(v[k].strip()), f"missing {k} at {o['period']}")
            require(last < iso(v["published"]) <= iso(v["accessed"]), f"duplicate or misdated vintage at {o['period']}")
            url(v["url"])
            if "licence_url" in v:
                url(v["licence_url"])
            last = v["published"]
    return singles, holes


VERDICTS = {"number_only", "now_wrong", "still_true", "unaffected"}


def predicate(assertion, value):
    if assertion["type"] == "direction":
        return assertion["detail"] == ("up" if value > 0 else "down" if value < 0 else "flat")
    if assertion["type"] == "threshold":
        comparison = {"<": operator.lt, "<=": operator.le, ">": operator.gt, ">=": operator.ge}
        return comparison[assertion["operator"]](value, assertion["threshold"])
    return None


def inspect_case(path, case, series):
    fields(case, "case_id registered_on claims checks")
    require(case["case_id"] == path.stem, "case ID differs from filename")
    registration = iso(case["registered_on"])
    claims = {}
    for c in case["claims"]:
        fields(c, "claim_id sentence series_id period value_cited vintage_cited stance assertion")
        require(c["claim_id"] not in claims, "duplicate claim ID")
        require(c["stance"] in ("dated", "current"), "invalid stance")
        fields(c["assertion"], "type detail")
        require(c["assertion"]["type"] in {"direction", "threshold", "level", "comparison", "rank"}, "invalid assertion")
        vs = next((o["vintages"] for o in series[c["series_id"]]["observations"] if o["period"] == c["period"]), [])
        cited = next((v for v in vs if v["published"] == c["vintage_cited"]), None)
        require(cited and cited["published"] <= registration and cited["value"] == c["value_cited"],
                f"citation disagrees with release for {c['claim_id']}")
        require(predicate(c["assertion"], cited["value"]) is not False, "assertion already false at citation")
        claims[c["claim_id"]] = (c, vs)
    require(claims and case["checks"], "case requires claims and checks")
    if path.parent.name == "holdout":
        require(len(claims) >= 4 and len({c["series_id"] for c, _ in claims.values()}) >= 2,
                "held-out document requires four claims and two series")
    last = registration
    for check in case["checks"]:
        fields(check, "as_of no_change repeat expected")
        day = iso(check["as_of"])
        require(day >= last, "checks out of order")
        ids = [e["claim_id"] for e in check["expected"]]
        require(sorted(ids) == sorted(claims), "each registered claim needs exactly one verdict")
        any_change = False
        for e in check["expected"]:
            fields(e, "status reason")
            c, vs = claims[e["claim_id"]]
            before = next(v for v in reversed(vs) if v["published"] <= last)
            after = next(v for v in reversed(vs) if v["published"] <= day)
            moved = before["value"] != after["value"]
            any_change |= moved
            status = e["status"]
            require(status in VERDICTS, "invalid verdict")
            require((status == "unaffected") == (not moved), "unaffected verdict disagrees with archived movement")
            if moved:
                require((c["stance"] == "dated") == (status == "still_true"), "dated verdict disagrees with stance")
                truth = predicate(c["assertion"], after["value"])
                if c["stance"] == "current" and truth is not None:
                    require(status == ("number_only" if truth else "now_wrong"),
                            "verdict disagrees with the revised direction or threshold")
        require(check["no_change"] is (not any_change), "no_change disagrees with registered observations")
        last = day


def inspect_calendar(calendar, archive):
    fields(calendar, "accessed timezone window_start window_end releases")
    start, end = iso(calendar["window_start"]), iso(calendar["window_end"])
    require(iso(calendar["accessed"]) <= end and start <= end, "invalid calendar window")
    require(calendar["timezone"] == "Asia/Singapore" and calendar["releases"], "invalid release calendar")
    for event in calendar["releases"]:
        fields(event, "date release date_type url accessed tracked_series")
        day = iso(event["date"])
        require(start <= day <= end, "release start outside requested window")
        require(iso(event["accessed"]) <= day, "release postdates its scheduled evidence")
        require(event["date_type"] in {"scheduled", "no_later_than", "window"}, "invalid date type")
        if event["date_type"] == "window":
            require(iso(event["end_date"]) >= day, "invalid release date range")
        require(set(event["tracked_series"]) <= set(archive), "unknown calendar series")
        url(event["url"])
        if "announcement_url" in event:
            url(event["announcement_url"])


def verify(directory):
    archive = {}
    singles, gaps, errors = [], [], []
    for path in sorted((directory / "series").glob("*.json")):
        try:
            obj = read(path)
            one, missing = inspect_series(path, obj)
            singles.extend((path.stem, period) for period in one)
            gaps.extend(f"{path.stem}: {note}" for note in missing)
            archive[obj["series_id"]] = obj
        except (KeyError, TypeError, ValueError, OSError) as exc:
            errors.append(f"{path.name}: {exc}")
    cases = sorted((directory / "cases").glob("*.json"))
    held = sorted((directory / "cases" / "holdout").glob("*.json"))
    for path in cases + held:
        try:
            inspect_case(path, read(path), archive)
        except (KeyError, StopIteration, TypeError, ValueError, OSError) as exc:
            errors.append(f"{path.name}: {exc}")
    if len(archive) < 8 or not {"A", "B", "C"}.issubset({p.stem for p in cases}) or len(cases) < 9 or len(held) < 3:
        errors.append("required series or answer keys missing")
    if archive:
        try:
            inspect_calendar(read(directory / "release-calendar.json"), archive)
            require(read(directory / "revision-stats.json") == revision_statistics(list(archive.values())),
                    "revision-stats.json disagrees with the archive")
        except (KeyError, TypeError, ValueError, OSError) as exc:
            errors.append(str(exc))
    obs = [o for s in archive.values() for o in s["observations"]]
    print(f"{len(archive)} series, {len(obs)} periods across series, {sum(len(o['vintages']) for o in obs)} vintages")
    print(f"{len(cases)} public cases, {len(held)} held-out cases")
    for note in gaps:
        print("Coverage gap:", note)
    for period in sorted({p for _, p in singles}):
        print(f"Awaiting second vintage: {period} in {sum(p == period for _, p in singles)} series")
    for error in errors:
        print("ERROR:", error, file=sys.stderr)
    print(f"{len(errors)} validation errors, {len(gaps)} internal period gaps")
    return int(bool(errors or gaps))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DATA)
    sys.exit(verify(parser.parse_args().data_dir))
