# Job 016 · Re-run the fresh deck with the fixed engine — REPORT

Deck: `samples/fresh/chamber-outlook-2026q2.pptx` (trade-association outlook, dated 14 August 2026), registered on **2026-08-14**. Replay checked **as-of 2026-11-21**.
Engine: installed recall-press Skill `run.py` (now reads speaker notes + fixed wording rules). Series: `$PWD/data/series`.
Fairness: nothing under `hack/` and `docs/qw-results/fresh-deck-answer-key.json` was opened, listed or searched. The deck was re-read independently before any rules ran.

## Timing & model
- started.txt `2026-11-21T17:07:32Z` · finished.txt `2026-11-21T17:11:44Z` → **~4.2 minutes**.
- Model: not visible to the job. `run.py` is deterministic Python (no LLM in the pipeline); no substitution occurred.

## Step 2 — rules-only cross-check (OUT/rules.json)
Workspace `workspace/fresh2-rules`. **5 linked claims** (c1–c5) + **4 unlinked sentences**.
The fixed engine now surfaces the **slide-2 speaker-note** sentence as an unlinked candidate with an anchor (`block 41`) — previously invisible to the rules. Unlinked list:
1. "Manufacturing outpaced services…" (comparison, needs a chosen series)
2. "Construction output contracted…" (qualitative direction, needs a series)
3. "Our freight scenario allows for a 7% rise…" (forward planning assumption, no archive series)
4. **"After seasonal adjustment, real GDP rose 1.4%…" — slide 2, speaker notes** (now anchorable)

## Step 3 — my reading + registration (OUT/claims.json → workspace/fresh2)
Re-checked every sentence against the deck; reused job 010's first-pass reading. **Registered count = 8** (c1–c8), matching the expectation that the notes claim now registers. c2 is the slide-2 speaker-note claim (`sg-gdp-overall-qoq`). Only 1 sentence left unlinked: the freight-scenario planning assumption (correct — no official archive series).

## Step 4 — replay check, verdicts, fixes, map
Run id: **`2026-11-21-407f22cd7d43`** · series_checked 7 · no_change false · unlinked_count 1.

Per-claim rule-proposed status vs my `rp judge` verdict (all `disagreement=false`):

| claim | location | series (period) | cited → replay | rule status | my verdict | replacement |
|---|---|---|---|---|---|---|
| c1 | slide 2 Headline | overall-yoy (2026-Q2) | 5.9 → 6.2 | number_only | **number_only** | "…was **6.2%** larger…" |
| c2 | slide 2 speaker notes | overall-qoq (2026-Q2) | 1.4 → 1.5 | number_only | **number_only** | "…rose **1.5%** from the first quarter…" |
| c3 | slide 3 Factory | manufacturing-yoy vs services-yoy | 12.5→12.9 / 4.9→5.2 | unaffected | **unaffected** (figure-free, comparison still holds) | — |
| c4 | slide 3 Service | services-yoy (2026-Q2) | 4.9 → 5.2 | now_wrong | **now_wrong** ("below 5%" breaks) | "…just **above** 5% year on year." |
| c5 | slide 4 table | construction-qoq (2026-Q2) | -2.5 → -2.7 | unaffected | **unaffected** (figure-free, still contracted) | — |
| c6 | slide 5 Jobs | employment-change (2026-Q2) | 14,000 → 14,700 | number_only | **number_only** | "…rose by **14,700**…" |
| c7 | slide 5 Unemployment | unemployment (2026-Q2) | 2.0 → 1.9 | number_only | **number_only** | "…stood at **1.9%**." |
| c8 | slide 6 July estimate | manufacturing-yoy (2026-Q2, dated 2026-07-14) | 12.2 (dated) | still_true | **still_true** (accurate account of the 14 Jul advance estimate) | — |

Note vs job 010: the fixed wording rules + the "leave figure-free sentences whose meaning still holds as unaffected" instruction mean c3 (comparison) and c5 (direction) are now **unaffected** rather than number_only — they carry no in-sentence figure to update. All other verdicts unchanged.

## Replacement files produced
`rp fix` → **5** corrected decks (one sentence changed + one `Source:` line each), under
`workspace/fresh2/runs/2026-11-21-407f22cd7d43/out/<claim_id>/chamber-outlook-2026q2.pptx`:
**c1, c2, c4, c6, c7**. c3/c5 (unaffected) and c8 (still_true) produced no file.
Verified per deck: new sentence present, old sentence removed, all other claims' original sentences untouched.

## Notes-claim check (python-pptx, printed both)
Original slide-2 notes: `After seasonal adjustment, real GDP rose 1.4% from the first quarter to the second.`
Corrected (c2) slide-2 notes: `After seasonal adjustment, real GDP rose 1.5% from the first quarter to the second.` + `Source: Overall, real GDP growth, quarter on quarter, seasonally adjusted, 2026-Q2, 1.5% · Advance GDP estimates — 2026-Q3 · 2026-10-14`
Slide-2 face (Section/Title/Folio/Headline/Advice) is **byte-identical** to the original — the Headline still reads "5.9% larger" (that edit belongs to c1's separate draft).
→ RESULT: notes updated to 1.5% = True · slide-2 face unchanged = True.

## Map
`rp map` → `workspace/fresh2/runs/2026-11-21-407f22cd7d43/map.html`, copied to **OUT/map.html** (317,901 bytes).

## Output folder (OUT = docs/qw-outbox/016-fresh-deck-rerun/)
CLAIMED, started.txt, finished.txt · rules.json/.err · claims.json · register.json/.err · check.json/.err · fix.json/.err · map.json/.err · map.html · REPORT.md · DONE.

## Left alone / notes
- c3, c5 — figure-free sentences whose meaning still holds (unaffected).
- c8 — dated claim, preserved unchanged.
- Freight-scenario sentence — unlinked, no official archive series.
- No commits/pushes; writes confined to the outbox; nothing under `hack/` or the answer key opened.
