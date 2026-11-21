# Split-flap board

A blank departure board hangs from two rods on a vermilion station wall. The first press sets every flap
spinning through its drum in order (blank, A–Z, 0–9); the flaps land left to right on the mark and the word, each
last flap bouncing a hair off its stop, while the housing shivers with the clatter. One flap lands a beat late.
At rest, every 14 s the last blank flap shuffles once. ~2.2 s. Print and reduced motion show the landed board.

**Use it for** travel, mobility, logistics and freight, booking and scheduling, events, anything about time,
routes or arrivals. It says "it's happening now, on time".
**Avoid it for** calm or organic brands, and for names longer than about 12 characters (the flaps get small).

## Adapt it
- **Brand**: set `--field` (the wall: any colour or gradient), `--brand` (the mark's colour), `--brand-2` on the `<section>` (inline style) or in the defaults at the top of its style. The board stays near-black so the characters always read; the mark takes `--brand` if it
  reads on the board (3:1), else `--brand-2`, else the flap ink.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box. Roughly square marks read
  best because the hinge line cuts them in half. It lands in the second flap.
- **Word**: set in capitals; the drum carries A–Z, 0–9, `-`, `.`, `&` plus any other character the name needs. The
  row is blank · mark · blank · word · blank; edit `targets` to change it. Long names shrink the flaps (12+ fit).
- **Timing**: `DT` (one flip, 52 ms), `LAST` (the landing flip), `settle` per flap in `plan`, `late` (which flap
  lands late, +0.34 s).

## Tiny details
Blank board waiting before the press · drum-order spinning · a ripple start · per-flap solved timing so letters
land left to right · bounce off the stop · one late flap · flap faces darken and brighten with angle · cast shading
on the halves · shadow, hinge line and pins on every flap · the housing shivers while it clatters · the mark rides
the drum · rods, brackets and a lamp · enamel panel joints · a shuffle on the last blank flap every 14 s.
