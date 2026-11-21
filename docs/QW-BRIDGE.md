# QwenWork bridge · one paste, then Claude drives

QwenWork has no outside API, but it has a scheduler. This sets up one local scheduled task that checks `docs/qw-inbox/` every 10 minutes and runs whatever job file Claude has written there, as a real QwenWork task with the recall-press Skill. Results land in `docs/qw-outbox/<job>/`. Claude reads them and writes the next job.

**Your part, once:** QwenWork Desktop → new task → working folder = this repo (`qw-hk`) → strongest model in the dropdown → `/recall-press` → paste the box. Keep QwenWork open and the Mac awake and plugged in (`caffeinate -dis` in a terminal works).

```
Set up an unattended job runner for the project at /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk, then start the first job. Don't ask me questions; record problems and continue.

1. Create ONE local scheduled task named "recall-press-bridge" that runs every 10 minutes, Singapore time, with working folder /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk, the recall-press Skill enabled, and the strongest available model. Its prompt must be exactly:

---
You are the recall-press job runner. Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first; all paths below are relative to it). Look in docs/qw-inbox/ for job files (*.md). A job is pending if docs/qw-outbox/<job-file-name-without-.md>/ contains neither CLAIMED nor DONE. If no job is pending, reply "idle" and stop at once without any other tool calls. Otherwise take the pending job with the lowest number, create docs/qw-outbox/<job>/CLAIMED containing the current time, then carry out the job file's instructions completely and unattended (never ask questions; record failures and continue). Write every output the job asks for, then docs/qw-outbox/<job>/REPORT.md (what you did, PASS/PARTIAL/FAIL per item, output paths, model name, credits used if visible), then create docs/qw-outbox/<job>/DONE. Process one job per run. If a CLAIMED file is older than 90 minutes with no DONE, treat that job as pending again.
---

2. Record the scheduled task's ID, schedule, working folder, model and execution location in docs/qw-outbox/BRIDGE.md.

3. Now act as the runner yourself in this task (cd to the project folder first): claim and run job docs/qw-inbox/001-acceptance-tests.md exactly as the runner would (CLAIMED → work → REPORT.md → DONE), so the scheduled task does not pick it up too.
```

To stop it later: disable "recall-press-bridge" in Scheduled Tasks.
