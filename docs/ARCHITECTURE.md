# Code map

The engine and bundled Skill support Python 3.10 or later. CI runs on Python 3.14. From a clean checkout with `python3` available, run `./demo.sh` to replay the samples offline. It prints the map and corrected file paths for each release.

| Path | What lives here |
| --- | --- |
| `recallpress/` | Python engine and command-line entry point for registration, release checks and corrections. |
| `skills/recall-press/` | Installable QwenWork Skill with its instructions, runner, archive and samples. |
| `web/` | Map renderer assets for reviewing publications and recording decisions. |
| `site/` | Builder for the Revisionpedia site. |
| `data/` | Archived official series with dated releases used for historical checks. |
| `samples/` | Founder sample publications used by the offline replay. |
| `publications/` | Project copies of publications for registration. |
| `tests/` | Engine, bundle, replay and map checks with their fixtures. |
| `docs/` | Project notes and submission materials. |
| `docs/qw-inbox/`, `docs/qw-outbox/` | Job instructions and returned work for jobs QwenWork ran. |
| `docs/qw-results/` | Evidence collected from QwenWork runs. |
| `qwenwork-out/` | Research, evaluation data and other deliverables from QwenWork jobs. |
| `deck/` | Pitch deck materials. |
| `scripts/`, `tools/` | Skill installer and archive maintenance utilities. |

## Run flow

Set the project workspace and archive paths as described in the Skill instructions. The shell function `rp` runs `python3 "$SKILL/run.py" "$@"`.

1. **Register** the original and its verified claims with `rp register FILE --registered-on YYYY-MM-DD --claims CLAIMS.json`.
2. **Check** the archive as of a release date with `rp check --offline --trigger replay --as-of YYYY-MM-DD --record`. Use the returned run ID below.
3. **Judge** each affected sentence with `rp judge --run RUN_ID --claim CLAIM_ID --status VERDICT --reason "Specific evidence for this sentence."` Add `--replacement "Full replacement sentence."` for a fixable verdict.
4. **Fix** the affected publications with `rp fix --run RUN_ID`. The run stores corrected copies alongside its results.
5. **Map** the run with `rp map --run RUN_ID` to review the verdicts and download the corrected files.
