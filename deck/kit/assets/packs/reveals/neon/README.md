# Neon sign

A dark plum brick wall over wet pavement. The first press brings up the unlit glass tubes, then the mark strikes in
a second gas colour, and the letters strike one by one with short flickers, each warming from dim to full. The glow
reveals the bricks, pools on the wet ground and reflects in the puddles as streaks; a fine drizzle shows only in
the light. One letter stutters twice, dies and catches late. At rest the sign buzzes faintly on the deck clock, and
every 17 s the same letter drops out for a double blink. ~2.2 s. Print and reduced motion show the lit sign.

**Use it for** nightlife, music and events, food and drink, gaming, creator and consumer apps, anything that lives
after dark or wants an electric, street-level feel.
**Avoid it for** finance, health, government and enterprise infrastructure, and for decks whose app is itself a
dark neon UI (the demo hand-off must change colour).

## Adapt it
- **Brand**: set `--field` (any colour or gradient), `--brand` (the word's gas), `--brand-2` (the mark's gas) on
  the `<section>` (inline style) or in the defaults at the top of its style. The field is shaded to night, so it stays a dark, coloured wall in every palette.
  Each brand colour becomes a gas: the script keeps its hue and lifts lightness and chroma in OKLCH, so a navy brand
  burns blue and a white brand burns cool white. Nothing depends on the brand being bright.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box. Neon is one bent tube: a
  continuous path reads best.
- **Word**: drawn in the deck font at `--neon-weight` (290), which reads as single tubes; long names shrink to fit.
- **Layout**: `--neon-y` (sign centre) and `--neon-g` (ground line). The reflection mirrors about the ground line.
- **Strike plan**: `plan` in the script lists the lit segments per tube; `stut` picks the stubborn letter.

## Tiny details
Unlit glass first · mark strikes first in another gas · each letter its own flicker · strikes warm from dim to full
· one stubborn letter stutters twice and catches late · bricks appear in the glow · light pools on the wet ground,
the kerb catches it · streaky puddle reflections cut by dry asphalt · painted-out connector tube on standoffs · a
drooping power cable · drizzle visible only in the light · a faint buzz at rest · a double blink every 17 s.
