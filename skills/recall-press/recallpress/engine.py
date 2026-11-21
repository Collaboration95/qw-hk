import hashlib
import html
import json
import runpy
import tempfile
from datetime import datetime
from pathlib import Path

from .documents import make_copy
from .registration import read_register
from .rules import VERDICTS, evaluate, replacement
from .storage import ROOT, fingerprint, load, safe_id, save, visible

FIXABLE = ("number_only", "now_wrong")


def timestamp():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def claim_key(claim, doc):
    key = [doc["sha256"], claim["document_id"], claim["claim_id"], claim["anchor"], claim["sentence"],
           claim["series_id"], claim["period"], claim["vintage_cited"], claim["stance"], claim["assertion"]]
    return hashlib.sha256(json.dumps(key, sort_keys=True).encode()).hexdigest()


def observations(claim):
    yield claim
    if claim["assertion"].get("reference"):
        yield claim["assertion"]["reference"]


def revision(series, link, day, previous):
    vintages = visible(series, link["period"], day)
    cited = next((v for v in vintages if v["published"] == link["vintage_cited"]), None)
    if cited is None or cited["value"] != link["value_cited"]:
        raise ValueError(f"Missing or conflicting vintage for {series['series_id']} {link['period']}")
    # Identify a revision by when the value actually changed. A later release
    # repeating that figure must resolve to the same event even if replayed backwards.
    current = cited
    for v in vintages:
        if v["published"] > cited["published"] and v["value"] != current["value"]:
            current = v
    earlier = [v for v in vintages if v["published"] in previous and v["published"] < current["published"]]
    old = earlier[-1] if earlier else cited
    change = dict(series_id=series["series_id"], period=link["period"], old=old["value"], new=current["value"],
                  old_published=old["published"], new_published=current["published"], url=current["url"],
                  old_release=old["release"], new_release=current["release"], title=series["title"],
                  unit=series["unit"], source=series["source"], evidence=current)
    return change, current["published"] in previous


def check(workspace, archive, day, trigger, replay, record=False, context=None):
    started = timestamp()
    register = read_register(workspace)
    docs = {d["document_id"]: d for d in register["documents"] if d["registered"] <= day}
    claims = [c for c in register["claims"] if c["document_id"] in docs]
    # Committed run records ARE the issuance ledger. Atomic publication of the
    # single result records both the revision and every claim it was issued for.
    ledger, previous_decisions = {}, {}
    for path in sorted((workspace / "runs").glob("*/result.json")):
        prior = load(path)
        decisions = {v["claim_id"]: v.get("decision") for v in prior["verdicts"]}
        for event in prior["issued"]:
            previous_decisions[event["key"], event["published"]] = decisions.get(event["claim_id"])
            ledger.setdefault(event["key"], {})[event["published"]] = event["value"]
    changes, verdicts, issued = {}, [], []
    for claim in claims:
        key = claim_key(claim, docs[claim["document_id"]])
        figures, affected, fresh, skipped = [], [], [], False
        for index, ref in enumerate(observations(claim)):
            sid, period = ref["series_id"], ref["period"]
            event_key = key if index == 0 else f"{key}/{sid}/{period}"
            figure, seen = revision(archive[sid], ref, day, ledger.get(event_key, {}))
            figures.append(figure)
            if figure["new"] != figure["old"]:
                affected.append(figure)
                if seen and previous_decisions.get((event_key, figure["new_published"])) == "skipped":
                    skipped = True
                if not seen:
                    changes[(sid, period)] = figure
                    fresh.append({"key": event_key, "claim_id": claim["claim_id"],
                                  "published": figure["new_published"], "value": figure["new"]})
        issued.extend(fresh)
        already = bool(affected and not fresh)
        if affected and not already:
            status, reason = evaluate(claim, figures[0]["new"], figures[1]["new"] if len(figures) > 1 else None)
        else:
            status, reason = "unaffected", f"No change to the linked figures for {claim['period']}."
        if already:
            reason = "No new revision. The earlier check already recorded this change."
        review = status == "needs_review"
        verdicts.append({"claim_id": claim["claim_id"], "status": "unchecked" if review else status,
                         "reason": ("Needs review. " if review else "") + reason, "decided_by": "rule",
                         "rule_status": status, "rule_reason": reason, "needs_review": review,
                         "figures": figures, "already_issued": already, "previously_skipped": already and skipped, "decision": "pending"})
    result = dict(started=started, finished=timestamp(), trigger=trigger, as_of=day, replay=replay,
                  series_checked=len({r["series_id"] for c in claims for r in observations(c)}), changes=list(changes.values()),
                  verdicts=verdicts, no_change=not issued, unlinked_count=sum(len(d.get("unlinked", [])) for d in docs.values()))
    if context:
        sid, period = context
        series = archive[sid]
        vintages = visible(series, period, day)
        if not vintages:
            raise ValueError(f"No published figure for {sid}, {period} as of {day}")
        result["context"] = dict(series_id=sid, title=series["title"], period=period, unit=series["unit"],
                                 vintage=vintages[-1], linked=any(
                                     ref["series_id"] == sid and ref["period"] == period
                                     for claim in claims for ref in observations(claim)))
    if not issued:
        result["message"] = f"Checked {result['series_checked']} series, no new revision."
        if not record:
            return result
    snapshot = {"documents": list(docs.values()), "claims": claims}
    identity = issued if issued else ["quiet", trigger, replay, snapshot, verdicts]
    if context:
        identity = [identity, result["context"]]
    digest = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()[:12]
    result["run_id"] = f"{day}-{digest}"
    path = result_path(workspace, result["run_id"])
    if path.exists():
        return load(path)
    result["issued"] = issued
    result["register_snapshot"] = snapshot
    save(path, result)
    return result


def result_path(workspace, run):
    return workspace / "runs" / safe_id(run) / "result.json"


def find(items, field, key):
    for item in items:
        if item[field] == key:
            return item
    raise ValueError(f"Unknown {field} {key!r}")


def judge(workspace, run, claim_id, status, reason, proposed=None):
    path = result_path(workspace, run)
    result = load(path)
    verdict = find(result["verdicts"], "claim_id", claim_id)
    claim = find(result["register_snapshot"]["claims"], "claim_id", claim_id)
    if not reason.strip() or status not in (*VERDICTS, "unchecked"):
        raise ValueError("A verdict and a nonempty reason are required")
    if verdict["already_issued"]:
        raise ValueError("This revision already belongs to an earlier run")
    disagreement = status != verdict["rule_status"]
    blocked = status in FIXABLE and (claim["stance"] == "dated" or verdict["rule_status"] == "unaffected")
    effective = verdict["rule_status"] if blocked else status
    detail = verdict["rule_reason"] if blocked else reason.strip()
    labels = {"now_wrong": "the claim needs a correction", "number_only": "only the number changed",
              "still_true": "the claim still holds", "unaffected": "the figure has no new revision",
              "unchecked": "a reader needs to check", "needs_review": "a reader needs to check"}
    if disagreement:
        detail += f" Editor review: the rule says {labels[verdict['rule_status']]}. The agent says {labels[status]}. {reason.strip()}" if blocked else f" Editor review: the rule says {labels[verdict['rule_status']]}. {verdict['rule_reason']}"
    old_edit = (verdict["status"], verdict.get("agent_replacement"))
    verdict.update(status=effective, reason=detail, decided_by="rule" if blocked else "agent",
                   agent_status=status, agent_reason=reason.strip(), disagreement=disagreement,
                   needs_review=disagreement or status == "unchecked", agent_replacement=proposed if effective in FIXABLE else None)
    if old_edit != (effective, verdict["agent_replacement"]):
        verdict.pop("editor_replacement", None)
        obsolete = verdict.pop("replacement_file", None)
        verdict.pop("replacement_sentence", None)
        verdict["decision"] = "pending"
    else:
        obsolete = None
    save(path, result)
    if obsolete:
        (workspace / obsolete).unlink(missing_ok=True)
    (path.parent / "map.html").unlink(missing_ok=True)
    return verdict


def stage_copy(workspace, path, reg, claim, verdict, scratch):
    doc = find(reg["documents"], "document_id", claim["document_id"])
    original = Path(doc["path"])
    change = verdict["figures"][0]
    wording = verdict.get("editor_replacement") or verdict.get("agent_replacement")
    sentence = wording or replacement(claim, change, change["new"], verdict["status"])
    if not wording and len(verdict["figures"]) == 2:
        reference = verdict["figures"][1]
        sentence = (f"{change['title']} was {change['new']}{change['unit']} in {change['period']}, "
                    f"compared with {reference['new']}{reference['unit']} in {reference['period']}.")
        if verdict["status"] == "number_only":
            sentence = (f"{claim['sentence'].rstrip('.')} "
                        f"({change['new']}{change['unit']} versus {reference['new']}{reference['unit']}).")
    gap = "" if change["unit"] == "%" else " "
    source = f"Source: {change['title']}, {claim['period']}, {change['new']}{gap}{change['unit']} · {change['new_release']} · {change['new_published']}"
    if len(verdict["figures"]) == 2:
        peer = verdict["figures"][1]
        source += f" · {peer['period']}: {peer['new']}{gap}{peer['unit']}, {peer['new_release']}, {peer['new_published']}"
    target = path.parent / "out" / safe_id(claim["claim_id"]) / original.name
    if verdict.get("editor_replacement"):
        version = hashlib.sha256(sentence.encode()).hexdigest()[:16]
        target = target.parent / ("edit-" + version) / original.name
    if fingerprint(original) != doc["sha256"]:
        raise ValueError(f"{original.name} changed after registration; register the new edition first")
    staged = None
    if verdict.get("replacement_sentence") != sentence or not target.is_file():
        staged = scratch / safe_id(claim["claim_id"]) / original.name
        staged.parent.mkdir()
        make_copy(original, staged, claim, sentence, source)
    verdict.update(replacement_sentence=sentence, replacement_file=str(target.relative_to(workspace)), source_line=source)
    return staged, target


def save_drafts(workspace, path, result, verdicts):
    reg = result["register_snapshot"]
    prepared, obsolete = [], []
    with tempfile.TemporaryDirectory(dir=path.parent) as tmp:
        for verdict in verdicts:
            if verdict["status"] not in FIXABLE or verdict["already_issued"]:
                continue
            claim = find(reg["claims"], "claim_id", verdict["claim_id"])
            if claim["stance"] == "dated":
                continue
            previous = verdict.get("replacement_file")
            prepared.append(stage_copy(workspace, path, reg, claim, verdict, Path(tmp)))
            if previous and previous != verdict["replacement_file"]:
                obsolete.append(workspace / previous)
        # New editor wording has its own destination. Keep existing downloads valid
        # until every original has been checked and all requested files are ready.
        for staged, target in prepared:
            if staged:
                target.parent.mkdir(parents=True, exist_ok=True)
                staged.replace(target)
        save(path, result)
    for old in obsolete:
        old.unlink(missing_ok=True)
    return len(prepared)


def fix(workspace, run):
    path = result_path(workspace, run)
    result = load(path)
    count = save_drafts(workspace, path, result, result["verdicts"])
    return {"run_id": run, "replacement_files": count, "result": str(path)}


def decide(workspace, run, claim_id, choice):
    path = result_path(workspace, run)
    result = load(path)
    v = find(result["verdicts"], "claim_id", claim_id)
    if choice == "apply" and (v["status"] not in FIXABLE or not v.get("replacement_file") or v["already_issued"]):
        raise ValueError("There is no replacement file to apply")
    v["decision"] = {"apply": "applied", "skip": "skipped"}[choice]
    save(path, result)
    return v


def render_map(workspace, run):
    path = result_path(workspace, run)
    result = load(path)
    out = path.parent / "map.html"
    renderer = ROOT / "web" / "render_map.py"
    if renderer.is_file():
        runpy.run_path(str(renderer))["render"](path, workspace / "register.json", out)
    else:
        rows = []
        for verdict in result["verdicts"]:
            claim = find(result["register_snapshot"]["claims"], "claim_id", verdict["claim_id"])
            fields = (claim["document_id"], claim["sentence"], verdict["status"], verdict["reason"],
                      verdict.get("replacement_sentence", ""), verdict["decision"])
            rows.append("<tr>" + "".join(f"<td>{html.escape(s)}</td>" for s in fields) + "</tr>")
        out.write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Recall Press</title>'
                       f'<h1>Recall Press</h1><p>{"Historical replay" if result["replay"] else "Publication check"} · {result["as_of"]}</p>'
                       '<table><tr><th>Document<th>Published sentence<th>Verdict<th>Reason<th>Replacement<th>Decision</tr>'
                       + "".join(rows) + "</table></html>", encoding="utf-8")
    return {"map": str(out)}
