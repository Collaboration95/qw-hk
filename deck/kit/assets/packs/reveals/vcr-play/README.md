# VCR play

A VCR's clean blue screen. The first press shows PLAY ▶ in OSD type, holds a beat on the blue, then rolls a band of tracking noise up the screen; behind it is the tape's picture with the name set as a camcorder title, lower left. The picture slips two frames of vertical hold and settles; the OSD clears. ~2.3 s. Reduced motion and print show the title card.

**Use it for** video, archive, memory and nostalgia products; talks about found footage, film, home video or the 90s; anything that should feel like a tape someone just pressed play on.
**Avoid it for** fintech, B2B infrastructure, anything that must feel modern and precise; the look is warm, lo-fi and a little uncanny.

## Adapt it
- **Picture**: set `--field` (a warm faded gradient by default) or drop an `<img>` into `.rv-vcr-pic`; it is sepia-faded and softly blurred so the title stays crisp.
- **Blue**: `--rv-vcr` (the deck's own blue screen).
- **Title**: `__WORD__`, white via the engine's `--ink-auto`, with a hard drop shadow tinted from `--brand`. Long titles shrink to fit 1600 px.
- **OSD font**: VT323 (`@fontsource/vt323`, OFL) if the deck loads it; falls back to the mono face.

## Params
- `--field`: the tape's picture
- `--rv-vcr`: the VCR blue
- `--brand`: titler shadow tint
- `--rv-fs`: title size

## Tiny details
The blue is perfectly clean before play (the deck makes it, not the tape) · PLAY ▶ lands with the press, the ▶ widened like a deck glyph · a beat of blue while the heads spin up · streaky tracking noise brightest mid-band with an occasional magenta or teal line · thin slipped lines just under the band · two frames of vertical-hold slip, then still · the OSD clears at 2.2 s like a real deck.

First used in the "Liminal spaces" talk (v2 Found tape), where the picture was a sun-faded empty school hallway.
