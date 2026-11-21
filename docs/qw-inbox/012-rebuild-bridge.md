# Job 012 · Replace the broken bridge with a fresh scheduled task

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/012-rebuild-bridge/. Never ask questions; record problems and continue. Do not commit or push. Use the scheduler tool (`qwenwork_cron_manage_job`).

Facts: `recall-press-bridge` (id 028f2aa6-91bb-460f-9946-0a234139c362, cron */10) has shown "Task missed its scheduled execution time" (Failed, 0 s) on every slot since 22:10, even after its model was moved to Standard at 23:27. `recall-press-watch` (id d5fbdc2b-…, cron 15,45, Standard) IS admitted on time. So copy the watch's working configuration shape.

1. Read both tasks (action=list or get) and save their full stored definitions (redact nothing secret; there are no secrets) to docs/qw-outbox/012-rebuild-bridge/before.json. Note every field that differs between them (missed-run policy, schedule kind, timezone, contextDirs, executionTarget, keep-awake flags, payload kind, etc.).
2. Disable (do not delete) `recall-press-bridge`.
3. Create `recall-press-bridge-2`: same prompt text as the old bridge's stored prompt, cron `5,35 * * * *` (twice an hour, offset from the watch), timezone Asia/Singapore, model qwen3.8-flash (Standard), contextDirs = project folder, and every other field shaped exactly like recall-press-watch (same missed-run policy, same execution location). Enabled.
4. Read it back; save to docs/qw-outbox/012-rebuild-bridge/after.json; record its id and next run time.
5. Update docs/qw-outbox/BRIDGE.md: add a dated section "Bridge 2" with the new id, cron, model, and why the old one was disabled.
6. REPORT.md (PASS/FAIL per step + the differing-fields list), then DONE. Do not press Run now on anything.
