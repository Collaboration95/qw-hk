# Recall Press — Competitor & Adjacent-Product Landscape

**Research date / all pricing pages checked: 2026-11-19.**
Prepared for the QwenWork x Hashmeta One-Person Company hackathon.

**Recall Press's four capabilities (the comparison baseline):**

1. **Watch the source** — monitor official statistics (e.g. SingStat/MTI) and detect when a cited figure is revised (Q3 2025 manufacturing: 0.0% advance → ~5.0% final).
2. **Find the dependent sentence** — locate every sentence in a client's *already-published* decks, board papers and newsletters that relied on the old figure, including unlinked prose and paraphrases.
3. **Judge still-true vs now-wrong** — semantic judgment per sentence ("as first reported in October" stays true; "manufacturing is flat" is now wrong).
4. **Prepare a sourced correction for sign-off** — draft a correction citing the new release, route to a human approver, keep the original and an audit trail.

**Evidence labels:** `[V]` = vendor says (vendor's own site/docs); `[I]` = independently confirmed (third-party source, named); `[U]` = unverified / not found. "No feature found" means absence of evidence in vendor documentation and targeted searches on 2026-11-19 — not proof of absence.

---

## Assumptions

- This research ran in a scratch workspace, not the user's project folder, so all deliverables are saved to `outputs/04-competitors/` as downloads; no existing files were modified.
- Prices are exactly as displayed on the vendor page on 2026-11-19. Some pages geo-rendered in **SGD** (Google Workspace, Box); USD list prices were not displayed there and are not asserted. Quote-only pricing is recorded as quote-only; no price was invented.
- "Target customer" is inferred from vendor positioning pages unless labelled otherwise.
- MTI's website migrated to **meti.gov.sg** on 1 Oct 2026; old mti.gov.sg URLs redirect there. Both forms appear in sources.
- The Q3 2025 final manufacturing figure of "5.0%" is confirmed via Business Times reporting ("5 per cent"); the exact one-decimal figure sits in an MTI PDF that could not be parsed (see `revisions-literature.md`).
- Logically has pivoted away from fact-checking (2025 administration/sale); Perplexity Pages' "Create page" is temporarily retired per Perplexity's own help centre. Both are reported as-is.
- Capability gaps are assessed against the four capabilities above; a tool may be excellent at its own job and still score "no" on all four.

---

## Summary table

| Tool | Category | Watches source for revisions | Finds dependent sentences in published docs | Judges still-true | Sourced correction + sign-off | Price (checked 2026-11-19) |
|---|---|---|---|---|---|---|
| Workiva | Data-linked reporting | No (DIY via Chains) | Only pre-linked content, in-platform | No | Closest: publish-links + audit trail | Quote-only |
| M365 Excel-linked PPT/Word | Data-linked reporting | No | No (linked objects only, not prose) | No | No | From US$10/user/mo (apps) |
| Google Sheets-linked Slides | Data-linked reporting | No | No (chart objects only) | No | No | From S$9.40/user/mo (as displayed) |
| Datawrapper | Live charts | Polls a CSV URL; no revision semantics | No | No | No | Free / $21 / $39 per user/mo |
| Flourish | Live charts | Polls a URL; auto-republishes graphic | No | No | Pre-publish approval only | Free; paid tiers quote-only |
| Notion synced data | Synced data | No (3 managed sources) | No | No | No | Free / $10 / $20 per member/mo |
| Coda (Superhuman Docs) | Synced data | No (Packs, ≤hourly) | No | No | No | Free / $12 / $33 per Doc Maker/mo |
| AvePoint | Governance | No | No | No | No | Quote-only |
| Microsoft Purview | Governance | No | No | No | No | $12/user/mo add-on; E5 $60 |
| Box Governance | Governance | No | No | No | No | Add-on quote-only; plans from S$25 |
| OpenText Content Mgmt | Records mgmt | No | No | No | No | Quote-only |
| Iron Mountain InSight | Records mgmt | No | No | No | No | $12,600–$33,600/yr (AWS Marketplace) |
| Full Fact AI | Fact-checking | Watches public media, not stats revisions | No (public claims, not client corpus) | Verdicts at check time | Public fact-checks, not doc corrections | Quote-only (demo) |
| ClaimBuster | Fact-checking | No | No | Check-worthiness scoring only | No | Free (academic) |
| Logically | Narrative intelligence | Public narrative monitoring | No | No | No | Quote-only (demo) |
| Factiverse | Fact-checking | No | On-demand doc checks only | Point-in-time verdicts | No | Quote-only; /pricing 404s |
| Newsroom workflows (AP/Reuters) | Corrections policy | No | Human-noticed, own stories only | Editorial judgment | Yes, but manual policy | N/A |
| ALFRED / FRED | Vintage archive | Free "new data" emails per series | No | No | No | Free |
| Philadelphia Fed RTDSM | Vintage archive | Dataset-update emails | No | No | No | Free |
| OECD revisions DB | Vintage archive | No | No | No | No | Free |
| ONS revision triangles | Vintage archive | Release alerts (GovDelivery) | No | No | No | Free |
| Eurostat revision policy | Policy/metadata | No | No | No | No | Free |
| SingStat / SingStat Express | Official stats | Release emails, not revision diffs | No | No | No | Free |
| Bloomberg PiT | Vintage data (paid) | Revision histories, no alerts-to-docs | No | No | No | Quote-only |
| Macrobond | Vintage data (paid) | Vintage viewer, no alert feature found | No | No | No | Quote-only |
| Haver Analytics | Vintage data (paid) | "As reported" databases | No | No | No | Quote-only |
| M365 Copilot | AI writing | No post-publication tracking found | No | No | No | $30/user/mo add-on |
| Gemini in Docs | AI writing | No post-publication tracking found | No | On-demand "double-check" (Gemini app) | No | In Workspace Standard+ (S$18.80 as displayed) |
| Perplexity Pages | AI writing | No post-publication tracking found | No | No | No | Pro $17/mo annual; Max $200/mo |

**Bottom line:** no product reviewed combines all four capabilities. The nearest primitives are (a) Workiva's publish-links + audit workflow (capability 4, but only for pre-linked content inside its own platform), (b) Datawrapper/Flourish URL polling (capability 1's plumbing, stopping at the chart boundary), and (c) free release-notification emails from SingStat/FRED/ONS (capability 1's trigger, with no revision diff and no document connection).

---

## Category 1 — Data-linked reporting

### 1.1 Workiva (Wdesk platform)

**What it does.** Cloud platform for SEC/EDGAR, ESG/CSRD, audit and board reporting where numbers *and narrative text* are linked across documents, spreadsheets and presentations: "Change a data point once, and every linked instance updates accurately, automatically" `[V]` (https://www.workiva.com/platform). Linking uses source links (blue) and destination links (green); a changed source shows an orange "unpublished" indicator until a user clicks **Publish / Publish All Links** `[V]` (https://support.workiva.com/hc/en-us/articles/360042390592-Link-and-publish-in-Documents). External data enters via 70+ connectors and **Wdata Chains**, which can run on a schedule, include approval-workflow events and send email notifications `[V]` (https://support.workiva.com/hc/en-us/articles/360036003651-Overview-How-chains-work-in-your-workspace; https://www.workiva.com/platform/data-connectivity/connectors).

**Gaps vs Recall Press.**
1. *Watch the source:* no shipped feature that monitors a statistical agency for revisions. Chains can be custom-built to poll a connected source on a schedule `[V]`, but revision detection is DIY pipeline work, not a product. Whether any out-of-the-box connector targets statistical agencies: `[U]`.
2. *Find dependent sentences:* linking works **inside the Workiva workspace on content explicitly linked in advance**. It does not scan arbitrary already-published decks/PDFs/EDGAR filings for unlinked mentions or paraphrases of an old figure. No such feature documented `[U]/absent`.
3. *Judge still-true:* none. A destination text link mirrors the source text verbatim when published; it does not judge whether "as first reported in October" remains true `[V]`. Workiva AI/Agent Studio drafts and tags disclosures under human oversight `[V]` (https://www.workiva.com/platform/workiva-ai) but no "is this sentence now wrong" feature is documented.
4. *Sourced correction + sign-off:* **closest of all tools reviewed** — publish-links workflow, version control, blacklines, full activity history, permissions `[V]`. But it updates *linked* content in *living* documents, not corrections to frozen published artifacts.

**Price.** **Quote-only.** https://www.workiva.com/pricing (checked 2026-11-19) publishes no numbers: "good/better/best packaging… priced in accordance with needs"; unlimited seats; contact sales `[V]`. Every plan includes "Data linking across documents, spreadsheets, and presentations—including numbers and narrative linking" `[V]`.

**Target customer.** Enterprise finance/accounting, audit/risk, sustainability teams; public-company SEC filers, banks, insurers, government `[V]` (workiva.com/solutions). Third-party ESG review exists: https://www.sweep.net/blog/workiva-review-for-esg-reporting-and-compliance `[I — existence confirmed via search; contents not fetched]`.

### 1.2 Microsoft 365 linked data (Excel → PowerPoint/Word; Power BI)

**What it does.** Paste-link keeps an Excel chart/table in PowerPoint/Word connected to the source workbook: "the data in the Word document will update when the source Excel worksheet is updated" `[V]` (https://support.microsoft.com/en-us/topic/4ba759cc-62f3-422c-bd75-3fc83b06bb6b). In PowerPoint refresh is manual: right-click → **Update Link** `[V]` (https://support.microsoft.com/en-us/powerpoint/insert-and-update-excel-data-in-powerpoint). Links break when files move; Microsoft documents broken-link repair `[V]` (https://support.microsoft.com/en-us/powerpoint/update-or-remove-a-broken-link-to-an-external-file).

**Gaps.** (1) Nothing watches an external official source; the chain starts at a human-maintained workbook. (2) **The link updates the number inside the linked chart/table object, not prose.** A text box saying "manufacturing grew 0.0%" is ordinary text with no data link; nothing finds it. Word can paste-link a cell as text, but only if deliberately linked in advance `[V]`. No cross-document "where is this figure cited" index. (3) No semantic judgment. (4) No correction workflow beyond generic version history. An exported PDF or an emailed .pptx is a static copy — links never reach it. Users frequently report linked charts failing to update at all `[I — user reports]` (https://learn.microsoft.com/en-us/answers/questions/5362658/powerpoint-does-not-update-linked-excel-charts).

**Price** (https://www.microsoft.com/en-us/microsoft-365/business/compare-all-microsoft-365-business-products, checked 2026-11-19, USD/user/month, paid yearly) `[V]`: Business Basic **$7.00**; Business Standard with Copilot **$23.50**; Business Premium with Copilot **$32.00**; Apps for business **$10.00**; no-Teams variants: Basic $5.40, Standard w/ Copilot $20.30, Premium w/ Copilot $28.80. Linked-data features live in the desktop apps (Apps for business and above; Basic is web/mobile only `[V]`).

**Target customer.** SMB to enterprise already on Office; no reporting-specific governance tier `[V]`.

### 1.3 Google Sheets-linked charts in Google Slides (and Docs)

**What it does.** Insert → Chart → From Sheets with "Link to spreadsheet"; when the Sheet changes an **Update** button appears, or **Tools → Linked objects → Update all** `[V]` (https://support.google.com/docs/answer/7009814). Updates are **user-triggered, not automatic**; bulk update added 2019 `[V]` (https://workspaceupdates.googleblog.com/2019/05/bulk-update-docs-slides.html). Users asking how to automate updates confirms the manual behaviour `[I]` (https://stackoverflow.com/questions/44497247/how-to-automatically-update-charts-linked-to-google-sheets).

**Gaps.** (1) No external-source watching. (2) Updates the chart/table object only — **prose in Slides/Docs is never linked or scanned**; the Linked objects panel lists objects in the current open file, not every deck citing a figure. (3) No semantic judgment. (4) No correction/sign-off workflow; linked-object updates silently override local edits `[V]`. Downloaded PPTX/PDF copies are static.

**Price** (https://workspace.google.com/pricing.html, checked 2026-11-19; page geo-rendered in **SGD**, per user/month, annual commitment, excl. tax) `[V]`: Business Starter **S$9.40**, Standard **S$18.80**, Plus **S$29.40** (50%-off-3-months promo shown); Enterprise quote-only. USD list prices of $7/$14/$22 (annual) reported by a third party `[I]` (https://coworker.ai/blog/coda-pricing, Sept 2026) — not directly verified on Google's page from this location. Linked charts available on all tiers incl. free personal accounts `[V]`.

**Target customer.** Teams already in Google Workspace; education, SMB, enterprise `[V]`.

### 1.4 Datawrapper

**What it does.** No-code charts/maps/tables for newsrooms. **Live data**: link a public CSV (own server, GitHub, Google Sheets); either Datawrapper re-fetches it (every minute for 24h after publish, then hourly for 29 days, then stops until republish) or the viewer's browser pulls the CSV directly — "update your charts… automatically, without republishing" `[V]` (https://www.datawrapper.de/docs/live-updating-options). API supports programmatic refresh: `POST /charts/{id}/data/refresh` `[V]` (https://www.datawrapper.de/developer/reference/post-charts-id-data-refresh; https://www.datawrapper.de/developer/automatic-updates-for-live-data).

**Gaps.** (1) Partially adjacent: it re-polls a CSV URL you point it at (e.g. a government CSV) but does not detect or interpret a *revision* (0.0% → 5.0%); it just redraws `[V]`. (2) **None** — a live chart silently updates inside whatever article embeds it; Datawrapper does not tell you which articles embed a chart and never touches surrounding prose. No embed-location registry documented `[U]/absent`. (3) None — this is the dangerous case: the chart flips to 5.0% while the article text still says 0.0%. (4) None; edit history (30/90 days/1 year/unlimited by tier) is versioning, not a correction workflow `[V]`.

**Price** (https://www.datawrapper.de/pricing, checked 2026-11-19, USD excl. VAT, annual billing displayed) `[V]`: **Free $0**; **Pro $21/user/month**; **Business $39/user/month**; **Enterprise quote-only**. Custom theme add-on **+$499/month** (+$299 per extra theme). API: free tiers (500 create / 1,000 publish / 3,000 export ops per month), then $0.04–0.03/create, $0.02–0.015/publish, $0.01–0.008/export op. Live updates on **all plans incl. Free** `[V]`.

**Target customer.** Newsrooms (NYT, Reuters, Vox, The Times shown), NGOs, academics, corporate comms `[V]`.

### 1.5 Flourish (Flourish Live; a Canva brand)

**What it does.** No-code interactive chart/map/story templates. **Live data** (premium): link a public CSV or published Google Sheet; Flourish periodically checks the source and **auto-republishes the graphic if data changed** (frequency by tier; API for per-minute updates) `[V]` (https://flourish.studio/blog/live-data/; https://helpcenter.flourish.studio/hc/en-us/articles/8761560293903). Published embeds keep working even if the source goes offline `[V]`.

**Gaps.** (1) Same as Datawrapper — polls a configured URL (the blog explicitly mentions "a government statistical bulletin" `[V]`) but no revision-detection/alerting semantics. (2) None — auto-republish updates the embedded graphic only; no embed registry, no prose awareness; story captions are static text `[V]` (https://flourish.studio/product/data-storytelling/). (3) None. (4) Publisher/Enterprise have **pre-publication approval workflows** ("admins review and approve visualizations before publishing") `[V]` — sign-off on graphics before publishing, not post-publication corrections of text. Enterprise audit logging on request `[V]`.

**Price** (https://flourish.studio/pricing/, checked 2026-11-19) `[V]`: **Free $0** (attribution, no live data); **Presenter** — no standalone price, "Available with a Canva Business or Enterprise plan"; **Publisher** quote-only (adds live data, teams, approval workflows); **Enterprise** quote-only. Canva's pricing page (https://www.canva.com/pricing/) is JS-rendered and failed to load prices via fetch; Canva's help page confirms location/seat-dependent pricing with no numbers `[V]` (https://www.canva.com/help/canva-business-billing/). Third-party SpendHound (updated 2026-10-29) reports Canva Business at **US$250/year per person**, Pro US$144/year `[I]` (https://www.spendhound.com/marketplace/canva-pricing) — indicative only, not vendor-verified.

**Target customer.** Newsrooms, financial services, professional services, marketing, government, education `[V]`.

### 1.6 Notion (synced databases / data sync)

**What it does.** Managed one-way syncs bring GitHub, Jira and Salesforce records into Notion databases as read-only pages; updates run in background "in a few minutes or less" (Salesforce checks every minute) `[V]` (https://www.notion.com/help/sync-data-from-other-tools-to-notion). Legacy GitHub/Jira/Asana/GitLab syncs **stop updating 2026-10-30**; custom sources require code via Notion Workers `[V]`.

**Gaps.** (1) No connector for statistical agencies; only three managed sources + custom Workers code `[V]`. (2) None — sync updates database *properties*; prose quoting a number is plain text; no dependency tracking or scan of published pages/Notion Sites. (3) None documented; Notion AI/Agents search and write `[V]` but no "flag sentences invalidated by changed data" feature `[U]/absent`. (4) Page history (7/30/90 days/custom) and Enterprise audit log `[V]` — versioning, not a sourced-correction workflow.

**Price** (https://www.notion.com/pricing, checked 2026-11-19, USD per member/month, yearly billing shown) `[V]`: **Free $0**; **Plus $10**; **Business $20**; **Enterprise custom**. GitHub/Jira sync requires Business; Salesforce sync requires Enterprise `[V]`. Custom Agents metered at $10 per 1,000 credits `[V]`.

**Target customer.** Startups, SMB team workspaces; Enterprise for org-wide rollout `[V]`.

### 1.7 Coda (now Superhuman Docs — Packs, sync tables, Cross-doc)

**What it does.** Docs-with-databases; **Packs** pull external data into sync tables; **Cross-doc** copies tables between docs with **Manual / Daily / Hourly** refresh — "instant or real-time syncs are not supported" `[V]` (https://help.superhuman.com/hc/en-us/articles/46210175526157-Set-up-Cross-doc-sync-tables). Optional two-way sync edits the source `[V]`. Coda became Superhuman Docs on **2026-07-08** under Grammarly/Superhuman; existing customers keep plans/pricing; new customers buy the Superhuman bundle `[V]` (https://help.superhuman.com/hc/en-us/articles/46210161369741-Superhuman-Docs-billing-and-pricing-basics).

**Gaps.** (1) Only via a configured Pack/API; refresh at best hourly (Free = manual, Pro = daily) `[V]`; no revision semantics. (2) None — sync tables update cells and formulas recalc, but **prose on the canvas quoting a figure is static text**; no dependency scan of published docs. (3) None documented (Docs AI is a beta writing/analysis assistant `[V]`). (4) Version history (7/30 days/unlimited) and doc locking `[V]`; no sourced-correction-with-sign-off workflow.

**Price** (https://superhuman.com/plans, checked 2026-11-19) `[V]`: **Free $0**; **Pro $12/member/month billed annually ($15 monthly)**; **Business $33 annually ($40 monthly)**; **Enterprise custom**. Billing per **Doc Maker** only — editors/viewers free `[V]`. Docs-only pricing pages are JS-rendered and failed to load; third-party Coworker.ai (Sept 2026) confirms the same $0/$12/$33 per-Doc-Maker figures `[I]` (https://coworker.ai/blog/coda-pricing); real-buyer median ~$29,840/yr per Vendr data cited there `[I]`.

**Target customer.** Ops/project teams building internal tools; "few builders, many readers" orgs `[V]`/`[I]`.

---

## Category 2 — Document governance & records management

*These products govern the **lifecycle** of documents — backup, classification, retention, legal hold, disposition, DLP. None watches external statistical sources, locates cited figures in published sentences, judges their truth, or drafts corrections. All four Recall Press capabilities are absent from every product reviewed (absence based on product pages reviewed 2026-11-19).*

### 2.1 AvePoint (Cloud Backup, Opus records management)

**What it does `[V]`.** Cloud Backup for Microsoft 365: backup/restore of Teams, SharePoint, Exchange, OneDrive, etc.; up to 4 backups/day; ransomware detection; granular restore; BYOS/BYOK (https://www.avepoint.com/products/cloud-backup/microsoft-365-backup). **AvePoint Opus**: AI classification ("Maestro"), retention rules, archiving, ROT-data purge, defensible disposal, physical + electronic records; uses Purview/Google DLP sensitivity labels; NARA FERMI, IRAP, VERS certified (vendor claims) (https://www.avepoint.com/products/records-management). Platform also includes Policy Enforcement & Drift Control and Data & Security Insights (https://www.avepoint.com/pricing).

**Gaps.** Protects copies, classifies them, decides keep/delete. "Insights" are about storage/risk/configuration, not factual accuracy. None of the four capabilities.

**Price.** **Quote-only** — "Let us craft a unique plan… Request Pricing"; licensed per user count or data volume `[V]` (https://www.avepoint.com/pricing, checked 2026-11-19).

**Target customer.** M365-centric enterprises and MSPs; government, financial services, regulated industries; 25,000+ companies claimed `[V]`.

### 2.2 Microsoft Purview

**What it does `[V]`.** Compliance suite: DLP, sensitivity labels, insider risk, audit, eDiscovery, **data lifecycle management and records management** (retention/disposition), Compliance Manager, Copilot data protection (https://www.microsoft.com/en-us/security/microsoft-purview-pricing). Data governance (Unified Catalog/Data Map): cataloging, glossary, data-quality rules billed per governed asset/day and per DGPU. Microsoft Learn states classic data governance is **being retired into Microsoft Fabric**; maintenance mode through Nov 12, 2027 `[V]` (https://learn.microsoft.com/en-us/purview/data-governance-billing).

**Gaps.** Records management = retention labels, holds, disposition schedules — keep/destroy decisions, not content accuracy. Sensitivity labels classify confidentiality, not truth. None of the four capabilities.

**Price** (https://www.microsoft.com/en-us/security/microsoft-purview-pricing, checked 2026-11-19) `[V]`: Microsoft 365 E5 (includes Purview Suite) **$60.00/user/month paid yearly** (E5 without Teams $51.45); **Purview Suite add-on $12.00/user/month paid yearly** (requires E3 base). Beyond-M365 scanning: pay-as-you-go via Azure; exact meter rates `[U]` (https://azure.microsoft.com/en-us/pricing/details/purview/ not opened).

**Target customer.** M365 enterprises; compliance, risk, data-governance teams.

### 2.3 Box Governance (+ Box AI)

**What it does `[V]`** (https://www.box.com/security/governance-and-compliance). Retention policies with disposition at global/folder/file level; **event-based retention**; **legal holds**; advanced trash controls; unlimited file versions; eDiscovery integrations (Logikcull, Exterro, Onna, IBM, RecordPoint, Gimmal). **Box AI** (separate): Q&A over stored content, generation, agents, metadata extraction, metered in "AI Units" (https://www.box.com/pricing).

**Gaps.** Retention/legal hold preserve or destroy content; they never evaluate whether a sentence's statistic is still correct. Box AI answers on demand — no external-source watching, no post-publication citation tracking, no correction workflow. None of the four.

**Price** (https://www.box.com/pricing, checked 2026-11-19; page served **SGD** due to geo-location; annual per user/month) `[V]`: Business **S$25** (monthly S$33.50, min 3 users); Business Plus **S$45**; Enterprise **S$60** (1,000 AI Units/mo); Enterprise Plus **S$85** (2,000 AI Units); Enterprise Advanced from **S$119** (20,000 AI Units). **Box Governance itself: optional add-on, quote-only** ("Contact us").

**Target customer.** Mid-market to enterprise content collaboration; banking, government, life sciences, legal `[V]`.

### 2.4 OpenText Content Management (Extended ECM)

**What it does `[V]`** (https://www.opentext.com/products/content-management). ECM embedded in SAP, Salesforce, Microsoft 365, Guidewire; version control, annotation, redaction; workflow automation; records management with nine permission levels, legal holds, audit trails; DOD 5015.02, FedRAMP, Protected B, IRAP certifications cited. **Content Aviator** AI: conversational search/summarization over managed content.

**Gaps.** Records controls govern access, retention and audit; Aviator summarizes on demand. None of the four capabilities.

**Price.** **Quote-only** — "Speak to an expert"; no public figures (product page, checked 2026-11-19). Third-party estimate sites exist (e.g. vendr.com/marketplace/opentext) but figures there are unverified and not reproduced.

**Target customer.** Large SAP/ERP-centric enterprises; government, engineering, insurance, life sciences.

### 2.5 Iron Mountain InSight DXP

**What it does `[V]`** (AWS Marketplace listing https://aws.amazon.com/marketplace/pp/prodview-3f6zm63444ptc). SaaS unifying **physical and digital records**; digitization via 135 imaging sites; generative/agentic AI for classification, enrichment, redaction; **automatically applies retention and privacy policies**; connectors/APIs.

**Gaps.** "Intelligent governance" = retention/privacy policy application and redaction, not factual-accuracy monitoring. None of the four.

**Price** (AWS Marketplace, checked 2026-11-19; 12-month contract, USD) `[V]`: InSight Base **$12,600/yr**; Plus **$15,600/yr**; Pro **$33,600/yr**; overage **$0.01 per Consumption Unit**; custom private offers available. Vendor page: https://www.ironmountain.com/services/insight-digital-experience-platform/intelligent-document-processing.

**Target customer.** Enterprises with large physical + digital archives; regulated industries.

---

## Category 3 — Fact-checking & claim monitoring

### 3.1 Full Fact AI (UK charity)

**What it does `[V]`** (https://fullfact.ai/; https://fullfact.ai/product/). Monitors public debate — RSS, newspapers, YouTube, TikTok, Instagram, podcasts, social accounts, broadcast radio — for check-worthy claims; "SIFT analysis" gives an AI verdict, harm score /100 and source-linked corrections; alerts when a previously fact-checked claim recurs; Slack alerts; real-time transcription. Used by "over 45 organisations in 30 countries" incl. Africa Check, Dubawa, ARIJ; English/French/Arabic. Adoption independently confirmed: Google blog on Nigerian fact-checkers (https://blog.google/intl/en-africa/company-news/technology/nigerian-fact-checkers-fight-election-misinformation-with-full-facts-ai-tools/) `[I]`.

**Gaps.** Watches *public* sources for misinformation and repeat claims. Does not ingest a client's private published-document corpus, does not watch official statistics for revisions, does not re-judge whether an existing sentence remains true after a revision. Its "corrections" are public fact-checks, not sourced amendments to client documents.

**Price.** No public pricing; demo-request only (checked 2026-11-19). Quote-only.

**Target customer.** Fact-checking organisations, journalists, researchers, communicators.

### 3.2 ClaimBuster (IDIR Lab, UT Arlington)

**What it does `[V]`** (https://claimbuster.org/; https://idir.uta.edu/projects/). Academic end-to-end fact-checking project: AI scores sentences for "check-worthiness"; free API; live US political-debate coverage; ClaimPortal tracks specific social-media accounts; open-source model (https://github.com/idirlab/claimspotter). Academic status confirmed via KDD'17 paper (https://ranger.uta.edu/~cli/pubs/2017/claimbuster-kdd17-hassan.pdf) `[I]`.

**Gaps.** Claim *detection* in public/political text, not verification against statistical vintages; no private-corpus scanning, no revision monitoring, no correction drafting or sign-off workflow.

**Price.** **Free** — "accessible by just registering for a free API key" (checked 2026-11-19). Academic/non-commercial.

**Target customer.** Journalists, researchers.

### 3.3 Logically — PIVOTED; fact-checking arm effectively gone

**Status `[I]`.** July 2025: lost TikTok and Meta contracts; went into administration and was sold to Kreatur Ltd (The Times, 4 Jul 2025, via https://en.wikipedia.org/wiki/Logically_(company), citing https://www.thetimes.com/uk/media/article/britains-biggest-fact-checking-firm-logically-administration-zpdgw8qnt). Current site (© 2026 Kreatur Limited) no longer sells fact-checking.

**What it does now `[V]`** (https://logically.ai/). "Narrative Decision Intelligence" for government/enterprise: **Logically Intelligence** (SaaS monitoring of public/open-source information, narrative clustering, alerts) and **PRISMα** (custom agentic intelligence via 30-60-90-day PoC; "can incorporate approved customer data in scoped, customer-controlled environments").

**Gaps.** Narrative/threat monitoring, not statistical-revision tracking; PRISMα's customer-data integration is the only adjacency, but nothing connects official-statistics revisions to sentences in published client documents. Logically Facts' residual operational status `[U]`.

**Price.** Demo-request only; no public figures (checked 2026-11-19).

**Target customer.** National security, public safety, government; enterprise risk second.

### 3.4 Factiverse (Norway)

**What it does `[V]`** (https://www.factiverse.ai/; https://www.factiverse.ai/solutions/text). Claim detection + verification across text, video/audio and LLM outputs in 114 languages; checks claims "against trusted user sources"; LLM audit methodology; customers shown include NRK, SVT, Viestimedia, Tjekdet, FactBar, Kyiv Independent; "independently security-tested at a NATO-certified centre"; claims ~1,400× faster / ~2,000× cheaper than frontier-LLM APIs (vendor benchmarks, not independently confirmed). Existence/positioning confirmed via Orange Hello Future profile (https://hellofuture.orange.com/en/factiverse-reliable-ai-fact-checking-in-more-than-100-languages/) `[I]`.

**Gaps.** Closest fact-checking adjacency — its Text solution processes "research documents" at scale against user-trusted sources. But it is a **point-in-time** claim check: no watching of statistical agencies for revisions, no vintage comparison, no re-judging of already-published sentences, no correction-with-sign-off workflow.

**Price.** https://www.factiverse.ai/pricing returns **404** (checked 2026-11-19); homepage offers only "Book a demo". Quote-only; any historical free-editor tier `[U]`.

**Target customer.** AI model builders / EU sovereign AI, defence & intelligence, media & research.

### 3.5 Newsroom correction workflows (AP, Reuters, Poynter)

- **AP `[I]`:** corrections must be labeled corrections (no "recasts/fixes"), sent to subscriber editors and visible to consumers; when correcting a prior-day error, AP asks subscribers who used the erroneous info to carry the correction; online stories are overwritten. https://www.ap.org/about/news-values-and-principles/telling-the-story/
- **Reuters `[I]`:** "Correct errors transparently"; rectify "promptly, clearly and comprehensively" across story/caption/graphic/script. https://reutersagency.com/about/standards-values/
- **Poynter `[I]`:** describes HuffPost standards editor Victor Brand's inbox-based system coding each correction by type and tracking teams (3% threshold triggers review) — a manual/spreadsheet-style workflow, not a product. https://www.poynter.org/reporting-editing/2022/journalists-need-to-rethink-their-relationship-with-corrections/

**Gaps.** Editorial policies for a newsroom's *own* stories, triggered by humans noticing errors. No dedicated commercial "corrections software" that scans a client corpus against statistical revisions was found `[U — none found]`. **These policies are Recall Press's workflow template, not its competitor** — AP's "ask subscribers who used the erroneous info to carry the correction" is exactly the distribution problem Recall Press automates.

---

## Category 4 — Statistical vintage & revision services

### 4.1 ALFRED (Archival FRED, St. Louis Fed)

**What it does `[I]`.** Vintage versions of US economic data "as reported on past dates"; new/revised observations typically added within one business day of release; download forms and API (https://fred.stlouisfed.org/docs/api/fred/alfred.html). **FRED accounts offer free per-series email notifications "when new data are added"** — the closest free "notify me" primitive, but it signals series updates, not revision-vs-your-documents (https://fred.stlouisfed.org/help/account/fred-account-features/notifications).

**Gaps.** Archives vintages for economists; no connection to your documents, no sentence-level judgment, no correction drafting. US-centric.

**Price.** **Free** (public Fed service; free account for notifications). Checked 2026-11-19. Sources: https://alfred.stlouisfed.org/; https://alfred.stlouisfed.org/help; FRED blog (Jun 2026): https://fred.stlouisfed.org/blog/2026/06/what-can-alfred-do-for-you

**Target customer.** Researchers, forecasters, policy analysts.

### 4.2 Philadelphia Fed Real-Time Data Set for Macroeconomists (RTDSM)

**What it does `[I]`.** Vintages/snapshots of major US macro series, updated end of each month; complete vintage-history downloads plus first/second/third-release files; now includes 24 GDI variables; on-page email sign-up for dataset updates. https://www.philadelphiafed.org/surveys-and-data/real-time-data-research/real-time-data-set-for-macroeconomists (checked 2026-11-19).

**Gaps.** US macro research dataset; no revision-specific alerts, no document linkage, no sentence judgment.

**Price.** **Free.** **Target customer.** Macroeconomic researchers, forecasters.

### 4.3 OECD real-time revisions database — migrated, not discontinued

**Status `[I]`.** The MEI "Original Release Data and Revisions Database" (monthly vintages from Jan 1999) is now served via the OECD Data Explorer as the Short-term Economic Statistics revisions dataset (DSD_STES_REVISIONS): https://data-explorer.oecd.org/vis?lc=en&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_STES_REVISIONS%40DF_STES_REVISIONS&df[ag]=OECD.SDD.STES (link confirmed via Dallas Fed). Companion: Dallas Fed "Real-time historical dataset for the OECD" — quarterly vintages 1962:Q1–1998:Q4 digitised from hard-copy MEI, 26 countries, 13 variables, free Excel files, non-commercial: https://www.dallasfed.org/research/international/oecd

**Gaps.** Vintage matrices for economists; no revision alerts, no document connection.

**Price.** **Free** (both; checked 2026-11-19). Methodology publication: https://www.oecd.org/en/publications/undertaking-revisions-and-real-time-data-analysis-using-the-oecd-main-economic-indicators-original-release-data-and-revisions-database_146528313656.html

### 4.4 ONS revision triangles (UK)

**What it does `[I]`.** Free datasets showing every published estimate of UK GDP growth and subsequent revisions: quarterly GDP (ABMI) — latest edition Q2 2026, released 30 Sep 2026, next 22 Dec 2026; also monthly GDP and GDP-per-head triangles. Free email alerts via GovDelivery (https://public.govdelivery.com/accounts/UKONS/subscribers/new). https://www.ons.gov.uk/economy/grossdomesticproductgdp/datasets/revisionstrianglesforukgdpabmi (checked 2026-11-19).

**Gaps.** UK GDP only; spreadsheet triangles, not per-series revision alerts; no link to documents or sentence truth judgments.

**Price.** **Free**, Open Government Licence v3. Also: https://www.ons.gov.uk/economy/grossdomesticproductgdp/datasets/revisionstrianglesformonthlygdp; OSR review: https://osr.statisticsauthority.gov.uk/publications/revisions-of-estimates-of-uk-gross-domestic-product-gdp/pages/5/

### 4.5 Eurostat revision tracking

**What it does `[I]`.** General revision policy adopted 2023; classifies routine / major / unscheduled revisions; revision policy & practice documented per dataset in metadata; ESS guidelines on PEEI revisions; national-accounts benchmark revisions every 5 years (harmonised CMFB policy); GDP flash estimates at 30 days. https://ec.europa.eu/eurostat/data/data-revision-policy; https://ec.europa.eu/eurostat/web/national-accounts/database/data-revisions (checked 2026-11-19).

**Gaps.** Policy + metadata documentation, not a vintage database or alert service; a standalone Eurostat real-time/vintage database was not found `[U]`. No document linkage.

**Price.** **Free.** PEEI guidelines: https://ec.europa.eu/eurostat/documents/3859598/5935517/KS-RA-13-016-EN.PDF

### 4.6 SingStat (Singapore Department of Statistics) — the source itself

**What it does `[I]`.** Quarterly Advance GDP Estimates published ahead of full estimates (e.g. 3Q 2026 advance released 14 Oct 2026, 8:00 a.m., pre-announced 7 Oct 2026): https://www.singstat.gov.sg/news/release-of-advance-gdp-estimates-3q2026. Advance Release Calendar: https://www.singstat.gov.sg/data-tools-services/advance-release-calendar. **SingStat Express** — free email subscription by release type, including "Advance GDP Estimates" (quarterly), "Performance of the Singapore Economy" (quarterly), "Manufacturing Performance" (monthly), CPI, trade: https://www.singstat.gov.sg/data-tools-services/subscribe-for-updates. Also Telegram: https://t.me/SingStat. Table Builder: https://tablebuilder.singstat.gov.sg/. A **SingStat MCP** (Model Context Protocol) service page exists at https://www.singstat.gov.sg/data-tools-services/singstat-mcp but its content is JS-rendered; details `[U]` — potentially relevant for Recall Press integration.

**Gaps.** These are *release* notifications, not "this figure was revised from X to Y" diff alerts. No public vintage archive, no per-series revision-diff alerts, nothing connecting revisions to client documents. **SingStat Express tells you a release happened; Recall Press would tell you which of your sentences it breaks.** No dedicated revision-policy page found on singstat.gov.sg `[U]`; IMF DSBB holds Singapore national-accounts metadata incl. revision practices at https://dsbb.imf.org/sdds/dqaf-base/country/SGP/category/NAG00 (JS-rendered; content `[U]`).

**Price.** **Free** (public statistics; free subscription; checked 2026-11-19).

### 4.7 Commercial vintage / "notify me of revisions" services

- **FRED email notifications `[I]`:** free per-series "new data added" emails (see 4.1). Not revision-specific, no document linkage.
- **Bloomberg Point-in-Time economic data `[V]`:** "Economic Releases and Surveys Point-in-Time (PiT)" dataset announced 7 May 2026 via Bloomberg Data License: 3,000+ indicators, 100+ economies, time-stamped history to 1997, full revision histories, consensus evolution; aligned with ECO <GO> and Real-Time Macro Indicators feed. Built for quant backtesting, not document correction. **Quote-only** (enterprise Data License; no public figures; checked 2026-11-19). https://www.bloomberg.com/company/press/bloomberg-introduces-point-in-time-economic-data-to-power-quantitative-research-and-strategy-development/
- **Macrobond `[V]`:** revision-history viewer (changed values highlighted), vintage formulas (`segdp{2001-12-01 09:30+1}`), initial-release extraction (`{0}`), Excel + Python/R API. Requires Data+, Professional or Enterprise license. No revision-alert feature documented `[U]`. **Quote-only** (checked 2026-11-19). https://help.macrobond.com/tutorials-training/macrobond-analysis-user-guides/3-analyzing-data/analysis-tree/using-the-series-list/vintage-data/; https://www.macrobond.com/
- **Haver Analytics `[V]`:** 250+ DLX databases updated within minutes of release; "Forecasts & As Reported Data" databases "store historical data as reported at a certain date to allow comparisons with pre-revision data". Subscription, **quote-only** (https://www.haver.com/our-data, checked 2026-11-19). Singapore office. No revision-alert feature documented `[U]`. https://www.haver.com/
- **Refinitiv/LSEG revision alerts:** no specific product verified `[U]`.

**Bottom line:** no commercial service was found combining revision detection on official statistics + scanning a client's private published corpus + sentence-level still-true/wrong judgment + sourced correction with human sign-off. The nearest primitives are free release/update emails (SingStat Express, FRED, ONS, Philadelphia Fed) and paid vintage archives (Macrobond, Haver, Bloomberg) — none connect to your documents.

---

## Category 5 — AI writing assistants that cite statistics

### 5.1 Microsoft 365 Copilot (Word / PowerPoint)

**Cites statistics at drafting time?** Partially. Grounding confirmed: web data, referenced/uploaded files, and **Work IQ** (tenant data) `[V]` (https://www.microsoft.com/en-us/copilot/pricing/enterprise). "Draft with Copilot" in Word can reference up to 20 files/emails/meetings, whole OneDrive/SharePoint folders (10 most recent files), documents up to 1.5M words `[V]` (https://techcommunity.microsoft.com/blog/microsoft365insiderblog/expanding-reference-capabilities-with-microsoft-365-copilot-in-word/4406054). It surfaces references to the files it used; it is not a statistics-verification engine — cited figures come from whatever the referenced files/web say at generation time.

**Post-publication tracking of cited figures? No such feature found.** Targeted searches ("Copilot update citations after source changes", "Copilot alert outdated statistics published documents") returned only user complaints that Copilot quotes outdated SharePoint content (https://learn.microsoft.com/en-us/answers/questions/5692027/microsoft-co-pilot-consistently-gives-outdated-and) `[I — user reports]` and manual hygiene advice (https://www.sharepointdesigns.com/blog/how-to-stop-copilot-quoting-outdated-policies-in-sharepoint). No Microsoft documentation or announcement of monitoring published documents for source revisions or proposing corrections (searched 2026-11-19; absence-of-evidence).

**Price** (https://www.microsoft.com/en-us/copilot/pricing/enterprise, checked 2026-11-19) `[V]`: M365 Copilot add-on **$30.00/user/month, paid yearly**; requires a qualifying M365 plan. Copilot Chat (web-grounded) included at no extra cost with eligible subscriptions; agents metered.

**Target customer.** Enterprise knowledge workers on Microsoft 365.

### 5.2 Gemini in Google Docs / Workspace

**Cites statistics at drafting time?** Grounding confirmed: Google's 30 Oct 2025 announcement — Gemini in Docs auto-curates sources **linked in your document** and can restrict writing assistance to those "Document links" `[V]` (https://workspaceupdates.googleblog.com/2025/10/improve-writing-gemini-google-docs-sources.html). The Gemini app has an on-demand "double-check response" feature that re-checks claims via Google Search `[I — third-party commentary]` (https://featureorfuture.substack.com/p/future-or-friction-google-geminis; https://www.itgenius.com/blog/how-to-fact-check-ai-results-with-a-gemini-gem/) — not continuous monitoring, and not a Docs post-publication feature. Gemini in Docs requires Business Standard or above `[V]` (pricing feature matrix).

**Post-publication tracking? No such feature found** (searched 2026-11-19; absence-of-evidence). Nothing watches a published Doc's cited statistics for source revisions or proposes corrections.

**Price** (https://workspace.google.com/pricing.html, checked 2026-11-19; **SGD** as displayed; annual, per user/month) `[V]`: Starter **S$9.40** (Gemini in Gmail only); Standard **S$18.80** (Gemini in Docs/Sheets/Slides/Drive/Meet); Plus **S$29.40**; Enterprise quote-only. Gemini AI now **included in Workspace plans** (no separate add-on listed). USD list prices not displayed — `[U]` here.

**Target customer.** Google Workspace organizations; Standard+ for AI writing in Docs.

### 5.3 Perplexity Pages

**What it is `[V]`.** Launched 30 May 2024: turns a research thread into a structured, publishable article with inline citations; tone/audience selection; section editing; visuals (https://www.perplexity.ai/hub/blog/perplexity-pages). Pro/Max add premium data sources (PitchBook, Statista, S&P Capital IQ) `[V]` (https://www.perplexity.ai/hub/pricing).

**Current status `[V]`.** Perplexity's Help Center: **"The 'Create page' feature is temporarily retired, and 'Convert to Page' feature will be returning shortly with enhanced capabilities."** https://www.perplexity.ai/help-center/en/articles/10352968-perplexity-pages (checked 2026-11-19).

**Refresh / citation re-check?** Editing was manual; **no documented auto-refresh or citation re-verification** when a source changes. Whether the returning "Convert to Page" will re-check citations: `[U]`. Perplexity Computer "Automations" can run scheduled monitoring tasks (https://www.perplexity.ai/help-center/en/articles/11521526-perplexity-tasks) — a generic scheduler, not a citation-revision watcher for published documents.

**Post-publication tracking? No such feature found** for published Pages or any Perplexity artifact (searched 2026-11-19).

**Price** (checked 2026-11-19): Free **$0**; Pro **$17/month billed annually** `[V]` (https://www.perplexity.ai/hub/pricing; the commonly cited $20 monthly rate was not visible on fetched pages — `[U]`); Max **$167/month billed annually** (hub/pricing) and **$200/month or $2,000/year** `[V]` (https://www.perplexity.ai/help-center/en/articles/11680686-perplexity-max); Enterprise Pro **from $40/seat/month or $400/seat/year** `[V]` (https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you).

**Target customer.** Researchers, analysts, content creators; Enterprise Pro/Max for finance, legal, consulting teams.

---

## Cross-cutting answers

**Does Workiva monitor external sources or flag dependent narrative?** External refresh: yes, mechanically — Wdata Chains can run on a schedule against connected sources with approval events and email alerts `[V]`; this is build-it-yourself pipeline automation, not a revision-monitoring product. Narrative: Workiva does link narrative text `[V]`, but a destination text link mirrors the source verbatim when published — it does not judge paraphrases or contextual sentences, and only covers text explicitly linked in advance. No feature found that flags unlinked narrative dependent on changed data `[U]`.

**Does any tool track figures AFTER publication?**
- **Datawrapper & Flourish: yes, but only the graphic.** Published live embeds keep updating post-publication `[V]` — which actively *creates* the Recall Press problem (chart says 5.0%, surrounding article still says 0.0%) without telling anyone where the embeds live or what text is now wrong.
- **Workiva:** links stay live inside the platform, but a filed EDGAR document, exported PDF or sent deck is frozen `[V]`.
- **Microsoft/Google:** links refresh only when someone opens the file and clicks Update; distributed copies never update `[V]`.
- **Notion/Coda:** live workspace pages reflect syncs; exported/published static copies don't; prose is never linked `[V]`.
- **Copilot/Gemini/Perplexity:** drafting-time grounding only; no post-publication monitoring found (searched 2026-11-19).

**The whitespace.** All four Recall Press capabilities combined are unoccupied by every product reviewed, based on vendor documentation and targeted searches on 2026-11-19. See `positioning.md` for the 2x2 map and the "why hasn't Workiva or Copilot done this?" analysis.