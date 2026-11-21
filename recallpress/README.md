# Replay the November 2025 manufacturing revision

For all publications together, run `./demo.sh` at the repository root. It prints every map and corrected-file path.

For one publication, create the local environment once with `python3 -m venv tests/.venv` and `tests/.venv/bin/python -m pip install -r recallpress/requirements.txt`. Use a fresh workspace for the first replay. The five commands below register the sample slide deck, replay the official release, record a judgement, prepare the replacement deck and print the map path.

```sh
tests/.venv/bin/python -m recallpress register samples/members-briefing-2025q3.pptx --registered-on 2025-10-20 --workspace workspace/replay
run=$(tests/.venv/bin/python -m recallpress check --as-of 2025-11-21 --offline --trigger replay --workspace workspace/replay | tests/.venv/bin/python -c 'import json,sys; print(json.load(sys.stdin)["run_id"])')
tests/.venv/bin/python -m recallpress judge --run "$run" --claim members-briefing-2025q3-c2 --status now_wrong --reason "The revised year-on-year figure is 5.0%. Manufacturing grew in Q3, so the October headline saying it stalled is wrong." --workspace workspace/replay
tests/.venv/bin/python -m recallpress fix --run "$run" --workspace workspace/replay
tests/.venv/bin/python -m recallpress map --run "$run" --workspace workspace/replay
```

Open the returned HTML file. Slide 4 has a corrected headline and source line. The services claim stays unchanged. Record an editor choice with `decide --run "$run" --claim members-briefing-2025q3-c2 apply` or `skip` using the same workspace. The browser export can be applied with `decide --from decisions.json --workspace workspace/replay`. Repeating the check returns `no_change: true` and writes no files by default. Add `check --record` to save a quiet result for a scheduled task or requested quiet map. Each run's result contains its issuance ledger and the register snapshot used to produce that run.

For a live check, omit `--offline` and `--as-of`. The engine refreshes registered observations and appends new data.gov.sg vintages to the series directory. Use `--series-dir DIR` or `RECALLPRESS_SERIES` for a project-local archive copy.

Install pytest separately for development. Run `tests/.venv/bin/python -m pytest tests -q -p no:cacheprovider` for the public suite. After freezing rules, run `tests/.venv/bin/python -m pytest tests/holdout.py -q -p no:cacheprovider` once for the unseen publication.

The rules supply a first reading for the local demo. In QwenWork the agent reads the document and registers the complete list with `--claims`. Use `judge --hold --reason ...` on an unresolved affected claim. The owner’s desktop checks and scored reading are in `docs/TEST-CARD.md`.
