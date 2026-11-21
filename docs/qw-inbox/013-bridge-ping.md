# Job 013 · Bridge ping (proves the scheduled bridge picks up work by itself)

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/013-bridge-ping/. Never ask questions; record problems and continue. Do not commit, push or edit any file outside the output folder.

1. Create docs/qw-outbox/013-bridge-ping/CLAIMED containing the current time.
2. Run `.venv/bin/python -m pytest -q 2>&1 | tail -5` and keep the last line (the pass/fail count).
3. Write docs/qw-outbox/013-bridge-ping/REPORT.md with exactly these lines:
   - `model:` the model name this task is running on, as shown to you (write "not disclosed" if you cannot see it)
   - `tests:` the last pytest line from step 2
   - `started:` / `finished:` times (Asia/Singapore)
   - `notes:` anything that blocked you, else "none"
4. Create docs/qw-outbox/013-bridge-ping/DONE.

Keep it short; this is a connection test, not a build job.
