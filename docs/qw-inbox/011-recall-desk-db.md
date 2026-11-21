# Job 011 · "Recall desk": the correction Page remembers the editor's decisions (dynamic Page + database)

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/011-recall-desk-db/. Never ask questions; record problems and continue. Do not commit or push. Use the qw-pages and qw-pages-supabase Skills. **The owner explicitly requests publishing this Page, and explicitly authorises ONE live test write plus a read-back for verification** (rows labelled as tests, see step 5).

Today the public correction Page (https://ka62nv48.qwenwork.page/, job 005, source docs/qw-outbox/005-correction-page/site/index.html) lets an editor click Apply fix / Skip / Edit first for each flagged sentence, but the choice is lost on reload; it only offers a JSON export. Make the choice persist in a database.

Build in `docs/qw-outbox/011-recall-desk-db/app/`:
1. A small Node server (no build step; `node server.mjs`, PORT from env, default 3000) that:
   - serves `public/index.html` = a copy of the job-005 page, with ONE change: the inline decision script also (a) on load, GETs `/api/decisions?run_id=<run>` and restores each saved decision (pressed state + state text + edited sentence); (b) after every Apply/Skip, POSTs `{run_id, claim_id, decision, replacement_sentence?}` to `/api/decisions`; (c) shows a small line under the buttons: "Saved <time>" or "Not saved: <reason>". Keep everything else in the page identical (banner, map, downloads). Add one line to the banner: "Decisions on this page are saved for the sample editor."
   - `GET /api/decisions?run_id=` → latest decision per claim_id for that run (JSON).
   - `POST /api/decisions` → validates run_id (must equal 2026-11-21-68013a314ad1), claim_id (must be one of the claim ids present in the page), decision in {apply, skip}, replacement_sentence ≤ 400 chars; inserts a row; returns the row. Reject anything else with 400. No delete/update endpoints.
   - `GET /api/health` → {ok:true}.
   Use the runtime-injected SUPABASE_URL / SUPABASE_ANON_KEY server-side only (never sent to the browser).
2. Database (qw-pages-supabase): provision once (name "recall-desk"); migration: table `decisions` (id bigint generated identity primary key, run_id text not null, claim_id text not null, decision text not null check (decision in ('apply','skip')), replacement_sentence text, is_test boolean not null default false, decided_at timestamptz not null default now()). Index on (run_id, claim_id, decided_at desc).
3. Publish as a dynamic Page named "Recall Press · recall desk" (category dynamic, entrypoint server.mjs, with_database true).
4. Verify signed out: `curl -sL --noproxy '*' <url>/api/health` → ok; `<url>/` contains "Members" and "Decisions on this page are saved".
5. Authorised live test (exactly once): POST `{run_id:"2026-11-21-68013a314ad1", claim_id:"members-briefing-2025q3-c2", decision:"apply"}` with header `x-test: 1` (server sets is_test=true when that header is present), then GET `/api/decisions?run_id=2026-11-21-68013a314ad1` and confirm the decision comes back. Record both responses. Also confirm a POST with decision "delete" returns 400.
6. REPORT.md: Page URL, deployment/version, DB provisioning + migration results, the verification outputs, model name if visible. Then DONE.
