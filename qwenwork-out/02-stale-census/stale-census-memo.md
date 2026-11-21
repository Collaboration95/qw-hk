# Stale Census Memo

Audit date: 19 November 2026. Claim-specific screening, not an exhaustive publisher census.

## Results
- Primary inputs: 22 manufacturing records, 15 GDP records, 12 top-five records (49 raw records). Final: 48 classified screening records across 47 distinct URLs.
- The two LiveGDP non-target records are consolidated into one screened-page absence/control record; both exact quotes and original evidence are retained in source_evidence and searched_cases. All other URL + exact-sentence pairs are unique; Mothership contains two different claims and remains two records.
- Categories: AMBIGUOUS: 1, NOT A MATCH: 18, NOW WRONG: 2, STILL TRUE: 27.
- Qualified stale findings: 2; other screened records/controls: 46. These are not 48 qualifying stale hits. No confirmed post-revision manufacturing-zero claim and no confirmed post-August current GDP 5.7% claim.
- Median revision-to-publication/update lag among NOW WRONG only: 31.5 days (n=2; individual lags 6 and 57 days). This is not time-to-correction or measured months of repetition.

## Five Strongest NOW WRONG Examples
Only two qualify. There are no defensible third, fourth or fifth examples in this evidence.

### commercial data platform
> Singapore's economy grew 5.9% year on year in the second quarter of 2026, slower than the 6.3% in the first quarter of 2026, according to SingStat.

https://app.indexbox.io/indicators/symbol/real-gdp-chained-2015-dollars-percent-change-on-a-year-earlier-quarterly-not-seasonally-adjusted-singapore/

Updated six days after revision, calls Q2 2026 Latest data and presents 5.9% without historical-vintage qualification. Correct comparison is 6.2% in October release.
Lag: 6 days. Second check: Separate second webfetch of identical URL, text format: same exact sentence, Updated20 Oct 2026, Latest dataQ2 2026 and 5.9 % y/y all remained. Confirmed..

### construction trade news
> The Ministry of Trade and Industry said the construction sector expanded 11.8 per cent year on year in the first quarter of 2026, up from 4.6 per cent in the previous quarter.

https://construction.economictimes.indiatimes.com/news/global-markets-investment/singapore-builders-are-under-pressure-but-home-prices-have-not-cracked/133954904?utm_source=top_news&utm_medium=homepage

Post-revision unqualified Q1 construction YoY claim, confirmed twice. 11.8% superseded by 12.9% on 14 July 2026 per user-supplied correction; latest archive 13.5% on 14 October. Attribution caveat: "MTI said" could describe an old statement, but supplies no explicit dated vintage; treated as unqualified, not deliberate misinformation.
Lag: 57 days. Second check: Confirmed separate second reopen in supplied evidence.

## Three Best Correct Styles

> The first three quarters have already averaged about 6%, with Q2 revised up from 5.9% to 6.2% in this release.
https://www.cnbc.com/2026/10/14/singapore-gdp-q3.html
Correct and expressly revision-qualified historical 5.9%, not stale current claim.

> Singapore’s economy expanded 5.9% year on year in the second quarter, slightly ahead of the 5.7% advance estimate, taking the first-half growth to 6.1%.
https://internationalfinance.com/economy/singapore-doubles-down-on-ai-boom-raises-forecast-after-q2-gdp-growth/
Post-Aug11 correctly reports 5.9% and labels 5.7% advance estimate. August article predates October revision; site-wide November date is not article update evidence.

> The modest upward revision from the advance estimates of 5.7% yoy and 1.1% qoq sa reflected firmer expansion in the manufacturing and services sectors.
https://www.dbs.id/id/treasures-private-client/aics/economics/templatedata/article/generic/data/en/GR/082026/260811_insights_singapore.xml
Explicit historical 5.7% qualification; preceding sentence reports revised 5.9% yoy. Do not mix 1.1% qoq with yoy.

These examples are current/correct at publication or explicitly preserve a historical vintage, not immutable numbers or a certification of every other assertion on each page. Numbers.sg is retained as qualified: its full-survey section is contextualised by the explicit first/full/now table.

## Benchmarks And Decisions
- Manufacturing Q3 2025: advance 0.0% (14 October 2025), first superseding 5.0% (21 November), later rebased 4.6%. Supplied agent evidence verifies 4.6% on the live API manufacturing row, not an overall-GDP lookalike.
- GDP Q2 2026: 5.7% (14 July), 5.9% (11 August), 6.2% (14 October). 6.2% is the latest supplied checked vintage, not certified current after October.
- Top-five latest values are user-archive evidence, not independently re-verified official releases this turn. E10 first supersession is corrected to 12.9% on 14 July (not the August availability date in the old evidence); latest is 13.5% on 14 October.
- E01-05 and E07-09 are explicitly pre-revision and have advance framing confirmed in title/lead or official release context. They are STILL TRUE historical records, never NOW WRONG merely because the latest archive differs. E04 retains supplied native PDF evidence rather than an invented new fetch.
- UNRESOLVED manufacturing date becomes AMBIGUOUS; CORRECT AT PUBLICATION becomes STILL TRUE with an explicit flag. PMI is NOT A MATCH because it is a different series. RLB is NOT A MATCH: full extraction found no numerical target claim, with metadata/publication access caveat. BigGo construction YoY/QoQ confusion is a non-revision frequency-label error, not a stale hit.
- Exact sentences include source table fragments where labelled, not invented prose. Empty values mean not established. source_evidence preserves original labels and all supplied source details, including superseded interpretations; final classification and reason govern.

## Ranking Assumptions
Sort dated vintages by publication; rank absolute first-to-latest percentage-point differences, not maximum intermediate moves. Exclude persons from percentage-point ranking and exclude the two headline targets. Archive reports 10 series, 60 comparable periods, 54 percentage-point periods, 52 eligible after exclusions. Employment maximum is 4,400 persons, separately, not comparable to percentage points. Five ranking as reported:
1. sg-gdp-manufacturing-qoq, 2025-Q1: -4.9 to 0.6; absolute 5.5 pp. Latest user-archive: https://www.singstat.gov.sg/files/5fb90497-058d-4ee1-b3c3-56470886b238.pdf
2. sg-gdp-manufacturing-yoy, 2025-Q2: 5.5 to 10.5; absolute 5 pp. Latest user-archive: https://www.singstat.gov.sg/files/09253980-e221-4b10-80f6-440e51c62060.pdf
3. sg-gdp-manufacturing-qoq, 2025-Q4: 9.2 to 4.5; absolute 4.7 pp. Latest user-archive: https://www.singstat.gov.sg/files/b310c1e5-f7cb-43b6-8125-fe67dfc0ac05.pdf
4. sg-gdp-construction-yoy, 2026-Q1: 9 to 13.5; absolute 4.5 pp. Latest user-archive: https://www.singstat.gov.sg/files/b310c1e5-f7cb-43b6-8125-fe67dfc0ac05.pdf
5. sg-gdp-construction-qoq, 2026-Q1: 3.7 to 8; absolute 4.3 pp. Latest user-archive: https://www.singstat.gov.sg/files/b310c1e5-f7cb-43b6-8125-fe67dfc0ac05.pdf

## Publisher Mix
Raw claim-record counts, not population prevalence or representative sample shares.
- HR trade publication: 2
- LinkedIn consultancy opinion: 1
- SEO directory annual company research report: 1
- SEO economic data site: 1
- SEO industrial directory / company editorial: 1
- asset manager monthly newsletter: 1
- asset manager research: 1
- bank economic research: 1
- broadcast news / AFP syndication: 1
- business / property news: 1
- business finance editorial / marketing: 1
- business news: 1
- business news / Bernama syndication: 1
- commercial data platform: 1
- company earnings release: 1
- construction consultancy PDF: 1
- construction trade news: 1
- digital news outlet: 2
- economic data vendor / economist commentary: 1
- finance magazine: 1
- fintech investment research / marketing: 1
- independent data/calculator publisher: 1
- industry association newsletter: 1
- investment newsletter: 1
- major broadcast news: 1
- major financial news outlet: 2
- manufacturing trade news / AFP syndication: 1
- market newswire: 1
- news agency: 2
- news aggregation/editorial platform: 2
- news syndication / Malay Mail: 1
- news syndication / Straits Times: 1
- official government PDF archive: 1
- official government archive: 3
- official statistics agency: 3
- property advisory/agent blog: 1
- property consultancy commentary: 1
- property consultancy research: 1
- real estate trade publication: 1

## Coverage And Gaps
Search-led convenience sample, including official archives, media, data vendors, property/finance research and controls. Chamber, company, university and Substack coverage is not adequate to estimate prevalence. A company false-positive and some newsletters are not systematic sector coverage. PDF search hits without readable exact quotation/date remain gaps; access failures do not prove absence or error. Separate same-turn reopens in supplied evidence confirm snapshot persistence only, not repeated publishing for months. No project files modified; local downloads only, no webpage publication or final cards.

### Unresolved And Failed Leads
- https://pdf.savills.asia/asia-pacific-research/singapore-research/singapore-industrial/singapore-industrial-briefing-q3-2025.pdf | webfetch returned raw PDF binary, not reliable readable text; search matches flat. Publication date and exact sentence unverified; not a confirmed stale hit.
- https://assets.cushmanwakefield.com/-/media/cw/marketbeat-pdfs/2025/q3/apac-and-gc/singapore-industrial-mb-3q2025.pdf?rev=ee2f22bcf3ef46b887016ebd95e732bc | Search lead only; not fetched or classified as factual error.
- https://www2.hl.com/pdf/2025/asia-pacific-real-estate-market-update-january-2026.pdf | Promising January 2026 PDF search lead; readable PDF evidence not obtained. Filename date insufficient alone.
- https://www.hrotoday.com/wp-content/uploads/2026/01/Global-Labor-Market-Report-3Q-2025-v1.pdf | Search lead and landing-page link verified; January upload path is not publication-date proof. Landing page header 19Nov2026 is site date, not article date. PDF statement not verified.
- https://www.amro-asia.org/wp-content/uploads/2025/12/2.-SG_ACR-2025_for-publication-latest-Dec-8.pdf | Search-only PDF lead. Possible historical vintage; no quote or classification of error invented.
- https://mkefactsettd.maybank-ke.com/PDFS/499734.pdf | Search title Singapore Economics - Defying Tariff Shocks; Upgrade GDP; not fetched. November 21 query discovery does not prove date.
- https://www.uobgroup.com/assets/web-resources/research/pdf/MN_251014.pdf | Search title Oct 2025 MPS; likely pre-cutoff but filename not accepted as on-page proof.
- https://www.reuters.com/world/asia-pacific/singapore-says-q3-gdp-grows-42-yy-upgrades-2025-forecast-2025-11-21/ | 401
- https://opengovasia.com/singapore-digital-economy-anchors-steady-gdp-growth/ | 403
- https://www.investing.com/news/economic-indicators/singapore-q3-gdp-beats-forecasts-but-growth-slows-as-manufacturing-stalls-4284683 | 403
- https://www.businesstoday.com.my/2025/10/14/singapore-gdp-expands-2-9-in-q3-slower-than-previous-quarter/ | 403
- https://www.icis.com/explore/resources/news/2025/10/14/11145715/singapore-q3-gdp-grows-2-9-on-year-stronger-than-expected | empty readable body
- https://www.icis.com/explore/resources/news/2025/11/21/11157946/singapore-raises-2025-gdp-growth-forecast-on-strong-semiconductor-demand | Incapsula incident response
- https://janicewongproperties.com/articles/953 | generic New launch projects in Singapore only
- https://sg.finance.yahoo.com/news/singapore-apos-business-activity-boosts-121548356.html | transport error
- https://sg.headtopics.com/news/singapore-economy-grows-2-9-in-q3-2025-defying-74356120 | 403
- https://theferrarigroup.com/global-wide-manufacturing-output-rises-marginally-in-september-2025/ | 403
- https://research.hktdc.com/en/article/MzIwNzUzMTE0 | JavaScript app shell only
- https://www.ifastgm.com.sg/igm/article/view/rcms315080/singapore-in-2025-riding-the-wave-of-strong-manufacturing-growth | iGM app shell only
- https://www.tradingview.com/news/te_news:492686:0-singapore-gdp-growth-slows-in-q3/ | 404
- https://www.reuters.com/world/asia-pacific/singapore-gdp-grows-59-yy-q2-government-raises-2026-forecast-ai-boom-2026-08-11/ | Fetch 401. Search title only, no verified sentence.
- https://finance.yahoo.com/economy/articles/singapore-gdp-grows-5-9-001158831.html | Fetch transport error.
- https://tradingeconomics.com/singapore/gdp-growth-annual/news/574221 | Fetch empty body.
- https://tradingeconomics.com/singapore/gdp-growth-annual | Fetch empty body.
- https://www.instagram.com/p/DbM6BSvCDjY/ | Fetch Instagram shell/images, no date or article text.
- https://assets.cushmanwakefield.com/-/media/cw/marketbeat-pdfs/2026/q3/apac-and-gc/singapore-industrial-mb-3q2026-final.pdf?rev=10ce07911a1049468d032a0dad4b7af2 | search-only PDF; not read/verified
- https://assets.cushmanwakefield.com/-/media/cw/marketbeat-pdfs/2026/q2/apac-and-gc/singapore-capital-markets-mb-2q2026.pdf?rev=7892950311a8453ebc22e82cb554f4b7 | search-only PDF; not read/verified
- https://www.mas.gov.sg/-/media/mas-media-library/monetary-policy/mas-survey-of-professional-forecasters/2026/survey-writeup-sep-2026-web.pdf | search-only PDF; not read/verified
- https://www.mas.gov.sg/-/media/mas-media-library/publications/macroeconomic-review/2026/oct/mroct26_chpt_3.pdf | search-only PDF; not read/verified
- https://www.dbs.com/insightsdirect/api/s3/dbs-buffer/article_attachment/20261026/09-50-17_261026_insights_weekly.pdf | search-only PDF; not read/verified
- https://www.dbs.com/insightsdirect/api/s3/dbs-buffer/article_attachment/20261019/10-24-24_261019_insights_weekly.pdf | search-only PDF; not read/verified
- https://www.ginniemae.gov/s3/sites/default/files/2026-09/global_market_analysis_aug26.pdf | search-only PDF; not read/verified
- https://www.nbcnewyork.com/news/business/money-report/singapores-economy-grows-4-3-in-second-quarter-beating-expectations/6334164/ | 403; no exact quote certified
- https://www.focus-economics.com/countries/singapore/news/gdp/singapore-national-accounts-22-05-2025-economic-growth-loses-traction-in-the-first-quarter/ | 403
- https://www.bssnews.net/business/291963 | 403
- https://www.nbcconnecticut.com/news/business/money-report/singapores-economy-grows-4-3-in-second-quarter-beating-expectations/3606464/ | 403
- https://sg.finance.yahoo.com/news/singapores-economy-expands-4-3-155834365.html | transport error
- https://borneobulletin.com.bn/singapore-economy-grows-5-7pc-in-q4/ | 403
- https://www.scribd.com/document/1008780986/DBS-250414-Insights-Singapore | fetched shell and AI description only; not certified
- https://isomer-user-content.by.gov.sg/166/cbda13af-78fe-408d-91fa-21f50825cdb5/FullReport_1Q26.pdf | download 403
- https://www.rlb.com/wp-content/uploads/sites/5/2026/09/WIP-SG-Reg-Report-Jun-2026_Compressed.pdf | webfetch binary not usable; downloaded 4070218-byte text PDF, 27 pages analyzed and extracted; no target sentence verified

## Demo Paragraph
Two concrete examples show why vintage-aware checks matter: IndexBox presented Q2 GDP at 5.9% in an update six days after it became 6.2%, while a construction trade article used Q1 growth of 11.8% 57 days after 12.9% was available. The latter attributes MTI without a dated vintage, so its stale classification depends on treating that as unqualified. These examples motivate a check, but do not establish widespread stale reporting, prevalence, or months of repeated publication.

## Query Appendix
Exact logged queries, compactly grouped. Search discovery alone does not establish quotation or date.

### Manufacturing (42 queries)
1. `Singapore Q3 2025 manufacturing 0.0 5.0 November 21`
2. `Singapore Q3 2025 manufacturing 4.6 2026`
3. `Singapore manufacturing Q3 2025 flat stalled November December`
4. `Singapore "manufacturing" "Q3 2025" "flat"`
5. `Singapore "manufacturing" "third quarter" "2025" "zero"`
6. `Singapore "manufacturing" "Q3 2025" "0.0"`
7. `Singapore manufacturing "flat" "December 2025" GDP`
8. `Singapore manufacturing "flat" "November 2025" GDP`
9. `Singapore "manufacturing" "Q3" "stalled" 2026`
10. `site:meti.gov.sg "2025" "third quarter" "5.0"`
11. `Singapore manufacturing "flat" "2026" "third quarter of 2025"`
12. `Singapore "manufacturing" "Q3 2025" "November 28"`
13. `Singapore "manufacturing" "Q3 2025" "December" bank`
14. `Singapore "manufacturing" "5.0 per cent" "21 November 2025"`
15. `Singapore "manufacturing" "4.6" "2025" "third"`
16. `Singapore "manufacturing" "stagnant" "2025" GDP`
17. `Singapore "manufacturing" "no growth" "2025"`
18. `Singapore "manufacturing" "flat" after:2025-11-21 GDP`
19. `Singapore "manufacturing" "0.0" after:2025-11-21`
20. `Singapore Q3 2025 manufacturing revised 5% November MTI`
21. `site:dbs.com Singapore "2025" "manufacturing" "flat"`
22. `"Singapore" "manufacturing" "flat" "Q3" consultancy 2025`
23. `"Singapore" "manufacturing" "stalled" after:2025-11-21`
24. `"Singapore" "manufacturing" "zero growth" "2025"`
25. `"Singapore" "manufacturing" "5.0" "November 21, 2025"`
26. `"Singapore" "Q3 2025" "flat" newsletter`
27. `Singapore "Q3 2025" manufacturing "flat" "2026" property`
28. `Singapore "Q3 2025" manufacturing "0%"`
29. `"manufacturing" "5.0" "third quarter" Singapore November 2025`
30. `"manufacturing" "4.6" "Q3 2025" Singapore`
31. `site:ocbc.com "2025" "manufacturing" "flat" Singapore`
32. `site:uobgroup.com "Nov" "2025" "manufacturing" "5.0"`
33. `"PR_3Q25.pdf" "manufacturing" "5.0"`
34. `"Singapore" "manufacturing" "third quarter of 2025" "5.0"`
35. `"Singapore" "manufacturing" "third quarter of 2025" "flat"`
36. `Singapore manufacturing "flat" "Q3" "December 2025"`
37. `Singapore manufacturing "flat" "Q3" "January 2026"`
38. `Singapore "manufacturing" "Q3 2025" "stagnated"`
39. `Singapore "manufacturing" "Q3 2025" "unchanged"`
40. `Singapore October 2025 manufacturing PMI 50 November 2025`
41. `Singapore manufacturing Q3 flat site:hl.com January 2026`
42. `Singapore manufacturing Q3 flat site:hrotoday.com 2025`

### GDP (15 queries)
1. `Singapore Q2 2026 GDP 5.7 5.9 6.2 revision`
2. `Singapore "2026" "GDP" "5.7" August September`
3. `Singapore "2026" "GDP" "5.9" October November`
4. `Singapore "2026" "GDP" "5.7" October November`
5. `Singapore "2026" "Q2" "6.2" GDP`
6. `Singapore "Q2 2026" "5.7%" September economy`
7. `Singapore "Q2 2026" "5.9%" November economy`
8. `Singapore "Q2 2026" "5.7" bank property report`
9. `Singapore "5.7" "2026" GDP September site:dbs.com`
10. `Singapore "5.9" "2026" GDP October property`
11. `Singapore GDP "5.7" "September 2026"`
12. `Singapore GDP "5.9" "November 2026"`
13. `Singapore GDP "5.7" "October 2026"`
14. `Singapore "5.7%" "2026" "September" GDP -instagram -facebook`
15. `Singapore "5.7%" "2026" "August" GDP -instagram -facebook`

### Top-five (19 queries)
1. `Singapore manufacturing first quarter 2025 "4.9"`
2. `Singapore manufacturing second quarter 2025 "5.5"`
3. `Singapore manufacturing fourth quarter 2025 "9.2"`
4. `Singapore construction first quarter 2026 "9.0"`
5. `Singapore construction first quarter 2026 "3.7"`
6. `Singapore "manufacturing" "4.9" "April 14, 2025"`
7. `Singapore "manufacturing" "5.5" "July 14, 2025"`
8. `Singapore "manufacturing" "9.2" "January 2026"`
9. `Singapore construction "13.5" "2026" GDP`
10. `Singapore construction "8.0" "2026" quarter`
11. `Singapore manufacturing "contracted by 4.9" 2025`
12. `Singapore manufacturing "10.5" "2025" GDP 2026`
13. `Singapore construction "3.7" "April" "2026" GDP growth`
14. `Singapore manufacturing "5.5" "July" "2025" grew`
15. `Singapore manufacturing "9.2" "2025" quarter growth`
16. `Singapore construction "9.0 per cent" "2026"`
17. `Singapore manufacturing "0.6" "2025" "quarter" 2026`
18. `Singapore manufacturing "9.2 per cent" fourth 2025`
19. `Singapore construction "3.7 per cent" "2026" growth`

## Validation
CSV round-trip: 48 rows; all URL fields preserved exactly and valid absolute HTTP(S) URLs; quotations round-trip exactly; source_evidence JSON parses; no duplicate URL + exact-sentence pairs. Categories total 48; stale lags deterministically recomputed from 2026-10-14 to 2026-10-20 and 2026-07-14 to 2026-09-09. No extra controls padded into the primary census.
