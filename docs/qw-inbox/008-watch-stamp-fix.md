# Job 008 · Fix the watch's Hashmeta stamp time; move the bridge to Standard

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/008-watch-stamp-fix/. Never ask questions; record problems and continue. Do not commit or push. Use the scheduler tool (`qwenwork_cron_manage_job`) for scheduled tasks.

Why: the engine deduplicates quiet checks — a quiet live check on the same day with the same registered claims returns the existing run record (same run_id, its old `finished` time). So the watch's Hashmeta stamp must use the watch run's OWN start time, not the record's `finished`.

1. Read the scheduled task `recall-press-watch` (id d5fbdc2b-2c50-4ea0-af3e-984e688f83f8). Save its current prompt to docs/qw-outbox/008-watch-stamp-fix/watch-prompt-before.txt.
2. Replace its prompt with this exact text (keep model qwen3.8-flash / Standard, cron `15,45 * * * *`, timezone Asia/Singapore, working folder, enabled, missed-run policy unchanged):
---
You are the Recall Press watch, a QwenWork scheduled task. cd /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk. Never ask questions.
1. Record START=$(date "+%Y-%m-%d %H:%M:%S") (Asia/Singapore).
2. Run a LIVE check against data.gov.sg: `RECALLPRESS_SERIES=$PWD/data/series RECALLPRESS_WORKSPACE=$PWD/workspace/qw-morning .venv/bin/python /Users/speedpowermac/.qwenwork/skills/recall-press/run.py check --trigger schedule --record`. Read its JSON output: run_id, series_checked, changes, issued, message. If any source request fails, the verdict is FAILED (never quiet). Quiet checks on the same day reuse that day's record id; that is expected.
3. Append ONE line to docs/qw-results/watch-log.md (keep the existing header): `| <cron slot :15 or :45 of this hour, SGT> | <START> | scheduled | <run_id> | <corrections/quiet/FAILED> | <series_checked> | <number of new issued corrections> | <hashmeta: published/failed/skipped> |`. If the header has 7 columns, add an 8th header cell "hashmeta stamp" (and a matching `---`) before appending.
4. Using the hashmeta connector (direct tools only; site projectId 6b7c9fea-8970-469b-871a-1eb4f8db9601; Indicators templateId f8b3b501-eaf8-4edf-a676-eb7e48b9f750): for each Indicators entry whose slug is one of the series this check covered (the distinct series_id values in the run's verdicts), set `last_checked` to `<START as YYYY-MM-DD HH:MM> SGT`, and in body_html replace the whole paragraph that starts with `<p>Last checked` with `<p>Last checked <START as D Mon YYYY, HH:MM> SGT by the Recall Press watch, a QwenWork scheduled task: <"no new revision" if changes is empty, else "new revision found, see the record pages"> (run <run_id>).</p>`. Then build the collection pages and publish changes; wait for publish status to finish. If verdict is FAILED, skip this step and log hashmeta "skipped".
5. Do nothing else: no other file edits, no commits.
---
3. Read the task back and save the stored prompt + model to docs/qw-outbox/008-watch-stamp-fix/watch-prompt-after.txt.
4. Read the scheduled task `recall-press-bridge` (id 028f2aa6-91bb-460f-9946-0a234139c362). Its recent runs all show "Task missed its scheduled execution time" while recall-press-watch (Standard) was admitted on time at 23:15. Change ONLY its model to the Standard tier (qwen3.8-flash), leaving prompt, cron and folder unchanged. Read it back; record before/after model and the last few run records you can see (status + reason) in the report.
5. REPORT.md: PASS/FAIL for each step with tool outputs (trimmed). Then DONE.
