# Fuzz set

Random brands for proving a pack item is general: `marks` (16 generic marks as 24 × 24 stroke paths with
`pathLength="1"`), `words` (1 to 12 characters, with spaces and "&"), `palettes` (light, dark, saturated, a
gradient, a cream and a near-black field, each with a brand and second brand colour).
`scripts/pack-gallery.mjs --fuzz N` renders every reveal and story N times with random picks (seeded, `--seed`).
`scripts/use-pack.mjs … --mark <name | file.svg>` fills `__MARK__` from here or from the product's own SVG.
