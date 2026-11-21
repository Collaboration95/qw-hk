# Paywall bump

The blocked actor. Four small bots run in along a dotted track; the lead one hits a brick wall, squashes, bounces
back tilted with its eyes gone to `> <`; the next one bunches up behind it, the third hesitates and looks around,
the last one sits down and sighs. Beyond the wall a lit shop glows: what they wanted, in plain view, out of reach.
Generalises the tftf "agents hit the paywall" beat. ~1.45 s on a forward arrival, then it rests.

**Suits** the problem slide of anything that removes friction: paywalls, logins, KYC, checkouts that need a human,
approvals, rate limits, out-of-stock. The claim is "they get this far and no further".
**Not for** a slide that should feel positive, or a deck where the problem is not about access.

## Re-skin it

- **Copy**: rewrite the `h2` (two short sentences: the shift, then the friction). Keep the sign to two words
  (`Humans only`, `Sign in`, `Members only`, `Sold out`). That is the only text in the picture.
- **Actors**: the four bots share one drawing (shell, screen, eyes, antenna, legs). Swap the shell for the product's
  actor (a shopping cart, a parcel, a little person) and keep the group structure, so every animation still hooks on.
  Antenna bulb colours are per bot.
- **Colours** come from the section: `--field`, `--brand` (the shop, two antenna bulbs), `--brand-2` (the wall's
  bricks: the friction). The headline uses `--ink-auto`; the hills are tints of it. Tested on random palettes
  (`pack-gallery --fuzz`).
- **Wall**: a gate, a turnstile or a login card works too: keep it 72 px wide where the lead bot hits it (x = 1040).
- **Goal**: the shop (awning, lit door, light spill) can become a library, a bank vault, a door with a price tag.

## Timing (one 1.5 s timeline, impact at 0.5 s)

0–0.5 s run in (legs cycle, speed streaks) · 0.5 s impact: squash, ticks, dust, wall shake, sign swings, crumb
falls · 0.6 s second bot bunches · 0.7 s third bot hesitates · 0.95 s last bot sits · 1.45 s rest. Resting CSS is
the final pose, so print, reduced motion and ← show it still. Ambient after rest: one blink every 7 s, the door
light breathes.

## Tiny details

Listed in `item.json`: the squash, the rear-foot pivot, the `> <` eyes, the antenna whip, shadows that catch up,
the dust, the ticks, the shaking wall, the crooked sign, the crumb that stays, the bunching, the hesitation, the
sit and sigh, the late blink, the breathing door light, the far town.
