# Job 009 · Make three deck headlines match the evidence, republish the pitch Page

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/009-deck-honest-headlines/. Never ask questions; record problems and continue. Do not commit or push. Change NOTHING in the deck beyond the edits listed.

Edits (exact text; keep markup/attributes as they are):
1. deck/v1/src/slides/02-address.html line with `<h2 data-enter>Every published number gets a recall address.</h2>` → `<h2 data-enter>Each linked sentence gets a recall address.</h2>`. In the same file's speaker notes, replace "every published number gets a recall address" with "each linked sentence gets a recall address".
2. deck/v1/src/slides/04-pipeline.html:
   - `<h2 data-enter>QwenWork reads, checks nightly and hands back the fix.</h2>` → `<h2 data-enter>QwenWork reads, checks on a schedule and hands back the fix.</h2>`
   - `<b>Nightly task</b>` → `<b>Scheduled task</b>`
   - `<span class="caption">every night · SGT</span>` → `<span class="caption">every 30 min · SGT</span>`
   - In the speaker notes: replace the whole `<aside class="notes">…</aside>` content with: `<b>Say</b>QwenWork does the reading, the scheduled check and the delivery. A Skill reads each slide and links each claim it can to a series, a quarter and a dated source. A QwenWork scheduled task checks the official data every 30 minutes and stamps the result on Revisionpedia. The agent judges each sentence (now wrong, number changed, or a dated statement that still holds) and gives a reason. Then it hands back the map and the corrected deck. The editor decides: apply, skip or edit first.<b>Do</b>Keep it to the four nouns. If asked: the first two live checks were started with Run now after missed slots; the recurring watch has run on its own since 21 Nov 23:15 (docs/qw-results/watch-log.md).`
3. deck/v1/src/slides/05-reach.html: `<h2 data-enter>57 of 60 quarters changed after first release.</h2>` → `<h2 data-enter>57 of 60 tracked figures changed after their first reading.</h2>`

Then:
4. From `deck/`: `node kit/scripts/export.mjs v1` then `node kit/scripts/export.mjs v1 --motion`. IMPORTANT: if the exporter would delete the whole `v1/out` directory, run it the safe way job 002 did (docs/qw-outbox/002-deck-slide4-and-page/REPORT.md describes it): back up `v1/out` first. Check `deck/v1/out/02.png`, `04.png`, `05.png`: headline readable, no overflow or clipping; lint clean (`deck/v1/out/lint.txt`; if the lint flags only one of these new phrases, add it to `deck/v1/src/deck.json` "lintAllow" and re-export). At most 3 rounds.
5. Republish `deck/v1/index.html` to the EXISTING Page "Recall Press pitch" (https://zsg5gl36.qwenwork.page/, deployment from job 002) as a new version — update, not create. If update is refused, record the error and create a new Page "Recall Press pitch v2" instead.
6. Verify signed out: `curl -sL --noproxy '*' <page url>` contains "Each linked sentence gets a recall address" and "checks on a schedule" and not "checks nightly".
7. REPORT.md (PASS/FAIL per step, URLs, version), copy 02/04/05 PNGs into the output folder, then DONE.
