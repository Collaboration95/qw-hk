# Job 005 · Publish the live run's correction as a public QwenWork Page

Project folder: /Users/speedpowermac/Documents/projects/CODE_MAIN/personal/qw-hk (cd there first). Output folder: docs/qw-outbox/005-correction-page/. Never ask questions; record problems and continue. Do not commit or push.

Goal: a public Page where anyone can open the correction from the real QwenWork live check of 21 Nov 2026 (run 2026-11-21-68013a314ad1) and download the corrected slide deck.

1. Make a publish folder `docs/qw-outbox/005-correction-page/site/` containing only `index.html`, a copy of `workspace/qw-morning/runs/2026-11-21-68013a314ad1/map.html` (it is self-contained: the corrected decks are embedded as data URIs).
2. Add a small fixed banner at the very top of the body of that copy (do not otherwise change the map): "Sample publications written by the founder. Figures and sources are official (data.gov.sg / SingStat). Produced by a QwenWork live check on 21 Nov 2026, run 2026-11-21-68013a314ad1." Plain text, readable on a phone.
3. Publish that folder as a NEW QwenWork Page named "Recall Press · live correction". If the publisher refuses or withholds the URL, try once more in a fresh way (e.g. different Page name); then record the exact error and stop.
4. Verify signed out with curl: HTTP 200; the HTML contains "Members" and "4.6%"; extract the first `download=` data URI for the slide-4 claim (members-briefing-2025q3-c2), base64-decode it to `docs/qw-outbox/005-correction-page/check.pptx`, and with `.venv/bin/python -c` + python-pptx print slide 4's text. Expected to contain "grew 4.6%".
5. REPORT.md: public URL, Page name, deployment/version id if shown, each check PASS/FAIL with the actual output, model name if visible. Then create DONE.
