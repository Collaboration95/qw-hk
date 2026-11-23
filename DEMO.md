# Recall Press · 3-minute judge path

**[Try the live recall desk](https://j3jvce39.qwenwork.page/)** · sample run `2026-11-21-68013a314ad1`. Job 011 hosts the two corrections from Job 001’s manual 15:48 SGT check in Desktop session `mwq2wb75y5x1adbq`. The public desk now labels it “Manual live check · started with Run now · 21 Nov 2026, 15:48 SGT”.

The desk, correction Page and Revisionpedia are public. The replay map, images and task reports require organiser access to the private repository. That access is unconfirmed.

## Watch

**[Watch the film on YouTube](https://youtu.be/u_WRPNRtmmI)** · 1:27.

One quarter's manufacturing figure was published five times in six months. The film follows the slide it broke ("Manufacturing stalled…"), the board paper it didn't, the editor's approval and the updated PowerPoint, then Revisionpedia on Hashmeta and the Recall Press Skill in QwenWork. The illustrations were generated in QwenWork; the QwenWork screens are recorded stills, sped up; the sample briefing and board paper are founder-written, and every figure, date and source is real. Script and shot list: [docs/submission/video-script.md](docs/submission/video-script.md).

## 1 · See the revision in public · 45 s

Open the [Q3 2025 manufacturing record on Revisionpedia](https://revisionpedia.geo.hashmeta.tech/revisions/sg-gdp-manufacturing-yoy-2025-q3/), the live directory built on Hashmeta.

- Look for: 0.0% on 14 Oct 2025, 5.0% on 21 Nov 2025, then 4.9%, 5.3% and 4.6% from 14 Apr 2026. Each reading links to its official release.
- Then: the [Revisions list](https://revisionpedia.geo.hashmeta.tech/revisions) (60 records) and the [Indicators list](https://revisionpedia.geo.hashmeta.tech/indicators) (10).
- [Cover my briefing](https://revisionpedia.geo.hashmeta.tech/cover-my-briefing/) is the enquiry form. One labelled test enquiry was submitted to the live form endpoint and appeared in Hashmeta’s form submissions.

## 2 · See what one revision does to two sentences · 45 s

Open the [README](README.md#one-revision-two-answers) table and images.

- The members’ briefing headline “Manufacturing stalled year on year in Q3 2025.” is now wrong. The corrected slide reads “Manufacturing grew 5.0% year on year in Q3 2025.”
- In the multi-document local replay, the board paper sentence “As first reported in the October advance estimate, manufacturing output was flat year on year in Q3 2025.” is still true and is left alone.

## 3 · See what QwenWork ran · 60 s

| Open | Look for |
|---|---|
| [Job 001 report](docs/qw-outbox/001-acceptance-tests/REPORT.md) | Session `mwq2wb75y5x1adbq`, Qwen4-Max. Skill loaded, slide corrected (replay run `2025-11-21-8d43d94969a0`), expected edit supplied in the task, unseen deck read 4 of 4. The Skill includes a worked example for the zero-growth wording. |
| [clock-1](docs/qw-results/clock-1.md) | Live data.gov.sg check `2026-11-21-68013a314ad1`: 8 series, 2 later revisions (services 0.6% → 0.7%; manufacturing now 4.6%), 2 corrected drafts. Started manually with Run now. |
| [clock-2](docs/qw-results/clock-2.md) | Repeat check `2026-11-21-98bbcfe8ff96`: quiet, nothing issued twice. Also started with Run now. |
| [Watch log](docs/qw-results/watch-log.md) | The watch was configured for :15 and :45 SGT. The 21 Nov 23:15 slot started automatically at 23:16:37. It checked eight series and was quiet. The 23:45 slot missed. The watch log has one row. The owner’s automation now drives QwenWork Desktop to start each job as a Standard-tier task. |
| [Pitch Page](https://vtzcv3g2.qwenwork.page/) | The pitch deck, republished with corrected headlines by Job 009. |
| Open the [correction Page](https://ka62nv48.qwenwork.page/) | Download the live correction. Slide 4 reads “Manufacturing grew 4.6% year on year in Q3 2025.” |
| [Fresh deck report](docs/qw-outbox/010-fresh-deck-read/REPORT.md) · [answer key](docs/qw-results/fresh-deck-answer-key.json) | On the first blind read of an independent deck, QwenWork read 8 claims, registered 7 and matched the key on 5/7. [Job 016](docs/qw-outbox/016-fresh-deck-rerun/REPORT.md) rechecked and reused that reading in QwenWork. Rules alone linked 5. With the reading, the fixed engine registered all 8, including the speaker note, and matched all 8 verdicts. |

## 4 · Open the corrected file · 30 s

With organiser repository access, download [the Job 001 map](docs/qw-results/map-2025-11-21.html) and open it in a browser. Select the members’ briefing, then **Replacement PPTX**. Slide 4 carries the new headline and the November source line. The original October footer is still on the slide.

## Try the recall desk

Open the members’ briefing in the public desk and inspect the labelled Apply decision. The desk accepts decisions for one sample run and two claims. Job 011 saved and read back one labelled Apply. A POST with the choice “delete” returned 400. Skip writes and the DELETE method were untested. The PPTX contains the proposed sentence and its April 2026 source. The October footer identifies the original reading. Browser edits save or export wording. A separate local rebuild applies it to a new file.

## Local replay · 3 minutes, needs Python 3.10+

```sh
git clone https://github.com/Collaboration95/qw-hk.git && cd qw-hk
python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements-dev.txt
./demo.sh
```

`./demo.sh` registers the sample publications in a fresh workspace and replays five dated checks offline, using only the figures published by each date. It prints a map and the corrected files for each.

1. Open the map printed for **2025-11-21**. Select the members’ briefing. Slide 4 is marked now wrong; download the replacement and open it in PowerPoint or Keynote.
2. On the same map, open the board paper. Its dated sentence is still true and gets no replacement.
3. Open the maps for **2026-08-11** and **2026-10-14**. The Q2 2026 GDP figure moves 5.7% → 5.9% → 6.2%. “Under 6%” holds at 5.9% and breaks at 6.2%.
4. The map for **2026-10-16** is a quiet check: no new revision, no files.
5. `python -m pytest -q` runs the test suite.

Code map: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
