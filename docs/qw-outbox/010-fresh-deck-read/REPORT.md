# Job 010 · Fresh deck read — REPORT

Deck: `samples/fresh/chamber-outlook-2026q2.pptx` (trade-association outlook, dated 14 August 2026), treated as registered on **2026-08-14**.
Fairness: nothing under `hack/` was opened, listed or searched. The deck was read independently before any rules ran.

## Timing
- started.txt `2026-11-21 23:33:29 +08` (job begin / CLAIMED time; started.txt was written at completion because step 1 was performed together with the CLAIMED marker)
- finished.txt `2026-11-21 23:39:44 +08`
- **Minutes taken: ~6.3**

## Model
- Runner model not exposed to the job at run time. recall-press `run.py` is deterministic Python (no LLM in the pipeline); no model substitution occurred. Disclosed as "not visible".

## Claim counts
- **First-pass (OUT/first-pass.json): 8 checkable claims** + 8 considered-and-rejected sentences.
- **Rules cross-check (OUT/rules.json): 5 claims** (c1–c5) + 3 unlinked.
- **Registered (workspace/fresh): 7 claims** (c1–c7).

## Overlap / misses
- Rules claims I missed: **none** — all 5 rules claims (c1–c5) were in my first-pass.
- My first-pass claims the rules missed:
  1. **Slide 2 speaker note** "After seasonal adjustment, real GDP rose 1.4% from the first quarter to the second." (sg-gdp-overall-qoq). Rules never surfaced it because the engine's `slide_blocks` does not read speaker notes. **Could not be registered** through `rp register` (no anchor). Recorded here and in changes.md; it remains a manual, unregistered observation. (Today's archive shows 2026-Q2 QoQ now 1.5%, so it would be a number_only item if the tool could anchor notes.)
  2. **Slide 3** "Manufacturing outpaced services…" — rules flagged *unlinked* (no number, two series). I registered it as comparison c6.
  3. **Slide 4 table** "Construction output contracted…" — rules flagged *unlinked* (qualitative). I registered it as direction c7.
- Rules unlinked that I also rejected: "Our freight scenario allows for a 7% rise…" (forward planning scenario, no official archive series). Agreement with the rules.

## Final verdict per claim (sentence → verdict → reason)
- **c1** "Singapore's economy was 5.9% larger in the June quarter than a year earlier." → **number_only** — overall Q2 YoY revised 5.9%→6.2% (2026-10-14); economy still grew. Repl: "…was 6.2% larger…".
- **c2** "Second-quarter services growth came in just below 5% year on year." → **now_wrong** — services revised 4.9%→5.2%; at 5.2% the "below 5%" threshold breaks. Repl: "…just above 5% year on year."
- **c3** "Total employment rose by 14,000 in the June quarter." → **number_only** — employment change revised 14,000→14,700 (2026-11-19); still rose. Repl: "…rose by 14,700…".
- **c4** "At the end of June, the seasonally adjusted overall unemployment rate stood at 2.0%." → **number_only** — unemployment revised 2.0%→1.9% (2026-09-21); level only. Repl: "…stood at 1.9%.".
- **c5** "MTI's advance estimate on 14 July 2026 put second-quarter manufacturing growth at 12.2% year on year." → **still_true** (dated) — the 14 July advance estimate did report 12.2%; later revisions do not change that record. No correction.
- **c6** "Manufacturing outpaced services on year-on-year growth in the second quarter." → **number_only** — both revised up (mfg 12.9%, services 5.2%); comparison still holds. Repl: "…(12.9% versus 5.2%)."
- **c7** "Construction output contracted from the March quarter on a seasonally adjusted basis." → **number_only** — construction QoQ -2.5%→-2.7%; still contracted. Repl: "Construction output contracted 2.7% from the March quarter…".

## Replacement files produced
Run id: `2026-11-21-b0013237f6a4`. 6 corrected decks (one sentence changed + source line each), under
`workspace/fresh/runs/2026-11-21-b0013237f6a4/out/<claim_id>/chamber-outlook-2026q2.pptx`:
c1, c2, c3, c4, c6, c7. c5 (still_true) produced no file. All 6 verified to carry the corrected sentence and a `Source:` line.

## Output folder (OUT = docs/qw-outbox/010-fresh-deck-read/)
- CLAIMED, started.txt, finished.txt
- first-pass.json (8 claims + 8 rejected)
- rules.json / rules.err (rules cross-check)
- changes.md (first-pass→registered fixes)
- claims.json (7 registered claims)
- map.html (copy of the run map, 375 KB)
- REPORT.md, DONE

## Left alone / notes
- Speaker-note GDP QoQ claim — not registerable by the tool (known engine limitation), kept as a manual note.
- Dated claim c5 — preserved unchanged.
- Slide 7 forward scenario / lead-time / advice sentences and all folio/date labels — rejected as non-archive-checkable.
