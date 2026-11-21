#!/bin/sh
set -eu
repo=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
parent="$HOME/.qwenwork/skills"
if [ ! -d "$parent" ]; then
    echo "Open QwenWork Desktop and visit Extensions → Skills → Install Skill. Select the recall-press folder from $repo/skills. If asked for a ZIP, run skills/recall-press/sync.sh from the checkout and select workspace/recall-press.zip. When $parent exists, rerun this installer." >&2
    exit 1
fi
target="$parent/recall-press"
if [ -L "$target" ]; then
    echo "The installed Skill is a symbolic link. Move that link aside and run this installer again to install a separate copy." >&2
    exit 1
fi
mkdir -p "$target"
rsync -rc --exclude='__pycache__' --exclude='.DS_Store' "$repo/skills/recall-press/" "$target/"
echo "Copied the Skill into $target. Start a new QwenWork Desktop task and select recall-press."
