# Porting v3 to Hashmeta (instructions for porting agents)

Site projectId: `6b7c9fea-8970-469b-871a-1eb4f8db9601`. Publish mode is manual: your saves only STAGE changes.
**Never call publish_changes.** The orchestrator publishes once at the end.

## Pages
For each pageId you were given:
1. Run `python3 site/v2/port/compose_payloads.py` once (the orchestrator does this). Read `site/v2/port/payload3/<pageId>.json` (keys: pageId, slug, layout, optional meta).
2. Call `mcp__hashmeta__update_page` with `projectId`, `pageId`, `layout` = the file's `layout` array exactly as is
   (do not edit, reformat or drop any block or field), and `meta` = the file's `meta` if present.
   Do not pass `_status`, `slug`, `title` or `parent`.
3. If a call fails, retry once. If it fails again, note the error and move on.

Load the tool first with ToolSearch `select:mcp__hashmeta__update_page`. Pass the JSON values exactly as they appear
in the file. The HTML strings are long; copy them exactly (a Python one-liner printing `json.dumps(d["layout"])` is a
good way to get the exact value).

## Report
One line per page: `pageId ok` or `pageId FAILED <error>`. Nothing else.
