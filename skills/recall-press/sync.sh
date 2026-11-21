#!/bin/sh
# Run inside the source checkout after updating the engine, map, samples or archives.
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo=$(CDPATH= cd -- "$here/../.." && pwd)
mkdir -p "$here/recallpress" "$here/web" "$here/data/series" "$here/samples"
rsync -rc --delete --delete-excluded --include='*.py' --exclude='*' "$repo/recallpress/" "$here/recallpress/"
rsync -rc --delete --delete-excluded --include='__init__.py' --include='render_map.py' --include='apply_decisions.py' --include='map.css' --include='decisions.js' --exclude='*' "$repo/web/" "$here/web/"
rsync -rc --delete --delete-excluded --include='*.json' --exclude='*' "$repo/data/series/" "$here/data/series/"
rsync -rc --delete --delete-excluded --exclude='__pycache__/' --include='*/' --include='*.pptx' --include='*.docx' --include='*.md' --exclude='*' "$repo/samples/" "$here/samples/"
cp "$repo/recallpress/requirements.txt" "$here/requirements.txt"
python3 - "$here" "$repo/workspace" <<'PY'
from pathlib import Path
import sys
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile

skill, output = map(Path, sys.argv[1:])
output.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(dir=output) as tmp:
    staged = Path(tmp) / "recall-press.zip"
    with ZipFile(staged, "w", ZIP_DEFLATED) as bundle:
        for path in sorted(skill.rglob("*")):
            if path.is_file() and path.name != ".DS_Store" and "__pycache__" not in path.parts:
                bundle.write(path, path.relative_to(skill.parent))
    print("Upload bundle:", staged.replace(output / staged.name))
PY
