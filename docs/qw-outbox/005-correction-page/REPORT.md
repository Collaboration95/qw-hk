# Job 005 · Live correction Page — REPORT

## Result
The corrected slide deck from the real QwenWork live check of 21 Nov 2026
(run `2026-11-21-68013a314ad1`) is published as a public QwenWork Page.

- Public URL: https://ka62nv48.qwenwork.page/
- Page name: `Recall Press · live correction`
- Domain: `ka62nv48.qwenwork.page`
- Deployment id: `63a6acd1-bd0d-4396-a40b-e9ba40461223`
- Version: `V1`
- Category: static (single `index.html`, the run's `map.html` copy with an added top banner)
- Model name: not shown by the publisher.

## What was done
1. Created `docs/qw-outbox/005-correction-page/site/` containing only `index.html`,
   a copy of `workspace/qw-morning/runs/2026-11-21-68013a314ad1/map.html` (self-contained;
   corrected decks embedded as base64 data URIs).
2. Inserted a fixed full-width banner at the very top of `<body>` (no other change to the map):
   "Sample publications written by the founder. Figures and sources are official
   (data.gov.sg / SingStat). Produced by a QwenWork live check on 21 Nov 2026,
   run 2026-11-21-68013a314ad1." Plain text, 14px, centered, with a 64px spacer so it
   reads on a phone.
3. Published the folder as a NEW Page (page_action=create, static). Succeeded on first attempt.

## Checks (signed out, via curl with proxy bypass)
- HTTP status: **PASS** — `HTTP=200`
- HTML contains "Members": **PASS** — 2 occurrences
- HTML contains "4.6%": **PASS** — 4 occurrences
- Banner present in served HTML: **PASS** — 1 occurrence of `rp-notice`
- First `download=` data URI decoded to `check.pptx`: **PASS** — 36435 bytes, PK zip magic OK
- python-pptx slide 4 text contains "grew 4.6%": **PASS**

Slide 4 text as decoded from the live page:
```
MANUFACTURING
4 / 6
Manufacturing grew 4.6% year on year in Q3 2025.
Here, output is measured against the same quarter a year earlier. Members can use the annual comparison when discussing activity with suppliers.
Ministry of Trade and Industry · Advance GDP estimates · 14 October 2025
Source: Manufacturing, real GDP growth, year on year, 2025-Q3, 4.6% · Advance GDP estimates — 2026-Q1 · 2026-04-14
```

## Artifacts
- `docs/qw-outbox/005-correction-page/site/index.html` — published source
- `docs/qw-outbox/005-correction-page/check.pptx` — deck decoded from the live page (verification only)

## Notes / assumptions
- The first `download=` anchor in the document belongs to the slide-4 claim
  (`members-briefing-2025q3-c2`, "Manufacturing grew 4.6%"); the second belongs to the
  slide-3 claim (`members-briefing-2025q3-c1`). Verified by section order in the map.
- curl was run with `--noproxy '*'` because this machine's Chrome/shell proxy otherwise
  intercepts requests; the fetch was unauthenticated (signed out).
- No existing project files were modified; all output is under `docs/qw-outbox/005-correction-page/`.
