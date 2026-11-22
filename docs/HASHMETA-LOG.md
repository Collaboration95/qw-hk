# Hashmeta AI build log: Revisionpedia

Date: 2026-11-21 (SGT). Built through the hashmeta MCP. The owner approved the licence and the address in advance.

## Live site

**https://revisionpedia.geo.hashmeta.tech**

## IDs

| Item | ID |
| --- | --- |
| Licence used | 2622704d-9684-435d-8390-8198b9858363 (Trial, 30 days, invite QWENWORKOPC), now USED |
| projectId | 6b7c9fea-8970-469b-871a-1eb4f8db9601 |
| App | https://app.hashmeta.ai/ai-cms/6b7c9fea-8970-469b-871a-1eb4f8db9601 |
| Collection: Revisions (/revisions/{slug}) | 61a26e6e-8b3c-4f2e-86c2-9ef6cbd172f6 (60 entries) |
| Collection: Indicators (/indicators/{slug}) | f8b3b501-eaf8-4edf-a676-eb7e48b9f750 (10 entries) |
| Form "Cover my briefing" (live CMS) | 1 |
| Site generation task | 906d99a4-b1a7-40e9-97a0-fb4e6b216912 |
| Pages (live CMS ids) | Home 1, Privacy 2, Cover my briefing 3, Sources and licences 4, Terms 5, How corrections work 6, About 7, Revisions list 8, Indicators list 10 |

## What was done

1. `create_site`: the description was built from README, site/pages and PUBLISH.md (audience, five pages, two collections, calm editorial look, no invented statistics, anonymous publisher). Language en.
2. `get_site_setup` → basics confirmed → `plan_site_pages`. The AI planned 5 pages, 2 collections, terms and privacy. I replaced each page prompt with the exact copy from `site/pages/*.md` plus layout notes, then confirmed the pages.
3. Design: Source Serif 4 headings, Source Sans 3 body, paper #faf9f3, ink #182923, one accent #075b48, social icons off. Header nav: Indicators, Revisions, How corrections work, Sources and licences, About, plus a "Cover my briefing" CTA. Footer: two link columns, an independence line and a data.gov.sg licence credit, with no contact details.
4. `generate_site` (multi-role): 21/21 steps, **263.1 credits**. The five pages came out faithful to the repo copy. The home page matched figure for figure: the 0.0% → 5.0% → 4.6% feature, the counts 60/57/56/18/21, and the latest and biggest tables.
5. The AI also made its own Indicators and Revisions collections. They contained **fabricated sample data**: a "Retail Sales Index Q2 2025" record and a fake release history. I deleted both collections and their pages before deploying. Nothing fabricated went live.
6. `deploy_site` at prefix `revisionpedia`. The deploy and the first publish completed.
7. I created new collections with `create_collection` and my own raw-HTML detail templates. Each page shows a breadcrumb, an H1 question, the answer, a first/current/change strip, `{{{body_html}}}` (release history with a source link and agency on every step, current table and licence links, indicator link) and Cover / Correction CTAs with `?record=&intent=` prefill.
   - The data came from `site/collections/*.json`. The body was slimmed by dropping per-step row locators and the repeated terms links. Display strings ("0.0%", "+4.6 pp", "14,700 people") were pre-formatted, so templates never format numbers.
   - Imported with `save_collection_entries`: 60 + 10 entries. The read-back was compared field by field with the local data: **0 mismatches**.
   - `build_collection_pages`: 69 pages, **0 credits**. The site software is the older "platform-rendered" kind; site-rendering was not available.
8. List pages /revisions/ and /indicators/ are raw HTML generated from the local data. Revisions are grouped by indicator, with first, current, change and a client-side filter. Without JavaScript the list can be browsed unfiltered. Indicators are grouped into Annual growth / Quarterly growth / Labour market.
9. Form: deploying moved the AI-built form into the live CMS as id 1. I redefined its fields as intent (coverage / correction), name, reply email, organisation, publication or briefing name, record, message, consent, and a hidden source. I rewrote the form markup on /cover-my-briefing/ to match, posting to `/api/form-submissions` with form 1 and prefilling `?intent=` and `?record=`.
10. Knowledge base: 8 entries (brand, style, product, site facts, policy, 2 FAQs, audience) were added through `add_knowledge`. Generation added 9 more facts of its own.
11. Meta titles were fixed so they no longer double the " | Revisionpedia" suffix, which the site appends. Home and record meta descriptions were set.
12. `publish_changes`: all pages, records and list pages are live.

## Verified by curl (signed out, 2026-11-21)

- 200 and real content: /, /how-corrections-work, /cover-my-briefing, /sources-and-licences, /about, /revisions, /indicators, /terms, /privacy.
- **All 60 revision record pages** load at /revisions/{slug}. Each shows its answer, first, current and change display values, and at least one official source link. All 10 indicator pages load with their description and frequency summary.
- Q3 2025 manufacturing YoY (/revisions/sg-gdp-manufacturing-yoy-2025-q3) shows the history 0.0% (14 Oct 2025) → 5.0% (21 Nov 2025) → 4.9% → 5.3% → 4.6% (14 Apr 2026) → 4.6% repeated through 14 Oct 2026. This matches site/collections.
- One decimal is preserved everywhere: "0.0%", "5.0%", "±0.0 pp".
- The /cover-my-briefing form renders all 8 fields.
- The pages checked contain no personal name and no email address.
- Page titles read "X | Revisionpedia" with no duplicate suffix.

## Not done or not verified

- One labelled API enquiry appeared in Hashmeta Forms with its originating record. Browser submission, forwarding, CRM follow-up and organic enquiries remain unverified.
- Job 006 stamped eight indicators using the manual 15:56 check. Job 014 checked those series again and published a fresh stamp on all eight: “Last checked 22 Nov 2026, 00:56 SGT in a live check of the official data by Recall Press on QwenWork: no new revision.”
- **Discovery files:** robots.txt is 200. sitemap.xml lists only 5 URLs, without the collection or list pages. llms.txt returns 404. These are platform-generated; they need the app's SEO settings or a support request.
- **AI Visibility runs** (visibility-prompts.md) were not run. They are in-app only.
- **No JSON-LD.** The structured-data templates in site/schema were not bound.
- **Possible duplicate CTAs:** record pages show the Cover / Correction links twice, once from body_html and once from the template CTA box. This is cosmetic.
- **Leftover hidden form:** the cover page still contains the old AI form inside an inert `<template>` (not rendered). It can be deleted in the editor.

## Credits

The site generation task used 263.1 credits. Planning and analysis cost was not reported separately. Collection builds, direct page and form edits and publishing used 0. No creditNotice (70% threshold) was returned. Usage: app → subscription and usage pages.

## 22 Nov 2026 · Revisionpedia v2 redesign (live)

The first version read like a data dictionary. v2 is a plain-language redesign: one idea per screen, real data only.
- Source: `site/v2/` (copy and visual rules in `BRIEF.md`, generator `render_v2.py`, Hashmeta port builders in `port/`).
- Applied with direct Hashmeta MCP edits (`update_global_styles`, `update_header`, `update_footer`, `update_page` for 77 pages, `update_form`), then three `publish_changes` releases. No AI page builds; 0 Hashmeta credits.
- Live: home (hero, a grid of all 60 figures, an interactive checker, the Recall Press offer), 60 figure pages with step charts and QAPage JSON-LD, 10 indicator pages, Figures index, all-figures list, How it works, About, Sources, the "Send a deck" page with the native form relabelled in plain words.
- Checked from outside after publishing: text on 71 of 72 ported pages matched the payloads, and the home page was checked by eye. Screenshots at 1440 and 390 px; no horizontal scroll.
- The indicator pages no longer carry job 014's per-page stamp. The site-wide footer now says "Figures checked 22 Nov 2026"; the job 014 evidence stays in docs/qw-outbox/014-honest-stamp/.

## 22 Nov 2026 · v3 product redesign (live)

The owner found v2 bland and Singapore-specific. v3 turns the site into a product landing page for Recall Press:
- **Headline:** "Your sources change. Your deck should too." Singapore appears only as the live proof ("Live today for 10 Singapore indicators").
- **Look:** a light theme in Inter, one correction red, and real-data product windows: the Recall desk, the agent run log ("runs on QwenWork"), a figure's history and the 60-figure grid.
- **Source and rounds:** source in `site/v2/` (`BRIEF-v3.md`, `NOTES-v3.md`, fix rounds `FIXES-v3-r1..r3.md`). Three blind-critic rounds; scores rose from 4–7 to 6–8.
- **Ported:** direct Hashmeta MCP edits.
  - Payloads come from `port/compose_payloads.py`.
  - Pages: 77 via `update_page`.
  - Site-wide: global CSS, header, footer.
  - Form 1 labels: "Link to your deck", "Send a deck".
  - Terms and privacy page meta, so they re-bake the chrome.
- **Released:** one `publish_changes` release (82 items). 0 Hashmeta credits.
- **Verified:** `port/verify_live.py` reports 77 of 77 pages matching. Live screenshots at 1440 and 390 show no horizontal scroll.

## 22 Nov 2026 · Automation copy (live)

- **Headline:** "Your sources change. Your deck updates itself." Subline: Recall Press rewrites the sentence and hands back the updated deck; the editor only approves.
- **Copy across the site:**
  - Hero mock: "To approve", "Updated for you", Approve button, "Updated PPTX".
  - Run band: "Runs on its own, every release."
  - Closing band and Send a deck page: "Send a deck once. It keeps itself current."
  - How it works: "Your deck keeps itself current." Steps end on "You approve. The deck updates."
  - About, Figures, All figures, figure and indicator closers say the deck updates itself.
- **Released:** one `publish_changes` release of 77 pages. 0 Hashmeta credits.
- **Verified:**
  - `port/verify_live.py` reports 77 of 77 pages matching.
  - A browser submission of the live Send a deck form was stored as submission 2 (labelled TEST, example.com address) and showed the thank-you message.
