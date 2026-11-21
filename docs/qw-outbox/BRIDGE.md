# recall-press-bridge

Created: 2026-11-21 15:23 SGT (by QwenWork setup task)

- **Task ID:** 028f2aa6-91bb-460f-9946-0a234139c362
- **Name:** recall-press-bridge
- **Schedule:** cron `*/10 * * * *`, timezone Asia/Singapore (every 10 minutes)
- **Next run at creation:** 2026-11-21 15:30 SGT
- **Working folder (contextDirs):** /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk
- **Model:** gpt-6.1-sol (flagship — strongest available in the local model list)
- **Execution location:** local (this Mac, QwenWork Desktop; requires the app open and the Mac awake)
- **Skill:** recall-press, installed at /Users/speedpowermac/.qwenwork/skills/recall-press (available to scheduled sessions via the skill catalogue)
- **Enabled:** true

Prompt: exactly the runner prompt from the bridge instructions (checks docs/qw-inbox/*.md, pending = no CLAIMED/DONE in docs/qw-outbox/<job>/, lowest number first, CLAIMED → work → REPORT.md → DONE, one job per run, stale CLAIMED > 90 min re-pends, replies "idle" when nothing pending).

To stop: disable "recall-press-bridge" in Scheduled Tasks.

Note: job 001 (001-acceptance-tests.md) was claimed and run by the setup task itself at 15:23 SGT so the bridge does not pick it up.

---

## Bridge 2 — 2026-11-21 23:35 SGT (job 012)

The original `recall-press-bridge` (id `028f2aa6-91bb-460f-9946-0a234139c362`) was **disabled** (not deleted). It had shown "Task missed its scheduled execution time" (Failed, 0 s) on every slot since 22:10, even after its model was moved to Standard at 23:27. Meanwhile `recall-press-watch` (cron `15,45`, Standard) kept being admitted on time, so a replacement was created shaped exactly like the watch's working configuration.

- **Task ID:** 21d91e81-89b1-477c-903f-3e3b113adabc
- **Name:** recall-press-bridge-2
- **Schedule:** cron `5,35 * * * *`, timezone Asia/Singapore (twice an hour, offset from the watch's `15,45`)
- **Model:** qwen3.8-flash (Standard)
- **Working folder (contextDirs):** /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk
- **Execution location:** local (this Mac, QwenWork Desktop)
- **Prompt:** identical to the old bridge's stored runner prompt
- **Enabled:** true
- **Next run at creation:** 2026-11-22 00:05 SGT (the 23:35 slot passed during creation and did not fire; nothing was run manually)

To stop: disable "recall-press-bridge-2" in Scheduled Tasks. Full before/after definitions are in `docs/qw-outbox/012-rebuild-bridge/before.json` and `after.json`.

## 22 November 2026 · observed starts

The original bridge claimed Job 002 automatically at 21:10 and missed every slot from 22:10. The replacement missed its 00:05 and 00:35 slots. The replacement slots reported “Task missed its scheduled execution time”. The owner’s automation now drives QwenWork Desktop to start each job as a Standard-tier task. An enabled schedule or a ping request alone does not establish that a job started automatically.
