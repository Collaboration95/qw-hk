# QwenWork autopilot · batch 1

One paste replaces the manual test card. QwenWork's own agent runs tests 1–5 and 7, writes the evidence into this repo, and Claude reads it afterwards. Hashmeta (test 6) and the video (test 8) come in batch 2.

**Before pasting:** open QwenWork Desktop → new task → working folder = this repo (`qw-hk`) → pick the strongest model in the dropdown (Qwen4-Max if listed) → select the `recall-press` Skill with `/`. Keep the Mac awake and plugged in. Then paste everything inside the box below and leave it alone.

---

```
You are running an unattended acceptance test of the recall-press Skill in this folder. Do not stop to ask me questions; when something fails, try the listed fallback, record what happened and move on. Never invent a result. Work only inside this folder.

Write all evidence to docs/qw-results/ (create it). Keep one running file, docs/qw-results/RESULTS.md, and update it after EVERY step, so partial progress survives if you stop. For each step record: the exact command(s) you ran, PASS / PARTIAL / FAIL, the key output lines verbatim, the paths of files you produced, and one sentence on anything surprising. At the top of RESULTS.md record the model name you are running on and the start time (Singapore time).

STEP 1 · Skill. Confirm the recall-press Skill is loaded in this task (say how you know: Skill tool listing, or reading skills/recall-press/SKILL.md). List the sample files the Skill supplies.

STEP 2 · Correct the slide. In a fresh project folder workspace/qw-morning, use the Skill to read the sample members' quarterly briefing YOURSELF, cross-check against the rule extractor, and register your full claim list with --claims as of 20 October 2025. Then replay 21 November 2025 offline, judge each affected sentence, produce the corrected deck and the publication map. Verify: slide four of the corrected deck says manufacturing grew 5.0% year on year in Q3 2025, the original still says "stalled", services stays at 0.6%. Export slide four of BOTH original and corrected decks to PNG (docs/qw-results/slide4-before.png, slide4-after.png) and copy the map HTML to docs/qw-results/map-2025-11-21.html.

STEP 3 · Read an unseen deck. In a separate fresh project workspace/qw-unseen, read samples/unseen/roundtable-reading.pptx yourself (do NOT open any answer key or fallback doc first). Write your claim list with a verdict and reason for every verifiable sentence. Register it as of 23 October 2025 and replay 21 November 2025. Also report how many claims the rule extractor alone finds. Record your FIRST unassisted count and verdicts in RESULTS.md before anything else. Only after recording, compare with docs/FALLBACKS.md item 3 and score yourself sentence by sentence.

STEP 4 · Clock. Return to workspace/qw-morning. Register the Skill's October 2026 economy briefing as of 19 October 2026. Create TWO one-time local scheduled tasks, 10 and 20 minutes from now (Singapore time). Each must use the same absolute workspace/qw-morning folder and the recall-press Skill, run a LIVE data.gov.sg check, save a run record, and report corrections or an explicit quiet night (a source failure must be reported as a failure, never as quiet). Record both job IDs, fire times and execution location in RESULTS.md. Do not wait for them; carry on.

STEP 5 · Email-style trigger. Without Mail access, simulate the forwarded-release route: write a short plain-text release notice for the 21 November 2025 Economic Survey (date, period Q3 2025, manufacturing 5.0% y/y, link to the MTI release listed in data/SOURCES.md) to docs/qw-results/release-notice.txt, then treat that text as the input: tell me which documents in workspace/qw-morning need updating, distinguishing earlier corrections from new ones. Mark this step "pasted input, not Mail".

STEP 6 · Publish the map as a QwenWork Page. Publish docs/qw-results/map-2025-11-21.html (with any files it needs next to it) as a QW Page. Record the public URL. Fetch the URL and confirm the page loads and shows the members' briefing card. Note whether the replacement-download button works on the hosted page; if scripts or downloads are blocked, say so.

STEP 7 · Check the clock. When steps 1–6 are done, check whether the step-4 jobs have fired (scheduled task history / run logs). Record for each: fired yes/no, actual time, location, run-record path, its verdict. If neither has fired yet, record that and stop; I will check later.

FINISH. At the end of RESULTS.md write a table: step, result, one-line evidence. Then a section "What a judge would want to see on video" listing the 5 most visual moments from this run with the file or screen that shows each. Present RESULTS.md to me as a file card.
```
