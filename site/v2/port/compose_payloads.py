"""Compose one ready-to-send Hashmeta payload per page into payload3/<pageId>.json.

Run after render_v2.py, build_port.py and build_more.py. Each file holds
{pageId, slug, layout, meta?}; a porting agent passes layout and meta to update_page as is.
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE / "payload3"


def main():
    OUT.mkdir(exist_ok=True)
    m = json.loads((HERE / "manifest.json").read_text())
    done = []
    for p in m["pages"]:
        k = p["kind"]
        if k in ("figure", "indicator"):
            meta = json.loads((HERE / p["meta"]).read_text())
            body = (HERE / p["file"]).read_text()
            layout = [
                {"blockType": "rawHtml", "html": meta["jsonld_block_html"], "containerWidth": "none"},
                {"blockType": "rawHtml", "html": body, "containerWidth": "full"},
            ]
            d = {"pageId": p["pageId"], "slug": p["slug"], "layout": layout, "meta": meta["meta"]}
        elif k == "home":
            d = {"pageId": 1, "slug": "home", "layout": json.loads((HERE / "home.json").read_text())}
        elif k == "cover":
            d = {"pageId": 3, "slug": "cover-my-briefing",
                 "layout": json.loads((HERE / "cover.json").read_text()), "meta": p["meta"]}
        else:
            continue
        (OUT / f"{d['pageId']}.json").write_text(json.dumps(d, ensure_ascii=False))
        done.append(d["pageId"])
    for pid in (4, 6, 7, 8, 10):  # written by build_more.py
        (OUT / f"{pid}.json").write_text((HERE / "payload" / f"{pid}.json").read_text())
        done.append(pid)
    print(f"{len(done)} payloads in {OUT}")


if __name__ == "__main__":
    main()
