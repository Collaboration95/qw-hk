"""Conservative text-to-claim rules. Unknown predicates require an editor or agent."""
import calendar
import operator
import re

from .storage import visible

PERCENT = re.compile(r"(?<![\w.])([+−-]?\d+(?:\.\d+)?)\s*(?:%|per\s*cent\b|percent\b)", re.I)
PERSONS = re.compile(r"(?<![\w.,])([+−-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s+(?:people|persons|jobs|workers)\b", re.I)
MONTH_PATTERN = "|".join(calendar.month_name[1:] + calendar.month_abbr[1:])
DATED = re.compile(
    r"\b(?:as (?:first|initially|originally) (?:reported|published|estimated)|"
    r"(?:first|initially|originally) (?:reported|estimated|published|put)|"
    r"(?:advance|preliminary|initial|first) (?:release|estimate|reading|report)s?|"
    r"at the time|as (?:reported|published) (?:in|on)|"
    rf"(?:{MONTH_PATTERN}) (?:report|release|estimate|survey)\b|"
    rf"in (?:{MONTH_PATTERN})[,]? (?:the ministry|MTI|METI|SingStat) (?:said|reported|estimated)|"
    rf"according to (?:MTI|METI|SingStat) in (?:{MONTH_PATTERN})|"
    r"according to (?:the )?\w+(?:'s|’s) (?:release|report))\b", re.I)
DIRECTIONS = {
    "flat": r"(?:stood still|stalled|stagnated|(?:was |remained |stayed )?(?:flat|unchanged)|zero growth|no (?:year[- ]on[- ]year |quarter[- ]on[- ]quarter )?growth)",
    "up": r"(?:grew|rose|increased|expanded|climbed|positive growth|strong growth|growth was positive)",
    "down": r"(?:fell|declined|decreased|contracted|shrank|negative growth|growth was negative)",
}
THRESHOLDS = {
    "<=": r"no (?:more|higher) than|at most|not (?:above|over)",
    ">=": r"no (?:less|lower) than|at least|not (?:below|under)",
    "<": r"under|below|less than|lower than",
    ">": r"over|above|more than|greater than|higher than|exceeded",
}
OPERATORS = {"<": operator.lt, "<=": operator.le, ">": operator.gt, ">=": operator.ge}
THRESHOLD = re.compile(r"\b(" + "|".join(THRESHOLDS.values()) +
                       r")\s+([−+-]?\d+(?:\.\d+)?)\s*(?:%|per\s*cent\b|percent\b)", re.I)
MONTHS = {name.lower(): i for i in range(1, 13)
          for name in (calendar.month_name[i], calendar.month_abbr[i])}
ORDINAL = {"first": 1, "second": 2, "third": 3, "fourth": 4, "1st": 1, "2nd": 2, "3rd": 3, "4th": 4}
VERDICTS = ("now_wrong", "number_only", "still_true", "unaffected")
ASSERTIONS = ("direction", "threshold", "level", "comparison", "rank")


def norm(text):
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def periods_in(text, possible):
    quarters = set(re.findall(r"\b[qQ]([1-4])\b|\b([1-4])[qQ]\b", text))
    nums = {int(a or b) for a, b in quarters}
    nums.update(ORDINAL[n.lower()] for n in re.findall(
        r"\b(first|second|third|fourth|1st|2nd|3rd|4th)\s+quarter\b", text, re.I))
    for q, (first, last) in enumerate(((1, 3), (4, 6), (7, 9), (10, 12)), 1):
        start = f"(?:{calendar.month_name[first]}|{calendar.month_abbr[first]})"
        end = f"(?:{calendar.month_name[last]}|{calendar.month_abbr[last]})"
        if re.search(rf"\b{start}\s*(?:to|through|[-–—])\s*{end}\b", text, re.I):
            nums.add(q)
    years = set(re.findall(r"\b(?:19|20)\d{2}\b", text))
    if nums:
        return [p for p in possible if re.fullmatch(r"\d{4}-Q[1-4]", p)
                and int(p[-1]) in nums and (not years or p[:4] in years)]
    months = {MONTHS[w] for w in norm(text).split() if w in MONTHS}
    if months:
        matched = [p for p in possible if re.fullmatch(r"\d{4}-\d{2}", p)
                   and int(p[-2:]) in months and (not years or p[:4] in years)]
        if matched:
            return matched
    direct = [p for p in possible if re.search(r"(?<!\w)" + re.escape(p) + r"(?!\w)", text, re.I)]
    if direct:
        return direct
    return [p for p in possible if not years or p[:4] in years]


def series_score(sentence, series):
    """Use specific sector names before broad terms such as GDP."""
    words = set(norm(sentence).split())
    ident = norm(series["series_id"])
    title = norm(series["title"])
    specific = set(ident.split() + title.split()) - set(
        "sg singapore real nominal gdp gross domestic product growth rate total overall economy "
        "quarter quarterly year yoy qoq seasonally adjusted on year over and the of at in prices chained value added by "
        "percentage change percent per cent sector industry industries output index month monthly mom".split())
    score = 0
    for token in specific:
        forms = {token, token.rstrip("s")}
        if any(f and (f in words or f + "s" in words) for f in forms):
            score += 10
    for alias in series.get("aliases", []):
        if len(norm(alias)) >= 3 and f" {norm(alias)} " in f" {norm(sentence)} ":
            score = max(score, 12 + len(norm(alias).split()))
    if not specific or any(term in ident.split() for term in ("total", "overall")):
        if words & {"gdp", "economy"} or "gross domestic product" in norm(sentence):
            score = max(score, 3)
    return score


def link_series(sentence, context, archive):
    measure = norm(sentence)
    basis = None
    if re.search(r"\b(?:quarter (?:on|over) quarter|qoq|q q|from one quarter to the next|previous quarter|preceding quarter|sequential(?:ly)?|seasonally adjusted)\b", measure):
        basis = "qoq"
    elif re.search(r"\b(?:year (?:on|over) year|yoy|y y|year earlier|annual growth)\b", measure):
        basis = "yoy"
    if basis:
        archive = {k: v for k, v in archive.items()
                   if not k.endswith(("-qoq", "-yoy")) or k.endswith("-" + basis)}
    for text in (sentence, context):
        scores = {sid: series_score(text, series) for sid, series in archive.items()}
        best = max(scores.values(), default=0)
        if best:
            winners = [sid for sid, score in scores.items() if score == best]
            return winners[0] if len(winners) == 1 else None
    return next(iter(archive)) if len(archive) == 1 else None


def infer_assertion(sentence):
    lower = sentence.lower()
    thresholds = list(THRESHOLD.finditer(lower))
    if re.search(r"\b(?:forecast|expected|projected|could|might|will|nearly|almost|missed|targeted)\b|n[’']t\b", lower):
        return {"type": "level", "detail": "needs_review"}
    if len(thresholds) == 1:
        m = thresholds[0]
        op = next(op for op, words in THRESHOLDS.items() if re.fullmatch(words, m[1]))
        if not re.search(r"\b(?:not|never|barely|nearly|almost)\s+(?:stay\w*\s+)?$", lower[:m.start()]):
            return {"type": "threshold", "detail": m[0], "operator": op, "threshold": float(m[2].replace("−", "-"))}
    if re.search(r"\b(?:fastest|slowest|highest|lowest|largest|smallest|ranked|leading|last place)\b", lower):
        return {"type": "rank", "detail": "peer values needed"}
    if re.search(r"\b(?:than|compared|outpaced|outgrew|overtook|stronger|faster|slower|accelerated|decelerated|"
                 r"rebounded|recovered|outperformed|weaker|doubled|halved)\b", lower):
        return {"type": "comparison", "detail": "comparison baseline needed"}
    unknown = {"type": "level", "detail": "needs_review"}
    if thresholds or re.search(r"\b(?:not|never|nearly|almost|forecast|expected|projected|could|may|might|will)\b", lower):
        return unknown
    signs = [direction for direction, pat in DIRECTIONS.items() if re.search(r"\b" + pat + r"\b", lower)]
    if signs and re.search(r"\b(?:rose|fell|climbed|grew|declined|increased|decreased) to\b", lower):
        return {"type": "comparison", "detail": "previous level needed"}
    if len(signs) == 1:
        return {"type": "direction", "detail": signs[0]}
    if not signs and len(measurements(lower)) == 1:
        return {"type": "level", "detail": "reported figure"}
    return unknown


def sign(value):
    return "up" if value > 0 else "down" if value < 0 else "flat"


def numeric(text):
    return float(text.replace(",", "").replace("−", "-"))


def measurements(text):
    return sorted([*PERCENT.finditer(text), *PERSONS.finditer(text)], key=lambda m: m.start())


def measured_values(sentence):
    text = THRESHOLD.sub("", sentence)
    return [numeric(m[1]) for m in measurements(text)]


def cited_vintage(vintages, sentence, assertion, dated):
    if not vintages:
        return None
    if dated:
        if assertion["type"] in ("comparison", "rank") or assertion.get("detail") == "needs_review":
            return None
        # Resolve the named edition before comparing its number. Searching by
        # value first can mistake a later survey for the advance estimate.
        if re.search(r"\b(?:first|initial|initially|originally|advance|preliminary)\b", sentence, re.I):
            vintages = vintages[:1]
    amounts = measured_values(sentence)
    if len(amounts) == 1:
        val = amounts[0]
        if assertion.get("detail") == "down" and val > 0:
            val = -val
        matches = [v for v in vintages if v["value"] == val]
    elif len(amounts) > 1:
        return None
    elif assertion["type"] == "direction":
        matches = [v for v in vintages if sign(v["value"]) == assertion["detail"]]
    elif assertion["type"] == "threshold" and assertion.get("operator") in OPERATORS:
        matches = [v for v in vintages if OPERATORS[assertion["operator"]](v["value"], assertion["threshold"])]
    else:
        matches = vintages
    if dated:
        # The named release month is evidence about publication, not the observation period.
        month_names = "|".join(MONTHS)
        month = re.search(rf"\bin ({month_names})(?=,? (?:MTI|METI|SingStat|the ministry)\b)|"
                          rf"according to (?:MTI|METI|SingStat) in ({month_names})\b|"
                          rf"\b({month_names})(?= (?:advance|initial|preliminary|release|report|survey|estimate))|"
                          rf"(?:reported|published) in ({month_names})\b", sentence, re.I)
        if month:
            number = MONTHS[next(m for m in month.groups() if m).lower()]
            matches = [v for v in matches if int(v["published"][5:7]) == number]
    if assertion["type"] == "direction":
        matches = [v for v in matches if sign(v["value"]) == assertion["detail"]]
    if assertion["type"] == "threshold" and assertion.get("operator") in OPERATORS:
        matches = [v for v in matches if OPERATORS[assertion["operator"]](v["value"], assertion["threshold"])]
    if not matches:
        return None
    return matches[0] if dated and re.search(r"\b(first|initial|initially|advance|originally)\b", sentence, re.I) else matches[-1]


def review_reason(sentence):
    lower = sentence.lower()
    # Strip only the negation belonging to a recognized inclusive bound.
    remainder = THRESHOLD.sub("", lower)
    if "?" in sentence or re.search(
        r"\b(?:not|never|no longer|without|if|unless|would|should|might|may|could|will|"
        r"likely|unlikely|perhaps|possibly|forecast\w*|predict\w*|expect\w*|projected|"
        r"roughly|almost|barely|nearly|about to|nowhere near|wrong about)\b|n[’']t\b", remainder
    ):
        return "Check the qualification or comparison in this sentence before changing it."
    if re.search(r"\b(?:fiscal|financial year|fy\s*\d+|percentage points?|percent points?|basis points?|bps)\b", lower):
        return "Confirm the reporting period and unit against the source."
    if re.search(r"[一-鿿ぁ-ヿ가-힣]", sentence):
        return "Read the full sentence in its original language before changing it."
    if re.search(r"\b(?:quarter (?:on|over) quarter|qoq)\b", norm(lower)) and re.search(
            r"\b(?:year (?:on|over) year|yoy)\b", norm(lower)):
        return "This sentence uses both annual and quarterly figures. Check each separately."
    if len(measurements(THRESHOLD.sub("", lower))) > 1 or len(THRESHOLD.findall(lower)) > 1:
        return "This sentence contains several figures or limits. Check which assertion each supports."
    return None


def wording_reason(sentence, series):
    """Approve familiar statistical clauses; leave additional subject matter visible for review."""
    words = norm(sentence)
    if re.search(r"\b(?:said|reported|according to|estimate|release|report|survey)\b", words) and not DATED.search(sentence):
        return "Identify the release being quoted before changing this sentence."
    if not series_score(sentence, series):
        return "The sentence does not name the series. Check its subject in the surrounding text."
    if re.search(r"\b(?:growth rate|rate of growth) (?:was|remained|stayed) (?:flat|unchanged)\b", words):
        return "An unchanged growth rate compares two rates. Check the earlier rate."
    if series["series_id"].startswith("sg-gdp-") and re.search(r"\b(?:end|start|most|part) of\b", words):
        return "This figure covers the whole quarter. Check the shorter period in the sentence."
    if re.search(r"\b(?:since|after|before|despite|unlike) (?:the )?(?:advance|initial|first|preliminary)\b", words):
        return "The release is a point of comparison. Check what the sentence says about it."
    # Remove whole recognized expressions before checking the remaining words.
    # An extra noun (e.g. orders) changes what series the sentence describes.
    text = DATED.sub(" ", sentence.lower())
    text = THRESHOLD.sub(" ", text)
    text = PERCENT.sub(" ", text)
    text = PERSONS.sub(" ", text)
    for pattern in DIRECTIONS.values():
        text = re.sub(r"\b" + pattern + r"\b", " ", text)
    tokens = set(re.findall(r"[a-z]+", text))
    vocabulary = set("""singapore s gdp real gross domestic product economy output sector overall total
        growth rate level grew was were is at by in the of a an and from to on over for
        first second third fourth st nd rd th quarter year q yoy qoq seasonally adjusted
        annual quarterly same period earlier previously figure release ministry mti meti singstat
        said reported estimated showed put stood recorded records chart table reading
        remained stayed exactly equal result end
        month months through per cent percent zero
        compared than slower lower weaker faster higher stronger ranked
        doubled halved outpaced barely moved""".split())
    vocabulary.update(MONTHS)
    vocabulary.update(norm(series["title"] + " " + " ".join(series.get("aliases", []))).split())
    unknown = tokens - vocabulary
    if unknown:
        return "Check the subject and wording against the source before changing this sentence."
    return None


def extract(sentence, context, archive, day):
    assertion = infer_assertion(sentence)
    if (assertion["detail"] == "needs_review" and not measurements(sentence)
            and not any(re.search(r"\b" + pat + r"\b", sentence, re.I) for pat in DIRECTIONS.values())
            and not re.search(r"\b(?:growth|doubled|halved|surged|plunged|edged|barely moved)\b", sentence, re.I)):
        return None, None
    reason = review_reason(sentence)
    if reason:
        return None, reason
    sid = link_series(sentence, context, archive)
    if sid is None:
        return None, "Choose the official series that this sentence describes."
    series = archive[sid]
    reason = wording_reason(sentence, series)
    if reason:
        return None, reason
    possible = [obs["period"] for obs in series["observations"] if visible(series, obs["period"], day)]
    periods = periods_in(sentence, possible)
    comparison = re.search(r"\b(slower|lower|weaker|faster|higher|stronger) than (?:in )?(.+)", sentence, re.I)
    if assertion["type"] == "comparison" and comparison:
        primary = periods_in(sentence[:comparison.start()], possible)
        if len(primary) == 1:
            periods = primary
            other = periods_in(comparison[2], possible)
            if len(other) > 1:
                other = [p for p in other if p[:4] == periods[0][:4]]
            if len(other) == 1 and other != primary:
                peer = visible(series, other[0], day)[-1]
                assertion.update(operator="<" if comparison[1].lower() in ("slower", "lower", "weaker") else ">",
                                 reference={"series_id": sid, "period": other[0], "value_cited": peer["value"],
                                            "vintage_cited": peer["published"]})
    if len(periods) > 1 and not re.search(r"\b(?:q[1-4]|[1-4]q|quarter|20\d\d)\b", sentence, re.I):
        periods = periods_in(context, periods)
    elif len(periods) > 1 and len({p[-2:] for p in periods}) == 1:
        periods = periods_in(context, periods)
    if len(periods) != 1:
        return None, "Check which period this sentence describes and whether a figure had been published."
    period = periods[0]
    dated = bool(DATED.search(sentence))
    vintage = cited_vintage(visible(series, period, day), sentence, assertion, dated)
    if not vintage:
        return None, "The published figures do not confirm this number or wording."
    return dict(series_id=sid, period=period, value_cited=vintage["value"], vintage_cited=vintage["published"],
                stance="dated" if dated else "current", assertion=assertion), None


def evaluate(claim, new, peer=None):
    old = claim["value_cited"]
    if claim["stance"] == "dated":
        return "still_true", f"The release of {claim['vintage_cited']} reported {old}. The sentence still describes that release correctly."
    a = claim["assertion"]
    if old != new and re.search(r"\b(?:exactly|equal to)\b", claim["sentence"], re.I) and measured_values(claim["sentence"]):
        return "now_wrong", f"The sentence gives an exact figure of {old}. The revised figure is {new}."
    if a["type"] == "comparison" and peer is not None and a.get("operator") in OPERATORS:
        op = a["operator"]
        other = a["reference"]
        if OPERATORS[op](old, other["value_cited"]):
            holds = OPERATORS[op](new, peer)
            relation = "still holds" if holds else "no longer holds"
            return ("number_only" if holds else "now_wrong",
                    f"The comparison {relation}. The figure for {claim['period']} is {new}, and the figure for {other['period']} is {peer}.")
    if old == new and peer is None:
        return "still_true", f"The latest revision returns to the cited value {old}."
    if a["type"] == "threshold" and a.get("operator") in OPERATORS and isinstance(a.get("threshold"), (int, float)):
        op, bound = a["operator"], a["threshold"]
        relation = {"<": "below", "<=": "at most", ">": "above", ">=": "at least"}[op]
        if OPERATORS[op](old, bound):
            if OPERATORS[op](new, bound):
                return "number_only", f"The figure changed from {old} to {new}. Both readings are {relation} {bound}."
            return "now_wrong", f"The original figure of {old} was {relation} {bound}. The revised figure of {new} falls outside that limit."
    if a["type"] == "direction" and a["detail"] == sign(old):
        if sign(old) != sign(new):
            return "now_wrong", f"The original figure was {old} ({sign(old)}). The revised figure is {new} ({sign(new)})."
        if re.search(r"\bstrong growth\b", claim["sentence"], re.I) and new < old:
            return "needs_review", f"Growth remains positive at {new}. The sentence gives no cutoff for strong growth."
        return "number_only", f"The figure moves from {old} to {new} and the direction remains {sign(new)}."
    if a["type"] == "level" and a.get("detail") != "needs_review" and measured_values(claim["sentence"]) == [old]:
        return "number_only", f"The sentence reports a level. Update its figure from {old} to {new}."
    return "needs_review", f"The figures {old} and {new} alone cannot settle this claim. Check the wording and its supporting evidence."


def replacement(claim, series, new, status):
    sentence = claim["sentence"]
    old, unit = claim["value_cited"], series["unit"]
    formatted = str(float(new))
    if status == "number_only":
        bounds = [m.span() for m in THRESHOLD.finditer(sentence)]
        for m in measurements(sentence):
            if any(l <= m.start() < r for l, r in bounds):
                continue
            amount = numeric(m[1])
            if amount == old or (amount == -old and claim["assertion"].get("detail") == "down"):
                figure = str(abs(float(new))) if amount == -old and old < 0 else formatted
                if unit == "persons":
                    figure = f"{float(figure):,.0f}"
                return sentence[:m.start(1)] + figure + sentence[m.end(1):]
        if claim["assertion"]["type"] == "threshold":
            return f"{sentence.rstrip('.!?')} ({formatted}{unit})."
    if claim["assertion"].get("detail") == "flat" and not measured_values(sentence):
        pat = r"\b(?:stalled|stagnated|stood still|(?:was|remained|stayed) (?:flat|unchanged))\b"
        revised = re.sub(pat, ("grew" if new > 0 else "fell") + f" {abs(float(new))}{unit}", sentence, count=1, flags=re.I)
        if revised != sentence:
            return revised
    period = re.sub(r"(\d{4})-(Q[1-4])", r"\2 \1", claim["period"])
    if claim["series_id"].startswith("sg-gdp-"):
        label = series["title"].split(",")[0]
        subject = "Singapore’s real GDP" if label == "Overall" else f"{label} output"
        basis = "quarter on quarter, seasonally adjusted" if claim["series_id"].endswith("-qoq") else "year on year"
        verb = "grew" if new > 0 else "fell"
        if new == 0:
            return f"{subject} was flat in {period} ({basis})."
        return f"{subject} {verb} {abs(float(new))}% in {period} ({basis})."
    gap = "" if unit == "%" else " "
    return f"{series['title']} was {formatted}{gap}{unit} in {period}."
