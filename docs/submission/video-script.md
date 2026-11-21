# Recall Press · submission film

**Target 2:30, maximum 3:00.** Screen recordings of the real product for every product shot. Generated clips only for short transitions. Every historical shot keeps its date and the word “sample”. Filenames are captures still to be made.

Evidence for each shot: [QwenWork results](../qw-results/RESULTS.md), [clock-1](../qw-results/clock-1.md), [clock-2](../qw-results/clock-2.md), [Job 001 report](../qw-outbox/001-acceptance-tests/REPORT.md), [Hashmeta build log](../HASHMETA-LOG.md).

| Time | Capture | On-screen caption | Narration |
|---|---|---|---|
| 0:00–0:15 | `01-map.mov` · Job 001 map. Click the members’ briefing, show “stalled” and the source changing from 14 Oct to 21 Nov 2025. | Sample briefing written by the founder · historical replay, 21 Nov 2025 | “Manufacturing stalled.” That was a fair headline in October 2025. In November the same quarter showed five percent growth. |
| 0:15–0:45 | `02-task.mov` · QwenWork task (session `mwq2wb75y5x1adbq`): the loaded Skill, the registered original, slide 4 and its sentence, the agent’s own claim and reason. Show series, quarter and dated release. | QwenWork Job 001 · run 2025-11-21-8d43d94969a0 | In QwenWork, the Skill reads the slide. The agent links this sentence to manufacturing growth, third quarter, the October release. Then it judges it against the November survey: now wrong, and why. |
| 0:45–1:15 | `03-dated.mov` then `04-fixed.mov` · Show the replay board paper. Switch to the live [correction Page](https://ka62nv48.qwenwork.page/), download the deck and open slide 4. | Sample board paper · October 2025 estimate · then live correction · April 2026 reading | The board paper quotes the October estimate. That stays true. The live check uses the later reading. Slide 4 now reads “Manufacturing grew 4.6% year on year in Q3 2025.” |
| 1:15–1:42 | `05-history.mov` · Show clock-1 and clock-2, then the watch log. | One-time checks · manual Run now after missed slots · first automatic run · 21 Nov 2026, 23:16:37 SGT | We started the first two checks with Run now after missed slots. One found two later revisions. The repeat was quiet. The scheduler then started the first automatic run. It checked eight series and was quiet. |
| 1:42–2:05 | `06-decision.mov` · Make one editor choice on the map: Apply fix, Skip or Edit first. Show the exported decision. | Editor decides · the original file is kept | The editor decides. Apply, skip, or edit the wording first. Nothing is sent until the editor sends it. A copy someone already downloaded stays with them. |
| 2:05–2:30 | `07-record.mov` · Open the public Revisionpedia record signed out, then the labelled test enquiry in Hashmeta’s form submissions. End card: pilot offer, customer status, links. | Revisionpedia · live on Hashmeta · no paying customer yet | Revisionpedia keeps every reading of this figure, with its source. One labelled test enquiry was submitted to the live form endpoint and appeared in Hashmeta’s form submissions. There is no paying customer yet. The first step is one editor with one real slide. |

## 60-second cut

Use the same captures and captions. Read only this column.

| Time | Picture | Narration |
|---|---|---|
| 0:00–0:10 | 01 · slide 4 on the map | Singapore first reported flat manufacturing for Q3 2025. A month later the same quarter showed five percent growth. This sample slide still says “stalled.” |
| 0:10–0:22 | 02 · QwenWork task | In QwenWork, the Skill links the sentence to its figure, quarter and release, and the agent judges it: now wrong. |
| 0:22–0:32 | 03 · dated board paper | This board paper quotes October’s estimate. That stays true, so it stays. |
| 0:32–0:42 | 04 · replacement slide | Here is the corrected slide, editable, with its source. |
| 0:42–0:52 | 05 · task history | Two live checks, started by hand: two later revisions found, then a quiet repeat. |
| 0:52–1:00 | 07 · public record | Revisionpedia keeps every reading. No paying customer yet. The first step is one real slide. |

## Prompt for the QwenWork assembly task

> Assemble the final film **inside this task** from this shot list and the attached captures: 01-map.mov, 02-task.mov, 03-dated.mov, 04-fixed.mov, 05-history.mov, 06-decision.mov and 07-record.mov. Use only the observed interface and outcomes. Keep every caption exactly, including dates, run IDs, “sample” and “manual Run now”. Crop out names and account details. Use straight cuts, readable captions and a plain spoken voice. Export recall-press-full.mp4 at 1080p, target 2:30, maximum 3:00. Assemble recall-press-60.mp4 from the short table, maximum 1:00. Play both inside the task, check speech and duration, and return the files, actual runtimes and the export history.

The submission needs the final film assembled in QwenWork and its YouTube link by Monday 23 November 2026, 23:59 SGT. After upload, open the YouTube link signed out and check it plays.
