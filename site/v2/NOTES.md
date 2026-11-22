# Revisionpedia v2 · notes

## The world in 3 lines
1. An editor's desk: warm paper, black ink, one serif (Newsreader) and one red correction pencil (Caveat, used only for the hero correction and "For your slide").
2. Red is used only where a number was changed: the strike, the handwritten fix, the vertical jumps in every step chart, the 18 flipped cells.
3. The business (Recall Press) is the one ink-black band. It is the only place the page changes colour.

## Headline spine (read in order)
1. Singapore’s official figures change after you quote them.
2. It happens to most figures. (57 of 60)
3. Check a figure before you quote it.
4. Recall Press keeps your briefing right.

Figure page: question title → "4.6% growth. First estimate: ~~0.0%~~." Indicator page: `indicator_headline()` in render_v2.py, generated from the data for all 10 (e.g. "Job gains were revised in 5 of 6 quarters."). Cover page: "Send one briefing. We watch every figure in it." CTA label everywhere: **Watch my briefing** (URL stays `/cover-my-briefing/`): header button, Recall Press band, figure CTA strip, sign-up page.

Word counts (rendered, measured in Chrome, excluding grid cell numbers, dropdown options, chart labels and the screen-reader-only label): home 250 at 1440, 246 at 390. Figure page 107; the `<details>` is closed.

## Files
- `blocks/home-01-hero.html` · `home-02-grid.html` · `home-03-checker.html` · `home-04-recall.html`: self-contained Hashmeta rawHtml blocks (`<style>` + HTML + inline script). Every CSS rule is scoped under `.rp2-*`.
- `blocks/header.html`, `blocks/footer.html`: stand-ins for the global header and footer (the footer is home band 5).
- `blocks/figure-template.html`: collection template using `{{title}}`, `{{body_html}}` and `{{answer}}` (in the JSON-LD).
- `blocks/indicator-template.html`, `blocks/cover-my-briefing.html`: prototypes. The cover form is a stand-in; the live page keeps the existing Hashmeta form.
- `render_v2.py`: `render_figure_body(entry)` (answer, dual step-chart SVG, slide line, history `<details>`, source), `plain_answer(entry)` (new `answer` text with no banned words), `step_svg()`. `python3 render_v2.py` rebuilds `blocks/` from `src/` and `preview/` from the JSON. Edit `src/`, not `blocks/`.
- `preview/index.html`, `figure.html`, `indicator.html`, `cover.html`; `shoot.mjs` writes `out/*.png`.

## For the orchestrator (porting)
- Regenerate each entry's `answer` with `plain_answer()`. The current field says "first archived figure", which is a banned word, and it feeds the JSON-LD.
- The grid (`home-02`) and checker data (`home-03`, about 28 KB of JSON) are generated from revisions.json, so rerun `render_v2.py` after each data refresh.
- Links go to `/revisions/<slug>/`, `/indicators/`, `/how-corrections-work/`, `/sources-and-licences/`, `/about/` and `/cover-my-briefing/` on the live site.
- One checked date only: the footer's "Figures checked 22 Nov 2026". The figure source line carries source + licence only. The footer no longer shows the next GDP release.
- The hero slide ("Q3 2025 in brief · Slide 4 · Oct 2025") is an illustrative slide. The sentence and every number in it are real.
- Grid red ("Flipped a headline") = `crossed_sign or crossed_threshold`, first to now: 6 of the 18 crossed zero, 12 crossed a round-number line (e.g. 4.9% → 6.6% over 5%). The legend says both.

## Small details (ledger)
1. The strike is two pencil passes, one heavy and one faint, drawn one after the other (`pathLength` dash animation).
2. The correction "grew 4.6%" is written left to right in nine steps, like a hand. It is tilted −3° and sits over a proofreader’s caret that draws just before it.
3. Under the slide, aligned to its left edge, the trail of readings (0.0% first estimate → 5.0% → 4.6%) arrives last. The first reading is struck and "now" is in red.
4. The slide's header line says "Slide 4", so it reads as a real slide without placeholder bars.
5. The wordmark is "Revision*pedia*", with *pedia* in red-pencil italic. The footer repeats it.
6. Grid: a changed cell gets a small red pencil tick in its corner. A cell that flipped a headline gets its number in red on a red wash. A cell that never changed is left blank paper.
7. Grid rows are grouped (GDP, manufacturing, services, construction, labour) with a slightly larger gap, like a ledger.
8. The grid readout defaults to the hero figure (~~0.0%~~ → 4.6%) and follows hover and keyboard focus. The focused cell gets an ink frame.
9. On mobile, the grid's quarter header row sticks while you scroll the 10 rows.
10. Step charts: the first reading is a hollow ring, the latest a red dot, and only the vertical jumps are red. Each point has a tooltip with its value and date (release name too on figure pages). A dashed zero line appears only when the chart crosses zero, and its "0" label hides if it would collide with the "now" label.
11. The checker writes the correction into your own sentence ("The economy ~~shrank 0.3%~~ *grew 1.4%*", red italic). Verb and number are struck as one phrase when both are wrong. Its placeholder uses a real first estimate (Services grew 4.7% in Q1 2026), so the result says "That was the first estimate".
12. The checker knows which release a quoted number came from: "That was the 21 Nov 2025 number. It is now 4.6%."
13. The checker opens on the second story (Manufacturing Q1 2025, −4.9% → 0.6%), so the hero and the checker never show the same figure.
14. The figure page renders two server-side SVGs (wide and narrow) and swaps them with CSS, so chart text stays readable at 390px without JS.
15. "For your slide" is written in the red pencil hand, as an editor’s margin note.
16. The history `<details>` uses a + that turns into ×. Rows where the number changed show their change in red. The summary reads "Every release (9) · changed 4 times".
17. Text selection is a faint red-pencil wash. Focus rings are red dotted pencil lines.
18. The primary button’s arrow drops 3px on hover; hover effects only run on devices that can hover (`(hover: hover)`).
19. With reduced motion on, every pencil mark is drawn in its final state from the first frame.
20. Old-style numerals in running text, lining tabular numerals in grids, charts and the history.

## Checks done
- Critic-fix pass (22 Nov): 10 items applied; the figure chart's red jumps were hidden by the dash animation and now reveal with a clip instead. Indicator cards share one x axis (Apr 2025 to Oct 2026) and label first and now values.
- Three screenshot look-and-fix rounds. Round 1: the slide sentence collided with the grey bars, the strike sat on the baseline like an underline, dropdown labels were cut off, the figure chart's red jumps did not render, and the "0" label overlapped "now". Round 2: the slide was inset on mobile, the narrow chart clipped "now", and the sentence correction doubled up. Round 3: copy trims to bring home under 250 words, and threshold wording ("at or above 2.0%").
- No horizontal scroll at 390 or 1440. No banned words on the home or figure page (checked by regex in Chrome). Tap targets are ≥44px.
- Contrast on paper (#F4EFE6), computed: ink 15.0:1, quiet #5B5449 6.5:1, red #B0271B 5.8:1, input placeholder #6B6458 5.6:1 on the sheet. On the night band: #B9B0A2 8.0:1, #F08A7E 7.1:1.
