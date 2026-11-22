# Revisionpedia v3 · product-grade redesign (22 Nov 2026)

## Owner verdict on the live v2 (verbatim)

"Generalize the website more instead of 'Singapore's official figures change after you quote them' type thing, do
something like a more generalisable statement." "The design overall is very bland and boring to look at. By bland I
don't want you to add a lot of clutter, just make the design better: copy, graphics, UI. Like how a proper Linear
[https://linear.app/] … it has a perfect page. Like a real product, copy everything." "You can even have a QwenWork
window (mock) that shows the workflow." "Make the site as if designed by a professional team, not a bunch of slop
churns."

They pointed at the live How it works page (`/how-corrections-work/`, built by `page_how()` in
`site/v2/port/build_more.py`): three beige cards "1 It is first estimated. / 2 Later releases revise it. / 3 A sentence
on the first number may now be wrong." plus "Flipped a headline: the change crossed zero or a round number such as 5%,
so the words must change." It reads like an explainer prompt, not a product.

## The bar: Linear (study it first)

Open https://linear.app/ yourself (screenshot it with playwright at 1440 and 390, look at the shots). What to take:
- **The product is the hero.** A large, crisp, believable app window right under a short headline. No illustrations.
- **Headline + one subline + two buttons.** Then the product. Then one section per capability, each with its own
  small, precise UI fragment (not cards with icons).
- **Type and restraint:** one sans family at display sizes with tight tracking, muted secondary text, hairline
  borders, generous spacing, a near-monochrome palette with one accent. Details reward a second look (keyboard hints,
  status dots, tiny timestamps inside the mock UI, subtle light on window edges).
- Take the craft and the page grammar. Do not copy Linear's logo, wording, illustrations or exact layout; this is
  our own product in our own colours.

## What the product is (general first, Singapore as the proof)

- Official numbers (GDP, jobs, inflation, trade, company results) are first estimates. They get revised for months.
  Decks, briefings and reports quote the first number and nobody tells the author when it changes.
- **Recall Press** watches every figure in your decks and briefings. When a source revises one, it tells you
  which sentence is now wrong, shows the new figure with its dated official source, and hands back a corrected PPTX.
  It runs as an agent on QwenWork.
- **Revisionpedia** is the free, public record behind it: one page per official figure, every release, every change.
  Today it covers 60 Singapore figures (10 indicators × 6 quarters); 57 of 60 changed after first publication and 18
  changed enough to flip the headline.
- The headline must be the **general** claim (any official number, any deck); Singapore appears only as the proof
  ("Live today for 60 Singapore figures", the real example). Write several candidate headlines, pick the strongest
  one, and say why in NOTES-v3.md. Direction, not final: "Numbers get revised. Your deck doesn't." / "Know when a
  number in your deck stops being true."
- CTA: "Send a deck" → `/cover-my-briefing/` (existing form; pilot, no fee, results within two working days).
  Secondary: "See a real correction" → https://ka62nv48.qwenwork.page/ (the live product page).

## The product mocks (the main graphics; build them in HTML/CSS/SVG, real data only)

1. **Hero: the Recall desk window** (an app window, macOS-style chrome, sidebar + main pane). Sidebar: Decks, Alerts,
   Figures. Main: the deck "Members' quarterly economy briefing" with its slides as rows; one row flagged: Slide 4
   "Manufacturing stalled in Q3 2025." → strike "stalled" → "grew 4.6%", source "MTI · 14 Apr 2026", buttons
   Apply fix / Skip. Other rows show "still current" in quiet text. Take real values from
   `workspace/qw-morning/runs/2026-11-21-68013a314ad1/result.json` and `site/collections/revisions.json`.
2. **The agent run (the QwenWork window the owner asked for):** a second window or panel showing the workflow as a
   live run log with timestamps and status dots: Deck received → 23 figures found → checked against the latest
   official releases → 1 sentence now wrong → corrected PPTX ready. Label it with the product's own name
   ("Recall Press agent"), with a small "runs on QwenWork" line; do not imitate QwenWork's logo or UI branding.
   Mark it visibly as an illustration of a run only if any of its numbers are not from the real run JSON.
3. **A figure's history:** the step chart of every release for Manufacturing YoY Q3 2025 (0.0% → 5.0% → 4.6%), in
   the new style, as a Revisionpedia fragment.
4. **The 60-figure grid** (keep the idea from v2 `home-02-grid`, restyled to the new system, readable on a phone:
   e.g. latest quarters visible, rest scroll sideways inside the frame).
5. Optional: the checker from `home-03-checker` restyled, if it fits the new page; drop it if it adds noise.
Motion: one hero entrance plus motion that explains (the strike drawing, the run log ticking). Respect
`prefers-reduced-motion`.

## Pages in scope (all of them share one new system)

- **Home** (rewrite the bands in `site/v2/src/home-*.html`; you may add, merge or drop bands).
- **How it works** (`page_how` in `site/v2/port/build_more.py`): rewrite as a product page section, e.g. the three
  steps as Linear-style feature rows with UI fragments, not beige cards. No "Flipped a headline:" definition prose.
- **Header and footer** (`site/v2/src/header.html`, `footer.html`): product nav (Product/How it works, Figures,
  About) + "Send a deck" button; a compact footer.
- **Figure page** (`site/v2/src/figure-template.html` + `render_v2.py`) and **indicator page**
  (`indicator-template.html`): restyle to the new system. Keep markup changes small, ideally CSS only via
  `site/v2/port/global.css` (it is the site-wide stylesheet; figure pages are 60 separate Hashmeta pages).
- **Cover / Send a deck** (`cover-my-briefing.html`), **About**, **Sources**, **Figures index**, **All revisions**
  (`build_more.py`): restyle and tighten copy.

## Hard rules (owner taste: read `deck/kit/references/taste.md` §1–5 before writing copy)

- Headlines are plain claims ending with a period, 4–10 words. No topic titles, no eyebrow pills/kickers, no
  "Learn more"/"Get started". No three continuous lines of prose anywhere. Keyword rows and arrows over sentences.
- Banned visible words: series, vintage, archived, archive, record (data sense), dataset, threshold, cutoff, observed,
  snapshot, "first to current", "pp", run IDs, "Manual live check", "started with Run now", "AI-powered".
- No status/provenance lines except one footer line (sources + licence + "Figures checked 22 Nov 2026").
- Never invent users, logos, testimonials, quotes, metrics, pricing tiers or "trusted by". Every number shown is
  real (from the repo files) or inside the clearly mock app window as part of the real example run.
- No AI-site tells: no purple-blue gradients, no blurred blobs, no gradient text, no three identical icon cards,
  no emoji, no fade-in on every block. A subtle light edge or glow on the product window is fine.
- Contrast ≥ 4.5:1 for body text, tap targets ≥ 44px, works at 390px with no horizontal page scroll and at 1440px.
- One accent colour reserved for corrections (the strike and the new figure). Dark or light theme is your call;
  justify it in NOTES-v3.md.
- Never mention the assistant tooling used to build this site in any file or visible text.

## Hashmeta constraints (must keep the port pipeline working)

- Pages are lists of self-contained `rawHtml` blocks (`<style>` + HTML + optional inline `<script>`), every rule
  scoped under a block class. Fonts via Google Fonts `@import`. No framework, no build step at runtime.
- Keep the pipeline: edit `site/v2/src/*` and the Python builders, then run
  `python3 site/v2/render_v2.py && python3 site/v2/port/build_port.py && python3 site/v2/port/build_more.py`
  (use `.venv/bin/python` if plain python3 fails). They write `site/v2/port/payload/*.json`,
  `site/v2/port/home.json`, `cover.json`, `global.css`, `header.html`, `footer.html`, `figures/`, `indicators/`.
  Keep each figure page payload ≤ 7 KB; home.json may grow but keep it under ~90 KB.
- Do not write to Hashmeta, QwenWork or git. Do not commit. Work only inside `site/v2/`.

## Done means

- Screenshots in `site/v2/out/v3/`: home 1440 (full + first screen) and 390 (full), how-it-works 1440/390, figure
  1440/390, indicator 1440, cover 1440. Use the existing shoot scripts (`site/v2/shoot.mjs`,
  `site/v2/port/shoot.mjs`, `shoot_more.mjs`; playwright-core in `deck/node_modules`, Chrome at
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, serve with `python3 -m http.server`).
- At least three look-and-fix rounds on your own screenshots, each judged against your Linear screenshots side by
  side: "would Linear's design team ship this?" Fix what fails.
- `site/v2/NOTES-v3.md`: the headline candidates and the pick, the headline spine of each page, theme choice, and
  12+ deliberate details.
- Home visible text ≤ ~220 words (mock UI text excluded).
