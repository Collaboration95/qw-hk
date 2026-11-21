# Job 001 · Acceptance test results (batch 1)

- **Model:** QwenWork desktop agent (this session). Bridge scheduled task model: gpt-6.1-sol (flagship, strongest in local list).
- **Start time:** 2026-11-21 15:24 SGT
- **Project:** /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk
- **Skill base:** /Users/speedpowermac/.qwenwork/skills/recall-press

## STEP 1 · Skill — PASS

How I know it is loaded: the `recall-press` skill was loaded through the Skill tool in this task (full SKILL.md injected; base directory `/Users/speedpowermac/.qwenwork/skills/recall-press`). The project also carries a copy at `skills/recall-press/SKILL.md`.

Environment check (exact commands):
```
.venv/bin/python --version            → Python 3.14.7
.venv/bin/python -m pip list --format=freeze
```
Key output: `python-pptx==1.0.2`, `python-docx==1.2.0`, `lxml==6.1.3`, `pillow==13.0.0` — matches the Skill's requirements.txt exactly; no installation needed. `data/series/` already present with all 10 series JSON files.

Sample files the Skill supplies (`$SKILL/samples/`):
- board-paper-2025q3.docx
- committee-note-2026q2.md
- members-briefing-2025q3.pptx
- members-newsletter-2025q3.md
- midyear-briefing-2026q2.pptx
- october-briefing-2026q3.pptx
- sales-outlook-2025q3.pptx
- unseen/roundtable-reading.pptx

Surprise: none — the project venv already satisfied the Skill requirements.

## STEP 2 · Correct the slide — PASS

Fresh workspace: `workspace/qw-morning` (created new; rule cross-check kept separate in `workspace/qw-morning-rules`). Original copied once to `publications/members-briefing-2025q3.pptx`.

**My own read of the deck (6 slides):** slide 1 title/metadata; slide 2 methodology ("advance estimate covers July to September… first two months") — no series link; slide 3 services 0.6% q/q Q1 2025 SA; slide 4 "Manufacturing stalled year on year in Q3 2025."; slide 5 electronics/biomedical sub-sector colour — archive has only total manufacturing, so unlinked; slide 6 editorial forward look — not verifiable.

**Archive cross-check (data/series/*.json):** services-qoq 2025-Q1 = 0.6 at 2025-10-14 (and still 0.6 at 2025-11-21); manufacturing-yoy 2025-Q3 = 0.0 at 2025-10-14 ("growth was flat (i.e., 0.0 per cent)") → 5.0 at 2025-11-21 ("The manufacturing sector expanded by 5.0 per cent year-on-year").

Commands (rp = `.venv/bin/python $SKILL/run.py`, RECALLPRESS_SERIES=$PWD/data/series):
```
rp register publications/members-briefing-2025q3.pptx --registered-on 2025-10-20 --workspace "$PWD/workspace/qw-morning-rules"
rp register publications/members-briefing-2025q3.pptx --registered-on 2025-10-20 --claims docs/qw-results/claims-members-briefing.json --workspace "$PWD/workspace/qw-morning"
RECALLPRESS_WORKSPACE=$PWD/workspace/qw-morning rp check --offline --trigger replay --as-of 2025-11-21 --record
rp judge --run 2025-11-21-8d43d94969a0 --claim members-briefing-2025q3-c2 --status now_wrong --reason "…" --replacement "Manufacturing grew 5.0% year on year in Q3 2025."
rp judge --run 2025-11-21-8d43d94969a0 --claim members-briefing-2025q3-c1 --status unaffected --reason "…"
rp fix --run 2025-11-21-8d43d94969a0
rp map --run 2025-11-21-8d43d94969a0
```
Key output: rules found the same 2 claims + 1 unlinked ("Electronics output expanded." — no unique series match); my --claims registration returned claim_ids c1/c2 at slide 3/slide 4 Headline; replay `run_id 2025-11-21-8d43d94969a0`, change manufacturing 0.0→5.0 (2025-10-14→2025-11-21), rule verdicts c1 unaffected / c2 now_wrong — I agreed with both (disagreement: false); fix `replacement_files: 1`.

**Verification (python-pptx text dump of both decks):**
- Corrected slide 4: `Manufacturing grew 5.0% year on year in Q3 2025.` ✓ (plus attached source line: Economic Survey of Singapore — 2025-Q3 · 2025-11-21)
- Original slide 4: `Manufacturing stalled year on year in Q3 2025.` ✓ unchanged
- Services slide 3 in both: `Services grew 0.6% quarter on quarter in Q1 2025, seasonally adjusted.` ✓ stays 0.6%

**PNG export:** no LibreOffice/Office on this Mac, so I wrote `docs/qw-results/render_slide4.py` (python-pptx geometry + PIL, deck's actual fonts/colours/positions, 150 dpi) and rendered slide 4 of both decks. Vision check confirmed: before = "Manufacturing stalled year on year in Q3 2025.", after = "Manufacturing grew 5.0% year on year in Q3 2025." + source line; both legible, no clipping.

Outputs:
- docs/qw-results/slide4-before.png, docs/qw-results/slide4-after.png (1999×1125)
- docs/qw-results/map-2025-11-21.html (copied from run map; self-contained — corrected deck embedded as base64 data URI)
- docs/qw-results/claims-members-briefing.json
- workspace/qw-morning/runs/2025-11-21-8d43d94969a0/{result.json,map.html,out/members-briefing-2025q3-c2/members-briefing-2025q3.pptx}

Unlinked note (kept for editor review): slide 5 "Electronics output expanded. Biomedical and general manufacturing weighed on the sector as a whole." — archive carries total manufacturing only, no sub-sector series; slide 2 methodology and slide 6 editorial sentences are not series-verifiable.

Surprise: the PNG route needed a custom renderer because LibreOffice is absent; rendering is faithful to shape geometry but word-wrap is approximated.

## STEP 3 · Read an unseen deck — first unassisted record (written BEFORE running the extractor or opening any fallback/answer doc)

Deck: `samples/unseen/roundtable-reading.pptx` (copied to `publications/roundtable-reading.pptx`), read myself with python-pptx. 3 slides; slide 1 is title/metadata (no verifiable claim).

**My FIRST unassisted count: 4 verifiable sentences.** My verdicts (supported at registration 23 Oct 2025; expected replay verdict for 21 Nov 2025 from my own archive check):

| # | Sentence (verbatim) | Location | Series / period | Cited value @ vintage | Stance / assertion | At 23 Oct 2025 | Expected after 21 Nov replay |
|---|---|---|---|---|---|---|---|
| 1 | Manufacturing output showed no year-on-year growth in Q3 2025. | slide 2, body p1 | sg-gdp-manufacturing-yoy / 2025-Q3 | 0.0 @ 2025-10-14 | current / direction flat | supported (0.0 = no growth) | **now_wrong** — revised to 5.0; "no growth" asserts zero |
| 2 | Year-on-year manufacturing growth was below 1% in Q3 2025. | slide 2, body p2 | sg-gdp-manufacturing-yoy / 2025-Q3 | 0.0 @ 2025-10-14 | current / threshold < 1 | supported (0.0 < 1) | **now_wrong** — 5.0 breaches the 1% bound |
| 3 | GDP expanded by 2.9% year on year in Q3 2025. | slide 3, body p1 | sg-gdp-overall-yoy / 2025-Q3 | 2.9 @ 2025-10-14 | current / direction up (level 2.9) | supported | **number_only** — revised to 4.2; "expanded" still holds, offer 4.2% |
| 4 | The October advance estimate put year-on-year GDP growth at 2.9% for Q3 2025. | slide 3, body p2 | sg-gdp-overall-yoy / 2025-Q3 | 2.9 @ 2025-10-14 | **dated** (attributes figure to the October release) / level 2.9 | supported | **still_true** — accurate account of the October release regardless of revision |

Archive evidence I checked myself: manufacturing-yoy 2025-Q3 0.0 (2025-10-14) → 5.0 (2025-11-21); overall-yoy 2025-Q3 2.9 (2025-10-14) → 4.2 (2025-11-21, Economic Survey of Singapore — 2025-Q3).

(Extractor comparison, registration, replay and FALLBACKS scoring follow below, appended only after this record.)

### Step 3 continued — extractor count, registration, replay

Commands:
```
rp register publications/roundtable-reading.pptx --registered-on 2025-10-23 --workspace "$PWD/workspace/qw-unseen-rules"   # rules-only
rp register publications/roundtable-reading.pptx --registered-on 2025-10-23 --claims docs/qw-results/claims-roundtable.json --workspace "$PWD/workspace/qw-unseen"
RECALLPRESS_WORKSPACE=$PWD/workspace/qw-unseen rp check --offline --trigger replay --as-of 2025-11-21 --record
```

**Rule extractor alone finds 3 claims** (threshold "below 1%", "GDP expanded by 2.9%", dated October-estimate sentence). It MISSES "Manufacturing output showed no year-on-year growth in Q3 2025." — a digitless zero-growth assertion. My unassisted count was 4; the miss is exactly the sentence the Skill's worked example warns about. My --claims registration carried all 4 (claim_ids c1–c4; engine normalised locations to the actual shape names: slide 2 Headline/Body, slide 3 Headline/Body).

Replay `run_id 2025-11-21-e6231c63c55f`, series_checked 2, changes: manufacturing-yoy 2025-Q3 0.0→5.0; overall-yoy 2025-Q3 2.9→4.2 (both 2025-10-14→2025-11-21). Rule verdicts vs my pre-registered expectations:

| Claim | Rule verdict | My unassisted expectation | Match |
|---|---|---|---|
| c1 no y/y growth | now_wrong ("cited direction was flat at 0.0; the revision is up at 5.0") | now_wrong | ✓ |
| c2 below 1% | now_wrong ("0.0 satisfied < 1, but 5.0 breaks that threshold") | now_wrong | ✓ |
| c3 GDP expanded 2.9% | number_only ("figure moves from 2.9 to 4.2 and the direction remains up") | number_only | ✓ |
| c4 October estimate put 2.9% | still_true ("attributes 2.9 to the release of 2025-10-14; that record still stands") | still_true | ✓ |

4/4 verdict agreement. Outputs: docs/qw-results/claims-roundtable.json; workspace/qw-unseen/runs/2025-11-21-e6231c63c55f/result.json.

### Step 3 scoring vs docs/FALLBACKS.md item 3 (opened ONLY after the record above)

FALLBACKS item 3 says: four verifiable sentences across two series; no manufacturing growth → now wrong (0.0→5.0); below 1% → now wrong; GDP expanded 2.9% → number only (revised 4.2); October's estimate of 2.9% → still true; unchanged extractor finds three.

| Sentence | FALLBACKS expected | My first unassisted verdict | Score |
|---|---|---|---|
| Manufacturing output showed no year-on-year growth in Q3 2025. | now_wrong | now_wrong | ✓ |
| Year-on-year manufacturing growth was below 1% in Q3 2025. | now_wrong | now_wrong | ✓ |
| GDP expanded by 2.9% year on year in Q3 2025. | number_only (4.2) | number_only (offer 4.2) | ✓ |
| The October advance estimate put year-on-year GDP growth at 2.9% for Q3 2025. | still_true | still_true | ✓ |

First count: mine 4 vs expected 4 ✓; extractor-only 3 vs expected 3 ✓. **Score 4/4 sentences + count correct, unassisted (no retry needed).** STEP 3 = PASS.

Surprise: the rules miss the digitless zero-growth sentence exactly as the Skill documents; the dated-stance sentence is correctly protected by the engine.

## STEP 4 · Clock — PASS (tasks created; firing checked in Step 7)

Back in `workspace/qw-morning`. Read the Skill's `october-briefing-2026q3.pptx` myself (5 slides, 8 numeric sentences, all Q3 2026, all citing METI Advance GDP estimates 14 October 2026). Verified every figure against the archive's 2026-10-14 vintage: overall 5.4 y/y / 1.1 q/q; manufacturing 7.5 y/y / −0.9 q/q; construction 8.8 y/y / 3.4 q/q; services 5.2 y/y / 1.2 q/q. Each series/period has exactly one vintage so far.

Commands:
```
rp register publications/october-briefing-2026q3.pptx --registered-on 2026-10-19 --workspace "$PWD/workspace/qw-morning-rules"      # rules: 8 claims, 0 unlinked
rp register publications/october-briefing-2026q3.pptx --registered-on 2026-10-19 --claims docs/qw-results/claims-october-briefing.json --workspace "$PWD/workspace/qw-morning"   # 8/8 registered, locations exact
```
Rules and my reading agree 8/8 (including the negative −0.9 "fell 0.9%" q/q claim).

**Two one-time LOCAL scheduled tasks created** (QwenWork Desktop scheduler, this Mac; both use contextDirs = project root and the prompt pins RECALLPRESS_WORKSPACE to the same absolute `workspace/qw-morning` folder and the recall-press Skill; both run a LIVE data.gov.sg check `rp check --trigger schedule --record`, save the run record, and must report a source failure as FAILED, never quiet):

| Task | Job ID | Fire time (SGT) | Execution location |
|---|---|---|---|
| recall-press-clock-1 | fe33912c-d43a-4757-9a50-03f5a5424bc1 | 2026-11-21 15:43:31 (+08:00) | local Desktop (this Mac) |
| recall-press-clock-2 | d9917d4b-b6ae-4edf-a50d-8a4de2f224f1 | 2026-11-21 15:53:31 (+08:00) | local Desktop (this Mac) |

Created at 15:33:31 SGT → +10 min and +20 min exactly. Each writes its run note to docs/qw-results/clock-1.md / clock-2.md. Not waiting; carrying on.

Surprise: none.

## STEP 5 · Email-style trigger — PASS (pasted input, not Mail)

Wrote `docs/qw-results/release-notice.txt`: plain-text notice, 21 November 2025 Economic Survey, period Q3 2025, manufacturing 5.0% y/y (revised from 0.0% on 14 October), link to the MTI release listed in data/SOURCES.md item A (https://www.singstat.gov.sg/files/a84a38d1-e0d8-4db9-bcf0-e95696170755.pdf). No Mail connector used — **pasted input, not Mail**.

Matching the notice against `workspace/qw-morning/register.json` (2 registered documents) and the stored run ledger:

| Document | Needs updating from THIS notice? | Earlier vs new |
|---|---|---|
| members-briefing-2025q3 (registered 2025-10-20) | Its slide-4 claim c2 is exactly what this notice revises — but the correction was **already issued**: run 2025-11-21-8d43d94969a0 ledger `issued: [{claim_id: members-briefing-2025q3-c2, published: 2025-11-21, value: 5.0}]`; corrected draft + map already prepared in Step 2. | **Earlier correction** (issued 2025-11-21), not a new one. No new action from this notice. |
| october-briefing-2026q3 (registered 2026-10-19) | No — all 8 claims are Q3 2026; a Q3 2025 release does not touch them. | Unaffected. |

**New corrections from this notice: none.** Per the Skill, an older notice may refer to an already-issued correction; the matching stored run is labelled 2025-11-21, separately from today's date (2026-11-21). I deliberately did not fire a fresh live check in this step, to keep the Step-4 clock tests clean; the notice's figures were taken from the archived 2025-11-21 vintage, not invented.

Surprise: none — the issued-ledger dedup works exactly as the Skill describes.

## STEP 6 · Publish the map as a QwenWork Page — PARTIAL (Page created; hosted URL blocked by publisher)

Prepared a static publish dir `docs/qw-results/page/index.html` (copy of the self-contained map; the corrected deck is embedded as a base64 data URI, so no sidecar files are needed).

Publish attempts (controlled `qwenwork_pages_publish`):
1. `create`, project path → error: "Sensitive tool error details withheld because the protection context changed."
2. `create`, workspace copy → error: "Expected to create a new Page, but the target already exists" — **this confirms attempt 1 did create a Page bound to this Chat.**
3. `update`, workspace copy → same protection-context error.

Per the qw-pages Skill I stopped retrying this turn. The Page exists, but the publisher withheld the public URL under a protection-context change, and QwenWork state exposes no Pages key to look it up. **Public URL: not retrievable this turn.** I therefore could not fetch the hosted page or test the hosted download button. This is the exact case FALLBACKS.md item 7 covers.

**Fallback (local, labelled static):** rendered the standalone map with headless Chrome (`--no-proxy-server`, file:// URL, 2× scale) → `docs/qw-results/map-static.png`. Vision check confirms the hosted-equivalent content:
- Card **"Members’ quarterly economy briefing"** present, status **"PPTX · Now wrong"**.
- Revised-figure banner: manufacturing y/y **0.0% (14 Oct 2025) → 5.0% (21 Nov 2025)**.
- Buttons **Apply fix / Skip / Edit first** (and a collapsed Decision JSON section with Copy JSON).
- **"↓ Replacement PPTX"** download link present.

Download-button assessment (from the HTML, since the hosted test was blocked): the replacement is a same-origin `data:` base64 anchor with `download="members-briefing-2025q3.pptx"`; the decision buttons use one inline `<script>` block. In a normal browser this downloads and runs; **whether the QW Page host blocks scripts/downloads is UNVERIFIED** because the hosted URL could not be fetched. Flagging this honestly rather than claiming it works.

Outputs: docs/qw-results/page/index.html, docs/qw-results/map-static.png (static screenshot), docs/qw-results/map-2025-11-21.html.

Surprise: the controlled publisher created the Page but repeatedly withheld its result/URL under a "protection context changed" guard — an environment blocker, not a map defect.