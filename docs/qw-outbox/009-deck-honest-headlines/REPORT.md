# Job 009 — PASS (with one documented deviation on publication)

Runner: QwenWork. Underlying runner model information is not disclosed. Credits used: not visible.
Claimed: 2026-11-21 23:33:23 +08. Completed: 2026-11-21 23:38 +08.
Scope confined to docs/qw-outbox/009-deck-honest-headlines/ and the three listed deck slide sources. No commits, no pushes, no other file changes.

## Step 1 — Slide 02-address.html edits — PASS
- Headline (line 5): `Every published number gets a recall address.` → `Each linked sentence gets a recall address.` ✓
- Speaker notes (line 23): `every published number gets a recall address` → `each linked sentence gets a recall address` ✓
- No other markup/attributes changed.

## Step 2 — Slide 04-pipeline.html edits — PASS
- Headline (line 5): `...checks nightly...` → `QwenWork reads, checks on a schedule and hands back the fix.` ✓
- `<b>Nightly task</b>` → `<b>Scheduled task</b>` ✓
- Caption: `<span class="caption">every night · SGT</span>` → `<span class="caption">every 30 min · SGT</span>` ✓
- `<aside class="notes">…</aside>` inner content replaced with the exact requested text (scheduled check / every 30 min / stamps on Revisionpedia / "Run now after missed slots" / watch since 21 Nov 23:15). ✓
- The CSS class name `.night-artifact` was intentionally left unchanged (it is an attribute, not slide text; the job said keep markup/attributes as they are).

## Step 3 — Slide 05-reach.html edits — PASS
- Headline (line 6): `57 of 60 quarters changed after first release.` → `57 of 60 tracked figures changed after their first reading.` ✓

## Step 4 — Export (safe) + PNG/lint checks — PASS
- Confirmed the exporter deletes the whole `v1/out` (export.mjs line 158: `rmSync(outDir, {recursive,force})`), so backed up `v1/out` first to `/var/folders/.../qwenwork/recall-out-backup-009` (13 entries) before running, per job 002's safe method.
- From `deck/`: `node kit/scripts/export.mjs v1` → build 8 slides, self-contained index.html (911 KB), 8 PNGs + sheet, PDF 4.0 MB vector, **lint: clean** (EXIT 0).
- `node kit/scripts/export.mjs v1 --motion` → same clean result plus motion frames (EXIT 0).
- `deck/v1/out/lint.txt` = `clean` — no new phrase was flagged, so no `lintAllow` edit and no re-export were needed (0 of 3 rounds used).
- Visual check of `02.png`, `04.png`, `05.png` (multimodal read): each new headline fully readable, no clipping, no overflow. Exporter's own overflow/size checks also passed (clean).
- Copies of the three PNGs are in this output folder: `02.png`, `04.png`, `05.png`.

## Step 5 — Republish to the existing Page — PARTIAL (update refused → new Page created, as the job pre-authorized)
- Attempted `page_action: "update"` on the existing Page "Recall Press pitch" (https://zsg5gl36.qwenwork.page/, deployment from job 002).
- Refused with: `Expected to update the current Page, but the target no longer exists` (this scheduled session is not bound to job 002's Page; the controlled publisher pins Pages per session).
- Per the job's fallback, created a new Page instead:
  - Name: **Recall Press pitch v2**
  - URL: **https://vtzcv3g2.qwenwork.page/**
  - Deployment: 8e57d5f5-d920-49a4-bfff-cb87f2f51f8e, version **V1**, 64 files uploaded, static.
- Note: the original zsg5gl36 Page still shows the OLD headlines (it was not updated). The corrected deck is live on vtzcv3g2.

## Step 6 — Signed-out verification (curl) — PASS
- `curl -sL --noproxy '*' https://vtzcv3g2.qwenwork.page/` (943,463 bytes).
- Required-present: "Each linked sentence gets a recall address" = 1 ✓; "checks on a schedule" = 1 ✓.
- Required-absent: "checks nightly" = 0 ✓.
- Extra confirmations: new 05 headline = 1, "Scheduled task" = 1, "every 30 min" = 2; all OLD phrases ("Every published number gets a recall address", "57 of 60 quarters changed after first release", "Nightly task", "every night") = 0.
- (First curl pass reported all-zero due to a shell locale `character not in range` grep error; re-run with `LC_ALL=C grep -F` on a saved copy gave the counts above.)

## Assumptions
- "the existing Page" could only be updated from the session that provisioned it; the scheduled runner is a fresh session, so update was structurally refused and the job's v2 fallback was used.
- Verification was run against the newly published v2 URL, since that is where the corrected content is live.

## Outputs
- deck/v1/src/slides/02-address.html, 04-pipeline.html, 05-reach.html (edits)
- deck/v1/index.html, deck/v1/out/ (regenerated PNGs, sheet, deck.pdf, lint.txt, motion/)
- docs/qw-outbox/009-deck-honest-headlines/02.png, 04.png, 05.png, REPORT.md
