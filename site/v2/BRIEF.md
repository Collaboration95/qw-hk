# Revisionpedia v2 · redesign brief (22 Nov 2026)

## Why

The live site (https://revisionpedia.geo.hashmeta.tech) fails a first-time visitor. Owner, verbatim:
"It can't be this complicated and this verbose. There's a lot of LLM slop where there's too much context and too
many minute things, minute, minute, minute, everywhere." "The stuff like the manual check … That's the definition of
LLM's slop." "It can be multiple passes, like we scroll down, the front page is normal … It has to be proper."

Worst live examples (never write anything like these): "60 series–quarter records have multiple readings." ·
"18 crossed zero or a briefing cutoff from first to current." · "compared with the first archived figure of 0.0%" ·
"Ordered by the date the value last changed in the archive. A table snapshot uses the date the change was first
observed." · "The sign changed (zero is its own category)." · "Manual live check · started with Run now · 21 Nov 2026,
15:48 SGT" · repeated link rows ("Browse all revision records · How corrections work") three times on one page.

## What the site is (the whole story, in plain words)

- Singapore's official economic figures change after they are first published. A slide or briefing written on the
  first number can become wrong months later, and nobody tells the author.
- **Revisionpedia** (free): one page per official figure, e.g. "Manufacturing growth, Q3 2025". What it first said,
  what it says now, every change in between with its official source, and what that means for a sentence.
- **Recall Press** (the business behind it): send your deck or briefing; when a figure in it is revised, you get the
  exact sentence, the dated source and an editable corrected PPTX. CTA: **Cover my briefing** (`/cover-my-briefing/`,
  existing Hashmeta form). Pilot: no fee, results within two working days.
- Audience: people who publish about Singapore's economy (trade-association and chamber editors, analysts, comms,
  journalists). Smart non-specialists. Also AI search engines: every figure page keeps a question title and a
  one-sentence direct answer as its first line.

## Facts you may use (only these, or values read straight from the files)

- `site/collections/revisions.json`: 60 figures (10 indicators × 6 quarters), each with `vintages[]` (value,
  published, release, url), first/current value+date, `direction`, `crossed_sign`, `slide_impact`.
- `site/collections/indicators.json`: the 10 indicators.
- `site/revision-highlights.md`: 57 of 60 changed at least once after first publication; 18 changed enough to flip a
  headline (crossed zero or a line that changes the wording), first to now.
- Hero story: Manufacturing growth, year on year, Q3 2025: **0.0%** (first, 14 Oct 2025) → 5.0% (21 Nov 2025) →
  **4.6%** now. A slide that said "Manufacturing stalled in Q3 2025" is now wrong; it grew 4.6%.
- Second story: Manufacturing, quarter on quarter, Q1 2025: −4.9% → +0.6% (a fall became growth).
- Next GDP release: 24 Nov 2026 (from `data/release-calendar.json`).
- Sources: SingStat via data.gov.sg (Singapore Open Data Licence v1.0), MTI releases. Independent; not government.
- Live demo of the product: https://ka62nv48.qwenwork.page/ (a real correction).
- Never invent numbers, users, logos, quotes, testimonials or "trusted by". No "AI-powered".

## Copy rules (hard)

1. Headlines are plain claims ending in a period, 4–10 words. No topic titles ("Latest revisions", "Keep reading").
2. At most one heading + two short sentences per block. Never three continuous lines. Arrows and before → after beat prose.
3. Information lives on three levels. Level 1 (always visible): the claim, one picture, one number. Level 2 (one
   click: `<details>` or the figure page): release-by-release history, sources. Level 3 (footer, one line): checked
   date, licence. Run IDs, "Manual live check", "started with Run now", "archived", trigger names: nowhere.
4. Banned on visible copy: series, vintage, archived, archive, record (data sense), dataset, threshold, cutoff,
   "series–quarter", "first to current", "pp", "intermediate", "observed", "snapshot", "category" (as a label).
   Say: figure, number, first published, now, changed, revised, release.
5. One primary action per screen. Button labels name the outcome. "Learn more"/"Get started" banned.
6. Numbers: one decimal for rates (5.0%), commas for people counts. Dates "14 Oct 2025".

## Visual rules (hard)

- One dominant visual per section, and the visual *is* the idea (a struck sentence with its correction, a step chart
  of readings, a grid of 60 figures). No three identical cards, no icon rows, no emoji, no gradient text, no
  purple-blue gradients, no blurred blobs, no eyebrow pills/kickers above headings.
- Clear type ladder (big headline, 16–18px body, ≤65ch). Two typefaces max. `text-wrap: balance` on headings.
- One hero entrance + motion that explains (e.g. the strike-through drawing itself). Respect `prefers-reduced-motion`.
- Colour as named roles (bg, panel, ink, quiet, line, action, correction-red). Body contrast ≥ 4.5:1 everywhere,
  including footer. Tap targets ≥ 44px. Works at 390px with no horizontal scroll, and at 1440px.
- The world: an editor's desk / errata. Paper, ink, one red correction mark. Variant B (`site/variants/B-errata`)
  passed the 5-second test best of three earlier tries; reuse its idea, cut 70% of its text and parts.
- Surprise in the details, not the noise: the owner wants a visitor to notice small, thought-through touches.

## Pages and the scroll

**Home** (each band one idea, top to bottom):
1. Hero. The felt problem shown, not described: a slide sentence "Manufacturing stalled in Q3 2025." gets struck and
   corrected to "grew 4.6%", with 0.0% → 4.6% and dates. One line names what the site is. Primary action scrolls to
   the checker. Secondary text link: Cover my briefing.
2. "It happens to most figures." One big number (57 of 60) and a 10 × 6 grid of every figure (changed / flipped a
   headline / unchanged), each cell linking to its figure page; hover or tap shows first → now.
3. The checker (the interactive piece, real data inlined): pick an indicator and a quarter (or type a sentence like
   "manufacturing grew 5.0% in Q3 2025") → shows first vs now, a small step chart, a verdict line ("A slide written on
   the first number would now be wrong"), and a link to the figure page. Keyboard usable.
4. Recall Press. One line of promise + a three-step arrow row (Your deck → a figure is revised → the sentence, the
   source and a corrected PPTX). Primary button: Cover my briefing. Text link: see a real correction (demo URL).
5. Footer: one line on sources and licence, one line "Checked 22 Nov 2026 · next GDP release 24 Nov 2026", nav.

**Figure page** (template for all 60; prototype it for Manufacturing YoY Q3 2025 from the JSON):
H1 = the question (keep `title`). Then the answer in large type ("4.6% growth. First published as 0.0%."), a step
chart of every reading (SVG, server-renderable), one line "What this means for your slide", the full release
history inside `<details>`, one small source line, one CTA strip. Nothing else.

**Indicator page** (one of 10): title, one line, six small step charts (one per quarter) each with first → now.

**Cover my briefing**: what you send · what you get · pilot terms · the form. Under 80 words of copy plus the form.

Header nav: Figures · How it works · Cover my briefing (button). Footer as above.

## Hashmeta portability (must)

The site is a Hashmeta AI site. Pages are a list of `rawHtml` blocks (each a `<style>` + HTML + optional inline
`<script>`). The 60 figure pages are a collection template with `{{field}}` placeholders plus a `body_html` field
we generate in Python (`site/directory_pages.py`). So:
- Build plain HTML/CSS/vanilla JS, no framework, no build step. Fonts via a Google Fonts `@import` in a `<style>`.
- Scope every CSS rule under a block class (`.rp2-hero …`). No global resets except inside a block.
- Write each home band as its own self-contained block file in `site/v2/blocks/home-NN-name.html`, plus a
  `site/v2/preview/index.html` that stitches them with a stand-in header/footer for screenshots.
- The figure page: write `site/v2/blocks/figure-template.html` using `{{title}}`, `{{answer}}`, `{{body_html}}`
  etc. (fields listed in `site/v2/fields.md`), and a Python function `render_figure_body(entry) -> str` in
  `site/v2/render_v2.py` that produces the new `body_html` (step chart SVG + history `<details>` + sources)
  from one revisions.json entry. Preview: `site/v2/preview/figure.html`.
- Do not write to Hashmeta or to any file outside `site/v2/`. The orchestrator ports it.

## Done means

- Screenshots in `site/v2/out/`: home-1440 (full), home-390 (full), figure-1440, figure-390, checker mid-use.
  Serve with `python3 -m http.server <port>` from `site/v2/preview`; playwright-core is in `deck/node_modules`,
  Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Look at your own screenshots and fix what is ugly (at least two look-and-fix rounds).
- Home visible text under ~250 words. Figure page under ~150 words above the `<details>`.
- `site/v2/NOTES.md`: the world in 3 lines, the headline spine, 12+ small details you added.
