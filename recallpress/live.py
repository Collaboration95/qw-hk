"""Refresh registered observations from data.gov.sg only."""
import calendar
import json
import math
import re
import time
from datetime import datetime, timedelta, timezone
from http.client import HTTPException
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import HTTPRedirectHandler, Request, build_opener

from .storage import save


SGT = timezone(timedelta(hours=8))


def observed_today():
    return datetime.now(SGT).date().isoformat()


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def fetch(url):
    opener = build_opener(NoRedirect())
    for attempt in range(3):
        try:
            request = Request(url, headers={"User-Agent": "statistics-client/1.0", "Accept": "application/json"})
            with opener.open(request, timeout=15) as conn:
                return json.load(conn)
        except HTTPError as exc:
            if exc.code != 429 or attempt == 2:
                raise ValueError(f"Official source unavailable (HTTP {exc.code}): {url}") from exc
            retry = exc.headers.get("Retry-After", "")
            if retry and (not retry.isdigit() or int(retry) > 30):
                raise ValueError(f"Official source rate-limited; retry after {retry}") from exc
            time.sleep(max(2 ** attempt, int(retry or 0)))
        except (HTTPException, OSError, URLError, ValueError) as exc:
            raise ValueError(f"Official source unavailable: {url} ({exc})") from exc


def dataset(resource):
    if not re.fullmatch(r"d_[a-f0-9]{32}", resource):
        raise ValueError(f"Missing or invalid data.gov.sg resource identifier: {resource!r}")
    meta_url = f"https://api-open.data.gov.sg/v2/public/api/datasets/{resource}/metadata"
    response = fetch(meta_url)
    metadata = response.get("data") if isinstance(response, dict) else None
    if not isinstance(metadata, dict) or not isinstance(metadata.get("lastUpdatedAt"), str):
        raise ValueError("The official source returned incomplete information about the table.")
    if metadata.get("datasetId") != resource:
        raise ValueError(f"Unexpected official metadata for {resource}")
    published = datetime.fromisoformat(metadata["lastUpdatedAt"]).astimezone(SGT).date().isoformat()
    records = []
    while True:
        args = urlencode({"resource_id": resource, "limit": 100, "offset": len(records)})
        payload = fetch("https://data.gov.sg/api/action/datastore_search?" + args)
        table = payload.get("result") if isinstance(payload, dict) and payload.get("success") else None
        if not isinstance(table, dict) or table.get("resource_id") != resource:
            raise ValueError(f"Official datastore query failed for {resource}")
        chunk = table.get("records")
        if not isinstance(chunk, list) or not all(isinstance(r, dict) for r in chunk) or not str(table.get("total")).isdigit():
            raise ValueError("The official table returned incomplete rows. Try the check again later.")
        records.extend(chunk)
        if len(records) >= int(table["total"]):
            break
        if not chunk:
            raise ValueError(f"Incomplete table returned for {resource}")
    return published, records


def column_for(period, record):
    aliases = [period]
    if re.fullmatch(r"\d{4}-Q[1-4]", period):
        year, quarter = period.split("-Q")
        aliases.extend([year + quarter + "Q", year + "Q" + quarter])
    if re.fullmatch(r"\d{4}-\d\d", period):
        year, month = period.split("-")
        aliases.extend([year + month, year + calendar.month_abbr[int(month)]])
    matches = [k for k in record if k.lower().replace(" ", "") in {a.lower() for a in aliases}]
    if len(matches) != 1:
        raise ValueError(f"Missing or ambiguous table column for {period}")
    return matches[0]


def source_row(series, records):
    source = series["source"]
    label = source.get("api_row") or source.get("row_label") or series.get("row_label")
    if not isinstance(label, str):
        raise ValueError(f"No verified live row mapping for {series['series_id']}")
    rows = [r for r in records if str(r.get(source.get("api_row_field", "DataSeries"), "")).strip().casefold() == label.strip().casefold()]
    if len(rows) != 1:
        raise ValueError(f"Expected one official row for {label!r}, found {len(rows)}")
    return rows[0]


def refresh(directory, archive, pairs):
    cache, updates = {}, {}
    observed = observed_today()
    for sid, period in sorted(set(pairs)):
        series = archive[sid]
        resource = series["source"]["api_resource_id"]
        if resource not in cache:
            cache[resource] = dataset(resource)
        published, records = cache[resource]
        record = source_row(series, records)
        key = column_for(period, record)
        value = float(record[key])
        if not math.isfinite(value):
            raise ValueError(f"Invalid official value for {sid} {period}")
        obs = next(o for o in series["observations"] if o["period"] == period)
        prev = obs["vintages"][-1]
        if value == prev["value"]:
            continue
        if published > observed or published < prev["published"] or observed <= prev["published"]:
            raise ValueError(f"Conflicting or stale official data for {sid} on {published}")
        src = series["source"]
        vintage = {"published": observed, "value": value, "release": "data.gov.sg snapshot, first observed on this date",
                   "dataset_updated": published, "url": src["dataset_url"], "accessed": observed, "quote": str(record[key]),
                   "locator": f"{src.get('api_row', '')} / {key}", "agency": src["agency"], "licence": src["licence"]}
        updates.setdefault(sid, {})[period] = vintage
    # Verify every requested observation before recording any fetched data.
    for sid, periods in updates.items():
        series = archive[sid]
        for obs in series["observations"]:
            if obs["period"] in periods:
                obs["vintages"].append(periods[obs["period"]])
        save(directory / f"{sid}.json", series)
    return bool(updates)
