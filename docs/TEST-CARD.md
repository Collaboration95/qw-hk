# Desktop test card · plan of 19 November, results of 21 November

**Results are recorded elsewhere.** QwenWork ran these checks as Job 001 on 21 November 2026, 15:24–15:58 SGT (session `mwq2wb75y5x1adbq`, Qwen4-Max). Full record: [docs/qw-results/RESULTS.md](qw-results/RESULTS.md) · summary: [Job 001 report](qw-outbox/001-acceptance-tests/REPORT.md). Job 001 numbered its steps differently; the mapping and the difference from each original test are below. The plan follows unchanged.

| Test | Observed | Difference from the plan |
|---|---|---|
| 1 · Find the Skill | Skill loaded through the Skill tool in the task (Job 001 step 1). | Loaded by the tool, not chosen from the `/` picker. No picker screenshot. |
| 2 · Correct the slide | Slide 4 corrected to “grew 5.0%”, replay run `2025-11-21-8d43d94969a0` (step 2). | None. Slide images rendered from the PPTX, not exported from PowerPoint. |
| 3 · Read a different deck | First read: 4 of 4 sentences and verdicts, written before opening the answer key. Rules alone: 3 (step 3). | The Skill includes a worked example for the zero-growth sentence. |
| 4 · Try the clock | Two one-time tasks created; both missed their slots and were started with Run now. Live runs `2026-11-21-68013a314ad1` (2 corrections) and `2026-11-21-98bbcfe8ff96` (quiet) (steps 4 and 7). | Manual, not automatic. <!-- TODO: fill when job 004/005 report --> Job 004 tests a recurring automatic watch. |
| 5 · Read Mail | Pasted release notice matched to documents; earlier correction recognised (step 5). | Pasted text, not Mail. |
| 6 · Try Hashmeta | Not run in QwenWork. Revisionpedia was built and published through the Hashmeta MCP instead ([build log](HASHMETA-LOG.md)). | No QwenWork connector draft. |
| 7 · Publish the map | Page created; the publisher withheld its URL (step 6). Download not tested. | <!-- TODO: fill when job 004/005 report --> Job 005 publishes the live correction as a public Page. |
| 8 · Export a video | Not run. | Film is planned in QwenWork for Sunday 22 November. |

---

## Original plan · 30 minutes

Open this checkout as the working folder in QwenWork Desktop. Keep the Mac awake. Have a forwarded release for one of the sample figures in Mail. Paste only the quoted text. Save screenshots of sample material, keeping account details out of frame.

1. **Find the Skill · 2 min** Paste “Run ./scripts/install-skill.sh in this folder.” Start a **new task**, type `/`, select recall-press and paste “Show the sample members’ briefing supplied by this Skill.” Capture the Skill picker and filename. Missing → install from Extensions (fallback 1).  

2. **Correct the slide · 4 min** Paste “Start a fresh local project called Morning inside workspace here. Use the Skill to read and register its sample members’ briefing on 20 October 2025. Replay 21 November offline, judge the sentences and open the map and corrected slide four.” Capture the map and slide showing 5.0% where the original said “stalled.” Missing → local replay (2).  

3. **Read a different deck · 4 min** Paste “In a separate fresh project, read samples/unseen/roundtable-reading.pptx from the Skill yourself. Register your full list on 23 October 2025. Replay 21 November 2025. Show every sentence, verdict and reason, plus the count from the rules alone.” Capture the list. Four answers in fallback 3. Missing claim → guided reread (3).  

4. **Try the clock · 3 min setup** Paste “Return to Morning. Register the Skill’s October 2026 economy briefing dated 19 October. Create two one-time tasks, five and ten minutes from now, Singapore time. Both must use Morning and this Skill, check live data, save the run record and report corrections or a quiet night. Show times and execution location.” Continue below, then capture **both** history entries, location (desktop/cloud), run record and second quiet report. Missed run → Run now (4).  

5. **Read Mail · 3 min** Select the forwarded release in macOS Mail. Paste “Read this email and tell me which of my documents need updating. Use Mac Mail and Morning. Match the release, show the document and distinguish earlier corrections.” Capture the release date and matching document. No access → paste release text (5).  

6. **Try Hashmeta · 3 min** Paste “List my Hashmeta sites.” Select your test site in the reply. Paste “On this selected site create one unpublished draft titled ‘Quarterly update test’. Show the draft and its status.” Capture site list and draft status. No draft → save locally (6).  

7. **Publish the map · 4 min** Paste “Publish Morning’s November sample map HTML as a QwenWork Page. Give me its URL.” Open it, select the briefing and try the replacement download. Capture the URL and card. Missing controls → local interactive map (7).  

8. **Export a video · 5 min** Attach three screenshots (original slide, map, corrected slide). Paste “Make a 20-second video from these three screenshots in order. Narrate the change from flat to 5.0%. Export one MP4 with voiceover.” Play it. Capture duration and export; listen for speech. No playable export → local movie (8).  
