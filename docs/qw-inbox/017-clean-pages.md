# Job 017 · Publish the decluttered correction Page and recall desk

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/017-clean-pages/. Never ask questions; record problems and continue. Do not commit or push. Use the qw-pages Skill. The owner explicitly requests publishing.

The product renderer (`web/render_map.py`) was redesigned: no provenance banner, no run labels, a plain headline ("One sentence in … is now wrong."), the cited figure → latest figure, and one main action. The re-rendered pages are ready in `docs/qw-inbox/017-assets/`.

1. Copy `docs/qw-inbox/017-assets/correction-index.html` over `docs/qw-outbox/005-correction-page/site/index.html`, and `docs/qw-inbox/017-assets/desk-index.html` over `docs/qw-outbox/011-recall-desk-db/app/public/index.html`. Change nothing else (`server.mjs` stays as is).
2. Republish each to its EXISTING Page as a new version (update, not create), from this task, which is the task that created that Page: "Recall Press · live correction" (https://ka62nv48.qwenwork.page/, static) or "Recall Press · recall desk" (https://j3jvce39.qwenwork.page/, dynamic, entrypoint server.mjs, with_database true; keep the same database; do not re-provision or migrate). If an update is refused, record the exact error and do not create a new Page.
3. Verify signed out with `curl -sL --noproxy '*'` and `LC_ALL=C grep -F`: the page contains "is now wrong." and "Finds the sentences in your briefings", and does not contain "Manual live check" or "run 2026-". For the desk: /api/health is ok and /api/decisions?run_id=2026-11-21-68013a314ad1 still returns the earlier test row.
4. Append PASS/FAIL per step and outputs to docs/qw-outbox/017-clean-pages/REPORT.md (create it if missing; the two Pages are published from two different tasks, so each task appends its own section), then create DONE when both sections are present.
