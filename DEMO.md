# Recall Press · 3-minute judge path

Public links first. Nothing here needs a login or a checkout until the local replay at the end. The publications are samples written by the founder; the figures, dates and sources are official.

## Watch

<!-- TODO: add the YouTube link and runtime when the demo film is made in QwenWork (Sunday) -->
Demo film: not made yet. It will be assembled inside QwenWork on Sunday 22 November 2026 and linked here.

## 1 · See the revision in public · 45 s

Open the [Q3 2025 manufacturing record on Revisionpedia](https://revisionpedia.geo.hashmeta.tech/revisions/sg-gdp-manufacturing-yoy-2025-q3/), the live directory built on Hashmeta.

- Look for: 0.0% on 14 Oct 2025, 5.0% on 21 Nov 2025, then 4.9%, 5.3% and 4.6% from 14 Apr 2026. Each reading links to its official release.
- Then: the [Revisions list](https://revisionpedia.geo.hashmeta.tech/revisions) (60 records) and the [Indicators list](https://revisionpedia.geo.hashmeta.tech/indicators) (10).
- [Cover my briefing](https://revisionpedia.geo.hashmeta.tech/cover-my-briefing/) is the enquiry form. It has no forwarding rule and no verified test submission yet.

## 2 · See what one revision does to two sentences · 45 s

Open the [README](README.md#one-revision-two-answers) table and images.

- The members’ briefing headline “Manufacturing stalled year on year in Q3 2025.” is now wrong. The corrected slide reads “Manufacturing grew 5.0% year on year in Q3 2025.”
- The board paper sentence “As first reported in the October advance estimate, manufacturing output was flat year on year in Q3 2025.” is still true and is left alone.

## 3 · See what QwenWork ran · 60 s

| Open | Look for |
|---|---|
| [Job 001 report](docs/qw-outbox/001-acceptance-tests/REPORT.md) | Session `mwq2wb75y5x1adbq`, Qwen4-Max. Skill loaded, slide corrected (replay run `2025-11-21-8d43d94969a0`), unseen deck read 4 of 4. The Skill includes a worked example for the zero-growth wording. |
| [clock-1](docs/qw-results/clock-1.md) | Live data.gov.sg check `2026-11-21-68013a314ad1`: 8 series, 2 later revisions (services 0.6% → 0.7%; manufacturing now 4.6%), 2 corrected drafts. Started manually with Run now. |
| [clock-2](docs/qw-results/clock-2.md) | Repeat check `2026-11-21-98bbcfe8ff96`: quiet, nothing issued twice. Also started with Run now. |
| [Watch log](docs/qw-results/watch-log.md) | <!-- TODO: fill when job 004/005 report --> Runs started by the scheduler at :15 and :45 SGT, with no manual trigger. Pending. |
| [Pitch Page](https://zsg5gl36.qwenwork.page/) | The pitch deck, published as a public Page by QwenWork Job 002. |
| Correction Page | <!-- TODO: fill when job 004/005 report --> The live run’s correction with the corrected PPTX to download. URL to come. |

## 4 · Open the corrected file · 30 s

Without a checkout: download [the Job 001 map](docs/qw-results/map-2025-11-21.html) and open it in a browser. Select the members’ briefing, then **Replacement PPTX**. Slide 4 carries the new headline and the November source line. The original October footer is still on the slide.

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
5. `python -m pytest -q` runs the 116 tests.

Code map: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
