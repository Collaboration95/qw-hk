# Job 015 · Correct the run label on both public Pages and republish

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/015-page-provenance/. Never ask questions; record problems and continue. Do not commit or push. Use the qw-pages Skill. The owner explicitly requests publishing.

Both public Pages show the map header label "Nightly run" (line ~165) for run 2026-11-21-68013a314ad1, which was a manually started live check (Run now, 21 Nov 2026 15:48 SGT).

1. In docs/qw-outbox/005-correction-page/site/index.html AND docs/qw-outbox/011-recall-desk-db/app/public/index.html, replace the header text "Nightly run" with "Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT". Change nothing else.
2. Republish each to its EXISTING Page as a new version (update, not create): "Recall Press · live correction" (https://ka62nv48.qwenwork.page/, static) and "Recall Press · recall desk" (https://j3jvce39.qwenwork.page/, dynamic, entrypoint server.mjs, with_database true — keep the same database; do not re-provision or migrate). If an update is refused, record the exact error and do not create a new Page.
3. Verify signed out: both URLs contain "Manual live check" and not "Nightly run" (`curl -sL --noproxy '*'`, use `LC_ALL=C grep -F`); the desk's /api/health is ok and /api/decisions?run_id=2026-11-21-68013a314ad1 still returns the earlier test row.
4. REPORT.md with PASS/FAIL per step and outputs, then DONE.
