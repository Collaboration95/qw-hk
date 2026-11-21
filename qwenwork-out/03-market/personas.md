# Buyer personas — Recall Press (Singapore)

Derived from prospects.csv (P-ids referenced). Roles only; no personal names. Date: 2026-11-19.

---

## Persona 1 — "The same-day macro note writer" (bank / consultancy economics team)

**Archetypes from the list:** UOB Global Economics & Markets Research (P12), OCBC Treasury Research & Strategy (P13), DBS Group Research (P11), Capital Economics Asia (P23), Maybank Global Markets Research (P14), RHB Research Institute Singapore (P20).

- **What they publish:** Same-day flash notes on GDP advance estimates and MAS decisions; daily/weekly macro digests; quarterly outlook decks. The same growth number is copied into 4–6 downstream products (daily note, weekly outlook, quarterly deck, client slides, media quotes).
- **What happens today when a figure is revised:** Nothing systematic. The economist who wrote the flash note may remember to update the quarterly deck; the daily digest archive, the client-facing PDF and the sales team's talking points keep the old number. The Q3 2025 case (0.0% advance estimate on 14 Oct → 5.0% in the 21 Nov Economic Survey) is exactly this failure mode: a 5-percentage-point swing that makes every "manufacturing stalled" sentence wrong.
- **What a wrong figure costs them:** Credibility with institutional clients who trade on these notes; internal compliance exposure (research records must be accurate and archived); media misquotation that compounds the error. For subscription research shops (Capital Economics, Oxford Economics), stale forecast baselines are a product-quality issue subscribers can churn over.
- **Who signs off:** Chief economist / head of macro research owns the content; head of research or COO owns the tooling budget. At banks, vendor onboarding adds procurement and infosec review (expect months, not weeks).
- **What they need to see before buying:** (1) Zero false positives on vintage-qualified sentences ("as first reported in October" must stay green); (2) a sourced correction draft with the exact SingStat/MTI release link and both vintages; (3) an audit trail they can show compliance; (4) coverage of their document formats (PDF, PPTX, Word); (5) a pilot on one publication series (e.g. the Singapore GDP flash note) before any enterprise rollout.

**Willingness to pay:** highest of the three personas (research is revenue-generating), but slowest procurement. Anchor: they already pay for data terminals and monitoring tools at custom-quote prices (see pricing-benchmarks.csv).

---

## Persona 2 — "The flash-to-final property research lead" (property agency / consultancy research team)

**Archetypes from the list:** ERA Research & Market Intelligence (P29), PropNex Research & Content (P30), OrangeTee/Realion research (P31), Cushman & Wakefield Singapore (P33), Knight Frank Singapore (P32).

- **What they publish:** Quarterly commentaries on URA private residential price index and HDB resale index — published twice per cycle: once on flash-estimate day, once on final-data day — plus monthly developer-sales reports, infographics and agent-facing slides.
- **What happens today when a figure is revised:** They knowingly re-publish on final-data day, but the flash-day infographic keeps circulating in agent WhatsApp groups and on social media with the old qoq/yoy numbers. Annual rebasing of URA indices silently invalidates older comparisons. Nobody tracks which past sentences are now wrong.
- **What a wrong figure costs them:** Agent and client trust (agents quote their infographics to buyers/sellers); brand reputation in a market where four agencies publish competing numbers on the same day; for the consultancies, client deliverables that fail review.
- **Who signs off:** Head of research / head of research and consultancy owns the problem; marketing or the CEO approves a small subscription. Decision cycle is short — these are 3–8 person teams with discretionary budgets.
- **What they need to see before buying:** (1) A live demo on their own last flash-vs-final pair (e.g. ERA's 1Q2025 flash report vs the final print); (2) correction drafts that preserve the original and label the vintage; (3) support for infographics/slides, not just text; (4) a price that fits a research-team budget (low hundreds of S$ per month); (5) no IT project — sign up and point it at a folder or feed.

**Willingness to pay:** moderate per seat but fast to convert; the pain is recurring, visible and quarterly. Best first-customer segment.

---

## Persona 3 — "The federation policy & research head" (chamber / association / think tank)

**Archetypes from the list:** SBF (P01), SCCCI (P08), EuroCham (P03), REDAS (P07), SIIA (P09), AmCham (P05), BritCham (P04).

- **What they publish:** Member newsletters, business-sentiment survey reports, board papers, budget recommendations and advocacy briefs that use official GDP/CPI/labour figures as the macro backdrop for their own survey findings.
- **What happens today when a figure is revised:** The backdrop paragraph is copied from the last release and rarely re-checked. Board papers and annual reports go out with stale growth numbers; a member or journalist notices before staff do. Small teams (2–8 producers) have no dedicated fact-checker.
- **What a wrong figure costs them:** Member trust and advocacy credibility — a federation quoting wrong growth figures in a Budget submission loses standing with ministries; for chambers, the value proposition to paying members is accurate, timely intelligence.
- **Who signs off:** Head of policy and research / director of research recommends; secretary-general or CEO approves. Budgets are modest and grant-sensitive (see grants-check.md — PSG/EDG closed Sep 2026; EDGE pre-approval rules make subsidised purchase unlikely near-term).
- **What they need to see before buying:** (1) Human-in-the-loop approval — nothing auto-publishes; (2) plain-language alerts ("this sentence in your Q4 sentiment release is now wrong; here is the sourced fix"); (3) coverage of newsletters and board papers (Word/PDF/email); (4) a low entry price and monthly billing; (5) evidence from a peer federation or chamber.

**Willingness to pay:** lowest of the three, but high referral density — federation staff move between chambers, and one happy SBF/REDAS user is a warm intro to five peers.

---

### Cross-persona product requirements (from all three)
1. Vintage-aware judgement: "as first reported" stays true; unqualified present-tense claims get flagged.
2. Sourced correction drafts (old value, new value, release date, official URL) with the original preserved.
3. Human approval before anything changes; full audit log.
4. Format coverage: PDF, PPTX, Word, newsletter HTML.
5. Nightly checking cadence matched to SingStat/MTI/URA/HDB release calendars.