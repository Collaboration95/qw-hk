# Job 012 · Rebuild the bridge — REPORT

Executed: 2026-11-21 23:33–23:36 SGT (Asia/Singapore) by the recall-press job runner.
Model used for this run: qwen3.8-flash (Standard). No commits/pushes. No "Run now" pressed on any task.

## Per-step results

| Step | Task | Result |
|------|------|--------|
| 1 | Read both tasks, save full stored definitions to `before.json`, list differing fields | **PASS** — `before.json` written (bridge + watch, verbatim from `action=list`). Differing-fields list below. |
| 2 | Disable (not delete) `recall-press-bridge` | **PASS** — disable returned `enabled:false`; read-back confirms `enabled:false`, task still present (id `028f2aa6-…`). |
| 3 | Create `recall-press-bridge-2` (old prompt, cron `5,35 * * * *`, SGT, qwen3.8-flash, contextDirs = project, rest shaped like watch, enabled) | **PASS** — created id `21d91e81-89b1-477c-903f-3e3b113adabc`, enabled true. |
| 4 | Read back, save `after.json`, record id + next run | **PASS** — `after.json` written. Next run **2026-11-22 00:05:00 +08**. |
| 5 | Update `docs/qw-outbox/BRIDGE.md` with dated "Bridge 2" section | **PASS** — appended (existing content preserved). |
| 6 | REPORT.md then DONE; press no "Run" | **PASS** — this file; DONE created after. |

## Differing fields between old `recall-press-bridge` and `recall-press-watch`

**Config fields that differ:**
- `name`: recall-press-bridge vs recall-press-watch
- `description`: different text
- `schedule.expr`: `*/10 * * * *` vs `15,45 * * * *`
- `payload.message`: different prompt bodies

**Config fields that are IDENTICAL in shape (bridge-2 matched the watch on all of these):**
- `schedule.kind`: `cron` (both)
- `schedule.tz`: `Asia/Singapore` (both)
- `payload.kind`: `agentTurn` (both)
- `payload.contextDirs`: `["/Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk"]` (identical)
- `payload.model`: `qwen3.8-flash` / `modelDisplayName` `标准` (both)
- `payload.version`: 2 (both)
- `payload.modelExecutionRoute` / `modelExecutionRouteV2`: same modeKey/engine/harness/apiProtocol/limits (only the runtime `resolvedAt` timestamps differ)
- `enabled`: true (both)

**Fields the scheduler `list` action does NOT expose** (so no difference could be observed; bridge-2 created to match the watch's defaults):
- `missedRunPolicy` — absent from both list entries (neither sets it explicitly). Bridge-2 created without setting it, i.e. same default as the watch.
- `executionTarget` — absent from both; both run **local** (this Mac, QwenWork Desktop). No cloud target on either.
- keep-awake flags — not surfaced by `list`.

**Runtime (non-config) fields that differ:** `lastRunStatus` = `error` (bridge) vs `ok` (watch); `nextRunAt`/`lastRunAt` values.

## New task summary
- **id:** 21d91e81-89b1-477c-903f-3e3b113adabc
- **name:** recall-press-bridge-2
- **cron:** `5,35 * * * *` (Asia/Singapore) — twice an hour, offset from the watch's `15,45`
- **model:** qwen3.8-flash (Standard)
- **enabled:** true
- **next run:** 2026-11-22 00:05:00 +08 SGT
- Note: the `:35` slot (23:35 SGT) passed during creation and did **not** fire (`lastRunAt` null); nothing was run manually, per instructions.

## Outputs
- docs/qw-outbox/012-rebuild-bridge/CLAIMED
- docs/qw-outbox/012-rebuild-bridge/before.json
- docs/qw-outbox/012-rebuild-bridge/after.json
- docs/qw-outbox/BRIDGE.md (Bridge 2 section appended)
- docs/qw-outbox/012-rebuild-bridge/REPORT.md
- docs/qw-outbox/012-rebuild-bridge/DONE

## Assumptions
- "Read both tasks (action=list or get)": the local scheduler exposes no `get`/`show` action, so `action=list` was used (consistent with prior jobs).
- "same missed-run policy / execution location as watch": since `list` does not surface these, bridge-2 was created without overriding them, taking the same defaults the watch uses (local execution, unset/default missed-run policy).
