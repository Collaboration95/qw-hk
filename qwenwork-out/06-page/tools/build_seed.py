#!/usr/bin/env python3
"""Build seed.json for the Recall Press Page by parsing the project's data files.

Sources (all parsed, nothing hand-typed):
  data/series/*.json                  -> series + vintages
  workspace/demo-dg50o917/workspace/register.json
                                      -> publications + claims (register produced by
                                         parsing the attached sample documents)
  data/cases/A.json, data/cases/B.json -> replay answer keys
  data/release-calendar.json          -> releases
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]  # qw-hk project root
OUT = Path(__file__).resolve().parents[1] / "app" / "seed.json"

TYPES = {".pptx": "PPTX", ".docx": "DOCX", ".md": "MD", ".pdf": "PDF"}


def main():
    series, vintages = [], []
    for path in sorted((ROOT / "data" / "series").glob("*.json")):
        d = json.loads(path.read_text())
        series.append({
            "id": d["series_id"],
            "title": d["title"],
            "unit": d["unit"],
            "agency": d["source"]["agency"],
            "dataset_url": d["source"]["dataset_url"],
        })
        for obs in d["observations"]:
            for v in obs["vintages"]:
                vintages.append({
                    "id": f"v-{d['series_id']}-{obs['period']}-{v['published']}",
                    "series_id": d["series_id"],
                    "period": obs["period"],
                    "value": v["value"],
                    "published_on": v["published"],
                    "source_title": v["release"],
                    "source_url": v["url"],
                    "locator": v.get("locator", ""),
                })

    register = json.loads((ROOT / "workspace" / "demo-dg50o917" / "workspace" / "register.json").read_text())
    publications, claims = [], []
    for doc in register["documents"]:
        p = Path(doc["path"])
        publications.append({
            "id": doc["document_id"],
            "title": doc["title"],
            "type": TYPES.get(p.suffix.lower(), p.suffix.lstrip(".").upper()),
            "published_on": doc["registered"],
            "file_name": p.name,
        })
    for c in register["claims"]:
        claims.append({
            "id": c["claim_id"],
            "publication_id": c["document_id"],
            "sentence": c["sentence"],
            "series_id": c["series_id"],
            "period": c["period"],
            "value_cited": c["value_cited"],
            "vintage_cited": c["vintage_cited"],
            "stance": c["stance"],
            "assertion": c["assertion"],
            "location": c.get("location", ""),
        })

    calendar = json.loads((ROOT / "data" / "release-calendar.json").read_text())
    releases = []
    for i, r in enumerate(calendar["releases"]):
        releases.append({
            "id": f"rel-{i:03d}",
            "date": r["date"],
            "release": r["release"],
            "date_type": r["date_type"],
            "url": r["url"],
            "tracked_series": r.get("tracked_series", []),
            "time_sgt": r.get("time_sgt"),
            "end_date": r.get("end_date"),
            "announcement_url": r.get("announcement_url"),
        })

    cases = {}
    for cid in ("A", "B"):
        cases[cid] = json.loads((ROOT / "data" / "cases" / f"{cid}.json").read_text())

    seed = {
        "series": series,
        "vintages": vintages,
        "publications": publications,
        "claims": claims,
        "releases": releases,
        "cases": cases,
        "calendar_timezone": calendar.get("timezone", "Asia/Singapore"),
    }
    OUT.write_text(json.dumps(seed, ensure_ascii=False, indent=1))
    print(f"series={len(series)} vintages={len(vintages)} publications={len(publications)} "
          f"claims={len(claims)} releases={len(releases)} -> {OUT}")


if __name__ == "__main__":
    main()