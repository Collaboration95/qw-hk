#!/usr/bin/env python3
"""Refresh the archive from data.gov.sg. Historical release URLs are never requested."""
import argparse
import calendar
import fcntl
import json
import math
import os
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

from archive import DATA, LICENCE, read, revision_statistics, save

SGT = timezone(timedelta(hours=8))
RESOURCE = re.compile(r"d_[0-9a-f]{32}")


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url):
    client = build_opener(NoRedirect())
    for attempt in range(5):
        try:
            req = Request(url, headers={"User-Agent": "Economic-Statistics/1.0", "Accept": "application/json"})
            with client.open(req, timeout=30) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code != 429 or attempt == 4:
                raise
            wait = 2 ** (attempt + 1)
            retry = error.headers.get("Retry-After", "").strip()
            if retry.isdigit():
                wait = max(wait, int(retry))
            elif retry:
                wait = max(wait, math.ceil(parsedate_to_datetime(retry).timestamp() - time.time()))
            if wait > 120:
                raise ValueError(f"HTTP 429; retry after {wait}s") from error
            print(f"HTTP 429; waiting {wait}s before retry", file=sys.stderr, flush=True)
            time.sleep(wait)


def dataset(resource):
    if not RESOURCE.fullmatch(resource):
        raise ValueError(f"Invalid resource ID {resource!r}")
    metadata_url = f"https://api-open.data.gov.sg/v2/public/api/datasets/{resource}/metadata"
    meta = fetch(metadata_url)["data"]
    if meta["datasetId"] != resource:
        raise ValueError(f"Unexpected metadata resource for {resource}")
    updated = datetime.fromisoformat(meta["lastUpdatedAt"]).astimezone(SGT).date().isoformat()
    rows = []
    while True:
        query = {"resource_id": resource, "limit": 100}
        if rows:
            query["offset"] = len(rows)
        url = "https://data.gov.sg/api/action/datastore_search?" + urlencode(query)
        body = fetch(url)
        result = body["result"]
        if not body["success"] or result["resource_id"] != resource:
            raise ValueError(f"Unexpected datastore response for {resource}")
        chunk = result["records"]
        rows.extend((record, url) for record in chunk)
        if len(rows) == result["total"]:
            return updated, rows
        if not chunk or len(rows) > result["total"]:
            raise ValueError(f"Incomplete paging for {resource}")


def period_key(field, frequency):
    if frequency == "quarterly":
        match = re.fullmatch(r"(\d{4})([1-4])Q", field)
        return f"{match[1]}-Q{match[2]}" if match else None
    match = re.fullmatch(r"(\d{4})([A-Z][a-z]{2})", field)
    if match and match[2] in calendar.month_abbr:
        return f"{match[1]}-{list(calendar.month_abbr).index(match[2]):02d}"
    return None


def apply_values(series, snapshot, day):
    src = series["source"]
    updated, rows = snapshot
    if updated > day:
        raise ValueError(f"{series['series_id']} dataset metadata is dated in the future")
    matches = [(row, url) for row, url in rows if row.get(src["api_row_field"], "").strip() == src["api_row"]]
    if len(matches) != 1:
        raise ValueError(f"{series['series_id']} expected one row matching {src['api_row']!r}, found {len(matches)}")
    row, url = matches[0]
    known = {o["period"]: o for o in series["observations"]}
    if not known:
        raise ValueError(f"{series['series_id']} needs a verified starting period")
    fields = {p: k for k in row if (p := period_key(k, src["frequency"]))}
    missing = sorted(known.keys() - fields.keys())
    if missing:
        raise ValueError(f"{series['series_id']} API missing archived period(s) {', '.join(missing)}")
    changes = []
    first_tracked = min(known)
    for period in sorted(p for p in fields if p >= first_tracked):
        key = fields[period]
        raw = row[key]
        if raw is None or str(raw).strip().lower() in {"", "na", "n.a.", "-"}:
            if period in known:
                raise ValueError(f"{series['series_id']} {period} has no published API value")
            continue
        value = float(raw)
        if not math.isfinite(value):
            raise ValueError(f"{series['series_id']} {period} has a non-finite API value")
        obs = known.get(period)
        old = obs["vintages"][-1] if obs else None
        if old and old["value"] == value:
            continue
        if old and (updated < old["published"] or day <= old["published"]):
            raise ValueError(f"{series['series_id']} {period} conflicting same-day or stale snapshot")
        if not obs:
            obs = {"period": period, "vintages": []}
            series["observations"].append(obs)
        obs["vintages"].append({
            "value": value, "published": day, "release": "data.gov.sg snapshot, first observed on this date",
            "url": url, "quote": str(raw), "accessed": day, "locator": f"{src['api_row']} / {key}",
            "agency": src["agency"], "licence": LICENCE, "licence_url": src["licence_url"],
            "dataset_updated": updated,
        })
        before = str(old["value"]) if old else "new period"
        changes.append(f"{series['series_id']} {period} {before} -> {value} {series['unit']}")
    series["observations"].sort(key=lambda o: o["period"])
    return changes


def refresh(directory, dry_run):
    # A directory lock survives atomic file replacement and creates no lockfile on a quiet run.
    fd = os.open(directory / "series", os.O_RDONLY)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        paths = sorted((directory / "series").glob("*.json"))
        if not paths:
            raise ValueError("No series files found")
        sources, cache, changes = [], {}, []
        day = datetime.now(SGT).date().isoformat()
        for path in paths:
            obj = read(path)
            resource = obj["source"]["api_resource_id"]
            if resource not in cache:
                cache[resource] = dataset(resource)
            changes.extend(apply_values(obj, cache[resource], day))
            sources.append(obj)
        stats = revision_statistics(sources)
        for line in changes:
            print(line)
        if not dry_run:
            for path, obj in zip(paths, sources):
                save(path, obj)
            save(directory / "revision-stats.json", stats)
        action = "would append" if dry_run else "appended"
        print(f"{len(paths)} series, {len(cache)} API resources, {action} {len(changes)} vintages")
    finally:
        os.close(fd)


if __name__ == "__main__":
    from pathlib import Path

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DATA)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        refresh(args.data_dir, args.dry_run)
    except (KeyError, ValueError, OSError, URLError) as exc:
        parser.exit(1, f"Refresh failed: {exc}\n")
