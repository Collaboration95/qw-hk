# Swarm word

An empty ultramarine field. The first press scatters about 5,200 points across it; they drift, then curve in and
settle into the mark and the wordmark, left to right, each overshooting its slot by a hair. A few stragglers arrive
late, and the very last points fill the mark's accent part in the accent colour with small landing pings. At rest
the points breathe on the deck clock, a faint light wave crosses the word every 9 s, and a few free points keep
drifting through the field. ~2.4 s. Canvas, 1920 × 1080, one loop (the deck clock).

**Use it for** data, geo and mapping, AI, analytics, sensing, research tools: products whose raw material is many
small signals that become one picture. It pairs naturally with a point-field carry device on later slides.
**Avoid it for** physical, paper or craft products (use stamp), and for decks whose app is itself a dark particle UI.

## Adapt it
- **Brand**: set `--field` (any colour or gradient), `--brand` (the accent), `--brand-2` on the `<section>` (inline style) or in the defaults at the top of its style. The points take the readable ink for the field (`Deck.inkOn`); the accent is `--brand` if it reads on
  the field and differs from the points, else `--brand-2`.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box. The svg is never shown;
  points are sampled from its strokes. The last stroke (or the last fifth of a single stroke) lands last, in the
  accent: put the part that should spark (a dot, a tip) last.
- **Size**: `--swarm-fs` (236 px). Long names shrink to fit 1700 px automatically.
- **Density**: the `area / 5200` line in `sample()` sets the point budget; above ~8,000 a laptop may drop frames.
- **Timing**: `d` (departure) and `du` (flight) per point in `sample()`; `END` is the total (2.4 s).

## Tiny details
Font-sampled targets after `fonts.ready` · scattered and already drifting on the first frame · each point on its
own arc · streaks at speed, dots at rest · left-to-right assembly · a hair of overshoot · 2% stragglers · the last
points land as the accent with pings · two sizes and two brightnesses · breathing on the clock · a light wave every
9 s · 34 free points that never join · a glow that rises as the word forms.
