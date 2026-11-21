# Publish Revisionpedia on Hashmeta AI

The deliverables are ready for import. The local preview uses real archived figures. Hosting, CRM delivery and AI Visibility results require an authenticated account. The display name recommendation and search evidence are in NAMING.md.

## Prepare the edition

From the repository root run `python3.14 -B site/build_site.py`. It reads the series archive, revision statistics and the calendar (for upcoming release dates only). It writes the collections, page copy, structured data, highlights, tracker answer key and preview. Open `site/preview/index.html` directly. Its enquiry form is disabled.

The 19 November 2026 edition has **10 indicators and 60 series–quarter records**. Each record has at least two vintages. Of these, 57 changed between releases, 56 changed from first to current, 21 crossed a sign or briefing cutoff at some point and 18 did so from first to current. Nine single-vintage quarters are excluded from the Revisions collection. See revision-highlights.md for ten sourced examples.

## Publish by hand, in this order

1. **Select the site.** In the authenticated AI CMS workspace, inspect the available site licence and existing sites. Choose the intended site or create its draft if needed. Use Revisionpedia as the directory name and “Singapore economic revisions” as its descriptor. Keep the service pages on the same site. Set the canonical hostname to the address assigned in this account.
2. **Create two Collections.** Use the keys `indicators` and `revisions`. Set detail routes to `/indicators/{slug}/` and `/revisions/{slug}/`. Use each supplied slug as the unique stable key. Define the fields in the tables below. If the editor has a native title, slug, category or body, map the matching column there once. Keep `period` as text so a quarter retains its year and Q label.
3. **Import Indicators first.** Import `collections/indicators.csv` using the header row, comma delimiter, UTF-8 and quoted-field support. Set the Categories field from `category`. Inspect the employment indicator. Its maximum is in people and its next release has a date window. If CSV import is unavailable, create records from the matching JSON objects using the same field map. If JSON fields are unavailable, keep the arrays as long text with their exact JSON value.
4. **Import Revisions second.** Import `collections/revisions.csv`. Map `series_id` to the indicator slug. If a relation field exists, resolve each value to the already-imported indicator. Otherwise keep the key as text and use the existing links in `body_html`. Do not create a new indicator for each quarter. On subsequent editions match by slug and update existing records. If the importer only appends, update matching records in the editor and import only the new slugs.
5. **Bind both detail templates.** Use the collection title as H1 and the answer (Revisions) or description (Indicators) immediately below it. Render `body_html` as content, including its linked source history, terms, access dates, indicator links and enquiry links. If the importer escapes HTML, use the rich-text source mode, map the same content into native blocks, or paste the rendered body from the corresponding offline page. Check that an official release name opens its cited source. No visitor should need to parse an array or see HTML tags. Put the checked date in visible text. Show Home › collection › record breadcrumbs.
6. **Build the browse routes.** Publish list pages at `/revisions/` and `/indicators/`, with pagination, per-entry links and visible record counts. Use the category labels “Annual growth”, “Quarterly growth” and “Labour market”, with stable slugs `annual-growth`, `quarterly-growth` and `labour-market`. Create routes under `/{collection}/category/{slug}/` and show filtered counts there. Annual growth means change from the same quarter a year earlier. Quarterly growth means change from the preceding quarter. Each indicator page links to every comparable quarter for that indicator.
7. **Create the five pages** using the files and routes below. At the home page’s `indicator-search` comment insert a native search field scoped to Indicators. If unavailable, use an HTML block with the preview’s local filter and indicator links. Keep the browse links visible with JavaScript off. “Latest” sorts on the last *changed* vintage date. “Biggest” ranks the absolute first-to-current difference within each unit. For a later edition, replace the home copy with the rebuilt version.
8. **Create the native enquiry form** at the `enquiry-form` comment. Use the form mapping below. Enable capture to Form Submissions or Records, configure the account’s forwarding rule to the AI CRM destination and save it. Preserve the referring record slug and intent through navigation. If query-prefill is unavailable, embed the same native form on each detail template and bind the record directly, with the standalone form available for other visitors. Show a received message only after CMS acceptance.
9. **Bind structured data.** Use `schema/revisions-template.json` (FAQPage) and `schema/indicators-template.json` (Dataset). Replace each double-braced token with the native binding for that named column. JSON-encode values. Resolve root-relative paths against the actual canonical origin in JSON-LD URL fields. The dataset licence is nested on the government source dataset. Keep the same answer in visible text and structured data. Apply the collection-list and breadcrumbs templates to the matching page types. Repeat the ListItem prototype for each *visible* entry or breadcrumb in order, numbering positions from one. Each template has a filled example. If the CMS already emits the equivalent structured data, configure that output once. If bindings are unavailable, insert per-record JSON-LD from its local preview and replace relative URL values with the hosted URLs.
10. **Review drafts and publish.** Open the Q3 2025 manufacturing year-on-year history and confirm the first, interim and latest figures are 0.0%, 5.0% and 4.6%. Open Q4 2025 overall year-on-year GDP and confirm the return from 6.9% to the original 5.7%. Open Q2 2026 employment and confirm 14,700 is labelled first observed. Check the current table licence and the separate release terms. Verify both collection totals, category links, search for “manufacturing”, mobile layout and a contextual enquiry link. Publish the collections, templates, list/category pages and the five editorial pages together, or publish the linked records before exposing Home if the editor requires multiple actions.
11. **Verify the actual host and enquiry.** Load the public address signed out. Confirm records work at their own URLs, the second result page is reachable, the answer is available in page text, and the source links work. Inspect the returned JSON-LD, robots.txt, sitemap and llms.txt. Enable public crawling for the directory, include collection and trust-page URLs in discovery files, and re-read those files on the final hostname. Record any platform limitation. In the account’s designated test mode or owner-approved test route, send a clearly labelled test enquiry from a record. Trace its reference and record slug through submissions, forwarding and the target CRM. Check that correction enquiries retain their own intent. Keep the receipt private. A form appearance alone is insufficient evidence of delivery.
12. **Run AI Visibility.** Enter the twelve question texts in visibility-prompts.md without their answer keys or numbering. Run the available ChatGPT, Gemini and Google AI Overviews checks. Record engine, time, exact answer, cited URL(s), numerical classification and whether the directory itself was cited. Retain an empty answer, unavailable engine or zero citations as observed. Use a fresh archive check before judging later runs. Record the published URL, import counts, verified form destination and actual tracker results in the operator’s handoff.

The CMS, capture and tracking instructions describe intended outcomes. Exact labels, field types and permission scopes depend on the authenticated workspace. Platform capability descriptions are available in [AI CMS](https://hashmeta.ai/platform/ai-cms), [AI CRM](https://hashmeta.ai/platform/ai-crm) and [AI Visibility](https://hashmeta.ai/platform/ai-visibility).

### Page map

| File under pages/ | Public path | Purpose |
| --- | --- | --- |
| home.md | / | Find an indicator, see recent changes and compare the biggest revisions within each unit |
| how-corrections-work.md | /how-corrections-work/ | Vintage dates, counting method, briefing cutoffs and slide corrections |
| cover-my-briefing.md | /cover-my-briefing/ | Enquiries, corrections, service promise and unvalidated price placeholder |
| sources-and-licences.md | /sources-and-licences/ | Four current tables, release terms, attribution and independence |
| about.md | /about/ | One-person publisher and sample-document policy |

### Collection fields and types

The JSON and CSV exports contain the same records. CSV booleans are lowercase true/false. An empty last-change date means the figure stayed the same throughout the available releases. All statistical numbers use unformatted decimals in the data fields. The display body supplies units.

| Both collections | CMS field type |
| --- | --- |
| slug | Unique slug |
| path | Internal path, text |
| title | Title, single-line text |
| category | Category, single value |
| agency, dataset, licence, revision_unit | Text |
| dataset_url, licence_url | URL |
| accessed, last_checked | ISO date |
| attribution | Long text |
| body_html | Rich text accepting HTML, or native content blocks |
| threshold | Decimal in the original unit |

| Indicators only | CMS field type |
| --- | --- |
| description, frequency_summary, next_release | Long text |
| periods, comparable_periods, single_vintage_periods, revised_periods, ever_revised_periods | Integer counts |
| sign_crossings, threshold_crossings, sign_or_threshold_crossings | Integer first-to-current counts |
| fraction_revised | Decimal fraction (0 to 1) |
| mean_absolute_revision, maximum_absolute_revision | Decimal in revision_unit |
| calendar_entries | Array of original calendar objects, or JSON text. Includes date type, window end or announced time where supplied and evidence URL |
| revision_paths | Array of internal paths, or JSON text |

| Revisions only | CMS field type |
| --- | --- |
| answer, slide_impact | Long text |
| series_id | Relation to Indicators by slug, or text |
| indicator, period, unit, current_date_kind, direction | Text |
| first_value, current_value, net_change, absolute_change | Decimal; net_change is signed |
| first_date, current_date, last_change_date | ISO date; last_change_date nullable |
| first_url, current_url | URL |
| ever_revised, crossed_sign, crossed_threshold, ever_crossed_sign, ever_crossed_threshold | Boolean. The crossed fields compare endpoints. The ever_crossed fields inspect every step |
| vintages | Ordered array or JSON text. Each item contains value, date, date kind, release, URL, row locator, agency, licence, access date, change and crossing flags |

### Form mapping

| Key | Native field | Behaviour |
| --- | --- | --- |
| intent | Required choice | coverage → Cover my briefing; correction → Report a correction. Read the query value or allow selection |
| record | Required text or linked record | Prefill the record slug from the query. On direct visits allow choosing an indicator or entering the relevant record |
| reply | Required email | Label “Reply email”. Used for this enquiry |
| note | Required long text | Label “What should the editor check?” For a correction ask for the official URL and release date |
| consent | Required checkbox | “You may contact me about this enquiry.” |
| source | Hidden text | Store the originating record or page path alongside the submission |
| submit | Button | “Send enquiry” |

Use the fields above for customer enquiries only when the owner connects capture. The standalone preview has no submission endpoint.

## Agent instructions for the authenticated MCP

Give the connected agent the following instructions and the contents of this package through the owner’s workspace.

1. **List the available MCP tools and read the account’s editing and publishing guidelines first.** Inspect advertised schemas, permissions, licence/site identity and current draft state. The reported names `list_site_licenses`, `get_guidelines`, `create_site`, `generate_site` and `get_site_build_status` are unconfirmed hints. Discover capabilities by description and use only tools actually returned for this account.
2. Match the desired site by its actual ID, then reuse or create the intended draft. Inspect collections and keys before writing. If the only available tool is a general site generator, give it the page map, route patterns and collection definitions. Read the resulting collection records back. A generated layout alone does not establish an import.
3. Follow manual steps 2–9 using discovered collection, entry, page, template and form capabilities. Use the JSON files for typed records and upsert by slug. If the tool supports file import instead, use the corresponding CSV. Check a record read-back after the first insert. Preserve its dated history, separate terms, release-window semantics and linked source URLs before continuing the rest of the batch. After an interruption compare existing slugs and contents before resuming.
4. Read back record counts, route bindings, visible answers, calendar records and form mappings. Compare to this edition and report exact failures. For any missing mutation capability, give the operator the specific pending manual step, collection or page, field and local source file. Continue the independent work supported by this account.
5. Follow the account’s publish workflow under the owner’s publishing authority. If the request only authorises staging, return the draft and outstanding publish action. For an authorised publish, wait for the actual build result, verify the public hostname and follow manual steps 11–12. Return public page URLs, status, CRM test reference and observed engine outputs only for completed checks.
