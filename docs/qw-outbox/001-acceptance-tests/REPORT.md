# Job 001 — Acceptance Tests · Report

- **Executed by:** QwenWork Desktop agent (session `mwq2wb75y5x1adbq`)
- **Model:** Qwen4-Max (session model; bridge task uses gpt-6.1-sol)
- **Start:** 2026-11-21 15:24 SGT
- **Finish:** 2026-11-21 15:58 SGT
- **Project:** /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk

## Results per item

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Skill loaded + environment verified | **PASS** | recall-press Skill loaded; Python 3.14.7, all deps satisfied, 10 series JSON present |
| 2 | Correct the slide (offline replay) | **PASS** | Register → replay 2025-11-21 → judge → fix → map; slide 4 corrected (0.0→5.0); PNGs verified via vision |
| 3 | Unseen deck unassisted read | **PASS** | 4/4 sentences found (extractor alone finds 3); all 4 verdicts match answer key |
| 4 | Clock tasks created | **PASS** | Two one-time local tasks created (10/20 min offset); model Qwen4-Max; contextDirs set |
| 5 | Email-style trigger (simulated) | **PASS** | release-notice.txt matched against register; already-issued correction correctly deduplicated |
| 6 | Publish map as QW Page | **PARTIAL** | Page created but publisher withheld URL under protection-context guard; local screenshot fallback produced |
| 7 | Clock tasks fired (live data.gov.sg) | **PASS** | Both fired manually (scheduler missed); clock-1 found 2 live corrections, clock-2 confirmed quiet |

## Output paths

- `docs/qw-results/RESULTS.md` — full detailed report (all steps)
- `docs/qw-results/clock-1.md` — live check run note (corrections)
- `docs/qw-results/clock-2.md` — live check run note (quiet)
- `docs/qw-results/slide4-before.png` / `slide4-after.png` — visual proof
- `docs/qw-results/map-2025-11-21.html` — self-contained correction map
- `docs/qw-results/map-static.png` — rendered map screenshot
- `docs/qw-results/claims-members-briefing.json` — claim list (step 2)
- `docs/qw-results/claims-roundtable.json` — claim list (step 3)
- `docs/qw-results/claims-october-briefing.json` — claim list (step 4)
- `docs/qw-results/release-notice.txt` — simulated email trigger
- `docs/qw-results/render_slide4.py` — PIL slide renderer utility
- `docs/qw-results/page/index.html` — publish-ready map
- `workspace/qw-morning/runs/2025-11-21-8d43d94969a0/` — offline replay run
- `workspace/qw-morning/runs/2026-11-21-68013a314ad1/` — clock-1 live run
- `workspace/qw-morning/runs/2026-11-21-98bbcfe8ff96/` — clock-2 live run
- `workspace/qw-unseen/runs/2025-11-21-e6231c63c55f/` — unseen replay run
- `docs/qw-outbox/BRIDGE.md` — bridge task registration info

## Known issues / caveats

1. **Scheduler not admitting runs on time** — `request_deadline` errors on all scheduled executions. Manual "Run now" works. The bridge cron will also miss until this resolves.
2. **QW Pages publisher** — `qwenwork_pages_publish` withholds result URL under "protection context changed" in this session. Page was created but is not linkable from this task.
3. **Manufacturing revision value discrepancy** — offline replay uses 5.0 (2025-11-21 vintage); live check fetches 4.6 (2026-04-14 vintage, a later revision). Both are valid published figures.

## Credits

Not visible in this session's tooling.
