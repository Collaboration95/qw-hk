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