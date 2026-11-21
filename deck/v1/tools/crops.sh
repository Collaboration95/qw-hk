#!/bin/zsh
# Crop the shared product captures (deck/shared, 2x) into slide assets.
cd "${0:A:h}/.."
S=../shared
# slide 3: hero band + publication map document list and the slide-four row
magick $S/map-2025-11-21.png -crop 2980x1340+110+180 +repage -resize 1800x -quality 86 src/assets/map-crop.jpg
# slide 5: Revisionpedia record, title through the first/current readings
magick $S/revisionpedia-mfg-q3.png -crop 2560x1240+160+0 +repage -resize 1500x -quality 86 src/assets/rp-q3.jpg
