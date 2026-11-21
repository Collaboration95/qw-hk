# Job 006 · QwenWork → Hashmeta: stamp "last checked" on Revisionpedia, test the enquiry route

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/006-hashmeta-loop/. Never ask questions; record problems and continue. Do not commit or push. Use the **hashmeta** connector (custom MCP, added by the owner) for every Hashmeta read/write. Use direct Hashmeta tools (no Hashmeta AI tasks, they cost credits).

Site: Revisionpedia, projectId `6b7c9fea-8970-469b-871a-1eb4f8db9601`, https://revisionpedia.geo.hashmeta.tech
Collection "Indicators": templateId `f8b3b501-eaf8-4edf-a676-eb7e48b9f750` (10 entries; `data.slug` equals the series id, e.g. `sg-gdp-manufacturing-yoy`; fields include `last_checked` (text) and `body_html` (richtext) whose second-to-last paragraph is currently `<p>Last checked 19 Nov 2026.</p>`).

A. Connector check. Call the hashmeta list-sites tool. PASS if Revisionpedia with the projectId above is listed. If the connector is missing or fails, record the exact error, write REPORT.md and DONE, and stop.

B. Find the newest live check. Look in workspace/qw-morning/runs/*/result.json; take the newest by `finished` whose `replay` is false. Read `run_id`, `finished`, `trigger`, `series_checked`, `changes`, `issued`. (If docs/qw-results/watch-log.md exists, its newest line is the same run; cross-check.)

C. Stamp the site. For each Indicators entry whose slug is in `series_checked`:
   - set `last_checked` to `YYYY-MM-DD HH:MM SGT` (the run's finished time, Asia/Singapore);
   - in `body_html`, replace the paragraph that starts `<p>Last checked` with exactly: `<p>Last checked <D Mon YYYY, HH:MM> SGT by the Recall Press watch, a QwenWork scheduled task (run <run_id>): <either "no new revision since the previous check" if changes is empty, or "new revision found — see the record pages">.</p>` Change nothing else in the entry.
   Read each entry first and pass back its updatedAt/hash if the update tool supports it. Then rebuild/publish the collection pages and publish the site changes with the hashmeta tools (build collection pages, then publish changes; check publish status until done).

D. Verify signed out: `curl -s https://revisionpedia.geo.hashmeta.tech/indicators/sg-gdp-manufacturing-yoy/` (follow redirects) contains "Recall Press watch" and the run id. Record the matching line. Do the same for one other stamped indicator. Indicators not in series_checked must still say 19 Nov 2026 (check one).

E. Test the enquiry route once. Submit ONE clearly labelled test through the live public form on https://revisionpedia.geo.hashmeta.tech/cover-my-briefing/?record=sg-gdp-manufacturing-yoy-2025-q3&intent=coverage (use the built-in browser, filling the visible form), with: name "Recall Press route test", email "route-test@example.com", organisation "Recall Press", publication "Members' quarterly economy briefing (sample)", message "TEST: automated end-to-end check of the enquiry route by a QwenWork task. Please ignore.", consent ticked. Then with the hashmeta tools list submissions for form id 1 and confirm the test appears; record its submission id, time, and the record/source fields captured. Never submit more than one.

F. Make the stamp automatic. If a scheduled task named `recall-press-watch` exists, edit its prompt (keep everything already there) to add a final step: "Then, using the hashmeta connector, do steps C and D of docs/qw-inbox/006-hashmeta-loop.md for this run only (stamp last_checked and the Last checked paragraph on the Indicators entries for the series you checked, publish, verify one page signed out), and add the publish result to your watch-log line." Keep its model and schedule unchanged. If it does not exist, record that.

REPORT.md: PASS/PARTIAL/FAIL for A–F with exact tool outputs (trim long ones), entries updated, the live lines from D, the submission id from E, the new watch prompt from F, model name if visible, Hashmeta credits if shown. Then create DONE.
