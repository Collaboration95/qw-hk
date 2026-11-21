# Job 010 · Read a deck nobody has shown you before (fair first-pass test)

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/010-fresh-deck-read/ ("OUT"). Never ask questions; record problems and continue. Do not commit or push.
**Fairness rules: do NOT open, list or search anything under hack/ (it holds the answer key).** Do not look at other jobs' outputs about this deck. Use the recall-press Skill as normal.

Deck: `samples/fresh/chamber-outlook-2026q2.pptx` — a trade-association outlook written by someone else, dated 14 August 2026. Treat it as a customer deck registered on 2026-08-14.
Set: `rp` = `.venv/bin/python /Users/speedpowermac/.qwenwork/skills/recall-press/run.py`, `RECALLPRESS_SERIES=$PWD/data/series`.

1. Write `OUT/started.txt` with the current time.
2. YOUR FIRST READ, before any rules run: dump every text frame, table cell and speaker note (python-pptx), read them, and write `OUT/first-pass.json`: a list of every sentence you think states a figure that the archive can check — slide number, location (title/body/table r,c/notes), exact sentence, series_id, period, value as stated, and the archived value visible on 2026-08-14 with its vintage date. Also list sentences you considered and rejected, with the reason. Do not change this file after step 3 starts.
3. Rules cross-check: `rp register samples/fresh/chamber-outlook-2026q2.pptx --registered-on 2026-08-14 --workspace "$PWD/workspace/fresh-rules"`. Save its output to `OUT/rules.json`. Note which of your claims the rules missed and which rule claims you missed.
4. Register your verified list (after fixing anything step 3 revealed — record each change in `OUT/changes.md`): save as `OUT/claims.json`, then `rp register samples/fresh/chamber-outlook-2026q2.pptx --registered-on 2026-08-14 --claims OUT/claims.json --workspace "$PWD/workspace/fresh"`.
5. Check against today's archive: `RECALLPRESS_WORKSPACE=$PWD/workspace/fresh rp check --offline --trigger replay --as-of 2026-11-21 --record`. For every affected claim, record your verdict with `rp judge` (now_wrong / number_only, with a specific reason and a full replacement sentence; hold if evidence is missing), then `rp fix --run <run_id>` and `rp map --run <run_id>`. Copy the map to `OUT/map.html`.
6. Write `OUT/finished.txt` with the current time, then REPORT.md: minutes taken (started→finished), first-pass claim count, rules claim count, overlaps/misses each way, final verdict per claim (sentence → verdict → reason), replacement files produced, model name if visible. Then DONE.
