# Job 004 · Recurring automatic watch (prove scheduled admission)

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first; paths below are relative). Output folder: docs/qw-outbox/004-automatic-watch/. Never ask questions; record problems and continue. Do not commit or push.

Background: the two earlier live checks (clock-1, clock-2) were started with **Run now** after the scheduler missed their slots ("request_deadline"). Since then the scheduler has admitted runs on time (the bridge claimed job 002 on its 21:10 tick by itself). This job sets up a recurring watch so we get runs that start **automatically**, with nobody pressing anything.

1. Create ONE recurring LOCAL scheduled task named `recall-press-watch`:
   - schedule: cron `15,45 * * * *`, timezone Asia/Singapore (twice an hour)
   - working folder (contextDirs): the project folder; recall-press Skill enabled
   - model: the **Standard** tier (not Pro, Flagship or Max)
   - prompt, exactly:
     ---
     You are the Recall Press watch. cd /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk. Run a LIVE check of the registered publications against data.gov.sg: `RECALLPRESS_SERIES=$PWD/data/series RECALLPRESS_WORKSPACE=$PWD/workspace/qw-morning .venv/bin/python /Users/speedpowermac/.qwenwork/skills/recall-press/run.py check --trigger schedule --record`. If any source request fails, the verdict is FAILED (never "quiet"). Then append ONE line to docs/qw-results/watch-log.md (create it with a header row if missing) in this exact table format: `| slot (scheduled, SGT) | started (actual, SGT) | trigger | run_id | verdict (corrections/quiet/FAILED) | series checked | new issued corrections |`. Use `date "+%Y-%m-%d %H:%M:%S"` for the actual start time, and the cron slot (:15 or :45 of the current hour) as the scheduled time. The trigger is "scheduled" — this run was started by the scheduler. Do nothing else: no edits to any other file, no commits.
     ---
   Do NOT press Run now on it. We want the scheduler to start it.
2. Write docs/qw-outbox/004-automatic-watch/REPORT.md: the task ID, name, cron, timezone, model tier as configured, working folder, execution location, next run time shown, and PASS/FAIL for creating it. Include the exact UI/tool response that confirms the model setting if available.
3. Create docs/qw-outbox/004-automatic-watch/DONE.
