# Scan

A dark sea under a faint graticule. The first press sends a push-broom swath across: a tiny satellite rides a thin noisy scan line, the footprint lights up behind it, and the mark and wordmark come out of it as if imaged, from coarse false-colour blocks to sharp type about half a second later. ~2.3 s. Reduced motion and print show the final lockup.

**Use it for** earth observation, mapping and GIS, climate and ag data, satellites, medical or industrial imaging, sensing and analytics.
**Avoid it for** consumer, social or playful products, and anything with no data or imaging story; the motion is precise and quiet, not celebratory.

## Adapt it
- **Brand**: `--field` (the sea; graticule and terrain tints come from it), `--brand` (the mark, the second pass), `--brand-2` (the first false-colour pass). Set them on the `<section>` or once in `theme.css` as `--deck-brand` / `--deck-brand-2`.
- **Mark**: `__MARK__` (use-pack `--mark`): stroke paths in a 24 x 24 box; the canvas images them stroke for stroke.
- **Word**: the engine's `--ink-auto` (also the scan line and ticks). Long names shrink to fit (`--rv-fs`).
- **Layout**: `--rv-y` moves the lockup up or down.

## Params
- `--field`: the sea under the swath; graticule and terrain classes are tinted from it
- `--brand`: the mark and the second, truer pass
- `--brand-2`: the first, coarse false-colour pass
- `--rv-fs`: wordmark size (shrinks for long names)
- `--rv-y`: the lockup's centre line
- `__MARK__`: stroke paths in a 24 x 24 box; the canvas images them stroke for stroke

## Tiny details
a tiny satellite rides the top of the scan line across the field · the scan line itself is thin and noisy, like a real sensor · the strip behind the line lights up as the instrument's footprint · the lockup comes out of the swath as if imaged: coarse false-colour blocks right behind the line · the image resolves through finer, truer passes to sharp type about half a second later · tick marks run along both swath edges as it goes · the footprint and ticks fade once the image is in · a faint graticule sits under everything, tinted from the field · terrain classes in the coarse pass are drawn from the field and brand colours · film grain and a soft vignette give the field depth.
