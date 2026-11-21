# Taste: what makes a deck this user approves

Distilled from five decks and their full feedback threads (evidence in `evidence/`). When two rules or two
reference decks disagree, the newer, better deck wins: **tftf final > Click > Prompt Fu = Common Grounds**.
Every rule below cost at least one feedback round when it was missed. Read all of it before writing copy or CSS.

## 0. Absorb the product; the reference decks are a bar, not a look

- These rules govern content, structure and craft. The look comes from the product's own world, found fresh
  for every deck (`look.md`, "Absorb the product"). Four lanes that copied tftf's look (tile reveal, headline
  top-left over white cards, gradient sky fields) were rejected together: "They have no variation between each
  other… these all seem slight remasking of the research agent slides."
- Lanes differ in world, colour journey, reveal, carry device, type, component grammar and layout, not in hue.
- "Surprise me, do something innovative." Safe and generic is the failure mode ("very overplayed, very safe").

## 1. The headlines are the pitch

- Every slide has one headline: a plain, positive claim in full words, ending with a period. Read only the
  headlines in order and the talk makes sense.
- Approved: "Shopping apps box you in. AI opens it up." · "The key that unlocks the article pays the writer." ·
  "Any agent, by URL." · "What we built since SingHacks." · "8 taps moved Guru from 7.9% to 43.4%." · "Why it works."
- Rejected topic titles and meta titles: "The problem" · "What you'll see" · "Honest scope" · "What we are
  betting on" · "Behind the scenes".
- Titles stay obvious. Clever is fine only when it is also specific ("Fun in, insight out."). Empty slogans are
  banned ("A little play. Better next picks.": "a real person would never put this").
- No negative headlines. "The LLM calls tools. It never writes UI code." became "The LLM calls tools to render the UI."
- Headline about 4–10 words. One line, two at most.

## 2. The problem is a felt tension, usually two-sided

- Slide 1 argues; it does not describe. Click: choice chokes you ("box you in") against the open box that frees
  you ("opens it up"). tftf: agents hit the paywall and settle for what's free; writers can't sell to agents and
  their best work goes unread.
- Neutral comparisons were rejected ("Shopping apps are one of two screens", "show everything / show nothing").
- The problem must make sense to a judge outside the field ("nebulous to someone who doesn't understand crypto").
- Then name what the product is in plain category words: "ResearchAgent is a marketplace for AI agents."
  No "X for Y" analogies (the iTunes line was replaced by the user).
- Get to the demo fast. "People spend a lot of time talking about the problem." One problem slide, never two.

## 3. Information lives on three levels (the most violated rule)

| Level | Holds | Never holds |
|---|---|---|
| **Slide** | What the presenter can defend in 3 seconds: the claim, the mechanism as a picture, one number | caveats, limits, assumptions, "hard-coded", "demo data", dates, names, provenance ("recorded run 12 Nov"), taglines, criteria tags, stats strips (PR counts, releases, days), file paths, competitor names, API keys, model internals |
| **Speaker notes + script** | Caveats said aloud, model details, file names, the honest qualifiers | anything the audience must read |
| **Appendix + FAQ** | Dense proof numbers, edge cases, "what if" answers, architecture detail | anything in the spoken path |

- "You don't need to say anything that's hard-coded. I can say it live… Don't put it in the slides or anywhere."
- "Checked, not claimed" (1,000 purchases, 210,480 states…) was cut at the end: "hard to explain later on".
  Proof numbers go to the appendix unless the presenter can explain each in one breath.
- The only labels ever tolerated: one tiny network label ("XRPL Testnet") and one honesty qualifier
  ("(simulated payments)") where a claim would otherwise be false.
- "If it's irrelevant, don't have it." Nothing fake: no invented feedback, quotes, users or metrics.

## 4. No labels, no chrome

- No eyebrow pills or kickers above headlines ("THE SHIFT", "STRONG INTENT", "BEHIND THE SCENES"). The user
  removed them all; the headline carries the slide.
- No headers, footers, page numbers, "N", logos in corners, event names, dates on slides.
- The slide position lives in a pill outside the stage (the engine's nav band), never printed.

## 5. Show the mechanism moving; never explain it in sentences

- Each slide has ONE dominant visual that is the idea: arrow rows, a pipeline, before/after with the before
  struck through, phones, a real artifact (code, log lines, sprite sheet), a big number.
- Text is keyword rows and arrows. Never three continuous lines anywhere ("Let's not write even three continuous
  lines. Bullet points are better, and arrows are better.").
- Feature lists are bare keywords: "escrow, pay on delivery and verifiable receipts", not a sentence explaining each.
- Contrasts are visibly different on each side (faded, struck "before" vs white-card "after").
- Group related charts or cards into one grid rather than several half-empty slides. No half-empty slides at all:
  never reserve space for a live mirror; assume the demo runs on its own screen.
- The one-line answer is about 10 words ("agents buy the article they need, writers get paid.").

## 6. Show the ideal system, by roles

- Architecture names roles, not plumbing: Phone renders → Server brings context → LLM calls tools → Validation
  (real products, real prices) → Screen. No API keys, model types, feature counts, "random shitty model".
- "Show them what, ideally, it's going to be."

## 7. Numbers: one, big, as a before → after

- One hero number per slide at most, shown as a change: "7.9% → 43.4%", "31 → 48 of 100".
- Progress is a before/after against the last milestone ("since SingHacks"), not vanity stats.
- Every number is real and traceable. Label simulated or synthetic data where the claim needs it.
- External validation (talks, rankings) earns a real photo card, not full screen.

## 8. Colour carries mood and continuity

- Every slide sits on a saturated or painted coloured field, with cards from the deck's world on top (white cards
  with depth are one option, not the rule). **Never a white or paper slide background** ("I really don't like the white"). Never bland ("BLAND LOOKING CRAP").
- The colours form one continuous journey across the deck (tftf: a sky deepening from golden hour to night, each
  slide's top continuing from the previous slide's middle). No harsh jumps ("boom, black. Boom, different blue").
- The deck background must differ from the app being demoed, so the demo does not melt into the slides.
- One warm accent kept for the problem and the marker. Never black text on saturated orange.
- Judge colour as a filmstrip of the whole deck, not slide by slide.
- Ink is computed, never hand-picked: text and marks on a field use the engine's `--ink-auto`, on the brand colour
  `--on-brand`, elsewhere `Deck.inkOn(colour)`. A dark wordmark on a navy field was called "a really bad design…
  in terms of visibility". Check visibility in the motion frames as well as the stills.

## 9. The product's soul, not its UI

- Borrow the brand: colours, characters, mascot, wordmark, art, launch video frames. Prompt Fu (the game's
  characters and palette) and Common Grounds (the video's pixel art) were approved with zero revisions.
- Never borrow the app's neutral UI chrome or background (Click's off-white app look was rejected).
- Screens: use the best-looking source (concept renders, drawn art), not raw captures that look worse.
- Every phone screen sits in a real iPhone frame (9:19.5, bezel, Dynamic Island, home bar). Asked five times,
  twice in caps. Web products use a browser frame. Use `.phone` / `.browser` from the engine.
- Real logos for third parties (Claude, Cursor, VS Code), never drawn stand-ins. The brand wordmark is text in
  the brand font and colour.

## 10. Craft shows in the tiny details

- "I want the end user to realize that even the teeny tiny things (like the bots hitting the paywall animation)
  was thought of and considered." Every deck has a detail ledger of at least 15 product-tied details (`look.md`,
  "Tiny considered details"): ambient actors (a steam train puffing along the bottom, distant skateboarders, a
  satellite crossing), arrival stories, and small physical touches (a shadow that catches up, a late window).
- Each deck gets its own reveal: "the beginning slide can have a logo reveal, but not the same".
- One emphasis device: the hand-drawn marker loop (`.mk`) or the world's own equivalent, drawn live on arrival, 1–3 times per deck, on the
  felt word. No other underlines, sparkles, discs or highlighter. "You don't need to put 100 circles."
- Cards have depth (inner highlight, soft tinted shadow), never bare rounded rectangles or anything that looks
  like a default web form ("UI/UX designed by Flask").
- Small elements stay small. Type: one family, 800 weight headlines, nothing under 28 px on a card that must read
  from 8 m (labels 22 px minimum).
- Avoid the LLM tells: generic gradients with no source, emoji, sparkle icons, three identical feature cards with
  icons, "Built for X" boilerplate, quips.

## 11. The presenter never works the deck

- Slide changes are instant. No transitions. Two exceptions: the intro reveal (empty slide, first press plays
  it), and a carry device that moves while the content cuts (≤ 1.2 s): a point swarm that reforms into the next
  slide's figure, a camera gliding along one panorama. The user's pick in hr-2026 was exactly this (v4).
- Each slide plays a short story animation on arrival (≤ 1.5 s, readable on the first frame, no loops): the bot
  runs into the wall, the key and the money cross, the before items strike through, the phones rise and wiggle,
  the marker draws. Then it rests.
- No clicks or steps inside a slide ("this is going to be just a slide. I'm just going to be presenting this").
  The appendix is the only interactive slide.
- Ambient motion (drift, parallax, a rolling town) is welcome, on one constant clock that ignores navigation.
- 0–9 jump straight to slides; 0 returns to the empty intro. Click anywhere advances. On the appendix the digits
  open its cards (as in tftf); Home or ← leaves it.

## 12. Delivery

- One self-contained HTML file that opens by double-click, plus a PDF, published to a live link
  (GitHub Pages). Give a cache-busted link (`?v=N`) and the local file link.
- Never open windows on the user's machine; render headlessly and hand over links.
- Under time pressure, push straight; skip PR ceremony.

## Sizing

- 3-minute pitch: intro + 6 slides + appendix, ~400 spoken words.
- 6–7 minutes: about 10 slides. Roughly one slide per 30 s of talk, not counting the live demo.
- Never more than 12 pitch slides. Backups go in the appendix, never in the count.

## Backtest clarifications (2026-11-19, hr-2026 run; inferred, not yet confirmed by the user)

User verdict on that run: none of the four was distinct enough; v4 (point field) was the one they liked, though
the critic ranked it last. Treat critic rankings as advisory; the user's taste rewards a product-born idea over
polish. The lines below are still unconfirmed.


- A before → after pair counts as one hero number. At most two pairs on a slide.
- Fields stay clearly coloured: no near-cream top that reads as paper, and not dark when the product's app is dark
  (the demo hand-off must change colour).
- Fields stay clearly coloured also means v4's deep teal → indigo was accepted next to a near-black green app.
- Characters and mascots stand beside the mechanism picture, never replace it. Technical audiences get them on
  the bookends and at most one or two content slides.
- For infrastructure products, the slide 1 tension shows a cost (time, bytes, re-work), not just a ratio.
- Captions inside a visual (axis ticks, "From the decision layer", "Declared / Mapped") are part of the picture
  and allowed at ≥ 22 px; pills or tags floating above content (a "P-0001" tag, key hints) are chrome.
- The marker is one warm colour deck-wide, on the felt word or the resolution, never more than 3 times.
- Crop app screenshots to the one region that carries the claim; dense inspector panels are unreadable on stage.
- Every picture agrees with the claim and the notes (a struck layer that the claim says is kept is a bug).
- Review motion with `export.mjs --motion` before showing; stills cannot prove the arrival story.
