# Job 017 · Clean Pages — REPORT

Scope note: this section covers the **live correction Page** only
(`correction-index.html` copy → republish → checks). The recall desk Page (011)
is published from a different task and appends its own section.

## Section A — Live correction Page (this task)

### Step 1 — Copy decluttered asset over target
Copied `docs/qw-inbox/017-assets/correction-index.html` over
`docs/qw-outbox/005-correction-page/site/index.html`. Nothing else changed
(`server.mjs` untouched — that is the desk Page, out of scope here).
Target folder now contains only `index.html` (124422 bytes).
- **PASS** — copied file contains "is now wrong." (1), "Finds the sentences in your briefings" (1),
  "Manual live check" (0), "run 2026-" (0).

### Step 2 — Republish to EXISTING Page as new version (update)
`qwenwork_pages_publish` page_action=update, category=static, name "Recall Press · live correction".
- Result: version **V3**, deployment id `97f4ea8d-0b93-40ce-bff2-b402eb734b53`,
  domain `ka62nv48.qwenwork.page`, url https://ka62nv48.qwenwork.page/, 1 file uploaded.
- Succeeded on first attempt; update was not refused; no new Page created.
- **PASS**

### Step 3 — Signed-out verification (curl -sL --noproxy '*' + LC_ALL=C grep -F)
Exact output:
```
HTTP=200  bytes=  135022
contains 'is now wrong.': 1
contains 'Finds the sentences in your briefings': 1
contains 'Manual live check': 0
contains 'run 2026-': 0
```
Required present: "is now wrong." ✓ and "Finds the sentences in your briefings" ✓.
Required absent: "Manual live check" ✓ and "run 2026-" ✓.
- **PASS**
- Desk-only sub-checks (/api/health, /api/decisions?run_id=...) are not applicable to this
  static Page and are handled by the recall-desk task.

### Overall
Live correction Page: Steps 1–3 all **PASS**.

---

## Section B — Recall desk Page (this task, 011/desk)

Scope: desk-index.html copy → republish to the existing dynamic Page → checks. Same database kept
(no re-provision, no migration). `server.mjs` untouched.

### Step 1 — Copy decluttered desk asset over target
Copied `docs/qw-inbox/017-assets/desk-index.html` over
`docs/qw-outbox/011-recall-desk-db/app/public/index.html`. `cmp` reports the target byte-identical
to the asset (126271 bytes). `git status` shows only `app/public/index.html` modified; `server.mjs`
unchanged. The asset retains the desk persistence script (2 refs to `/api/decisions`, claim
`members-briefing-2025q3-c2`).
- **PASS** — target contains "is now wrong." (1), "Finds the sentences in your briefings" (1),
  "Manual live check" (0), "run 2026-" (0).

### Step 2 — Republish to EXISTING Page as new version (update)
`qwenwork_pages_publish` page_action=update, category=dynamic, entrypoint `server.mjs`, port 8081,
with_database=true, name "Recall Press · recall desk". Same domain/database reused.
- Result: version **V3**, deployment id `6d2f8f19-8537-4c24-9ccb-48396594ef06`,
  domain `j3jvce39.qwenwork.page`, url https://j3jvce39.qwenwork.page/, 1 file uploaded.
- Update accepted on first attempt; not refused; no new Page created; no re-provision/migration.
- **PASS**

### Step 3 — Signed-out verification (`curl -sL --noproxy '*'` + `LC_ALL=C grep -F`)
Exact output:
```
bytes:   136871
contains 'is now wrong.': 1
contains 'Finds the sentences in your briefings': 1
contains 'Manual live check': 0
contains 'run 2026-': 0
/api/health -> {"ok":true}
/api/decisions?run_id=2026-11-21-68013a314ad1 -> HTTP 200
[{"id":1,"run_id":"2026-11-21-68013a314ad1","claim_id":"members-briefing-2025q3-c2","decision":"apply","replacement_sentence":null,"is_test":true,"decided_at":"2026-11-21T15:36:49.74444+00:00"}]
```
Required present: "is now wrong." ✓ and "Finds the sentences in your briefings" ✓.
Required absent: "Manual live check" ✓ and "run 2026-" ✓.
Desk sub-checks: /api/health ok ✓; earlier test decision row (id 1) still returned ✓ (DB intact).
- **PASS**

### Overall
Recall desk Page: Steps 1–3 all **PASS**.
