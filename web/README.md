# Recall Press publication map

Run `./demo.sh` at the repository root for a fresh project. The five maps in `examples/replays/` come from the engine and have matching 1920 × 1080 headless Chrome captures. Open `examples/replays/2025-11-21.html` for the two decks and newsletter affected by the November manufacturing revision. Select a publication to inspect its sentences and files. July shows GDP’s first Q2 reading and earlier revisions; the July publications themselves are dated 16 July. August and October show the 6% threshold on each side. The last map records the quiet check.

The original standalone examples in `examples/` use illustrative fixtures and include phone previews.

## Render a run

From the repository root, pass the run result, the workspace register and the destination file.

```sh
python3 web/render_map.py workspace/runs/RUN_ID/result.json workspace/register.json workspace/runs/RUN_ID/map.html
```

Python callers can import `render` from `web.render_map` and pass the same three paths. Rendering uses the standard library. The output includes its styles, scripts and available replacement documents. Open it from disk, pass it to a task preview, or paste the HTML into a Page that permits scripts. The official release link opens only when selected.

Each card groups the registered claims from one publication. The counts use the most urgent verdict per document. A historical run uses its saved register snapshot when available. The renderer takes series titles, units and release names from the change record or matches its dates against the local vintage archive.

## Record decisions

Choose **Apply fix**, **Skip** or **Edit first** beside a proposed replacement. After editing, choose **Apply fix** to include the new wording. The download contains the proposal generated for this run. The decision export carries any subsequent wording change.

Expand **Decision JSON**, copy the choices and save them as `decisions.json`. From the repository root, record them against the same engine workspace.

```sh
.venv/bin/python -m recallpress decide --from decisions.json --workspace workspace
```

The browser holds new choices until you export them. The engine validates the run ID and choices under the workspace lock, records editor wording separately from agent judgements, rebuilds edited files and refreshes the map. The export must refer to the original engine workspace.

## Rebuild the samples and examples

```sh
python3 -m venv .venv
.venv/bin/python -m pip install python-pptx python-docx
.venv/bin/python samples/build_samples.py
.venv/bin/python web/build_examples.py
```

The second script reads the hand-written fixtures and the original publications. It changes the quoted sentence in an editable copy, adds a linked source line on that slide and embeds the copy in the example.

## Narration

“On 21 November, Singapore revised third-quarter manufacturing growth from flat to 5.0%.”

“Two decks carried the flat reading, while the board paper accurately recorded what October’s release said.”

“Here on slide four, I can read the new sentence beside the published one and download the corrected deck.”
