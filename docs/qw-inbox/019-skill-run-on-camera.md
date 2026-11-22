# 019 · Run the Recall Press Skill end to end (for the submission film)

Work only inside this project folder. Create `docs/qw-outbox/019-skill-run/CLAIMED` first. Use the `recall-press`
Skill (load it with the Skill tool). Use a fresh workspace folder `docs/qw-outbox/019-skill-run/workspace`. Do not
delete, commit, push or publish anything.

1. **Register two documents as of 20 October 2025**: `samples/members-briefing-2025q3.pptx` (the members' briefing)
   and `samples/board-paper-2025q3.docx` (the board paper). Read each yourself, cross-check with the rules, and
   register your claim lists. Show me every linked sentence (slide 4 "Manufacturing stalled year on year in Q3 2025."
   and the board paper's "As first reported in the October advance estimate…" sentence must be among them).
2. **Replay 21 November 2025 offline.** Judge each affected sentence. Show me the verdicts side by side: slide 4 must
   be *now wrong* and the board paper sentence *still true*, each with its reason.
3. **Prepare the fix.** Produce the updated deck (the engine now writes one updated file per document with every fix
   applied, under `out/<document>-updated/`). Open slide 4 of the updated PowerPoint and show me its text and source
   line.
4. **Today's live check**: run a live check against the official data for the members' briefing and show which
   sentences have later readings (manufacturing Q3 2025 now 4.6%, published 14 Apr 2026).
5. Write `docs/qw-outbox/019-skill-run/REPORT.md` (commands run, verdicts, output file paths, anything that failed),
   then create `docs/qw-outbox/019-skill-run/DONE`. Finish with the Skill's three lines.
