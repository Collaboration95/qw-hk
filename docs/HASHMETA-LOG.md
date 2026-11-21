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
8. List pages /revisions/ and /indicators/ are raw HTML generated from the local data. Revisions are grouped by indicator, with first, current, change and a client-side filter that still works without JavaScript. Indicators are grouped into Annual growth / Quarterly growth / Labour market.
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

- **Form submission and delivery are not tested.** No test enquiry was sent, because PUBLISH.md requires an owner-approved test route. Submissions should land in Form Submissions for form 1.
- **No forwarding or CRM rule.** The email forwarding rule needs a destination address and none was supplied, by design. The owner should add one in the app or via `create_forwarding_rule` with their address.
- **Discovery files:** robots.txt is 200. sitemap.xml lists only 5 URLs, without the collection or list pages. llms.txt returns 404. These are platform-generated; they need the app's SEO settings or a support request.
- **AI Visibility runs** (visibility-prompts.md) were not run. They are in-app only.
- **No JSON-LD.** The structured-data templates in site/schema were not bound.
- **Possible duplicate CTAs:** record pages show the Cover / Correction links twice, once from body_html and once from the template CTA box. This is cosmetic.
- **Leftover hidden form:** the cover page still contains the old AI form inside an inert `<template>` (not rendered). It can be deleted in the editor.

## Credits

The site generation task used 263.1 credits. Planning and analysis cost was not reported separately. Collection builds, direct page and form edits and publishing used 0. No creditNotice (70% threshold) was returned. Usage: app → subscription and usage pages.
