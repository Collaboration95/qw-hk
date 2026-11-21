# Job 015 · Report — Correct the run label on both public Pages and republish

Run started (CLAIMED): 2026-11-22T01:07:10+0800
Runner: recall-press job runner (unattended)
Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk

## Overall: PARTIAL — source edits applied, republish blocked. Live pages still show the old label.

---

## Step 1 — Edit the header label in both source files: PASS

Replaced `<p class="trigger">Nightly run</p>` with
`<p class="trigger">Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT</p>`
in both files (only that text changed; nothing else touched).

- `docs/qw-outbox/005-correction-page/site/index.html` (line 165)
- `docs/qw-outbox/011-recall-desk-db/app/public/index.html` (line 165)

Verified locally after edit:
| File | "Nightly run" count | "Manual live check …" count |
|---|---|---|
| 005-correction-page/site/index.html | 0 | 1 |
| 011-recall-desk-db/app/public/index.html | 0 | 1 |

## Step 2 — Republish each to its EXISTING Page (update, not create): FAIL

Both `qwenwork_pages_publish` calls with `page_action: "update"` were refused by the
controlled publisher with the identical error:

```
Expected to update the current Page, but the target no longer exists
```

- Static — "Recall Press · live correction" (https://ka62nv48.qwenwork.page/),
  file_path `docs/qw-outbox/005-correction-page/site`, category `static` → REFUSED (error above).
- Dynamic — "Recall Press · recall desk" (https://j3jvce39.qwenwork.page/),
  file_path `docs/qw-outbox/011-recall-desk-db/app`, category `dynamic`, entrypoint `server.mjs`,
  port `8081`, with_database `true` → REFUSED (error above).

Root cause: the controlled QW Pages publisher binds `update` to the **current Chat's** Page.
This job runs in a fresh, unattended job-runner session that has no Page bound to it, so the
publisher reports the update target as non-existent. The publisher exposes no domain/name
argument to retarget an arbitrary existing Page, and the job explicitly forbids
creating a new Page or re-provisioning the database. Per the job instructions
("If an update is refused, record the exact error and do not create a new Page"),
no new Page was created and the database was not re-provisioned or migrated.

Consequence: the corrected `index.html` files are staged locally but NOT live. The public
URLs still serve the previous version.

## Step 3 — Verify signed out: FAIL on the label; desk API checks PASS

Probes via `curl -sL --noproxy '*'` with `LC_ALL=C grep -F` (signed out):

| Check | Expected | Actual | Result |
|---|---|---|---|
| ka62nv48 contains "Manual live check" | yes | no (count 0) | FAIL |
| ka62nv48 contains "Nightly run" | no | yes (count 1) | FAIL |
| j3jvce39 contains "Manual live check" | yes | no (count 0) | FAIL |
| j3jvce39 contains "Nightly run" | no | yes (count 1) | FAIL |
| j3jvce39 `/api/health` | ok | `{"ok":true}` | PASS |
| j3jvce39 `/api/decisions?run_id=2026-11-21-68013a314ad1` | earlier test row | `[{"id":1,"run_id":"2026-11-21-68013a314ad1","claim_id":"members-briefing-2025q3-c2","decision":"apply","replacement_sentence":null,"is_test":true,"decided_at":"2026-11-21T15:36:49.74444+00:00"}]` | PASS |

The label checks fail only because Step 2 could not republish; the desk's data/API behavior
is unchanged and correct.

## Assumptions
- "Republish to its EXISTING Page" requires the controlled publisher's `page_action: "update"`,
  which in this environment targets only the current Chat's Page; there is no parameter to
  point `update` at an arbitrary existing domain.
- Dynamic port set to the skill default `8081` (the server reads `process.env.PORT`; no
  non-8081 port is required by the app).

## Recommended follow-up (for the owner, not done here)
To make Step 1's corrected files go live without creating a new Page, republish must run in a
session already bound to each target Page (e.g. the original 005 / 011 Chat sessions), or via a
publisher path that accepts the existing domain. The source edits are ready and verified.

## Republish from original task

The corrected header label in `docs/qw-outbox/005-correction-page/site/index.html`
(now `Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT`) was republished
to the SAME Page `https://ka62nv48.qwenwork.page/` as a new version (page_action=update, static).

- Republish result: version `V2`, deployment id `1e1d34a7-ecb9-4f55-ab20-35472598468c`, domain `ka62nv48.qwenwork.page`, 1 file uploaded. Succeeded on first attempt (no "details withheld" error).
- Signed-out check: `curl -s --noproxy '*' https://ka62nv48.qwenwork.page/`

Exact output:
```
HTTP=200
Manual live check count: 1
Nightly run count: 0
--- exact header line ---
Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT
```

Verdict: **PASS** — the live page contains `Manual live check` (1) and does not contain `Nightly run` (0).

## Republish from original task (desk)

The corrected header label in `docs/qw-outbox/011-recall-desk-db/app/public/index.html`
(now `Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT`) was republished
to the SAME dynamic Page `https://j3jvce39.qwenwork.page/` as a new version
(page_action=update, category=dynamic, entrypoint `server.mjs`, port 8081, with_database=true).
Same database reused — no re-provision, no migration.

- Republish result: version `V2`, deployment id `8299c491-0210-4d52-804c-aae72eaf27e2`, domain `j3jvce39.qwenwork.page`, 1 file uploaded. Succeeded on first attempt.
- Signed-out checks (`curl -sL --noproxy '*'`):

Exact output:
```
--- header ---
Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT
Manual live check present: yes
Nightly run count: 0
--- /api/health ---
{"ok":true}
--- /api/decisions?run_id=2026-11-21-68013a314ad1 ---
[{"id":1,"run_id":"2026-11-21-68013a314ad1","claim_id":"members-briefing-2025q3-c2","decision":"apply","replacement_sentence":null,"is_test":true,"decided_at":"2026-11-21T15:36:49.74444+00:00"}]
HTTP=200
```

Verdict: **PASS** — live page contains `Manual live check` and does not contain `Nightly run`;
`/api/health` returns `{"ok":true}`; the earlier test decision row (id 1) is still returned by
`/api/decisions`, confirming the reused database is intact across the republish.
