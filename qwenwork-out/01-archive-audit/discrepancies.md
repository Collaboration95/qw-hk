# Discrepancies, Completeness and QC

**PARTIAL AUDIT: independent numeric evidence, not an exhaustive all-vintage audit. Earliest found is NOT verified first publication.**

GDP: 984 VERIFIED rows and 24 gap rows. Labour: 150 VERIFIED rows and 6 gap rows. Gaps are evidence gaps, not proof of nonpublication. GDP archive outcomes: 336 MATCH, 24 URL_ALTERNATIVE_MATCH; labour: 46 MATCH. No material value disagreement confirmed in those checked archive records. Original archive and illustrative statistics remain unchanged and are not full-window statistics.

## Completeness Matrix

Each target series has fifteen quarterly cells. P=confirmed target-quarter advance first; E=dated evidence but original first unconfirmed; S=snapshot only; -=no numeric evidence. Every cell remains nonexhaustive for later restatements.

| Series | 2023-Q1 | 2023-Q2 | 2023-Q3 | 2023-Q4 | 2024-Q1 | 2024-Q2 | 2024-Q3 | 2024-Q4 | 2025-Q1 | 2025-Q2 | 2025-Q3 | 2025-Q4 | 2026-Q1 | 2026-Q2 | 2026-Q3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sg-employment-change | E | E | E | E | E | E | E | E | E | E | E | E | E | E | - |
| sg-gdp-construction-qoq | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-construction-yoy | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-manufacturing-qoq | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-manufacturing-yoy | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-overall-qoq | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-overall-yoy | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-services-qoq | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-gdp-services-yoy | E | E | E | P | P | P | E | P | P | P | P | P | P | P | P |
| sg-unemployment | P | E | P | P | E | P | E | E | E | E | E | P | E | P | P |

## Coverage and Denominators

| Series | Verified / dated / snapshot rows | Confirmed first cells | Dated strict-first n | Dated earliest-verified n | Snapshot expanded earliest n |
|---|---|---|---|---|---|
| sg-employment-change | 68 / 54 / 14 | 0 | 0 | 13 | 14 |
| sg-gdp-construction-qoq | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-construction-yoy | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-manufacturing-qoq | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-manufacturing-yoy | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-overall-qoq | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-overall-yoy | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-services-qoq | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-gdp-services-yoy | 123 / 108 / 15 | 11 | 10 | 14 | 15 |
| sg-unemployment | 82 / 67 / 15 | 7 | 6 | 14 | 15 |

Strict-first labour is deliberately narrower than sibling original-quarter proxy. Survey employment totals are not demonstrated original advance estimates; no strict-first employment frequency is asserted. GDP early original releases are missing; full survey appendices, MOM annexes, monthly/annual restatements and all later vintages are nonexhaustive. API observed_on is audit observation date from inherited environment, not agency release date.

## Explicit Gap Rows

- `GAP-overall-yoy-2023-Q1`: sg-gdp-overall-yoy 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-overall-yoy-2023-Q2`: sg-gdp-overall-yoy 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-overall-yoy-2023-Q3`: sg-gdp-overall-yoy 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-overall-qoq-2023-Q1`: sg-gdp-overall-qoq 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-overall-qoq-2023-Q2`: sg-gdp-overall-qoq 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-overall-qoq-2023-Q3`: sg-gdp-overall-qoq 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-yoy-2023-Q1`: sg-gdp-manufacturing-yoy 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-yoy-2023-Q2`: sg-gdp-manufacturing-yoy 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-yoy-2023-Q3`: sg-gdp-manufacturing-yoy 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-qoq-2023-Q1`: sg-gdp-manufacturing-qoq 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-qoq-2023-Q2`: sg-gdp-manufacturing-qoq 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-manufacturing-qoq-2023-Q3`: sg-gdp-manufacturing-qoq 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-yoy-2023-Q1`: sg-gdp-construction-yoy 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-yoy-2023-Q2`: sg-gdp-construction-yoy 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-yoy-2023-Q3`: sg-gdp-construction-yoy 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-qoq-2023-Q1`: sg-gdp-construction-qoq 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-qoq-2023-Q2`: sg-gdp-construction-qoq 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-construction-qoq-2023-Q3`: sg-gdp-construction-qoq 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-yoy-2023-Q1`: sg-gdp-services-yoy 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-yoy-2023-Q2`: sg-gdp-services-yoy 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-yoy-2023-Q3`: sg-gdp-services-yoy 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-qoq-2023-Q1`: sg-gdp-services-qoq 2023-Q1 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-qoq-2023-Q2`: sg-gdp-services-qoq 2023-Q2 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `GAP-services-qoq-2023-Q3`: sg-gdp-services-qoq 2023-Q3 |  | Original 2023-Q1 through Q3 advances/surveys not independently read in this pass. Later restatements and current API are separate verified rows; this is not proof no official release exists.
- `LAB-243382a44941f5ff`: sg-employment-change 2026-Q3 | JSON result.records; DataSeries = Total Changes In Employment; field 20263Q | Current API snapshot retrieved in this audit; publication_date blank because observation time is not agency publication date. No earlier vintage inferred.
- `LAB-7bcf596c6dc1bd5f`: sg-unemployment 2023-Q2 | Original-quarter dated release not located/verified in audit | Later restatements/current API do not fill original-release gap. Search not exhaustive; absence here does not establish non-publication.
- `LAB-5976f98877332ebb`: sg-employment-change 2023-Q1 | Original-quarter dated release not located/verified in audit | Later restatements/current API do not fill original-release gap. Search not exhaustive; absence here does not establish non-publication.
- `LAB-abed14c79b629275`: sg-employment-change 2023-Q2 | Original-quarter dated release not located/verified in audit | Later restatements/current API do not fill original-release gap. Search not exhaustive; absence here does not establish non-publication.
- `LAB-8bb704f7de48d859`: sg-employment-change 2023-Q3 | Original-quarter dated release not located/verified in audit | Later restatements/current API do not fill original-release gap. Search not exhaustive; absence here does not establish non-publication.
- `LAB-948663bdf025b4cc`: sg-employment-change 2026-Q3 | Original-quarter dated release not located/verified in audit | Later restatements/current API do not fill original-release gap. Search not exhaustive; absence here does not establish non-publication.

## Final QC Evidence

Combined stratified independent samples: GDP 20 from its VERIFIED population (including API), labour 5 from VERIFIED dated SingStat survey PDFs only. Both seeds 20261119, independent Random.sample calls without replacement in sibling CSV order. NOT a simple random sample of the full combined table; labour API/HTML not in its sample frame. Final IDs and seed replay exactly match saved results. GDP initial section-classification collision was fixed before final regeneration/resampling, as recorded in assumptions. Final assembly validates inherited reopening results without claiming a new network reopening.

| Stratum | Row ID | Stored | Reopened | Result | URL / Locator | SHA256 if supplied |
|---|---|---|---|---|---|---|
| GDP | `GDP-e49eb448210b8913` | 0.0 | 0.0 | MATCH | https://www.singstat.gov.sg/files/a6945587-6c12-413c-aade-f4f0264fa560.pdf ; PDF page 7; Annex B, Real Sectoral Growth Rates; qoq seasonally adjusted, nonannualized; row Manufacturing; column 4Q24 | 3d4dce3d912331e93d598ec580d31ff0dff71501f83b65c7f38dee8318b20ab2 |
| GDP | `GDP-717aa5c1c34049ec` | 3.7 | 3.7 | MATCH | https://www.singstat.gov.sg/files/9c77a41c-c004-484a-9996-6d9859f700f7.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Construction; column 3Q23 | 721b4717cbdd09661819425c447c4d8e97a0281ef8b3ab05806e65587b5ce5f6 |
| GDP | `GDP-e6c853f7c1e7f740` | 4.5 | 4.5 | MATCH | https://www.singstat.gov.sg/files/e98950d1-fd6d-4fa8-873e-c7257404d038.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Services Producing Industries; column 2Q25 | 66bbe89ebbbb3fd2baef0ac7fb93c98671d1a0d7d6c7c17d3c7558ce0d7e427d |
| GDP | `GDP-ba313cb4bf35aeca` | -1.7 | -1.7 | MATCH | https://www.singstat.gov.sg/files/51524a2e-550d-4680-9ccc-9b6377b82f08.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Manufacturing; column 1Q24 | 128ad21034e294b8ec783227155cbe8a89fbfea8446bc73f8e596147c7cace0e |
| GDP | `GDP-8e772dcf4cb82a3a` | -5.1 | -5.1 | MATCH | https://www.singstat.gov.sg/files/e98950d1-fd6d-4fa8-873e-c7257404d038.pdf ; PDF page 2; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Manufacturing; column 1Q25 | 66bbe89ebbbb3fd2baef0ac7fb93c98671d1a0d7d6c7c17d3c7558ce0d7e427d |
| GDP | `GDP-7600840cd7b0d9b3` | 5.0 | 5.0 | MATCH | https://www.singstat.gov.sg/files/a6945587-6c12-413c-aade-f4f0264fa560.pdf ; PDF page 7; Annex B, Real Sectoral Growth Rates; yoy; row Total; column 4Q24 | 3d4dce3d912331e93d598ec580d31ff0dff71501f83b65c7f38dee8318b20ab2 |
| GDP | `GDP-45716cf79bdd74e8` | 2.2 | 2.2 | MATCH | https://www.singstat.gov.sg/files/a2d9a1f4-13e6-43ce-a786-296d9e35b63a.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Overall GDP; column 4Q23 | 2926f40584dc73c1d4b501cf3994fb3f0b20147bcfd8a4bf3bdc2a5a14477dce |
| GDP | `GDP-35bc4b325260af14` | -0.5 | -0.5 | MATCH | https://www.singstat.gov.sg/files/27e63127-7733-4691-8ac3-7bc13cd27c16.pdf ; PDF page 2; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Overall GDP; column 1Q25 | fd3673bcae7a21fed28e3f3164f570b5168ca1e43040573901bfea1d3de34682 |
| GDP | `GDP-54df245416c0e7b8` | 3.5 | 3.5 | MATCH | https://data.gov.sg/api/action/datastore_search?resource_id=d_17702de81b268ab5d6100a1aab3805bf&limit=100 ; result.records _id=4; DataSeries='        Construction'; field=20231Q | aaf61c6b5bba118a3d21479408fc7298c69e948f1b9064bc82b4091b0defefd3 |
| GDP | `GDP-162c013c5a1211c3` | 6.2 | 6.2 | MATCH | https://data.gov.sg/api/action/datastore_search?resource_id=d_1506368f0e7928ac18e42f84d1c450a3&limit=100 ; result.records _id=1; DataSeries='GDP In Chained (2015) Dollars'; field=20262Q | a2bba570ef0accdbfbdcb1bf2f754cf80c2c5163642209a45bbe08e8f3a4b92b |
| GDP | `GDP-fdc08221bcd423f9` | 3.0 | 3.0 | MATCH | https://www.singstat.gov.sg/files/cc0d17f8-3325-4a3b-8e7d-54f3131c73fe.pdf ; PDF page 2; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Overall GDP; column 3Q24 | fec4cb6e962bdbaaf499d7502a374770b6a581fd8572b5795bc7461c2f693115 |
| GDP | `GDP-989671e30d134a0a` | 0.6 | 0.6 | MATCH | https://www.singstat.gov.sg/files/678ec3aa-30e5-4a67-8de3-1349182b4d15.pdf ; PDF page 2; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Overall GDP; column 1Q25 | 7bf9eb386c9b7cc8866bc6d192600a8700c1ee2d5c7ce8a68a11e9b9bda1d156 |
| GDP | `GDP-f3714ce15dead49a` | 1.7 | 1.7 | MATCH | https://www.singstat.gov.sg/files/b4783339-3cf7-43f8-ad8a-5ac4d402ad69.pdf ; PDF page 2; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Overall GDP; column 4Q23* | b8e6f172d3bd0d7c366ae206d039ad1b152c5b93925da97a67fa60520d8709a9 |
| GDP | `GDP-f01cec300539e145` | 11.2 | 11.2 | MATCH | https://www.singstat.gov.sg/files/e98950d1-fd6d-4fa8-873e-c7257404d038.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Manufacturing; column 3Q24 | 66bbe89ebbbb3fd2baef0ac7fb93c98671d1a0d7d6c7c17d3c7558ce0d7e427d |
| GDP | `GDP-2e2a335e5cd2ba19` | 5.8 | 5.8 | MATCH | https://www.singstat.gov.sg/files/09253980-e221-4b10-80f6-440e51c62060.pdf ; PDF page 8; Annex B, Real Sectoral Growth Rates; yoy; row Construction; column 2Q26 | a02603f6155ab3094f0c625199391f9c6f847ea16824c6774a8aa59a13d28cfb |
| GDP | `GDP-e5024ab63375e044` | 5.6 | 5.6 | MATCH | https://www.singstat.gov.sg/files/b310c1e5-f7cb-43b6-8125-fe67dfc0ac05.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Construction; column 3Q25 | 0a128843ae2860c9e9f399f7b4d8a7172d0d0310bb31902108cdad038c50c735 |
| GDP | `GDP-6c4f6e043fdddd25` | 11.4 | 11.4 | MATCH | https://data.gov.sg/api/action/datastore_search?resource_id=d_1506368f0e7928ac18e42f84d1c450a3&limit=100 ; result.records _id=3; DataSeries='        Manufacturing'; field=20254Q | a2bba570ef0accdbfbdcb1bf2f754cf80c2c5163642209a45bbe08e8f3a4b92b |
| GDP | `GDP-87c66cea88bcdbb2` | 4.1 | 4.1 | MATCH | https://www.singstat.gov.sg/files/c7873595-5970-4225-9219-d7fff255735d.pdf ; PDF page 1; Gross Domestic Product in Chained (2015) Dollars; yoy; row Services Producing Industries; column 2Q24 | 16b2e9c587dc86ce7127f80b809677c16b6cf092d1c33421a3694c48616bcaf9 |
| GDP | `GDP-cbf63191de326695` | 3.9 | 3.9 | MATCH | https://www.singstat.gov.sg/files/e59f8f48-dca7-4666-ae74-b322882624ac.pdf ; PDF page 9; Annex B, Real Sectoral Growth Rates; yoy; row Total; column 1Q25 | 059620d09a453409fda91eacbeb077436fb947df2cd031314405c3e8e6a16944 |
| GDP | `GDP-fa57c8472ac783fe` | 0.8 | 0.8 | MATCH | https://www.singstat.gov.sg/files/6b14984e-db41-4842-9d12-0622e18e27a8.pdf ; PDF page 5; Gross Domestic Product in Chained (2015) Dollars; qoq seasonally adjusted, nonannualized; row Services Producing Industries; column 3Q23 | def7344f320827dff1c2191e95caf5b3e3bea502dd3067b383a8acbd07a79c66 |
| Labour survey PDF | `LAB-c78985cb0b8c7316` | 15000.0 | 15000.0 | MATCH | https://www.singstat.gov.sg/files/506dc6f4-937b-4aaf-a30f-58f8ba377b13.pdf ; PDF page 8; OTHER ECONOMIC INDICATORS; row Changes in Employment (’000); column 2Q24 | not recorded by sibling |
| Labour survey PDF | `LAB-7205ad418254a937` | 26800.0 | 26800.0 | MATCH | https://www.singstat.gov.sg/files/6b14984e-db41-4842-9d12-0622e18e27a8.pdf ; PDF page 6; OTHER ECONOMIC INDICATORS; row Changes in Employment (’000); column 2Q23 | not recorded by sibling |
| Labour survey PDF | `LAB-dc7dadcfc26c7f77` | 14900.0 | 14900.0 | MATCH | https://www.singstat.gov.sg/files/a6945587-6c12-413c-aade-f4f0264fa560.pdf ; PDF page 8; OTHER ECONOMIC INDICATORS; row Changes in Employment (’000); column 2Q24 | not recorded by sibling |
| Labour survey PDF | `LAB-b3a468d464824659` | 2.0 | 2.0 | MATCH | https://www.singstat.gov.sg/files/6b14984e-db41-4842-9d12-0622e18e27a8.pdf ; PDF page 6; OTHER ECONOMIC INDICATORS; row Overall Unemployment Rate, SA (%); column 3Q23 | not recorded by sibling |
| Labour survey PDF | `LAB-bb7a831fccd1a522` | 24900.0 | 24900.0 | MATCH | https://www.singstat.gov.sg/files/a6945587-6c12-413c-aade-f4f0264fa560.pdf ; PDF page 8; OTHER ECONOMIC INDICATORS; row Changes in Employment (’000); column 3Q24 | not recorded by sibling |

## Assumptions and Sibling Findings (Preserved)

The following inherited statements are historical working-file context. Any broad original-first inference or statement that expanded statistics cannot be asserted is superseded by the explicitly labelled conditional comparisons and stricter evidence rules above; exhaustive estimates remain unavailable.


### gdp-assumptions.md

# GDP Assumptions and Limits

- Scope: eight percent-growth series, 2023-Q1 through 2026-Q3 inclusive; qoq is seasonally adjusted, nonannualized. Annual columns omitted, not mistaken for quarterly cells.
- Stable archive identifiers are filename plus zero-based JSON Pointer; original archive unchanged. Independent row IDs are deterministic hashes.
- VERIFIED means numeric primary-source cell independently read from retrieved PDF or API, never copied from archive. Repeated dated publications retained.
- API snapshot observed 2026-11-19, original publication date unknown and left blank. Metadata endpoints returned HTTP 403.
- Allowed primary domains include subdomains of singstat.gov.sg, mti.gov.sg, meti.gov.sg, data.gov.sg. Isomer by.gov.sg linked PDF assets are explicitly EXCLUDED, not opened for numeric evidence.
- Coverage incomplete: original 2023-Q1/Q2/Q3 releases not read; full survey statistical appendices on excluded asset hosts not read; other restatement publications may exist. Current API covers all 120 series-period cells, not every vintage. No claim every release checked.
- Search used built-in web search for 2023/2024 MTI and SingStat GDP, 2025/2026 SingStat. 2025 search failed HTTP 424. No search snippets promoted to verified numeric rows.
- Local PDF dependency missing initially; installed pypdf/pdfplumber once, analysis then succeeded. Extraction warned about rotated text; only aligned target tables parsed, unmatched rows not promoted.
- apply_patch unavailable in shell; dedicated Write tool used for scratch working scripts. No existing project file edited.

- Initial QC detected section-classification collisions for advance tables. Fixed classification across all rows (first Overall GDP/Total table is yoy; second is qoq), regenerated all output, then reran seeded sample from corrected VERIFIED population. Final QC 20/20 reopened matches. Final random sample differs from the initial flawed population; no failed row was silently retained.


### labour-assumptions.md

# Assumptions and limitations

- Scope: 2023-Q1 through 2026-Q3, two series, 30 target series-period cells.
- VERIFIED requires independent opened primary numeric cell or precise HTML paragraph. Original JSON values were never promoted by assertion.
- CSV schema and uppercase VERIFIED/NOT_FOUND match GDP sibling. Blank values/dates/URLs represent missing evidence, never zero.
- Unemployment is overall, seasonally adjusted, quarter-end; annual means and non-quarter months excluded.
- Employment survey total changes and API Total Changes In Employment retained in persons; survey thousands multiplied by 1000. MOM excluding-MDW headlines never substituted.
- PDF pages count from 1 using form-feed page boundaries. Locator specifies exact table row and column. HTML sources use numbered body paragraphs; no invented PDF page for HTML.
- API publication_date blank: retrieval is not a historical release date. Audit initiated in environment dated 2026-11-19; archive observation date not independently established as an agency release.
- Original-quarter coverage proxy checks dated releases in the immediately following quarter; gap status is audit not-found, not proof no publication exists.
- QC randomly samples five verified survey PDF rows, with fresh network fetch; it does not randomly sample the API/HTML strata.
- Incomplete audit: original 2023 Q1-Q3 GDP sources were not researched; later available survey labour comparators used instead. Full MOM annexes, monthly unemployment restatements and every later annual appendix not exhausted.


### gdp-discrepancies.md

# GDP Archive Audit

INCOMPLETE release-universe audit; never treat archive cells as verified.

{'MATCH': 336, 'URL_ALTERNATIVE_MATCH': 24}

Material value mismatches appear below. Dates compared to independently read dated PDF; URL alternatives explicitly separated. Missing page locators in original archive are upgraded in independent CSV. Revision statistics are archive-only, not validated for the requested expanded universe.

| Archive ID | Series | Period | Archive date | Archive value | Independent value | Result | Evidence row |
|---|---|---|---|---|---|---|---|
| `sg-gdp-construction-qoq.json#/observations/0/vintages/0` | sg-gdp-construction-qoq | 2025-Q1 | 2025-04-14 | -2.3 | -2.3 | MATCH | GDP-aa80bec4ccda5650 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/1` | sg-gdp-construction-qoq | 2025-Q1 | 2025-05-22 | -1.4 | -1.4 | MATCH | GDP-75aa7c0900f821b4 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/2` | sg-gdp-construction-qoq | 2025-Q1 | 2025-07-14 | -1.8 | -1.8 | MATCH | GDP-9772bcdd8a93d4d3 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/3` | sg-gdp-construction-qoq | 2025-Q1 | 2025-08-12 | -2.0 | -2.0 | MATCH | GDP-e19953a7dcf84a9f |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/4` | sg-gdp-construction-qoq | 2025-Q1 | 2025-10-14 | -2.5 | -2.5 | URL_ALTERNATIVE_MATCH | GDP-fdfef4656b1e2924 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/5` | sg-gdp-construction-qoq | 2025-Q1 | 2025-11-21 | -2.5 | -2.5 | MATCH | GDP-e1e9611cd421eaef |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/6` | sg-gdp-construction-qoq | 2025-Q1 | 2026-01-02 | -2.5 | -2.5 | MATCH | GDP-7b51e83578f291f4 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/7` | sg-gdp-construction-qoq | 2025-Q1 | 2026-02-10 | -0.8 | -0.8 | MATCH | GDP-dd8eefd341e7ff74 |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/8` | sg-gdp-construction-qoq | 2025-Q1 | 2026-04-14 | -0.8 | -0.8 | MATCH | GDP-032ae13382192aca |
| `sg-gdp-construction-qoq.json#/observations/0/vintages/9` | sg-gdp-construction-qoq | 2025-Q1 | 2026-05-25 | -0.8 | -0.8 | MATCH | GDP-d4737e831dabfb89 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/0` | sg-gdp-construction-qoq | 2025-Q2 | 2025-07-14 | 4.4 | 4.4 | MATCH | GDP-703963633a5bbdb8 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/1` | sg-gdp-construction-qoq | 2025-Q2 | 2025-08-12 | 5.7 | 5.7 | MATCH | GDP-9afb8c9b6c218d77 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/2` | sg-gdp-construction-qoq | 2025-Q2 | 2025-10-14 | 6.5 | 6.5 | URL_ALTERNATIVE_MATCH | GDP-d85f5862a286a05b |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/3` | sg-gdp-construction-qoq | 2025-Q2 | 2025-11-21 | 6.5 | 6.5 | MATCH | GDP-608456b7e8d55033 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/4` | sg-gdp-construction-qoq | 2025-Q2 | 2026-01-02 | 6.5 | 6.5 | MATCH | GDP-e2c3c35f8fef850c |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/5` | sg-gdp-construction-qoq | 2025-Q2 | 2026-02-10 | 4.8 | 4.8 | MATCH | GDP-406db10dd010b313 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/6` | sg-gdp-construction-qoq | 2025-Q2 | 2026-04-14 | 4.8 | 4.8 | MATCH | GDP-f9cac8e6aacb1104 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/7` | sg-gdp-construction-qoq | 2025-Q2 | 2026-05-25 | 4.8 | 4.8 | MATCH | GDP-93cbaf97de370127 |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/8` | sg-gdp-construction-qoq | 2025-Q2 | 2026-07-14 | 4.8 | 4.8 | MATCH | GDP-34e3ea9ad5faad2b |
| `sg-gdp-construction-qoq.json#/observations/1/vintages/9` | sg-gdp-construction-qoq | 2025-Q2 | 2026-08-11 | 4.8 | 4.8 | MATCH | GDP-ca8237d73ce936ad |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/0` | sg-gdp-construction-qoq | 2025-Q3 | 2025-10-14 | -1.2 | -1.2 | URL_ALTERNATIVE_MATCH | GDP-fb33565247472826 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/1` | sg-gdp-construction-qoq | 2025-Q3 | 2025-11-21 | -0.7 | -0.7 | MATCH | GDP-c87babc6b638ac1f |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/2` | sg-gdp-construction-qoq | 2025-Q3 | 2026-01-02 | 0.7 | 0.7 | MATCH | GDP-09c292f7369ad373 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/3` | sg-gdp-construction-qoq | 2025-Q3 | 2026-02-10 | 0.6 | 0.6 | MATCH | GDP-ee7ada739794b272 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/4` | sg-gdp-construction-qoq | 2025-Q3 | 2026-04-14 | 0.6 | 0.6 | MATCH | GDP-98a13a8c9c48aa77 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/5` | sg-gdp-construction-qoq | 2025-Q3 | 2026-05-25 | 0.6 | 0.6 | MATCH | GDP-2f4b9c4eacfe55d0 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/6` | sg-gdp-construction-qoq | 2025-Q3 | 2026-07-14 | 0.6 | 0.6 | MATCH | GDP-9979b32624b07bb2 |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/7` | sg-gdp-construction-qoq | 2025-Q3 | 2026-08-11 | 0.6 | 0.6 | MATCH | GDP-aac6d59d7342b5dc |
| `sg-gdp-construction-qoq.json#/observations/2/vintages/8` | sg-gdp-construction-qoq | 2025-Q3 | 2026-10-14 | 0.6 | 0.6 | MATCH | GDP-968585b76469ac26 |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/0` | sg-gdp-construction-qoq | 2025-Q4 | 2026-01-02 | -0.4 | -0.4 | MATCH | GDP-827e0d30eb7f7c94 |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/1` | sg-gdp-construction-qoq | 2025-Q4 | 2026-02-10 | 0.2 | 0.2 | MATCH | GDP-2ff81d3cc818683e |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/2` | sg-gdp-construction-qoq | 2025-Q4 | 2026-04-14 | 0.2 | 0.2 | MATCH | GDP-88e7991fb61cfdba |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/3` | sg-gdp-construction-qoq | 2025-Q4 | 2026-05-25 | 0.2 | 0.2 | MATCH | GDP-3b6453b21eefbcf8 |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/4` | sg-gdp-construction-qoq | 2025-Q4 | 2026-07-14 | 0.2 | 0.2 | MATCH | GDP-2330a4b270b0ecd0 |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/5` | sg-gdp-construction-qoq | 2025-Q4 | 2026-08-11 | 0.2 | 0.2 | MATCH | GDP-027da796ec92fba8 |
| `sg-gdp-construction-qoq.json#/observations/3/vintages/6` | sg-gdp-construction-qoq | 2025-Q4 | 2026-10-14 | 0.2 | 0.2 | MATCH | GDP-1325bf0615e3481e |
| `sg-gdp-construction-qoq.json#/observations/4/vintages/0` | sg-gdp-construction-qoq | 2026-Q1 | 2026-04-14 | 3.7 | 3.7 | MATCH | GDP-4847b14a5ff09762 |
| `sg-gdp-construction-qoq.json#/observations/4/vintages/1` | sg-gdp-construction-qoq | 2026-Q1 | 2026-05-25 | 6.3 | 6.3 | MATCH | GDP-15a1e73210ea79d2 |
| `sg-gdp-construction-qoq.json#/observations/4/vintages/2` | sg-gdp-construction-qoq | 2026-Q1 | 2026-07-14 | 7.4 | 7.4 | MATCH | GDP-0806ee15ecc8de94 |
| `sg-gdp-construction-qoq.json#/observations/4/vintages/3` | sg-gdp-construction-qoq | 2026-Q1 | 2026-08-11 | 7.4 | 7.4 | MATCH | GDP-5a9ccb111a8c37c6 |
| `sg-gdp-construction-qoq.json#/observations/4/vintages/4` | sg-gdp-construction-qoq | 2026-Q1 | 2026-10-14 | 8.0 | 8.0 | MATCH | GDP-d6feca96375e3194 |
| `sg-gdp-construction-qoq.json#/observations/5/vintages/0` | sg-gdp-construction-qoq | 2026-Q2 | 2026-07-14 | -2.1 | -2.1 | MATCH | GDP-42194ba76818a08c |
| `sg-gdp-construction-qoq.json#/observations/5/vintages/1` | sg-gdp-construction-qoq | 2026-Q2 | 2026-08-11 | -2.5 | -2.5 | MATCH | GDP-9d8b86034399eeb1 |
| `sg-gdp-construction-qoq.json#/observations/5/vintages/2` | sg-gdp-construction-qoq | 2026-Q2 | 2026-10-14 | -2.7 | -2.7 | MATCH | GDP-b567d2df8c505069 |
| `sg-gdp-construction-qoq.json#/observations/6/vintages/0` | sg-gdp-construction-qoq | 2026-Q3 | 2026-10-14 | 3.4 | 3.4 | MATCH | GDP-b8f6cbb6c3e80e45 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/0` | sg-gdp-construction-yoy | 2025-Q1 | 2025-04-14 | 4.6 | 4.6 | MATCH | GDP-011958d999f99592 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/1` | sg-gdp-construction-yoy | 2025-Q1 | 2025-05-22 | 5.5 | 5.5 | MATCH | GDP-6d6fd2ffd8c174ba |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/2` | sg-gdp-construction-yoy | 2025-Q1 | 2025-07-14 | 5.1 | 5.1 | MATCH | GDP-2d35d721a2fefc03 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/3` | sg-gdp-construction-yoy | 2025-Q1 | 2025-08-12 | 4.9 | 4.9 | MATCH | GDP-3004239903d8ab71 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/4` | sg-gdp-construction-yoy | 2025-Q1 | 2025-10-14 | 4.3 | 4.3 | URL_ALTERNATIVE_MATCH | GDP-d0535b0b48171c50 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/5` | sg-gdp-construction-yoy | 2025-Q1 | 2025-11-21 | 4.3 | 4.3 | MATCH | GDP-3b8e601c9969b4ea |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/6` | sg-gdp-construction-yoy | 2025-Q1 | 2026-01-02 | 4.3 | 4.3 | MATCH | GDP-4fd5094d04e78358 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/7` | sg-gdp-construction-yoy | 2025-Q1 | 2026-02-10 | 4.2 | 4.2 | MATCH | GDP-ef9dc362cc822166 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/8` | sg-gdp-construction-yoy | 2025-Q1 | 2026-04-14 | 4.2 | 4.2 | MATCH | GDP-4d25184796a71193 |
| `sg-gdp-construction-yoy.json#/observations/0/vintages/9` | sg-gdp-construction-yoy | 2025-Q1 | 2026-05-25 | 4.2 | 4.2 | MATCH | GDP-cc482ff55673782a |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/0` | sg-gdp-construction-yoy | 2025-Q2 | 2025-07-14 | 4.9 | 4.9 | MATCH | GDP-f8de3261e7a7501a |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/1` | sg-gdp-construction-yoy | 2025-Q2 | 2025-08-12 | 6.0 | 6.0 | MATCH | GDP-bcaa1fbcfeaf4505 |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/2` | sg-gdp-construction-yoy | 2025-Q2 | 2025-10-14 | 6.2 | 6.2 | URL_ALTERNATIVE_MATCH | GDP-29c9d55e30b206de |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/3` | sg-gdp-construction-yoy | 2025-Q2 | 2025-11-21 | 6.2 | 6.2 | MATCH | GDP-ccef1338fab6b66b |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/4` | sg-gdp-construction-yoy | 2025-Q2 | 2026-01-02 | 6.2 | 6.2 | MATCH | GDP-f75dd1a99a4b3221 |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/5` | sg-gdp-construction-yoy | 2025-Q2 | 2026-02-10 | 6.6 | 6.6 | MATCH | GDP-cfd9781185a6725c |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/6` | sg-gdp-construction-yoy | 2025-Q2 | 2026-04-14 | 6.6 | 6.6 | MATCH | GDP-27ab394492aef376 |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/7` | sg-gdp-construction-yoy | 2025-Q2 | 2026-05-25 | 6.6 | 6.6 | MATCH | GDP-28d06996e51839fb |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/8` | sg-gdp-construction-yoy | 2025-Q2 | 2026-07-14 | 6.6 | 6.6 | MATCH | GDP-c6ba00fd5c092ef4 |
| `sg-gdp-construction-yoy.json#/observations/1/vintages/9` | sg-gdp-construction-yoy | 2025-Q2 | 2026-08-11 | 6.6 | 6.6 | MATCH | GDP-eeaa64608fd94e39 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/0` | sg-gdp-construction-yoy | 2025-Q3 | 2025-10-14 | 3.1 | 3.1 | URL_ALTERNATIVE_MATCH | GDP-a8c172591acdc781 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/1` | sg-gdp-construction-yoy | 2025-Q3 | 2025-11-21 | 3.6 | 3.6 | MATCH | GDP-5aefa0d3f86f305b |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/2` | sg-gdp-construction-yoy | 2025-Q3 | 2026-01-02 | 5.1 | 5.1 | MATCH | GDP-c6b9fb14dfe14112 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/3` | sg-gdp-construction-yoy | 2025-Q3 | 2026-02-10 | 5.6 | 5.6 | MATCH | GDP-01e40e88b3225de9 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/4` | sg-gdp-construction-yoy | 2025-Q3 | 2026-04-14 | 5.6 | 5.6 | MATCH | GDP-dab68788977d3593 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/5` | sg-gdp-construction-yoy | 2025-Q3 | 2026-05-25 | 5.6 | 5.6 | MATCH | GDP-8477dc62afac8751 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/6` | sg-gdp-construction-yoy | 2025-Q3 | 2026-07-14 | 5.6 | 5.6 | MATCH | GDP-e480d338052b3995 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/7` | sg-gdp-construction-yoy | 2025-Q3 | 2026-08-11 | 5.6 | 5.6 | MATCH | GDP-6fe50def9e6b69e5 |
| `sg-gdp-construction-yoy.json#/observations/2/vintages/8` | sg-gdp-construction-yoy | 2025-Q3 | 2026-10-14 | 5.6 | 5.6 | MATCH | GDP-e5024ab63375e044 |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/0` | sg-gdp-construction-yoy | 2025-Q4 | 2026-01-02 | 4.2 | 4.2 | MATCH | GDP-37bf497fe0abe59b |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/1` | sg-gdp-construction-yoy | 2025-Q4 | 2026-02-10 | 4.6 | 4.6 | MATCH | GDP-6745c76cf2e8de76 |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/2` | sg-gdp-construction-yoy | 2025-Q4 | 2026-04-14 | 4.6 | 4.6 | MATCH | GDP-37f7dc8634939155 |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/3` | sg-gdp-construction-yoy | 2025-Q4 | 2026-05-25 | 4.6 | 4.6 | MATCH | GDP-df27a9d77672def3 |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/4` | sg-gdp-construction-yoy | 2025-Q4 | 2026-07-14 | 4.6 | 4.6 | MATCH | GDP-656d28223df15eee |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/5` | sg-gdp-construction-yoy | 2025-Q4 | 2026-08-11 | 4.6 | 4.6 | MATCH | GDP-51acd733bc14e062 |
| `sg-gdp-construction-yoy.json#/observations/3/vintages/6` | sg-gdp-construction-yoy | 2025-Q4 | 2026-10-14 | 4.6 | 4.6 | MATCH | GDP-b07a8a909ff118e6 |
| `sg-gdp-construction-yoy.json#/observations/4/vintages/0` | sg-gdp-construction-yoy | 2026-Q1 | 2026-04-14 | 9.0 | 9.0 | MATCH | GDP-9bcf09ae3980df3a |
| `sg-gdp-construction-yoy.json#/observations/4/vintages/1` | sg-gdp-construction-yoy | 2026-Q1 | 2026-05-25 | 11.8 | 11.8 | MATCH | GDP-17572b4a40e3ac82 |
| `sg-gdp-construction-yoy.json#/observations/4/vintages/2` | sg-gdp-construction-yoy | 2026-Q1 | 2026-07-14 | 12.9 | 12.9 | MATCH | GDP-e092eb8d6d500753 |
| `sg-gdp-construction-yoy.json#/observations/4/vintages/3` | sg-gdp-construction-yoy | 2026-Q1 | 2026-08-11 | 12.9 | 12.9 | MATCH | GDP-6e9e0ff4aad0aaf5 |
| `sg-gdp-construction-yoy.json#/observations/4/vintages/4` | sg-gdp-construction-yoy | 2026-Q1 | 2026-10-14 | 13.5 | 13.5 | MATCH | GDP-fa512e1d271cbb1a |
| `sg-gdp-construction-yoy.json#/observations/5/vintages/0` | sg-gdp-construction-yoy | 2026-Q2 | 2026-07-14 | 6.2 | 6.2 | MATCH | GDP-85b7e496bc0288f0 |
| `sg-gdp-construction-yoy.json#/observations/5/vintages/1` | sg-gdp-construction-yoy | 2026-Q2 | 2026-08-11 | 5.8 | 5.8 | MATCH | GDP-2e2a335e5cd2ba19 |
| `sg-gdp-construction-yoy.json#/observations/5/vintages/2` | sg-gdp-construction-yoy | 2026-Q2 | 2026-10-14 | 6.1 | 6.1 | MATCH | GDP-d30217cd6daab622 |
| `sg-gdp-construction-yoy.json#/observations/6/vintages/0` | sg-gdp-construction-yoy | 2026-Q3 | 2026-10-14 | 8.8 | 8.8 | MATCH | GDP-1cb403eb02f6499d |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/0` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-04-14 | -4.9 | -4.9 | MATCH | GDP-099abba907bde23a |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/1` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-05-22 | -5.8 | -5.8 | MATCH | GDP-441ed39ee508c525 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/2` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-07-14 | -5.5 | -5.5 | MATCH | GDP-60596f048dc81c02 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/3` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-08-12 | -5.2 | -5.2 | MATCH | GDP-2b618987198af319 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/4` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-10-14 | -5.1 | -5.1 | URL_ALTERNATIVE_MATCH | GDP-8e772dcf4cb82a3a |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/5` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2025-11-21 | -5.1 | -5.1 | MATCH | GDP-cc0383f4a8d7b148 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/6` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2026-01-02 | -5.2 | -5.2 | MATCH | GDP-e1747206b27cba11 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/7` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2026-02-10 | -1.0 | -1.0 | MATCH | GDP-39666ea4420fa445 |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/8` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2026-04-14 | 0.6 | 0.6 | MATCH | GDP-f3efdd8aa9ab394a |
| `sg-gdp-manufacturing-qoq.json#/observations/0/vintages/9` | sg-gdp-manufacturing-qoq | 2025-Q1 | 2026-05-25 | 0.6 | 0.6 | MATCH | GDP-f0fa1c2982071f50 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/0` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2025-07-14 | 0.1 | 0.1 | MATCH | GDP-1d478870e23bedf1 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/1` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2025-08-12 | -0.4 | -0.4 | MATCH | GDP-19c961139060b139 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/2` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2025-10-14 | -0.7 | -0.7 | URL_ALTERNATIVE_MATCH | GDP-f85e0430f7acf80d |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/3` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2025-11-21 | -0.6 | -0.6 | MATCH | GDP-2d46083db8dcc4b2 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/4` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-01-02 | -0.4 | -0.4 | MATCH | GDP-0c1e40b202dc3d63 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/5` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-02-10 | 0.8 | 0.8 | MATCH | GDP-2fa38a8d0fb19d7e |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/6` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-04-14 | 1.2 | 1.2 | MATCH | GDP-6efb5e6f595547f2 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/7` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-05-25 | 1.2 | 1.2 | MATCH | GDP-bad0d78017648cd8 |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/8` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-07-14 | 1.2 | 1.2 | MATCH | GDP-532c81eded271e0c |
| `sg-gdp-manufacturing-qoq.json#/observations/1/vintages/9` | sg-gdp-manufacturing-qoq | 2025-Q2 | 2026-08-11 | 1.2 | 1.2 | MATCH | GDP-34598e2d05c96b52 |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/0` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2025-10-14 | 6.1 | 6.1 | URL_ALTERNATIVE_MATCH | GDP-539fb663df406fba |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/1` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2025-11-21 | 11.3 | 11.3 | MATCH | GDP-f2cc3413cd80d08f |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/2` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-01-02 | 11.1 | 11.1 | MATCH | GDP-42f722ee68c7fd91 |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/3` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-02-10 | 9.3 | 9.3 | MATCH | GDP-e6647314c8af64e3 |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/4` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-04-14 | 4.5 | 4.5 | MATCH | GDP-d0ff3f59b7f2321e |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/5` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-05-25 | 4.5 | 4.5 | MATCH | GDP-cd9fd0ebc91bb093 |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/6` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-07-14 | 4.5 | 4.5 | MATCH | GDP-ec7419531eae9b5c |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/7` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-08-11 | 4.5 | 4.5 | MATCH | GDP-3232c21212c0b2cb |
| `sg-gdp-manufacturing-qoq.json#/observations/2/vintages/8` | sg-gdp-manufacturing-qoq | 2025-Q3 | 2026-10-14 | 4.5 | 4.5 | MATCH | GDP-00415a180c0231e6 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/0` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-01-02 | 9.2 | 9.2 | MATCH | GDP-7cfbc674682efba5 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/1` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-02-10 | 8.4 | 8.4 | MATCH | GDP-1b9614028293ffe1 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/2` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-04-14 | 4.5 | 4.5 | MATCH | GDP-777127c9b6f76db3 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/3` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-05-25 | 4.5 | 4.5 | MATCH | GDP-b3b93e007f8b20c1 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/4` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-07-14 | 4.5 | 4.5 | MATCH | GDP-67cb000fad2dfcb5 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/5` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-08-11 | 4.5 | 4.5 | MATCH | GDP-2b05ee2b17aaad03 |
| `sg-gdp-manufacturing-qoq.json#/observations/3/vintages/6` | sg-gdp-manufacturing-qoq | 2025-Q4 | 2026-10-14 | 4.5 | 4.5 | MATCH | GDP-8d2338970ea0c128 |
| `sg-gdp-manufacturing-qoq.json#/observations/4/vintages/0` | sg-gdp-manufacturing-qoq | 2026-Q1 | 2026-04-14 | -4.9 | -4.9 | MATCH | GDP-82f6d2d5f13d7d8d |
| `sg-gdp-manufacturing-qoq.json#/observations/4/vintages/1` | sg-gdp-manufacturing-qoq | 2026-Q1 | 2026-05-25 | -2.3 | -2.3 | MATCH | GDP-473585a87a5470a9 |
| `sg-gdp-manufacturing-qoq.json#/observations/4/vintages/2` | sg-gdp-manufacturing-qoq | 2026-Q1 | 2026-07-14 | -2.2 | -2.2 | MATCH | GDP-de77a4543651e427 |
| `sg-gdp-manufacturing-qoq.json#/observations/4/vintages/3` | sg-gdp-manufacturing-qoq | 2026-Q1 | 2026-08-11 | -2.8 | -2.8 | MATCH | GDP-bd2e850aa9f91161 |
| `sg-gdp-manufacturing-qoq.json#/observations/4/vintages/4` | sg-gdp-manufacturing-qoq | 2026-Q1 | 2026-10-14 | -2.5 | -2.5 | MATCH | GDP-d0bf3550d1987671 |
| `sg-gdp-manufacturing-qoq.json#/observations/5/vintages/0` | sg-gdp-manufacturing-qoq | 2026-Q2 | 2026-07-14 | 5.3 | 5.3 | MATCH | GDP-8f0caacd10ca2ecf |
| `sg-gdp-manufacturing-qoq.json#/observations/5/vintages/1` | sg-gdp-manufacturing-qoq | 2026-Q2 | 2026-08-11 | 6.3 | 6.3 | MATCH | GDP-74efe831a21da654 |
| `sg-gdp-manufacturing-qoq.json#/observations/5/vintages/2` | sg-gdp-manufacturing-qoq | 2026-Q2 | 2026-10-14 | 6.3 | 6.3 | MATCH | GDP-369dd1d7685d275b |
| `sg-gdp-manufacturing-qoq.json#/observations/6/vintages/0` | sg-gdp-manufacturing-qoq | 2026-Q3 | 2026-10-14 | -0.9 | -0.9 | MATCH | GDP-b549f010ff7ffec0 |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/0` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-04-14 | 5.0 | 5.0 | MATCH | GDP-64770c6658cc5c80 |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/1` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-05-22 | 4.0 | 4.0 | MATCH | GDP-521375ca8b6adf39 |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/2` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-07-14 | 4.4 | 4.4 | MATCH | GDP-b721898c3a03e9df |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/3` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-08-12 | 4.7 | 4.7 | MATCH | GDP-cbc946bf764a8f04 |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/4` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-10-14 | 4.8 | 4.8 | URL_ALTERNATIVE_MATCH | GDP-e0779a57f42d8bed |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/5` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2025-11-21 | 4.8 | 4.8 | MATCH | GDP-dc744bb8e40a260b |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/6` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2026-01-02 | 4.7 | 4.7 | MATCH | GDP-07439ccffccac0a5 |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/7` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2026-02-10 | 4.7 | 4.7 | MATCH | GDP-bfcc4a9acec79f9c |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/8` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2026-04-14 | 8.6 | 8.6 | MATCH | GDP-7a36951303e6a9db |
| `sg-gdp-manufacturing-yoy.json#/observations/0/vintages/9` | sg-gdp-manufacturing-yoy | 2025-Q1 | 2026-05-25 | 8.6 | 8.6 | MATCH | GDP-851845dd54c12cb2 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/0` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2025-07-14 | 5.5 | 5.5 | MATCH | GDP-6a63a2f67891f1d0 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/1` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2025-08-12 | 5.2 | 5.2 | MATCH | GDP-18e32cb4b808a1cc |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/2` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2025-10-14 | 5.0 | 5.0 | URL_ALTERNATIVE_MATCH | GDP-035872eac5022c89 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/3` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2025-11-21 | 5.1 | 5.1 | MATCH | GDP-177049c1b2689c3d |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/4` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-01-02 | 5.2 | 5.2 | MATCH | GDP-7beac25e05139766 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/5` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-02-10 | 5.1 | 5.1 | MATCH | GDP-f07609e692749248 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/6` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-04-14 | 10.5 | 10.5 | MATCH | GDP-af4bbdac29e29f7f |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/7` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-05-25 | 10.5 | 10.5 | MATCH | GDP-9121eaeedda3c332 |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/8` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-07-14 | 10.5 | 10.5 | MATCH | GDP-f2f11a52bf85458d |
| `sg-gdp-manufacturing-yoy.json#/observations/1/vintages/9` | sg-gdp-manufacturing-yoy | 2025-Q2 | 2026-08-11 | 10.5 | 10.5 | MATCH | GDP-92acca0ebdbd799c |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/0` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2025-10-14 | 0.0 | 0.0 | URL_ALTERNATIVE_MATCH | GDP-c0be5aaa3560739d |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/1` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2025-11-21 | 5.0 | 5.0 | MATCH | GDP-cb6e5ee5e5679104 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/2` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-01-02 | 4.9 | 4.9 | MATCH | GDP-d1aa6881b8dcafc1 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/3` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-02-10 | 5.3 | 5.3 | MATCH | GDP-59d67e1bf97e2ad1 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/4` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-04-14 | 4.6 | 4.6 | MATCH | GDP-b99dda48cf12e732 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/5` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-05-25 | 4.6 | 4.6 | MATCH | GDP-6fc7101f2038926e |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/6` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-07-14 | 4.6 | 4.6 | MATCH | GDP-d647d28b228e89a8 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/7` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-08-11 | 4.6 | 4.6 | MATCH | GDP-82f019005edb1321 |
| `sg-gdp-manufacturing-yoy.json#/observations/2/vintages/8` | sg-gdp-manufacturing-yoy | 2025-Q3 | 2026-10-14 | 4.6 | 4.6 | MATCH | GDP-76a491318d79da98 |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/0` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-01-02 | 15.0 | 15.0 | MATCH | GDP-ceea9866778e1f43 |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/1` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-02-10 | 18.8 | 18.8 | MATCH | GDP-8014cd55faf6d482 |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/2` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-04-14 | 11.4 | 11.4 | MATCH | GDP-2a2b5025e50d53eb |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/3` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-05-25 | 11.4 | 11.4 | MATCH | GDP-4990d7a1841f6894 |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/4` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-07-14 | 11.4 | 11.4 | MATCH | GDP-41cb872dd6750d2f |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/5` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-08-11 | 11.4 | 11.4 | MATCH | GDP-26a61ed73de76d3f |
| `sg-gdp-manufacturing-yoy.json#/observations/3/vintages/6` | sg-gdp-manufacturing-yoy | 2025-Q4 | 2026-10-14 | 11.4 | 11.4 | MATCH | GDP-9e322b3ba586ec0e |
| `sg-gdp-manufacturing-yoy.json#/observations/4/vintages/0` | sg-gdp-manufacturing-yoy | 2026-Q1 | 2026-04-14 | 5.0 | 5.0 | MATCH | GDP-61a5edd46faea864 |
| `sg-gdp-manufacturing-yoy.json#/observations/4/vintages/1` | sg-gdp-manufacturing-yoy | 2026-Q1 | 2026-05-25 | 7.9 | 7.9 | MATCH | GDP-621410fa26acfb28 |
| `sg-gdp-manufacturing-yoy.json#/observations/4/vintages/2` | sg-gdp-manufacturing-yoy | 2026-Q1 | 2026-07-14 | 8.0 | 8.0 | MATCH | GDP-c882a96070625b1e |
| `sg-gdp-manufacturing-yoy.json#/observations/4/vintages/3` | sg-gdp-manufacturing-yoy | 2026-Q1 | 2026-08-11 | 7.3 | 7.3 | MATCH | GDP-95b9d8e9159f387f |
| `sg-gdp-manufacturing-yoy.json#/observations/4/vintages/4` | sg-gdp-manufacturing-yoy | 2026-Q1 | 2026-10-14 | 7.7 | 7.7 | MATCH | GDP-95928d1903c322ef |
| `sg-gdp-manufacturing-yoy.json#/observations/5/vintages/0` | sg-gdp-manufacturing-yoy | 2026-Q2 | 2026-07-14 | 12.2 | 12.2 | MATCH | GDP-a8ca00ebb065b8ad |
| `sg-gdp-manufacturing-yoy.json#/observations/5/vintages/1` | sg-gdp-manufacturing-yoy | 2026-Q2 | 2026-08-11 | 12.5 | 12.5 | MATCH | GDP-9d8ec7e77998a1bb |
| `sg-gdp-manufacturing-yoy.json#/observations/5/vintages/2` | sg-gdp-manufacturing-yoy | 2026-Q2 | 2026-10-14 | 12.9 | 12.9 | MATCH | GDP-ea8d18be6f3a4383 |
| `sg-gdp-manufacturing-yoy.json#/observations/6/vintages/0` | sg-gdp-manufacturing-yoy | 2026-Q3 | 2026-10-14 | 7.5 | 7.5 | MATCH | GDP-5341a3fce3be4e6d |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/0` | sg-gdp-overall-qoq | 2025-Q1 | 2025-04-14 | -0.8 | -0.8 | MATCH | GDP-584a52dbf1d1a2ad |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/1` | sg-gdp-overall-qoq | 2025-Q1 | 2025-05-22 | -0.6 | -0.6 | MATCH | GDP-37e6ef0735596cf1 |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/2` | sg-gdp-overall-qoq | 2025-Q1 | 2025-07-14 | -0.5 | -0.5 | MATCH | GDP-74a586bb31b27fcc |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/3` | sg-gdp-overall-qoq | 2025-Q1 | 2025-08-12 | -0.5 | -0.5 | MATCH | GDP-4ea4f47337bf020c |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/4` | sg-gdp-overall-qoq | 2025-Q1 | 2025-10-14 | -0.5 | -0.5 | URL_ALTERNATIVE_MATCH | GDP-2926b4ed68a3691c |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/5` | sg-gdp-overall-qoq | 2025-Q1 | 2025-11-21 | -0.5 | -0.5 | MATCH | GDP-965d4df128a4776a |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/6` | sg-gdp-overall-qoq | 2025-Q1 | 2026-01-02 | -0.5 | -0.5 | MATCH | GDP-35bc4b325260af14 |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/7` | sg-gdp-overall-qoq | 2025-Q1 | 2026-02-10 | 0.1 | 0.1 | MATCH | GDP-3d5997521fc69488 |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/8` | sg-gdp-overall-qoq | 2025-Q1 | 2026-04-14 | 0.6 | 0.6 | MATCH | GDP-989671e30d134a0a |
| `sg-gdp-overall-qoq.json#/observations/0/vintages/9` | sg-gdp-overall-qoq | 2025-Q1 | 2026-05-25 | 0.6 | 0.6 | MATCH | GDP-dd5f8f00c3b2ac1f |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/0` | sg-gdp-overall-qoq | 2025-Q2 | 2025-07-14 | 1.4 | 1.4 | MATCH | GDP-e200407e2f887756 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/1` | sg-gdp-overall-qoq | 2025-Q2 | 2025-08-12 | 1.4 | 1.4 | MATCH | GDP-5f428d4fceee0a10 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/2` | sg-gdp-overall-qoq | 2025-Q2 | 2025-10-14 | 1.5 | 1.5 | URL_ALTERNATIVE_MATCH | GDP-cf319a032cd06370 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/3` | sg-gdp-overall-qoq | 2025-Q2 | 2025-11-21 | 1.7 | 1.7 | MATCH | GDP-93e77ae47a17e73a |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/4` | sg-gdp-overall-qoq | 2025-Q2 | 2026-01-02 | 1.8 | 1.8 | MATCH | GDP-c1c7b60dc9d69e17 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/5` | sg-gdp-overall-qoq | 2025-Q2 | 2026-02-10 | 1.7 | 1.7 | MATCH | GDP-1c18df2d8a383ff3 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/6` | sg-gdp-overall-qoq | 2025-Q2 | 2026-04-14 | 1.8 | 1.8 | MATCH | GDP-596f161dbbdb565a |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/7` | sg-gdp-overall-qoq | 2025-Q2 | 2026-05-25 | 1.8 | 1.8 | MATCH | GDP-5c3bfcc4358cbd85 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/8` | sg-gdp-overall-qoq | 2025-Q2 | 2026-07-14 | 1.8 | 1.8 | MATCH | GDP-07e6ad29f41f5dc4 |
| `sg-gdp-overall-qoq.json#/observations/1/vintages/9` | sg-gdp-overall-qoq | 2025-Q2 | 2026-08-11 | 1.8 | 1.8 | MATCH | GDP-49ce2b52d8e3a8a6 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/0` | sg-gdp-overall-qoq | 2025-Q3 | 2025-10-14 | 1.3 | 1.3 | URL_ALTERNATIVE_MATCH | GDP-d0b0afb0cef6b489 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/1` | sg-gdp-overall-qoq | 2025-Q3 | 2025-11-21 | 2.4 | 2.4 | MATCH | GDP-386453bdaa4874a4 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/2` | sg-gdp-overall-qoq | 2025-Q3 | 2026-01-02 | 2.4 | 2.4 | MATCH | GDP-bc284ba4580b762c |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/3` | sg-gdp-overall-qoq | 2025-Q3 | 2026-02-10 | 2.6 | 2.6 | MATCH | GDP-46a65b62382e2350 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/4` | sg-gdp-overall-qoq | 2025-Q3 | 2026-04-14 | 1.9 | 1.9 | MATCH | GDP-acb64c4749d1f102 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/5` | sg-gdp-overall-qoq | 2025-Q3 | 2026-05-25 | 1.9 | 1.9 | MATCH | GDP-c75818fd2d105373 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/6` | sg-gdp-overall-qoq | 2025-Q3 | 2026-07-14 | 1.9 | 1.9 | MATCH | GDP-aaef800c304ef453 |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/7` | sg-gdp-overall-qoq | 2025-Q3 | 2026-08-11 | 1.9 | 1.9 | MATCH | GDP-c56228e2330dbebf |
| `sg-gdp-overall-qoq.json#/observations/2/vintages/8` | sg-gdp-overall-qoq | 2025-Q3 | 2026-10-14 | 1.9 | 1.9 | MATCH | GDP-45fe57506684bbac |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/0` | sg-gdp-overall-qoq | 2025-Q4 | 2026-01-02 | 1.9 | 1.9 | MATCH | GDP-d8be89e5ff856979 |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/1` | sg-gdp-overall-qoq | 2025-Q4 | 2026-02-10 | 2.1 | 2.1 | MATCH | GDP-3c26de037756cbd6 |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/2` | sg-gdp-overall-qoq | 2025-Q4 | 2026-04-14 | 1.3 | 1.3 | MATCH | GDP-980e84f2276a0415 |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/3` | sg-gdp-overall-qoq | 2025-Q4 | 2026-05-25 | 1.3 | 1.3 | MATCH | GDP-4d30bec53ea49d71 |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/4` | sg-gdp-overall-qoq | 2025-Q4 | 2026-07-14 | 1.3 | 1.3 | MATCH | GDP-32de2daa0ba42cc5 |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/5` | sg-gdp-overall-qoq | 2025-Q4 | 2026-08-11 | 1.3 | 1.3 | MATCH | GDP-5101fc406dd8a82d |
| `sg-gdp-overall-qoq.json#/observations/3/vintages/6` | sg-gdp-overall-qoq | 2025-Q4 | 2026-10-14 | 1.3 | 1.3 | MATCH | GDP-349a1a0c0a8ecbbc |
| `sg-gdp-overall-qoq.json#/observations/4/vintages/0` | sg-gdp-overall-qoq | 2026-Q1 | 2026-04-14 | -0.3 | -0.3 | MATCH | GDP-3a23eb49e2401f25 |
| `sg-gdp-overall-qoq.json#/observations/4/vintages/1` | sg-gdp-overall-qoq | 2026-Q1 | 2026-05-25 | 1.0 | 1.0 | MATCH | GDP-9e7d40543354c9c5 |
| `sg-gdp-overall-qoq.json#/observations/4/vintages/2` | sg-gdp-overall-qoq | 2026-Q1 | 2026-07-14 | 1.3 | 1.3 | MATCH | GDP-ffd2c2f6537db883 |
| `sg-gdp-overall-qoq.json#/observations/4/vintages/3` | sg-gdp-overall-qoq | 2026-Q1 | 2026-08-11 | 1.2 | 1.2 | MATCH | GDP-3f45738c3bbde5fa |
| `sg-gdp-overall-qoq.json#/observations/4/vintages/4` | sg-gdp-overall-qoq | 2026-Q1 | 2026-10-14 | 1.4 | 1.4 | MATCH | GDP-4162720ce814efa1 |
| `sg-gdp-overall-qoq.json#/observations/5/vintages/0` | sg-gdp-overall-qoq | 2026-Q2 | 2026-07-14 | 1.1 | 1.1 | MATCH | GDP-b3b1b39ddf61c4f7 |
| `sg-gdp-overall-qoq.json#/observations/5/vintages/1` | sg-gdp-overall-qoq | 2026-Q2 | 2026-08-11 | 1.4 | 1.4 | MATCH | GDP-cee2ed7f738b2d85 |
| `sg-gdp-overall-qoq.json#/observations/5/vintages/2` | sg-gdp-overall-qoq | 2026-Q2 | 2026-10-14 | 1.5 | 1.5 | MATCH | GDP-7ffd83dbc6057fab |
| `sg-gdp-overall-qoq.json#/observations/6/vintages/0` | sg-gdp-overall-qoq | 2026-Q3 | 2026-10-14 | 1.1 | 1.1 | MATCH | GDP-af383c590e7ad82a |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/0` | sg-gdp-overall-yoy | 2025-Q1 | 2025-04-14 | 3.8 | 3.8 | MATCH | GDP-d85c1a11b4ff33d4 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/1` | sg-gdp-overall-yoy | 2025-Q1 | 2025-05-22 | 3.9 | 3.9 | MATCH | GDP-6bfb94bf154b24d1 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/2` | sg-gdp-overall-yoy | 2025-Q1 | 2025-07-14 | 4.1 | 4.1 | MATCH | GDP-2c39809433506dc0 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/3` | sg-gdp-overall-yoy | 2025-Q1 | 2025-08-12 | 4.1 | 4.1 | MATCH | GDP-cf41d82851cab061 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/4` | sg-gdp-overall-yoy | 2025-Q1 | 2025-10-14 | 4.1 | 4.1 | URL_ALTERNATIVE_MATCH | GDP-f1bdae8c261ce977 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/5` | sg-gdp-overall-yoy | 2025-Q1 | 2025-11-21 | 4.1 | 4.1 | MATCH | GDP-62754614480dbdd8 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/6` | sg-gdp-overall-yoy | 2025-Q1 | 2026-01-02 | 4.1 | 4.1 | MATCH | GDP-d25c7a24ae43a1cb |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/7` | sg-gdp-overall-yoy | 2025-Q1 | 2026-02-10 | 3.9 | 3.9 | MATCH | GDP-cbf63191de326695 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/8` | sg-gdp-overall-yoy | 2025-Q1 | 2026-04-14 | 4.5 | 4.5 | MATCH | GDP-ad8c7e39a61b3034 |
| `sg-gdp-overall-yoy.json#/observations/0/vintages/9` | sg-gdp-overall-yoy | 2025-Q1 | 2026-05-25 | 4.5 | 4.5 | MATCH | GDP-bb13b6ec538d01f8 |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/0` | sg-gdp-overall-yoy | 2025-Q2 | 2025-07-14 | 4.3 | 4.3 | MATCH | GDP-ca7052c1c3d24197 |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/1` | sg-gdp-overall-yoy | 2025-Q2 | 2025-08-12 | 4.4 | 4.4 | MATCH | GDP-58973cdee698deee |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/2` | sg-gdp-overall-yoy | 2025-Q2 | 2025-10-14 | 4.5 | 4.5 | URL_ALTERNATIVE_MATCH | GDP-78c980dd4c31e0fe |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/3` | sg-gdp-overall-yoy | 2025-Q2 | 2025-11-21 | 4.7 | 4.7 | MATCH | GDP-627314855c190d13 |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/4` | sg-gdp-overall-yoy | 2025-Q2 | 2026-01-02 | 4.8 | 4.8 | MATCH | GDP-f03dc09f2af58a27 |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/5` | sg-gdp-overall-yoy | 2025-Q2 | 2026-02-10 | 4.6 | 4.6 | MATCH | GDP-4dd41cbccb52d470 |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/6` | sg-gdp-overall-yoy | 2025-Q2 | 2026-04-14 | 5.4 | 5.4 | MATCH | GDP-ee7c3cecea18025c |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/7` | sg-gdp-overall-yoy | 2025-Q2 | 2026-05-25 | 5.4 | 5.4 | MATCH | GDP-412f507ea4b88abe |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/8` | sg-gdp-overall-yoy | 2025-Q2 | 2026-07-14 | 5.4 | 5.4 | MATCH | GDP-3293aab51ac73d1d |
| `sg-gdp-overall-yoy.json#/observations/1/vintages/9` | sg-gdp-overall-yoy | 2025-Q2 | 2026-08-11 | 5.4 | 5.4 | MATCH | GDP-bffe2f49d6120336 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/0` | sg-gdp-overall-yoy | 2025-Q3 | 2025-10-14 | 2.9 | 2.9 | URL_ALTERNATIVE_MATCH | GDP-34e808e1f5163756 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/1` | sg-gdp-overall-yoy | 2025-Q3 | 2025-11-21 | 4.2 | 4.2 | MATCH | GDP-b2974320b64f80d4 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/2` | sg-gdp-overall-yoy | 2025-Q3 | 2026-01-02 | 4.3 | 4.3 | MATCH | GDP-8bb7a203dd6b7890 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/3` | sg-gdp-overall-yoy | 2025-Q3 | 2026-02-10 | 4.6 | 4.6 | MATCH | GDP-0f31299ba1f860bc |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/4` | sg-gdp-overall-yoy | 2025-Q3 | 2026-04-14 | 4.5 | 4.5 | MATCH | GDP-f1c385965da3cb3b |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/5` | sg-gdp-overall-yoy | 2025-Q3 | 2026-05-25 | 4.5 | 4.5 | MATCH | GDP-06a1f53c6993e1c4 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/6` | sg-gdp-overall-yoy | 2025-Q3 | 2026-07-14 | 4.5 | 4.5 | MATCH | GDP-5eb6afc781848ae6 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/7` | sg-gdp-overall-yoy | 2025-Q3 | 2026-08-11 | 4.5 | 4.5 | MATCH | GDP-3690993cbeca5420 |
| `sg-gdp-overall-yoy.json#/observations/2/vintages/8` | sg-gdp-overall-yoy | 2025-Q3 | 2026-10-14 | 4.5 | 4.5 | MATCH | GDP-54d84d4a91353235 |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/0` | sg-gdp-overall-yoy | 2025-Q4 | 2026-01-02 | 5.7 | 5.7 | MATCH | GDP-eaa8fd4c4184af96 |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/1` | sg-gdp-overall-yoy | 2025-Q4 | 2026-02-10 | 6.9 | 6.9 | MATCH | GDP-a24479cd012ed393 |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/2` | sg-gdp-overall-yoy | 2025-Q4 | 2026-04-14 | 5.7 | 5.7 | MATCH | GDP-cf8779c8e598bdde |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/3` | sg-gdp-overall-yoy | 2025-Q4 | 2026-05-25 | 5.7 | 5.7 | MATCH | GDP-8b28342eb62d34fa |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/4` | sg-gdp-overall-yoy | 2025-Q4 | 2026-07-14 | 5.7 | 5.7 | MATCH | GDP-52face544e3a7c0f |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/5` | sg-gdp-overall-yoy | 2025-Q4 | 2026-08-11 | 5.7 | 5.7 | MATCH | GDP-39601c66d18856a4 |
| `sg-gdp-overall-yoy.json#/observations/3/vintages/6` | sg-gdp-overall-yoy | 2025-Q4 | 2026-10-14 | 5.7 | 5.7 | MATCH | GDP-a8fe3c7600317723 |
| `sg-gdp-overall-yoy.json#/observations/4/vintages/0` | sg-gdp-overall-yoy | 2026-Q1 | 2026-04-14 | 4.6 | 4.6 | MATCH | GDP-109226edece30332 |
| `sg-gdp-overall-yoy.json#/observations/4/vintages/1` | sg-gdp-overall-yoy | 2026-Q1 | 2026-05-25 | 6.0 | 6.0 | MATCH | GDP-9a358f43e81f5985 |
| `sg-gdp-overall-yoy.json#/observations/4/vintages/2` | sg-gdp-overall-yoy | 2026-Q1 | 2026-07-14 | 6.3 | 6.3 | MATCH | GDP-33a139462df5d615 |
| `sg-gdp-overall-yoy.json#/observations/4/vintages/3` | sg-gdp-overall-yoy | 2026-Q1 | 2026-08-11 | 6.3 | 6.3 | MATCH | GDP-d7fb22f72758e003 |
| `sg-gdp-overall-yoy.json#/observations/4/vintages/4` | sg-gdp-overall-yoy | 2026-Q1 | 2026-10-14 | 6.4 | 6.4 | MATCH | GDP-4b38e49ee9128996 |
| `sg-gdp-overall-yoy.json#/observations/5/vintages/0` | sg-gdp-overall-yoy | 2026-Q2 | 2026-07-14 | 5.7 | 5.7 | MATCH | GDP-7b469fe34a77d24e |
| `sg-gdp-overall-yoy.json#/observations/5/vintages/1` | sg-gdp-overall-yoy | 2026-Q2 | 2026-08-11 | 5.9 | 5.9 | MATCH | GDP-4fc3b1d2125ceb93 |
| `sg-gdp-overall-yoy.json#/observations/5/vintages/2` | sg-gdp-overall-yoy | 2026-Q2 | 2026-10-14 | 6.2 | 6.2 | MATCH | GDP-b5b548ffd5f96abd |
| `sg-gdp-overall-yoy.json#/observations/6/vintages/0` | sg-gdp-overall-yoy | 2026-Q3 | 2026-10-14 | 5.4 | 5.4 | MATCH | GDP-3e0855652775edbf |
| `sg-gdp-services-qoq.json#/observations/0/vintages/0` | sg-gdp-services-qoq | 2025-Q1 | 2025-04-14 | 0.3 | 0.3 | MATCH | GDP-6ffaf38590734dbf |
| `sg-gdp-services-qoq.json#/observations/0/vintages/1` | sg-gdp-services-qoq | 2025-Q1 | 2025-05-22 | 0.5 | 0.5 | MATCH | GDP-250d707feec4fd71 |
| `sg-gdp-services-qoq.json#/observations/0/vintages/2` | sg-gdp-services-qoq | 2025-Q1 | 2025-07-14 | 0.6 | 0.6 | MATCH | GDP-a19e1f9e9acef18b |
| `sg-gdp-services-qoq.json#/observations/0/vintages/3` | sg-gdp-services-qoq | 2025-Q1 | 2025-08-12 | 0.6 | 0.6 | MATCH | GDP-57b9f65610cae305 |
| `sg-gdp-services-qoq.json#/observations/0/vintages/4` | sg-gdp-services-qoq | 2025-Q1 | 2025-10-14 | 0.6 | 0.6 | URL_ALTERNATIVE_MATCH | GDP-18f661bf2f3f0e00 |
| `sg-gdp-services-qoq.json#/observations/0/vintages/5` | sg-gdp-services-qoq | 2025-Q1 | 2025-11-21 | 0.6 | 0.6 | MATCH | GDP-294cb98b0d10095c |
| `sg-gdp-services-qoq.json#/observations/0/vintages/6` | sg-gdp-services-qoq | 2025-Q1 | 2026-01-02 | 0.6 | 0.6 | MATCH | GDP-3262844d65e8d902 |
| `sg-gdp-services-qoq.json#/observations/0/vintages/7` | sg-gdp-services-qoq | 2025-Q1 | 2026-02-10 | 0.7 | 0.7 | MATCH | GDP-f2ef46e41db039aa |
| `sg-gdp-services-qoq.json#/observations/0/vintages/8` | sg-gdp-services-qoq | 2025-Q1 | 2026-04-14 | 0.7 | 0.7 | MATCH | GDP-4ee2f6ffd49f6be2 |
| `sg-gdp-services-qoq.json#/observations/0/vintages/9` | sg-gdp-services-qoq | 2025-Q1 | 2026-05-25 | 0.7 | 0.7 | MATCH | GDP-3bfd0e83eb22e621 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/0` | sg-gdp-services-qoq | 2025-Q2 | 2025-07-14 | 1.4 | 1.4 | MATCH | GDP-b21c6cd63a6b678b |
| `sg-gdp-services-qoq.json#/observations/1/vintages/1` | sg-gdp-services-qoq | 2025-Q2 | 2025-08-12 | 1.5 | 1.5 | MATCH | GDP-694275bc0304e2f7 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/2` | sg-gdp-services-qoq | 2025-Q2 | 2025-10-14 | 1.7 | 1.7 | URL_ALTERNATIVE_MATCH | GDP-e0d43aef48297bc0 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/3` | sg-gdp-services-qoq | 2025-Q2 | 2025-11-21 | 1.9 | 1.9 | MATCH | GDP-9661a3cf603f893e |
| `sg-gdp-services-qoq.json#/observations/1/vintages/4` | sg-gdp-services-qoq | 2025-Q2 | 2026-01-02 | 2.0 | 2.0 | MATCH | GDP-50491c26f58976be |
| `sg-gdp-services-qoq.json#/observations/1/vintages/5` | sg-gdp-services-qoq | 2025-Q2 | 2026-02-10 | 1.9 | 1.9 | MATCH | GDP-121c5e63ecf78b55 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/6` | sg-gdp-services-qoq | 2025-Q2 | 2026-04-14 | 1.9 | 1.9 | MATCH | GDP-e09507d1d78cce06 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/7` | sg-gdp-services-qoq | 2025-Q2 | 2026-05-25 | 1.9 | 1.9 | MATCH | GDP-bc875e2629e7733f |
| `sg-gdp-services-qoq.json#/observations/1/vintages/8` | sg-gdp-services-qoq | 2025-Q2 | 2026-07-14 | 1.9 | 1.9 | MATCH | GDP-74de0c5a23c75f43 |
| `sg-gdp-services-qoq.json#/observations/1/vintages/9` | sg-gdp-services-qoq | 2025-Q2 | 2026-08-11 | 1.9 | 1.9 | MATCH | GDP-fadb140ba1a76e45 |
| `sg-gdp-services-qoq.json#/observations/2/vintages/0` | sg-gdp-services-qoq | 2025-Q3 | 2025-10-14 | 0.2 | 0.2 | URL_ALTERNATIVE_MATCH | GDP-79412dec498a3d18 |
| `sg-gdp-services-qoq.json#/observations/2/vintages/1` | sg-gdp-services-qoq | 2025-Q3 | 2025-11-21 | 0.4 | 0.4 | MATCH | GDP-fe319fc569bcb9ad |
| `sg-gdp-services-qoq.json#/observations/2/vintages/2` | sg-gdp-services-qoq | 2025-Q3 | 2026-01-02 | 0.5 | 0.5 | MATCH | GDP-41ccbe7b57bab16c |
| `sg-gdp-services-qoq.json#/observations/2/vintages/3` | sg-gdp-services-qoq | 2025-Q3 | 2026-02-10 | 1.2 | 1.2 | MATCH | GDP-8032f94c95c85f5f |
| `sg-gdp-services-qoq.json#/observations/2/vintages/4` | sg-gdp-services-qoq | 2025-Q3 | 2026-04-14 | 1.2 | 1.2 | MATCH | GDP-64842e4de8d02908 |
| `sg-gdp-services-qoq.json#/observations/2/vintages/5` | sg-gdp-services-qoq | 2025-Q3 | 2026-05-25 | 1.2 | 1.2 | MATCH | GDP-4950efbc59ba4625 |
| `sg-gdp-services-qoq.json#/observations/2/vintages/6` | sg-gdp-services-qoq | 2025-Q3 | 2026-07-14 | 1.2 | 1.2 | MATCH | GDP-9ee4582b08031b1e |
| `sg-gdp-services-qoq.json#/observations/2/vintages/7` | sg-gdp-services-qoq | 2025-Q3 | 2026-08-11 | 1.2 | 1.2 | MATCH | GDP-669f0314244dec30 |
| `sg-gdp-services-qoq.json#/observations/2/vintages/8` | sg-gdp-services-qoq | 2025-Q3 | 2026-10-14 | 1.2 | 1.2 | MATCH | GDP-5d096d7a461c2ed6 |
| `sg-gdp-services-qoq.json#/observations/3/vintages/0` | sg-gdp-services-qoq | 2025-Q4 | 2026-01-02 | 0.8 | 0.8 | MATCH | GDP-72a260434915b98c |
| `sg-gdp-services-qoq.json#/observations/3/vintages/1` | sg-gdp-services-qoq | 2025-Q4 | 2026-02-10 | 1.0 | 1.0 | MATCH | GDP-f8cb8042d2e2c05d |
| `sg-gdp-services-qoq.json#/observations/3/vintages/2` | sg-gdp-services-qoq | 2025-Q4 | 2026-04-14 | 1.0 | 1.0 | MATCH | GDP-665d952dac6327a8 |
| `sg-gdp-services-qoq.json#/observations/3/vintages/3` | sg-gdp-services-qoq | 2025-Q4 | 2026-05-25 | 1.0 | 1.0 | MATCH | GDP-2aaf2de50b4c08a5 |
| `sg-gdp-services-qoq.json#/observations/3/vintages/4` | sg-gdp-services-qoq | 2025-Q4 | 2026-07-14 | 1.0 | 1.0 | MATCH | GDP-6296a27e70961a31 |
| `sg-gdp-services-qoq.json#/observations/3/vintages/5` | sg-gdp-services-qoq | 2025-Q4 | 2026-08-11 | 1.0 | 1.0 | MATCH | GDP-5b81a2bfc09bed63 |
| `sg-gdp-services-qoq.json#/observations/3/vintages/6` | sg-gdp-services-qoq | 2025-Q4 | 2026-10-14 | 1.0 | 1.0 | MATCH | GDP-8dbe3bc0614ae391 |
| `sg-gdp-services-qoq.json#/observations/4/vintages/0` | sg-gdp-services-qoq | 2026-Q1 | 2026-04-14 | 0.6 | 0.6 | MATCH | GDP-2751902615b14927 |
| `sg-gdp-services-qoq.json#/observations/4/vintages/1` | sg-gdp-services-qoq | 2026-Q1 | 2026-05-25 | 1.6 | 1.6 | MATCH | GDP-1b1501b16598d5b7 |
| `sg-gdp-services-qoq.json#/observations/4/vintages/2` | sg-gdp-services-qoq | 2026-Q1 | 2026-07-14 | 2.0 | 2.0 | MATCH | GDP-992023ca61ffd43c |
| `sg-gdp-services-qoq.json#/observations/4/vintages/3` | sg-gdp-services-qoq | 2026-Q1 | 2026-08-11 | 2.1 | 2.1 | MATCH | GDP-f297dad26ccbd5b4 |
| `sg-gdp-services-qoq.json#/observations/4/vintages/4` | sg-gdp-services-qoq | 2026-Q1 | 2026-10-14 | 2.1 | 2.1 | MATCH | GDP-24967f559717dbc4 |
| `sg-gdp-services-qoq.json#/observations/5/vintages/0` | sg-gdp-services-qoq | 2026-Q2 | 2026-07-14 | 0.3 | 0.3 | MATCH | GDP-f6a7b4878cd40ebb |
| `sg-gdp-services-qoq.json#/observations/5/vintages/1` | sg-gdp-services-qoq | 2026-Q2 | 2026-08-11 | 0.5 | 0.5 | MATCH | GDP-2be4ef533686b061 |
| `sg-gdp-services-qoq.json#/observations/5/vintages/2` | sg-gdp-services-qoq | 2026-Q2 | 2026-10-14 | 0.7 | 0.7 | MATCH | GDP-41eab36c7914aad1 |
| `sg-gdp-services-qoq.json#/observations/6/vintages/0` | sg-gdp-services-qoq | 2026-Q3 | 2026-10-14 | 1.2 | 1.2 | MATCH | GDP-78e229392b98a530 |
| `sg-gdp-services-yoy.json#/observations/0/vintages/0` | sg-gdp-services-yoy | 2025-Q1 | 2025-04-14 | 3.4 | 3.4 | MATCH | GDP-f79bd2294057eae0 |
| `sg-gdp-services-yoy.json#/observations/0/vintages/1` | sg-gdp-services-yoy | 2025-Q1 | 2025-05-22 | 3.6 | 3.6 | MATCH | GDP-828c60b366a6840d |
| `sg-gdp-services-yoy.json#/observations/0/vintages/2` | sg-gdp-services-yoy | 2025-Q1 | 2025-07-14 | 3.7 | 3.7 | MATCH | GDP-722ae4b1f28dd37c |
| `sg-gdp-services-yoy.json#/observations/0/vintages/3` | sg-gdp-services-yoy | 2025-Q1 | 2025-08-12 | 3.8 | 3.8 | MATCH | GDP-93d868c482b6b9a6 |
| `sg-gdp-services-yoy.json#/observations/0/vintages/4` | sg-gdp-services-yoy | 2025-Q1 | 2025-10-14 | 3.8 | 3.8 | URL_ALTERNATIVE_MATCH | GDP-ed5692c88cbde46c |
| `sg-gdp-services-yoy.json#/observations/0/vintages/5` | sg-gdp-services-yoy | 2025-Q1 | 2025-11-21 | 3.7 | 3.7 | MATCH | GDP-ecf0c5d5ead95ee0 |
| `sg-gdp-services-yoy.json#/observations/0/vintages/6` | sg-gdp-services-yoy | 2025-Q1 | 2026-01-02 | 3.7 | 3.7 | MATCH | GDP-b9596755dc2682ab |
| `sg-gdp-services-yoy.json#/observations/0/vintages/7` | sg-gdp-services-yoy | 2025-Q1 | 2026-02-10 | 3.5 | 3.5 | MATCH | GDP-ee2d9d235591158b |
| `sg-gdp-services-yoy.json#/observations/0/vintages/8` | sg-gdp-services-yoy | 2025-Q1 | 2026-04-14 | 3.5 | 3.5 | MATCH | GDP-0c17e20245dfcf02 |
| `sg-gdp-services-yoy.json#/observations/0/vintages/9` | sg-gdp-services-yoy | 2025-Q1 | 2026-05-25 | 3.5 | 3.5 | MATCH | GDP-8721ab02cde9f0c7 |
| `sg-gdp-services-yoy.json#/observations/1/vintages/0` | sg-gdp-services-yoy | 2025-Q2 | 2025-07-14 | 4.1 | 4.1 | MATCH | GDP-0c6188a3394b7da2 |
| `sg-gdp-services-yoy.json#/observations/1/vintages/1` | sg-gdp-services-yoy | 2025-Q2 | 2025-08-12 | 4.3 | 4.3 | MATCH | GDP-52fa4482fe776a4e |
| `sg-gdp-services-yoy.json#/observations/1/vintages/2` | sg-gdp-services-yoy | 2025-Q2 | 2025-10-14 | 4.5 | 4.5 | URL_ALTERNATIVE_MATCH | GDP-e6c853f7c1e7f740 |
| `sg-gdp-services-yoy.json#/observations/1/vintages/3` | sg-gdp-services-yoy | 2025-Q2 | 2025-11-21 | 4.7 | 4.7 | MATCH | GDP-7390d9fd081fe77b |
| `sg-gdp-services-yoy.json#/observations/1/vintages/4` | sg-gdp-services-yoy | 2025-Q2 | 2026-01-02 | 4.8 | 4.8 | MATCH | GDP-c99c02a20c35abfd |
| `sg-gdp-services-yoy.json#/observations/1/vintages/5` | sg-gdp-services-yoy | 2025-Q2 | 2026-02-10 | 4.5 | 4.5 | MATCH | GDP-d8a6d4d5cd6879f7 |
| `sg-gdp-services-yoy.json#/observations/1/vintages/6` | sg-gdp-services-yoy | 2025-Q2 | 2026-04-14 | 4.5 | 4.5 | MATCH | GDP-ef26aafc0d73c96c |
| `sg-gdp-services-yoy.json#/observations/1/vintages/7` | sg-gdp-services-yoy | 2025-Q2 | 2026-05-25 | 4.5 | 4.5 | MATCH | GDP-d183f1d4ae184b5f |
| `sg-gdp-services-yoy.json#/observations/1/vintages/8` | sg-gdp-services-yoy | 2025-Q2 | 2026-07-14 | 4.5 | 4.5 | MATCH | GDP-b9aab1b9a0cbf9e6 |
| `sg-gdp-services-yoy.json#/observations/1/vintages/9` | sg-gdp-services-yoy | 2025-Q2 | 2026-08-11 | 4.5 | 4.5 | MATCH | GDP-7d8ba6980351b7d5 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/0` | sg-gdp-services-yoy | 2025-Q3 | 2025-10-14 | 3.5 | 3.5 | URL_ALTERNATIVE_MATCH | GDP-72f11a9eef6cb7b2 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/1` | sg-gdp-services-yoy | 2025-Q3 | 2025-11-21 | 3.9 | 3.9 | MATCH | GDP-aa971179f0b80154 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/2` | sg-gdp-services-yoy | 2025-Q3 | 2026-01-02 | 4.1 | 4.1 | MATCH | GDP-86db87e790310e25 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/3` | sg-gdp-services-yoy | 2025-Q3 | 2026-02-10 | 4.3 | 4.3 | MATCH | GDP-0cc0bbdf38cd28cc |
| `sg-gdp-services-yoy.json#/observations/2/vintages/4` | sg-gdp-services-yoy | 2025-Q3 | 2026-04-14 | 4.3 | 4.3 | MATCH | GDP-11c0900ef4c88db4 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/5` | sg-gdp-services-yoy | 2025-Q3 | 2026-05-25 | 4.3 | 4.3 | MATCH | GDP-411d6736b2c45715 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/6` | sg-gdp-services-yoy | 2025-Q3 | 2026-07-14 | 4.3 | 4.3 | MATCH | GDP-d3e534c14e1444e0 |
| `sg-gdp-services-yoy.json#/observations/2/vintages/7` | sg-gdp-services-yoy | 2025-Q3 | 2026-08-11 | 4.3 | 4.3 | MATCH | GDP-69f6caee3e7d377f |
| `sg-gdp-services-yoy.json#/observations/2/vintages/8` | sg-gdp-services-yoy | 2025-Q3 | 2026-10-14 | 4.3 | 4.3 | MATCH | GDP-0a95093e05308f65 |
| `sg-gdp-services-yoy.json#/observations/3/vintages/0` | sg-gdp-services-yoy | 2025-Q4 | 2026-01-02 | 3.8 | 3.8 | MATCH | GDP-f3ed0b010ce50fba |
| `sg-gdp-services-yoy.json#/observations/3/vintages/1` | sg-gdp-services-yoy | 2025-Q4 | 2026-02-10 | 4.8 | 4.8 | MATCH | GDP-786360d0ee2a1929 |
| `sg-gdp-services-yoy.json#/observations/3/vintages/2` | sg-gdp-services-yoy | 2025-Q4 | 2026-04-14 | 4.8 | 4.8 | MATCH | GDP-7cbaf27a7d761424 |
| `sg-gdp-services-yoy.json#/observations/3/vintages/3` | sg-gdp-services-yoy | 2025-Q4 | 2026-05-25 | 4.8 | 4.8 | MATCH | GDP-e24a471bd4a62aec |
| `sg-gdp-services-yoy.json#/observations/3/vintages/4` | sg-gdp-services-yoy | 2025-Q4 | 2026-07-14 | 4.8 | 4.8 | MATCH | GDP-abbb777ee9cb61c5 |
| `sg-gdp-services-yoy.json#/observations/3/vintages/5` | sg-gdp-services-yoy | 2025-Q4 | 2026-08-11 | 4.8 | 4.8 | MATCH | GDP-753cfe09e2d4d682 |
| `sg-gdp-services-yoy.json#/observations/3/vintages/6` | sg-gdp-services-yoy | 2025-Q4 | 2026-10-14 | 4.8 | 4.8 | MATCH | GDP-52bb45523bf65251 |
| `sg-gdp-services-yoy.json#/observations/4/vintages/0` | sg-gdp-services-yoy | 2026-Q1 | 2026-04-14 | 4.7 | 4.7 | MATCH | GDP-5040b52446e57e02 |
| `sg-gdp-services-yoy.json#/observations/4/vintages/1` | sg-gdp-services-yoy | 2026-Q1 | 2026-05-25 | 5.7 | 5.7 | MATCH | GDP-fb54145fb32e475b |
| `sg-gdp-services-yoy.json#/observations/4/vintages/2` | sg-gdp-services-yoy | 2026-Q1 | 2026-07-14 | 6.2 | 6.2 | MATCH | GDP-b3fb68c6ee5942d2 |
| `sg-gdp-services-yoy.json#/observations/4/vintages/3` | sg-gdp-services-yoy | 2026-Q1 | 2026-08-11 | 6.3 | 6.3 | MATCH | GDP-fdc748e75011a360 |
| `sg-gdp-services-yoy.json#/observations/4/vintages/4` | sg-gdp-services-yoy | 2026-Q1 | 2026-10-14 | 6.3 | 6.3 | MATCH | GDP-ae6b63f2180ed32c |
| `sg-gdp-services-yoy.json#/observations/5/vintages/0` | sg-gdp-services-yoy | 2026-Q2 | 2026-07-14 | 4.6 | 4.6 | MATCH | GDP-b538dc874039dfa2 |
| `sg-gdp-services-yoy.json#/observations/5/vintages/1` | sg-gdp-services-yoy | 2026-Q2 | 2026-08-11 | 4.9 | 4.9 | MATCH | GDP-793eb96a0ad5996c |
| `sg-gdp-services-yoy.json#/observations/5/vintages/2` | sg-gdp-services-yoy | 2026-Q2 | 2026-10-14 | 5.2 | 5.2 | MATCH | GDP-20c78034e9603592 |
| `sg-gdp-services-yoy.json#/observations/6/vintages/0` | sg-gdp-services-yoy | 2026-Q3 | 2026-10-14 | 5.2 | 5.2 | MATCH | GDP-ee6e61c0d53e9c2c |

## Material Findings

- Final independent numeric comparisons: all 360 original GDP records match independently read values and dated releases; 336 at the same URL, 24 through an allowed SingStat mirror of the excluded October 2025 asset URL. No value discrepancy confirmed in the checked archive records.
- Original archive covers only 2025-Q1 through 2026-Q3, not requested 2023-Q1 onward. Expanded coverage must not be inferred from its revision statistics.
- 2026-04-14 advance release footnote 2 explicitly attributes 2025 quarterly revisions to IIP rebasing to 2025; this is substantive restatement context, not merely late-quarter revisions.
- SOURCES.md services-control assertion (0.6 in October and November 2025) is supported by the newly retrieved October SingStat mirror and November Annex B.
- The source-domain policy excludes by.gov.sg assets even when linked officially; use independently retrieved allowed mirrors, not silent domain substitution.
- Current API snapshot is not a dated agency publication; date is intentionally blank.


### labour-discrepancies.md

# Labour discrepancies

Archive record outcomes: {'MATCH': 46}. Material value disagreements count: 0. This is NOT proof all archive records are correct; NOT_VERIFIED records remain unresolved.


## Coverage and statistics

Archive omits 2023-Q1 through 2024-Q4 for both series (16 target cells); employment also omits 2026-Q3. Later survey restatements and current APIs supply historical cells but do not supply every original vintage. Revision-stats.json figures are archive-only, not full-period estimates. Its employment 5/6 revised periods and unemployment 4/6 comparable periods are arithmetically consistent with archived first/latest values, but independent full-window revision statistics cannot be asserted.

Important verified historical changes: 2023-Q4 employment appears as 12,600 in 2024-02-15 survey, 11,600 in 2024-05-23 and 8,000 in 2025-02-14; 2024-Q1 as 9,800 in 2024-05-23, 9,600 in 2024-08-13 and 8,100 in 2025-02-14. These are dated restatements, not same-vintage disagreements.

MOM July 2026 HTML shows release heading 31 July although metadata was last updated 6 August; original archive date retained after independent heading read. MOM 2023 Q1 report similarly shows 15 June despite later metadata.

