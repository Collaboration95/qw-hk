# Rubber stamp

An empty manila field. The first press drops a wooden rubber stamp into frame: it falls with its shadow
sharpening, squashes on contact (the whole field nudges 1 px), rocks a hair, springs back and lifts away up and
to the right. What it leaves is the lockup in ink: mark and wordmark inside a double-ruled die, with uneven
coverage, pooled edges, pinholes, speckles and a faint ring. ~2.0 s. Reduced motion and print show the impression.

**Use it for** products about approval, proof and paperwork: compliance, legal, KYC, customs and logistics,
government services, signing, audits, inspections. It says "official, done, on the record".
**Avoid it for** playful consumer apps, AI and data products (use a swarm or constellation), anything dark-mode
or nightlife, and decks whose world is not physical.

## Adapt it
- **Brand**: set `--field` (the paper), `--brand` (the ink), `--brand-2` on the `<section>` (inline style) or in the defaults at the top of its style. The ink is
  checked against the paper: `--brand` if it reads (3.2:1), else `--brand-2`, else the engine's readable ink
  (`Deck.inkOn`) tinted toward the brand. Light ink on a dark field works (a white stamp on navy card).
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box, inked as thick round
  strokes, so line marks become solid stamp art. The label on top of the block copies it.
- **Word**: uppercase reads as a die; `--stamp-case:none` keeps the brand's casing. Any length: the die shrinks to
  fit 1560 px.
- **Tilt**: `--stamp-tilt` (−1.6°). Never 0: a perfectly square impression looks printed, not stamped.
- **Ink texture**: the `#rv-stamp-ink-N` filter. `seed` on the low-frequency turbulence moves the light patches;
  the `feMorphology` radius sets how wide the pooled rim is; the last colour matrix sets how many pinholes.

## Tiny details
Gravity drop with an 8.5° → 1.6° turn · far shadow then contact shadow · 1 px field nudge and 0.4 px recoil ·
rubber squash and spring-back before lift · a hair of rocking, so one side inks lighter · index label with a tiny
print of the impression · pooled glyph edges · fibrous edges and pinholes · speckles and two splats · a faint
broken ring from the block edge · wet ink dries matte · 1.6° off square · manila fibre and end-grain wood.
