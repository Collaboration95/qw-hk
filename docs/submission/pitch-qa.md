# Recall Press · questions for the 11 December pitch

Answers reflect the evidence on 21 November 2026. Replace an answer only with an observed result, including a quiet or failed check. Evidence: [QwenWork results](../qw-results/RESULTS.md), [Job 001 report](../qw-outbox/001-acceptance-tests/REPORT.md), [Hashmeta build log](../HASHMETA-LOG.md).

1. **Digital China · Has anyone paid for coverage after seeing their own slide corrected?**  
   Not yet. The founder wrote the sample publications. The first proof would be an editor paying an agreed fee to cover a second edition after seeing the correction on their own slide.

2. **QwenWork · Could you open a task now and show which part the agent actually did?**  
   Yes. In Job 001 (session `mwq2wb75y5x1adbq`, Qwen4-Max) the recall-press Skill loaded through the Skill tool. The agent read the members’ briefing, registered its own claim list, replayed 21 November 2025, judged each sentence with a reason and produced the corrected slide 4 (run `2025-11-21-8d43d94969a0`). The Skill picker screenshot is a separate check and was not captured.

3. **QwenWork · Did the clock run twice without the founder clicking, and what happened the second time?**  
   Not in the first test. Both one-time checks missed their scheduled slots and were started with Run now. Both live checks then worked. The first (`2026-11-21-68013a314ad1`) found two later revisions and drafted two corrections. The second (`2026-11-21-98bbcfe8ff96`) was quiet and issued nothing twice. Later the same scheduler started the inbox bridge on time: it claimed Job 002 at 21:10 SGT. The first automatic run, scheduled for 23:15 on 21 Nov 2026, started at 23:16:37 SGT. The scheduler checked 8 live series without a manual trigger. The result was quiet.

4. **QwenWork · Can the agent find the claim your rules missed on a different deck?**  
   On an independently written briefing with 8 checkable claims and 2 distractors, QwenWork found all 8 in about 6 minutes. The rules alone found 5. Its verdicts matched the key on 5 of 7 registrable claims. It missed no broken claim. The speaker note could not be registered, and two figure-free sentences received unnecessary number edits. The engine now reads speaker notes and excludes figure-free sentences from `number_only`. The rules now match the key on all 8. [Answer key](../qw-results/fresh-deck-answer-key.json)

5. **Hashmeta · Can I find that figure on a public page and trace its enquiry into CRM?**  
   The public page, yes: the [Q3 2025 manufacturing record](https://revisionpedia.geo.hashmeta.tech/revisions/sg-gdp-manufacturing-yoy-2025-q3/) loads signed out with every reading and source. One labelled test enquiry was submitted to the live form endpoint and appeared in Hashmeta’s form submissions. CRM forwarding is unverified.

6. **Digital China · Why would a chamber buy this if its charts already refresh in PowerPoint?**  
   A refreshed chart can sit under a headline that still says “stalled”. Recall Press finds that sentence across registered briefings and hands the editor replacement wording and an editable file. Its value depends on editors reusing those briefings.

7. **AvePoint · What stops the agent from silently changing a board minute?**  
   Each claim records whether it describes current conditions or a dated release. October really did report flat output, so the board paper keeps that statement, while the current headline gets a proposed replacement and a reason. Nothing changes until the editor chooses.

8. **AvePoint · What happens to the copy a member downloaded yesterday?**  
   It stays on the member’s device. The editor can distribute the corrected copy and cite the release behind it. Recall Press cannot retrieve the download or establish who replaced it.

9. **Alibaba Cloud · Does an email start a background job, and can the sender dictate the new value?**  
   Not tested with Mail. In Job 001 the editor pasted a release notice into the task. The agent matched it to the registered documents and found the correction had already been issued, so it made no new one. The check takes the value from the official series, basis and quarter, not from the notice.

10. **Digital China · Does 57 out of 60 mean almost every slide needs fixing?**  
    No. The 60 are series–quarter records with more than one archived reading. Fifty-seven changed at least once after their first archived reading, and 21 crossed zero or an illustrative cutoff at some point. Whether a slide needs fixing depends on its wording.

11. **AvePoint · Why trust the agent with an ambiguous sentence or a failed source check?**  
    An unresolved claim is held with a reason, and a failed source check must be reported as failed, never quiet. In the rules test on 40 labelled claims, 28 got correct automatic verdicts, 9 were held for the agent with a reason and 3 were missed. The editor applies, skips or edits each proposal.

12. **Hashmeta · Why would anyone visit Revisionpedia before they know your product?**  
    A reader can look up why Q3 manufacturing is quoted as 0.0%, 5.0% and 4.6% and follow the source for each reading. The same record gives an editor a reason to ask about coverage. Search referrals and AI citations are not yet measured.

13. **AvePoint · Can the public directory expose a subscriber’s deck or republish a ministry report?**  
    The directory is built from statistical records, with links to dated releases. The licensed inputs are the attributed data.gov.sg tables; ministry documents carry separate terms. A correction map can embed a deck, so only the founder’s labelled samples go on a public Page.

14. **Digital China · What would convince you that one founder can deliver this profitably?**  
    Measure the editor’s manual correction time alongside registration, agent cost, review time and exceptions over several releases. Compare the cost per covered briefing with the fee an editor actually pays. A change count alone cannot establish a margin.

15. **Alibaba Cloud · What will you show on 11 December if the 24 November release changes nothing?**  
    The actual run record: when the data was checked and whether it succeeded. An unchanged figure gets a quiet result, as in the second live check on 21 November. A failed fetch gets a visible failure. The November 2025 manufacturing example remains a dated historical replay.

16. **Hashmeta · Is anyone still quoting old numbers?**  
    A claim-specific screen on 19 November 2026 checked 48 public records across 47 URLs. Two still presented a superseded figure as current; 27 were still true. One page, updated 20 October 2026, gave Q2 2026 GDP growth as 5.9% after the 14 October release revised it to 6.2%. It is a screen, not a census, and the two are examples, not prospects.
