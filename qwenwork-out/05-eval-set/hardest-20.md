# The 20 hardest sentences — eval-set-150

Selected from the two reviewer disagreements, the reviewer's medium-confidence flags, and sentences where the answer turns on subtle wording rather than on looking up a number. These are the cases most likely to separate a careful agent from a keyword matcher.

---

### 1. c136 — "Services grew roughly 3.5% year-on-year in Q3 2025."
**Final: needs_human** (reviewer disagreed with author's now_wrong; reviewer upheld)
The official value moved 3.5 → 3.9. Is 3.9 "roughly 3.5"? The 0.4 pp drift sits between the set's clear cases (0.1 pp drift keeps "about 5%" true; 1.3 pp drift breaks "nearly 3%"). The answer is a tolerance judgement, not a lookup — and it must be made consistently with c138.

### 2. c148 — "Manufacturing is flat."
**Final: needs_human** (author disagreed with reviewer's now_wrong; author upheld)
Three words, no period, no vintage. Reading it as Q3 2025 makes it falsified (5.0%); reading it as a claim about the current quarter (Q4, no data yet) makes it unverifiable. The agent must recognise that the period itself is unresolvable instead of silently binding "is" to the latest observation.

### 3. c138 — "Construction expanded about 3% year-on-year in Q3 2025."
**Final: needs_human** (both passes agreed, both medium confidence)
3.1 → 3.6. "About 3%" stretched to 3.6 is the same tolerance dilemma as c136 with a larger drift. Both reviewers independently landed on needs_human, which is why it anchors the set's approximation rule.

### 4. c144 — "Construction grew 6.2% year-on-year in Q2 2025, outpacing manufacturing's 5.0%."
**Final: now_wrong**
The comparison the sentence is *about* survives (6.2 > 5.1), but it embeds an exact figure — manufacturing's 5.0% — that was restated to 5.1%. An agent that checks only the ranking calls this still_true; an agent that checks every asserted figure flags it. The set's rule: any falsified figure falsifies the sentence.

### 5. c145 — "Manufacturing grew faster in Q2 2025 than in Q3."
**Final: still_true**
Before revision: 5.0 > 0.0, comfortably true. After: 5.1 > 5.0, true by 0.1 pp. The claim survives, but barely — and a keyword agent sees "Q3" and "manufacturing" and assumes the headline revision broke it. Cross-period comparisons within the same revised series are a distinct failure mode.

### 6. c146 — "Q3 2025 was manufacturing's weakest quarter of the year so far."
**Final: now_wrong**
Requires ranking three quarters, two of which also moved (Q2 5.0 → 5.1). Revised Q3 (5.0%) now beats Q1 (4.8%), so Q1 is the weakest. The agent must recompute a superlative over a whole set of vintages, not just check the cited period.

### 7. c054 — "We expect manufacturing to remain flat for the rest of 2025."
**Final: needs_human**
Two readings compete: the forecast target (Q4) has no official data, so it is unverifiable; but "remain flat" presupposes Q3 was flat, and that presupposition is now false. The reviewer flagged exactly this tension. The set treats the sentence as a forecast about an unobserved period.

### 8. c055 — "Manufacturing is expected to stay flat in Q3 2025."
**Final: now_wrong**
A forecast about a period whose actual outturn is now known (5.0%). Present-tense expectations overtaken by fact must be corrected; the same sentence dated to October (c057) stays true. The pair tests whether the agent distinguishes a live expectation from a historical one.

### 9. c057 — "In October, we expected manufacturing to stay flat through year-end."
**Final: still_true**
Reports an expectation held in October. Expectations are not falsified by later data the way assertions are; the historical fact that "we expected" remains. Agents that treat every "flat" as now_wrong fail here.

### 10. c063 — "Economists said manufacturing stalled in Q3 2025."
**Final: needs_human**
Past-tense attribution with no anchor. If it reports reactions to the 14 Oct release, it is accurate history; if the author endorses the stall claim, it is now false. The series cannot tell which. Contrast c065, where "commenting on the October advance estimate" supplies the anchor and makes it still_true.

### 11. c068 — "Some strategists still argue that manufacturing is flat in Q3 2025."
**Final: needs_human**
"Still argue" reports a present opinion the data cannot verify, while the embedded proposition is demonstrably false. Whether to correct the sentence, annotate it, or leave it as reported opinion is an editorial decision — precisely what needs_human is for.

### 12. c087 — "Table 2: Q3 2025 year-on-year growth — manufacturing 0.0%, overall GDP 2.9% (advance estimates)."
**Final: still_true**
Identical figures to c088, which is now_wrong. The only difference is the parenthetical "(advance estimates)", which converts the caption into a dated report of a vintage. A two-word anchor flips the label — the cleanest test of vintage sensitivity in the set.

### 13. c089 — "Speaker note: Emphasise that manufacturing went nowhere in Q3 — the flat reading is the story."
**Final: now_wrong**
An instruction, not an assertion. Strictly, instructions have no truth value; but its premise ("the flat reading") is falsified and following it would publish an error. The set flags notes whose factual premise breaks, while c090 — a note attributing 0.0% to the 14 Oct release — stays true.

### 14. c093 — "Speaker note: Remember, manufacturing was flat in Q3, so don't oversell the industrial recovery."
**Final: now_wrong**
The revision inverts the note's advice: the recovery is now real (5.0%), so "don't oversell" built on flatness misleads. The agent must evaluate the premise and the pragmatic force of the instruction, not just match "flat".

### 15. c099 — "Manufacturing did not contract year-on-year in Q3 2025."
**Final: still_true**
0.0 → 5.0: neither value is a contraction, so the negation survives a 5-point revision. Agents that equate "any revision to a cited sentence = now_wrong" fail here; the assertion's truth conditions, not the cited value, decide.

### 16. c104 — "It is not the case that manufacturing was anything other than flat in Q3 2025."
**Final: now_wrong**
A double negative that reduces to "manufacturing was flat". The agent must normalise the logic before checking the data; surface matching sees "not … other than flat" and may misread it as hedged or negated growth.

### 17. c135 — "Manufacturing grew about 5% year-on-year in Q2 2025."
**Final: still_true**
5.0 → 5.1. The exact-figure twin (c024) is now_wrong, but the hedge absorbs a 0.1 pp restatement. The pair tests whether the agent distinguishes precision commitments: "5.0%" promises a decimal, "about 5%" does not.

### 18. c142 — "Construction output declined on a seasonally adjusted quarter-on-quarter basis in Q3 2025."
**Final: still_true**
The decline was revised from −1.2% to −0.7% — a 0.5 pp change in a cited series — yet "declined" remains true because the sign survived. Directional claims on revised values need sign/range checks, not value equality.

### 19. c143 — "Manufacturing rebounded strongly on the quarter in Q3 2025."
**Final: still_true**
The q-o-q rebound was revised *upward*, 6.1% → 11.3%. The revision strengthens rather than falsifies the claim. Agents must check the direction of the revision against the assertion's semantics: a bigger rebound is still a rebound.

### 20. c034 — "Manufacturing grew faster than services in Q1 2025."
**Final: still_true**
Services Q1 was revised (3.8 → 3.7) but manufacturing's 4.8% lead survives. The comparison involves a revised series yet remains true — the mirror image of c027, where the same wording about Q3 flips. The agent must recompute the ordering with new values instead of pattern-matching "revised series → wrong".