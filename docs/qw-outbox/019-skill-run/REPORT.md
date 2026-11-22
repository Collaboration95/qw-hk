# 019 · Recall Press Skill run on camera — REPORT

Date: 2026-11-23 (SGT). Job: `docs/qw-inbox/019-skill-run-on-camera.md`.
Claimed: 2026-11-23T00:59:44+0800. All writes confined to `docs/qw-outbox/019-skill-run/`.
Nothing deleted, committed, pushed or published. Originals in `samples/` untouched (git confirms
`data/series/` and `samples/` unmodified).

## Environment and paths

- `SKILL` (installed): `/Users/speedpowermac/.qwenwork/skills/recall-press` — loaded with the Skill tool.
- Engine actually used for fix/map/live check: the project's newer copy `skills/recall-press/run.py`
  (see Deviations below). Registration and replay used the installed skill's `run.py`; both engines
  share the same workspace format.
- `RECALLPRESS_WORKSPACE=docs/qw-outbox/019-skill-run/workspace` (fresh)
- `RECALLPRESS_SERIES=<project>/data/series`
- Rules cross-check workspace: `docs/qw-outbox/019-skill-run/rule-cross-check`
- Python: system `python3` is 3.9.6 (< 3.10 required); used `/opt/homebrew/bin/python3.13` (3.13.14).

## Step 1 — Register as of 2025-10-20

Read every slide (incl. footers; no speaker notes present) and every board-paper paragraph myself
first. Latest visible vintage on 2025-10-20: MTI Advance GDP estimates, published 2025-10-14.

Commands (installed skill engine):

```
rp register samples/members-briefing-2025q3.pptx --registered-on 2025-10-20 --workspace rule-cross-check
rp register samples/board-paper-2025q3.docx     --registered-on 2025-10-20 --workspace rule-cross-check
rp register samples/members-briefing-2025q3.pptx --registered-on 2025-10-20 --claims claims-members-briefing.json
rp register samples/board-paper-2025q3.docx     --registered-on 2025-10-20 --claims claims-board-paper.json
```

Rules cross-check matched my reading exactly (2 claims + 1 unlinked for the deck; 1 claim for the
paper). Registered linked sentences (all three required sentences present):

| Claim ID | Location | Sentence | Series / period | Cited value & vintage | Stance |
|---|---|---|---|---|---|
| members-briefing-2025q3-c1 | slide 3, Headline | "Services grew 0.6% quarter on quarter in Q1 2025, seasonally adjusted." | sg-gdp-services-qoq / 2025-Q1 | 0.6, 2025-10-14 | current |
| members-briefing-2025q3-c2 | slide 4, Headline | "Manufacturing stalled year on year in Q3 2025." | sg-gdp-manufacturing-yoy / 2025-Q3 | 0.0, 2025-10-14 | current |
| board-paper-2025q3-c1 | paragraph 7 | "As first reported in the October advance estimate, manufacturing output was flat year on year in Q3 2025." | sg-gdp-manufacturing-yoy / 2025-Q3 | 0.0, 2025-10-14 | dated |

Unmatched text kept in `unmatched-notes.md`: slide 5 "Electronics output expanded." (rules-flagged
unlinked; no electronics series in the archive) and "Biomedical and general manufacturing weighed
on the sector as a whole." (sub-industry, no series); methodology/editorial sentences on slides 2/6
are not statistical claims.

## Step 2 — Offline replay of 2025-11-21

```
rp check --offline --trigger replay --as-of 2025-11-21 --record
```

Run ID `2025-11-21-e6b1d169aebf`. 2 series checked, 1 revision found: manufacturing YoY 2025-Q3
0.0% (Advance, 2025-10-14) → 5.0% (Economic Survey of Singapore — 2025-Q3, published 2025-11-21,
"The manufacturing sector expanded by 5.0 per cent year-on-year", Annex B column 3Q25).

Verdicts side by side (rule verdict = my judged verdict in all three cases; recorded with `rp judge`):

| Sentence | Verdict | Reason |
|---|---|---|
| Slide 4: "Manufacturing stalled year on year in Q3 2025." | **now_wrong** | "Stalled" asserts flat (0.0%); the 21 Nov 2025 Economic Survey revised Q3 2025 to 5.0% growth, breaking the assertion. Replacement: "Manufacturing grew 5.0% year on year in Q3 2025." |
| Board paper: "As first reported in the October advance estimate, manufacturing output was flat year on year in Q3 2025." | **still_true** | Dated stance: it reports what the October advance estimate said. The 14 Oct 2025 release did report 0.0% (flat), so the account remains accurate. Sentence and file preserved. |
| Slide 3: "Services grew 0.6% quarter on quarter in Q1 2025, seasonally adjusted." | unaffected | Services Q1 2025 QoQ SA is 0.6% in every vintage visible at 21 Nov 2025; the manufacturing revision does not touch it. |

Judge commands:

```
rp judge --run 2025-11-21-e6b1d169aebf --claim members-briefing-2025q3-c2 --status now_wrong --reason "..." --replacement "Manufacturing grew 5.0% year on year in Q3 2025."
rp judge --run 2025-11-21-e6b1d169aebf --claim board-paper-2025q3-c1 --status still_true --reason "..."
rp judge --run 2025-11-21-e6b1d169aebf --claim members-briefing-2025q3-c1 --status unaffected --reason "..."
```

## Step 3 — Fix and map

```
rp fix --run 2025-11-21-e6b1d169aebf   # project engine skills/recall-press/run.py
rp map --run 2025-11-21-e6b1d169aebf
```

Outputs (under `workspace/runs/2025-11-21-e6b1d169aebf/`):

- Updated deck (one file per document, all fixes applied):
  `out/members-briefing-2025q3-updated/members-briefing-2025q3.pptx`
- Per-claim draft: `out/members-briefing-2025q3-c2/members-briefing-2025q3.pptx`
- Map: `map.html` · Run record: `result.json`
- Board paper: no corrected file (still_true — preserved as required).

Slide 4 of the updated deck, opened and verified programmatically:

> MANUFACTURING · 4 / 6
> **Manufacturing grew 5.0% year on year in Q3 2025.**
> Here, output is measured against the same quarter a year earlier. Members can use the annual
> comparison when discussing activity with suppliers.
> Ministry of Trade and Industry · Advance GDP estimates · 14 October 2025
> **Source: Manufacturing, real GDP growth, year on year, 2025-Q3, 5.0% · Economic Survey of
> Singapore — 2025-Q3 · 2025-11-21**

Slides 1, 2, 3, 5, 6 verified byte-identical to the original.

## Step 4 — Today's live check (2026-11-23)

```
rp check --trigger manual --record   # project engine; contacts data.gov.sg only
```

Run ID `2026-11-23-36b23a221c29`. Live fetch of both registered datasets succeeded (exit 0; the
engine's refresh step queries api-open.data.gov.sg / data.gov.sg for every registered series and
fails loudly on any unavailable source — none failed). Live values matched the archive's latest
vintages, so no new vintage was appended and `data/series/` stayed untouched. Full stdout saved to
`live-check-output.json`.

Sentences with later readings (members' briefing):

| Sentence | Cited | Now | First published at current value | Rule verdict (live run) |
|---|---|---|---|---|
| Slide 4 manufacturing Q3 2025 | 0.0% (2025-10-14) | **4.6%** | **2026-04-14** (Advance GDP estimates — 2026-Q1) | now_wrong |
| Slide 3 services Q1 2025 QoQ SA | 0.6% (2025-10-14) | 0.7% | 2026-02-10 (Economic Survey — 2025-Q4) | number_only |

Board paper sentence remains still_true (dated account of the October release). The live run's
verdicts are left pending editor decision — the job asked to show later readings, not to issue
today's corrections. 1 unlinked sentence (electronics) still outstanding.

## Failures / deviations / assumptions

1. **Python substitution:** system python3 is 3.9.6; used python3.13 (3.13.14) throughout. No model
   substitution (engine is deterministic Python).
2. **Engine version:** the installed skill copy (`~/.qwenwork/skills/recall-press`) still writes
   per-claim drafts only. The job's "one updated file per document under `out/<document>-updated/`"
   matches the project's newer engine (`skills/recall-press/`, identical to repo `recallpress/`).
   First `fix` ran on the installed engine (per-claim draft only); re-ran `fix`/`map` and the live
   check on the project engine, which produced the `-updated` deck. Workspace formats are
   compatible; both drafts are kept.
3. **Board paper date:** the paper's face date is 22 October 2025; registered as of 2025-10-20 per
   the job instruction. The latest visible vintage (2025-10-14) is the same on either date, so the
   claim list is unaffected.
4. No failed sources, no quiet-run issues, nothing deleted/committed/pushed/published. Pre-existing
   git changes outside this outbox folder (e.g. `docs/submission/video-script.md`) were present
   before this job and were not touched.

## Assumptions

- "Show me" is satisfied by the tables above plus the verified slide-4 text; the map HTML and
  updated deck are delivered as files for the camera.
- The live check covers both registered documents (engine checks the whole register); the members'
  briefing rows are the ones the job asked for.
- Electronics/biomedical sub-industry sentences stay unlinked for editor review rather than being
  forced onto the total-manufacturing series.