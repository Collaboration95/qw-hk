# Terminal

A prompt and an idle, blinking cursor on a deep phosphor-green field. The first press types the name with human
keystroke timing (one slip onto a neighbouring key, a beat, a backspace), enter flashes the line, a few boot lines
print and scroll, then flick away while every typed letter flies from its mono slot into the final wordmark and the
prompt glyph becomes the mark. The cursor ends after the wordmark in the accent and keeps blinking. ~1.9 s. Print
and reduced motion show the lockup.

**Use it for** developer tools, infrastructure, CLIs, APIs and SDKs, security, devops, data pipelines: anything
whose users live in a shell. It says "built by people like you".
**Avoid it for** consumer, lifestyle or non-technical audiences, and when the product's own app is a dark terminal
UI on a similar field (change `--field` so the demo hand-off is visible).

## Adapt it
- **Brand**: set `--field`, `--brand`, `--brand-2` on the `<section>` (inline style) or in the defaults at the top of its style. The text takes the readable
  ink for the field (`Deck.inkOn`), tinted toward `--brand-2` only while it stays at 7:1; the cursor and mark take
  `--brand` if it reads on the field (3:1), else `--brand-2`, else the ink. Light, dark and gradient fields all work.
- **Mark**: `__MARK__` (use-pack `--mark name|file.svg`): stroke paths in a 24 × 24 box, drawn with square caps.
- **Word**: any length; the typed command is the name in lower case; long names type faster and the lockup shrinks
  to fit 1640 px. Spaces and "&" are kept.
- **Boot lines**: the `BOOT` array. Keep them short and generic (texture, not claims; no fake numbers).
- **Timing**: `keys` (typing), `BDT` (one boot line), `MD` (one letter's flight).

## Tiny details
An idle blinking cursor before the press · cursor solid while typing · human key rhythm · a slip onto the
neighbouring key, a beat, a backspace · a phosphor ghost of the slipped key · enter flashes the line · boot lines
faster than reading, scrolling one at a time · the log flicks away top first · letters fly mono → sans, staggered ·
the prompt becomes the mark · the cursor lands after the word and keeps blinking · scanlines and vignette, glow only
for light ink · long names type faster.
