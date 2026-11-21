# REPORT · Job 004 — Recurring automatic watch (prove scheduled admission)

Runner: QwenWork (Standard-tier job runner acting unattended per `docs/qw-inbox/004-automatic-watch.md`).
Claimed: 2026-11-21 23:13:06 +08. Completed: 2026-11-21 23:14 SGT.

## What was done

Created exactly ONE recurring LOCAL scheduled task via the scheduler tool (`qwenwork_cron_manage_job`, action=add). No "Run now" was pressed — the scheduler will start it on its own. No other files were edited; nothing committed or pushed.

## Task as configured (verified by read-back via action=list)

| Field | Value |
|---|---|
| Task ID | `d5fbdc2b-2c50-4ea0-af3e-984e688f83f8` |
| Name | `recall-press-watch` |
| Schedule kind | cron |
| Cron expression | `15,45 * * * *` (twice an hour, at :15 and :45) |
| Timezone | `Asia/Singapore` |
| Model key | `qwen3.8-flash` |
| Model tier (as configured) | **Standard** (标准) — NOT Pro / Flagship / Max |
| Working folder (contextDirs) | `/Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk` |
| Execution location | Local Desktop (no cloud `executionTarget`; local cron with project `contextDirs`) |
| Enabled | `true` |
| Missed-run policy | `skip` (a missed slot is skipped, not back-filled — keeps each log row a real on-time admission) |
| Next run time shown | `1795274100000` → **2026-11-21 23:15:00 SGT** |
| Last run | `null` (has not fired yet — created, not executed) |

## Exact tool response confirming the model setting

From the `action=add` receipt:
```json
{"success":true,"taskId":"d5fbdc2b-2c50-4ea0-af3e-984e688f83f8","name":"recall-press-watch","enabled":true,"nextRunAt":1795274100000}
```

From the read-back (`action=list`), the persisted payload model fields:
```json
"model": "qwen3.8-flash",
"modelDisplayName": "标准",
"modelExecutionRoute": { "modeKey": "qwen3.8-flash", "modelId": "qwen3.8-flash", ... },
"modelExecutionRouteV2": { "modeKey": "qwen3.8-flash", "modelId": "qwen3.8-flash", ... }
```
`qwen3.8-flash` / `标准` is the Standard tier. (For contrast, the sibling jobs use `gpt-6.1-sol`/旗舰 Flagship and `qwen4-max`/Qwen4-Max — this task deliberately uses Standard.)

## Prompt (stored verbatim, exactly as specified in the job file)

> You are the Recall Press watch. cd /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk. Run a LIVE check of the registered publications against data.gov.sg: `RECALLPRESS_SERIES=$PWD/data/series RECALLPRESS_WORKSPACE=$PWD/workspace/qw-morning .venv/bin/python /Users/speedpowermac/.qwenwork/skills/recall-press/run.py check --trigger schedule --record`. If any source request fails, the verdict is FAILED (never "quiet"). Then append ONE line to docs/qw-results/watch-log.md (create it with a header row if missing) in this exact table format: `| slot (scheduled, SGT) | started (actual, SGT) | trigger | run_id | verdict (corrections/quiet/FAILED) | series checked | new issued corrections |`. Use `date "+%Y-%m-%d %H:%M:%S"` for the actual start time, and the cron slot (:15 or :45 of the current hour) as the scheduled time. The trigger is "scheduled" — this run was started by the scheduler. Do nothing else: no edits to any other file, no commits.

## Assumptions / notes

- **Standard tier mapping:** the scheduler exposes tiers as keys; "Standard" (标准) = `qwen3.8-flash`. Passed explicitly in the payload so the run does not inherit the runner's model.
- **"recall-press Skill enabled":** the local scheduled-task payload schema has no separate skill-enable field. The prompt invokes the recall-press runner directly by absolute path (`.../skills/recall-press/run.py check ...`), which is the same pattern the existing clock-1/clock-2 tasks use. The recall-press Skill is installed at `/Users/speedpowermac/.qwenwork/skills/recall-press/` and its `run.py` is present.
- **Environment pre-checks (read-only):** `.venv/bin/python` → python3.14 present; `data/series/` populated (10+ JSON vintages); `workspace/qw-morning/register.json` present; runner `run.py` present. No live check was executed by this job (that is the scheduled task's own work).
- **Next auto-run:** 23:15:00 SGT today — the first fully automatic admission to observe. This job only sets it up; it does not press Run now and does not wait for the fire.

## Result

PASS — single recurring LOCAL task `recall-press-watch` created with cron `15,45 * * * *` @ Asia/Singapore, Standard model (`qwen3.8-flash`/标准), project working folder, enabled, next run 2026-11-21 23:15:00 SGT, prompt verbatim. Not manually triggered. No commits.
