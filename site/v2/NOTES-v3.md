# Recall Press v3 · notes (22 Nov 2026; light theme + fix round 1)

## Headline (fix round 1 + owner update, 22 Nov 2026)

The owner ruled out "Official numbers": a first-time visitor doesn't know what it means. Line 1 now has to say, in plain
words, that the things your deck cites change. Candidates:

1. **Your sources change. Your deck should too.** ← pick
2. The sources you cite get revised.
3. What your deck cites will change.
4. Your deck cites sources. They get revised.

Why 1: it keeps the two-sided tension of the old pick, and "sources" is the word people already use for what a deck
cites. Each half is three or four words and sits on one line at 1440. Candidates 2 and 3 state the problem but leave out
the product's side.

Subline (concrete, one sentence): "When a report or release you cited is revised, we find the sentence it broke and send
the fix." Scope link: "Live today for **10 Singapore indicators** →". Buttons: "Send a deck" and "See an example
correction".

## Headline spine

**Home** (section headers follow Linear's two-column pattern: a short claim on the left, one grey sentence on the right)
1. Your sources change. Your deck should too. (Recall desk window)
2. Rechecked the day a source changes. (agent run window, one run per release)
3. Each change, dated and sourced. (the figure window; the one place that says "Revisionpedia")
4. Most figures change after you cite them. (57 / 60 revised at least once · 18 changed the sentence · the grid)
5. Send one deck. / We watch every source in it. (one "Send a deck" button only)

**How it works:** We watch the sources your deck cites. Then:
- Send a deck once.
- Each sentence is linked to its source.
- A revised source flags the sentence it breaks.
- You get the fix, its source and a corrected PPTX.
- Send one deck. We watch every source in it.

**Other pages**
- Figures: "57 of 60 figures were revised at least once."
- All figures: the same headline; the 56 appears once in the lede ("56 still differ from their first estimate").
- Indicator pages: generated per indicator, e.g. "Manufacturing growth was revised in every quarter."
- Figure page: the question, then "4.6% growth." with "First estimate 0.0%, 14 Oct 2025" grey and unstruck.
- Cover: "Send one deck. We watch every source in it."
- About: "Recall Press watches the sources your decks cite."
- Sources: "Every number comes from an official source."

Home visible words: **169**, measured in Chrome by walking text nodes. That excludes the mock windows and the grid; the
header and footer are included.

## Theme: light (owner update; this replaces the dark theme)

The owner's call: "landing pages are a white theme (Linear is an outlier)… light mode, with a tinge of a gradient."

- The page is white (#FFFFFF) with near-black ink #111110.
- Window bars, the sidebar, the grid legend and the footer use one off-white, #FAFAF8.
- Borders are hairlines: rgba(17,17,16,.08) and .14.
- **The one tinge:** a faint warm peach radial wash behind the hero, plus a white-to-#FFFBF8 top fade. It sits behind
  the headline and the product window and is gone before the next band. There is no other gradient anywhere: no
  purple-blue, no blobs, no gradient text.
- Windows are white panels with a soft warm shadow, `0 24px 60px -24px rgba(60,35,20,.22)`, plus a 1px ring.
- The accent moves from coral #FF6A47 (2.8:1 on white, which fails) to **#C93A1B**. It is used only for corrections:
  the strike, the new value, "Now wrong", "Changed the sentence".

Contrast on white:

| Colour | Hex | Ratio |
|---|---|---|
| ink | #111110 | 18.9:1 |
| quiet | #5B5953 | 7.0:1 |
| dim | #6B6862 | 5.6:1 (5.3:1 on #FAFAF8) |
| accent | #C93A1B | 5.1:1 (4.7:1 on its own wash) |

The type is still Inter. Display weight drops from 570 to 550, and tracking loosens from −0.036em to −0.028em, so
letters no longer touch. H2 is 48px / 560 / −0.024em.

## System (one for every page)

`src/system.css` holds the tokens and a small UI kit, all written against `__R__`:

- `.wrap` `.h1` `.h2` (with the grey `.q` continuation) `.sub` `.band` `.split`
- buttons: `.b1` solid, `.b2` outline, `.b3` text with an arrow
- `.kbd`, `.win` (app window: bar, dots, title), `.sd` status dots, `.sx` strike, `.nw` new figure
- the step-chart styles

`render_v2.tokens(cls)` scopes it per block for `render_v2` previews. The port scopes it once under `:is(all roots)`
in `global.css`.

All pages share the kit: home bands, header, footer, figure, indicator, cover, and the five `build_more` pages
(`.rp2-pg` is now a root).

## The product mocks: real data only

**Hero, the Recall desk.** Deck "Members’ quarterly economy briefing", 6 slides, as in
`publications/members-briefing-2025q3.pptx`.
- Slide 3: 0.6% → 0.7%, number updated.
- Slide 4: "Manufacturing ~~stalled~~ grew 4.6% year on year in Q3 2025", source MTI · Advance GDP estimates · 14 Apr
  2026, quoted 0.0% on 14 Oct 2025.
- Slide 5: "Electronics output expanded.", no matching figure (from `register_snapshot.unlinked`).
- Slides 1, 2 and 6: no figures.
- Sidebar: 2 decks; 10 figures across both decks; "Checked 21 Nov, 15:48" (the run time).

All of it comes from `workspace/qw-morning/runs/2026-11-21-68013a314ad1/result.json`.

**Agent run (the QwenWork window).** It is labelled "Recall Press agent", with "runs on QwenWork" in plain small text.
There is no QwenWork logo or UI. Every number and timestamp is from the real run:
- registered 20 Oct 2025
- 2 claims and 1 unlinked sentence
- `series_checked` 8
- the two verdicts and the replacement file
- scheduled run at 21 Nov 2026, 15:48 SGT

The brief's "23 figures found" is not in the run. I used the real count (2), so no "illustration" label is needed.

**Figure history.** Manufacturing YoY Q3 2025 shows every release (0.0 → 5.0 → 4.9 → 5.3 → 4.6, then 4 more,
unchanged), built from `revisions.json` by `render_v2.hist_html()`.

**60-figure grid.** `render_v2.grid_html()`, unchanged data. On a phone the frame scrolls sideways, starting at the
latest quarters, with sticky row labels.

**Checker.** Dropped from the home page. It was 28 KB of JSON and a second interaction that competed with the CTA.
Its source is in `src-retired/`.

The sample deck is "Sample publication for demonstration" (slide 1 of the PPTX). The About page says sample slides
are written for demonstration. No users, logos, testimonials or invented metrics anywhere.

## Deliberate details (ledger)

The light build changes four items below:
- **2–3:** the lit top edge and the radial glow became the hero's single warm wash, and each window got a soft warm shadow.
- **6:** status dots are graphite for done, a hollow ring for no matching figure, and #C93A1B with a halo for now wrong.
- **19:** text selection is a 16% accent wash.

New in the light build:
- the "Example" tag on mock windows
- grid legend swatches drawn as flat 10px squares
- the struck first estimate set small inside each Figures cell
- values printed on the steps that changed

1. The wordmark glyph is two text lines with a coral stroke through the top one: the product's one gesture in 20px.
   It is the same glyph in the header, footer and app sidebar.
2. Each window has a 1px light edge across its top that fades out at both ends, like a lit bezel. There is no glow
   blob.
3. The hero window is lit from above by one faint radial, and its bottom dissolves into the page (mask), so the
   app feels like it continues.
4. Hero entrance, once:
   - 0.1s: the window rises 24px.
   - 1.05s: the coral strike draws through "stalled".
   - 1.45s: "grew 4.6%" types in, in nine steps.
   - 1.95s: the source chip and Apply fix / Skip arrive.
5. Keyboard hints live inside the mock: ⌘K next to the workspace, ↵ on Apply fix, S on Skip.
6. Status dots carry state in one colour family:
   - solid warm-white: done
   - hollow ring: no matching figure
   - coral with a soft halo: now wrong

   The Alerts badge is the only filled coral chip.
7. Slide 3's correction strikes in coral but keeps its new number in ink, so slide 4 stays the one loud row.
8. The run log is a timeline: dots on one hairline spine, which starts at the first dot's centre and ends at the
   last. Dates sit right-aligned in tabular numerals.
9. The run log ticks line by line (260ms apart) when it scrolls into view, then the "Completed" pill lights up.
   Without JS or with reduced motion it is simply complete.
10. The history chart's coral jumps and "now" dot fade in when the window enters view. The rest of the step chart is
    already there.
11. The release list shows only the releases that changed the number, with signed deltas in coral. The four repeats
    are folded into "+ 4 later releases, unchanged".
12. Grid legend:
    - a headline-flipped cell is coral text on a coral wash with a coral hairline
    - a revised cell gets a tiny dot in its corner
    - an unchanged cell is an empty outline
13. The phone grid opens scrolled to the latest quarters, row labels stay pinned, and "← earlier quarters" appears
    only on the phone.
14. Section headlines are two-tone: the claim in ink, then its continuation in grey. On a phone the continuation drops
    to a smaller subline, so no heading runs five lines.
15. On the How page, the "Send a deck" fragment draws its slide thumbnails with two faint text bars. Slide 3 is
    outlined, slide 4 in coral, matching the hero.
16. On the How page the three revision rules are shown as chips, and the one that applied ("Crossed zero") is lit.
    This replaces v2's "Flipped a headline:" definition prose.
17. The header is translucent with a blur, so content passes under it. Its button keeps a 44px hit area around a 36px
    visual pill.
18. The figure page chart frame is the same window surface as the home mocks, so a figure page reads as an open
    Revisionpedia window.
19. Text selection is a coral wash. Focus rings are a 2px coral outline.
20. Hover effects only run where hover exists. `prefers-reduced-motion` turns off every animation and transition in
    every block.

## Pipeline changes

- `render_v2.py`:
  - Inter fonts (`FONTS_HREF`)
  - `tokens()` reads `src/system.css`, replacing the old `TOKENS` string
  - `hist_html()` and `home_subs()` (shared by both builders)
  - `blocks/` is cleaned before each rebuild
  - preview shell is dark
  - indicator lede drops the colour word
- `port/build_port.py`:
  - `ROOTS` adds `.rp2-run .rp2-hist .rp2-end .rp2-pg`; the `HOME` block list
  - dark page background
  - the `all:revert` shield also covers `span,time,nav,aside`
  - cover form CSS is dark
  - `minify_html` keeps a space between tags on the same line, so "~~stalled~~ grew" keeps its space
- `port/build_more.py`:
  - new dark CSS
  - How page rewritten as feature rows; About and Sources tightened (the "Tables last read… Next GDP release" status
    line is gone)
  - `global.css` gets the more-pages CSS re-appended on every run
  - `global.after.css` = `global.before.css` + `global.css`. Before, it was the stale `global.live.css` + `more.css`,
    which put the old v2 CSS into previews.
  - previews use the new header
  - the banned-word list is extended
- `shoot_v3.mjs` (new):
  - writes `out/v3/` and reports horizontal scroll, sub-44px taps and banned words
  - full-page shots render with reduced motion (the final state). Chrome's full-page capture drops in-flight SVG
    animation states, which made the coral jumps look missing.
  - fold shots keep motion

## Look-and-fix rounds (each against `out/v3/linear/*`)

1. **Spacing, headline, fold.**
   - The section spacing never applied (`.band` was written as a descendant of its own root).
   - The headline was set in three lines, heavy and too tight.
   - The flagged slide sat below the fold.
   - The window was offset 64px from the text column (Linear's is about 20px).
   - The history chart's jumps didn't draw (dash animation on a multi-segment path, the same bug v2 hit).
2. **Linear side by side.**
   - The headline went to weight 570 on two lines, and the tabs merged into the deck header row.
   - The How page's keyword arrows leaked into the mock windows' inner lists.
   - Page content was 64px wider than the header column.
   - "Red marks each change" was rewritten, since red is now coral.
   - Grid cells and the source and history links were raised to 44px tap targets.
3. **Blind critic** (fresh agent, screenshots only, per `CRITIC-v3.md`; score 5/10 "bones right, finish not yet").
   - Taken:
     - Apply fix is now above the fold at 1440×900, and the phone hero shows only slides 3–5.
     - The agent window is full width with larger text. Its duplicate footer and the three-column keyword strip
       under it are gone.
     - Linear-style two-tone section heads, and tighter bands.
     - The coral glow became a hairline.
     - "No matching figure" is used everywhere.
     - The How page lost the "1.0"-style numbers and restated bullets.
     - The phone grid has a scroll hint.
   - Not taken, because they contradict the brief:
     - logos or "used by" (nothing real to show)
     - folding Revisionpedia into Recall Press (the brief keeps it as the public site)
     - editing the kept Hashmeta form
   - Then a final phone pass: an orphan headline word, and the four-line subline cut to two.

## Known limits (dark build; superseded by "Known limits (updated)" below)

- The cover page's form is the live Hashmeta block, kept unchanged by design. Its label "Indicator or record (e.g. …)"
  contains the banned word "record", and its button says "Send enquiry". Changing either means editing that block in
  Hashmeta.
- The indicator payload is about 10 KB per page (unchanged from v2; there is no limit for indicators). Figure body
  max is 6,637 B (≤ 7 KB).
- `global.live.css` is the last live read and still holds v2 rules. Use `global.after.css` (before + new
  `global.css`) for `update_global_styles`.

## Fix round 1 (FIXES-v3-r1.md + §11 owner update)

**Numbers now agree**
- 57 of 60 figures were revised at least once (home, Figures, All figures). The 56 that still differ appear only in the
  All figures lede.
- GDP YoY Q4 2025 was revised and then went back to its first value. It is now drawn as revised: a dot in its cell, and
  "revised, then back" on All figures.
- There is one checked date sitewide, in the footer. The hero sidebar's "Checked 21 Nov, 15:48" and the four
  "accessed" dates on Sources are gone.

**Agent run, release-day framing.** The log has one row per GDP release that touched the sample deck. The dates and
values are real, from `revisions.json`:

| Date | Release | Effect on the deck |
|---|---|---|
| 20 Oct 2025 | — | Deck received |
| 21 Nov 2025 | Economic Survey, Q3 2025 | Slide 4 now wrong: stalled → grew 5.0% |
| 2 Jan 2026 | Advance estimate, Q4 2025 | Slide 4 number: 5.0 → 4.9 |
| 10 Feb 2026 | Economic Survey, Q4 2025 | Slide 3: 0.6 → 0.7; slide 4: 4.9 → 5.3 |
| 14 Apr 2026 | Advance estimate, Q1 2026 | Slide 4: 5.3 → 4.6, corrected PPTX ready |
| May–Oct 2026 | 4 later releases | Still current |

- The window is titled with the deck name and a quiet "Example" tag, and keeps one small "runs on QwenWork" line.
- The "Completed" pill, the "Scheduled run" line and the "8 indicators" count are gone.
- The log shows no times of day, because the data has none.

**How page chips.** The critic flagged "Services · QoQ · Q1 2025 · Advance estimate, 14 Oct 2025" as impossible. It
was not: the 14 Oct 2025 release carried the revised Q1 value. The chip now reads "Services, q/q, Q1 2025 · as
published 14 Oct 2025".

**Brands.** Recall Press is the only product name in the copy. "Revisionpedia" appears once, as the history window's
title. The footer mark and the meta titles are Recall Press.

**Charts**
- Every step chart's right gutter is sized to its own end label, so "−12.9% now" fits.
- Values are labelled on the steps that changed. A step label is skipped when it repeats the final value or would
  collide with another.
- The first value moves under its line when the first jump rises beside the ring.
- Phone charts use a separate 358px viewBox, so their text renders at 11.8px or more.
- The How page gets a phone chart too.
- Indicator pages share one value scale across all six charts, labelled "One scale for all six charts: 0.0% to 18.8%".

**Figure page**
- The release table sits open under the chart: date · value · release (linked) · change.
- "9 releases · latest 14 Oct 2026".
- The narrow chart's tooltips are dropped, so the largest figure body is 5,815 B.

**Figures index.** The 6px dot plot is replaced by the home grid's cells: the value now, and the first estimate small
and struck when it differs. Cells that changed the sentence are in the accent. The legend reads "Changed the sentence /
Changed the number / Never changed", with flat 10px squares, not toggles.

**Home**
- Only the hero carries the "Send a deck" and "See an example correction" pair; the end band has one button.
- The phone grid's sticky label column is opaque white, with a right hairline, z-index 3 and 12px of inset.

**Copy**
- About drops "A one-person company." and says "Independent, based in Singapore." once. "Independent, not government"
  appears only in the footer.
- Sources uses plain table names (e.g. "Employment change by sector, quarterly").
- How it works drops the three rule cards and every → bullet. A single comparison replaces them:
  - Slide 4: 0.0% → 4.6%, crossed zero → **Words change**
  - Slide 3: 0.6% → 0.7%, still growth → Number only

**Mock chrome varies.**
- Traffic lights stay on the hero, the agent run and the How chart.
- Tab bars are used for the history window, the How "Send a deck" and "fix ready" fragments, and the cover example.
- The How "linked figures" fragment is a borderless panel.
- The grid has its legend as its header.

## Cover form field mapping (for `update_form` / the live block `6b014fa164950600078336ae`)

`build_port.cover_form()` rewrites the live block's `<form data-payload-form-id="1">` markup in `cover.json`. The
block id, its `<style>`, the submit script and the retired `<template>` are kept. The script still posts every
FormData entry to `/api/form-submissions`, form "1".

| Visible field | Posts as | Notes |
|---|---|---|
| Email (required) | `email` | was "Reply email" |
| Link to your deck (required) | `publication` | was "Publication or briefing name"; text input, `inputmode=url` |
| Anything we should check? (optional) | `message` | an empty value is posted as "Please check every figure in this deck." |
| — hidden | `intent` = `coverage` | `?intent=correction` still sets it to `correction` |
| — hidden | `name` = `Not given` | was required |
| — hidden | `organisation` = empty | |
| — hidden | `record` = empty | `?record=<slug>` still fills it |
| — hidden | `consent` = `true` | replaced by the visible line "We reply to this email only." under the button |

- The button reads "Send deck".
- With `?intent=correction` (the About and Sources "Report a correction" links), the script makes the deck link
  optional and relabels it "Link to the figure". The message becomes required, with the label "What should we correct?
  Give the official link and release date." The button becomes "Send correction".
- The success text is now "Thank you. We will reply to your email within two working days."
- The old "directory editor / paid plan" text is gone from the first script. The second, legacy script returns early
  (`dataset.wired`), so its fallback text never runs.
- **If `update_form` validates on the server,** the Hashmeta form 1 definition should mark `name`, `message` and
  `consent` optional, or keep accepting the hidden defaults above.
- **At 390,** the form comes directly under the H1. Under 900px, the cover copy wrappers use `display:contents` and
  grid `order`: H1, then form, then the "You send / You get / Pilot" list, then the example.

## Look-and-fix rounds on the light version

1. **First light build.** Problems found:
   - The run log's new values were not in the accent.
   - The grid legend swatches rendered as round radios, a later rule overrode the radius, so they looked like toggles.
   - The phone grid's labels touched the frame edge.
   - The figure and How charts printed "4.6%" twice (on the step and as "now").
   - "0.0%" collided with the first jump on narrow charts.
   - The How chips broke mid-date.
   - The home end headline left an orphaned "We" on phone.
   - The indicator scale label had a stray bracket glyph, and its lede orphaned "now.".

   All fixed.
2. **Second pass at 390 and 1440.** The How window title wrapped "Q3 / 2025" on phone, so it is shortened to
   "Manufacturing · Q3 2025". The All figures key now uses the shared vocabulary ("Red: changed the sentence").
   `shoot_v3.mjs` reports no horizontal scroll, no taps under 44px and no banned words on any page.

## Known limits (updated)

- The cover form now matches the brief, but only in `cover.json`. The live page changes when that block is pushed.
- The indicator payload is about 10.4 KB per page; there is no limit for indicators. The largest figure body is 5,815 B
  (≤ 7 KB).
- Narrow (phone) step charts label only the steps with room. The release table under the chart carries every value.

## Fix round 2 (FIXES-v3-r2.md, 22 Nov 2026)

**Charts are plotted by date** (`render_v2.chart_geometry` + `step_svg`, used by the figure page, the home history card,
the How step and the indicator cards).
- x is linear in days from the first estimate (left edge) to the latest release (axis end). The "now" dot sits at
  the axis end, the end-date label is right-aligned under it, and the line stops at the dot.
- The y scale has no padding: the scale max maps to the plot top and the min to the baseline.
- There is one baseline label. The zero line is labelled only when no release sits on it, so the figure page shows
  "0.0%" once and no stray "0".
- `python3 site/v2/check_charts.py` checks every point of all 60 figures at all 6 chart sizes. Result: max |x − x(date)| =
  0.0000px, the now dot sits at the axis end on every chart, and no line runs past it. It also prints the hero
  figure's x positions.
- **Indicator cards: each card has its own time axis.** Older quarters stop being re-released earlier (Q1 2025's
  latest release is 25 May 2026), so a shared time axis can't put every "now" dot at its axis end. The value scale is
  still shared. Its top and baseline are dashed hairlines on every card, and the two values (e.g. 18.8% and 0.0%)
  are printed once, small, on the first card. The "One scale for all six charts" line is gone. Cards are 176px tall
  with tight padding, so the scale fills the plot.
- **Red in a chart now means "the words change".** Only the jump that crosses zero (or the figure's round number,
  when that is what flipped it) is drawn in the accent. Every other jump and the now dot are in ink. When the first
  value sits on the baseline with a jump right beside it, its label is tucked right of the jump.
- On phones, the figure chart labels the first, highest and latest values only (`step_labels="extremes"`).

**One meaning per word and colour**
- The legend reads "Words change / Number only / Never revised" everywhere (home grid, Figures, the All figures key
  "Red: words change"). It uses flat 12px squares.
- The corner dots on revised cells are gone: the grey fill already means "number only". The Figures page grid no
  longer shows the 10px struck first estimates.
- The home grid's row labels read "year on year" / "quarter on quarter", and so does the readout.
- The accent appears only on:
  - "Words change" cells and chips
  - the strike and the new value inside a sentence (hero slide 4, run log 21 Nov, the How and cover fix windows)
  - "Now wrong" and "sentence now wrong"
- Moved to ink or grey:
  - latest values and change amounts in the home release list and the figure table
  - the run log's 14 Apr "4.6%"
  - the hero's Alerts badge and "Needs a fix" count
  - the home "18" stat, which now carries a small "words change" swatch instead

**Closing band:** one pattern, `.end` in `system.css`, on every page: home, How, figure, indicator, Figures, All
figures, About, Sources. The cover page is the form itself.
- The headline and subline sit left. The button sits right and is aligned to the subline's last baseline
  (`align-items: last baseline`). On phones it stacks with a full-width button.
- There is a break after "deck.", and "in&nbsp;it." keeps the last line from being one word.
- `text-wrap: balance` is on every h1/h2 and `text-wrap: pretty` on p/dd/li.
- `shoot_v3.mjs` now also reports single-word last lines (mock windows excluded). Final run: none at 1440 or 390.

**Hero window:** the mask and the 560px min-height are gone. The window closes 16px under slide 6 with its real
bottom edge and shadow. "Watching 2 decks" is normal quiet grey.

**Copy**
- "Revisionpedia › Manufacturing › Q3 2025" is now "Figures › …".
- One "Example" tag remains, on the run window, which also keeps "runs on QwenWork". The tags on How step 4 and the
  cover example are gone.
- "One run per new release" is deleted.
- How chips: "crossed zero" is now "stalled → grew", and "still growth" is now "still growing".
- Cover:
  - "You get" is three keyword rows: "The sentence that broke / The new figure and its dated release / A corrected
    PPTX".
  - The form button reads "Send a deck", with the email placeholder "you@company.com".
  - "We reply within two working days." This is changed in `build_port.COVER_FORM` and the stand-in; the live form
    block changes only when it is pushed.
- The home grid's link is "All 60 figures →" to /revisions/; the hero keeps "Live today for 10 Singapore
  indicators →".
- About still names no person.

**Phone (390)**
- Hero buttons are full width.
- Header: "Send a deck" stays visible, and a details/summary menu (no script) holds How it works, Figures and About.
- Footer links are a 2 × 3 grid.
- The figure release table under 480px has 3 columns. Each release link is one 44px+ tap target, with its date as a
  grey second line.

**How it works thumbnails** are tiny real slides. Each has a title in the deck's own words and the figure it quotes,
where it has one ("Services, quarter on quarter 0.6%", "Manufacturing, year on year 0.0%", "Members’ quarterly
briefing Q3 2025"), plus the slide number. On phones they sit in 3 columns.

**Sizes:**
- largest figure body 6,164 B (≤ 7 KB)
- home blocks 30.1 KB
- indicator body max 11.7 KB
- How payload 7.6 KB

## Fix round 3 (FIXES-v3-r3.md, 22 Nov 2026)

**Words.** The category names now read as plain English everywhere:
- legend (home grid, Figures): "Sentence now wrong · Number changed · Never revised"
- home stat: "18 / 60", labelled "now make the sentence wrong"
- How chips: "Sentence wrong" / "Number only"; All figures key: "Red: sentence now wrong"

**Grid (home + Figures).** Cells have no borders and no grey fill.
- Number changed: ink text, weight 550.
- Sentence now wrong: accent text, weight 650, on a 6% accent tint.
- Never revised: grey text, weight 450.
- Legend swatches are small text samples (0.6 / 4.5 / 2.0) in the same three styles, so the key matches the cells.
- Manufacturing Q3 2025 (the cell the readout names) has a 1.5px ink outline on both pages. On home it starts as the
  readout's selected cell (`render_v2.grid_html` adds `on`).
- On a phone the grid opens scrolled so that cell sits right after the pinned labels (the scroll is measured from
  the label's edge, so no sliver of an earlier cell shows).

**Mock chrome.** Traffic-light dots appear only on the hero app window. The run window and the How chart now use the
plain bar. The run window keeps "runs on QwenWork" and its one "Example" tag.

**Closing bands.** Each page now has its own closing line:

| Page | Line | Subline |
|---|---|---|
| Home | Send one deck. We watch every source in it. | Pilot: no fee, results within two working days. |
| How | Try it on your next deck. | Pilot line |
| Indicator | Quoted one of these six? | Send the deck. We tell you when any of them changes. |
| Figures | Cited any of these 60? | Send the deck. We check each figure in it against every new release. |
| All figures | Found one you quoted? | Send the deck. We tell you the next time it changes. |
| About | Start with one deck. | Pilot line |
| Figure | Quoted this figure? (unchanged) | |
| Sources | home line (not in the list; unchanged) | |

`build_more.end(h2, sub)` builds them.

**Layout and spacing**
- `.end` is one column. The button sits left-aligned, 24px under the subline; on phones it is full width.
- The gap before the closing divider is halved: home end band 144 → 72px (112 → 56 on phone), indicator 128 → 64
  (96 → 48), Figures 128 → 64 (96 → 48).

**Send page**
- "We reply within two working days." is gone from under the button, in both the stand-in form and
  `build_port.COVER_FORM`. The Pilot row keeps the promise once, and the success message after sending still states it.
- On this page the header's "Send a deck" is drawn as the current page: off-white with a hairline and ink text
  (`body:has(.rp2-cover)`, CSS only).

**Sample deck rows.** Slide 1 reads "Title" and slides 2 and 6 read "Text only". The slide titles are unchanged.

**Indicator page**
- One line under the lede: "All charts on one scale, 0–18.8%." It is generated from the shared range.
- The per-card scale labels are gone.
- When a card's first value sits on the baseline with a jump right beside it (Manufacturing Q3 2025), the label sits
  left of the start ring. `chart_geometry` reserves left room for it (`lead`), so `check_charts.py` still checks the
  real axis.

**Phone details**
- `.kbd` hints (⌘K, ↵, S) are hidden below 640px on every page.
- The phone hero's slide sentences wrap instead of ending in an ellipsis.

**Copy**
- Sources: "Every earlier number links to its release on the figure page." The employment-counts sentence is deleted.
- About: "Figures and sources are public. The example deck is a sample."

**Look-and-fix rounds**
1. Phone grid: an earlier cell's red tint showed as a sliver beside the pinned labels. The scroll offset is now
   measured from the label's edge. The "18" stat swatch was too faint at 14%, so it is now 22%.
2. Checked at 1440 and 390: home, Figures, indicator, How, cover and About. Nothing left to fix.

`shoot_v3.mjs`: no horizontal scroll, no taps under 44px, no banned words, no single-word last lines.

**Sizes:**
- largest figure body 6,164 B (≤ 7 KB)
- home blocks 30.3 KB (grid 16,860 B)
- indicator body max 11,661 B
- How payload 7,508 B
- Figures 7,081 B
- All figures 14,477 B
