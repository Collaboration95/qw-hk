import argparse
import json
import os
import sys
from datetime import date
from pathlib import Path
from zipfile import BadZipFile

from . import engine
from .live import observed_today, refresh
from .registration import read_register, register
from .rules import VERDICTS
from .storage import ROOT, iso, locked, read_series


def parser():
    cli = argparse.ArgumentParser(description="Register a publication and trace corrections to official figures.")
    sub = cli.add_subparsers(dest="command", required=True)
    reg = sub.add_parser("register")
    reg.add_argument("file", type=Path)
    reg.add_argument("--registered-on", type=iso, default=date.today().isoformat())
    reg.add_argument("--claims", type=Path)
    chk = sub.add_parser("check")
    chk.add_argument("--as-of", type=iso)
    chk.add_argument("--offline", action="store_true")
    chk.add_argument("--context", nargs=2, metavar=("SERIES", "PERIOD"), help="Show this archived reading on a dated replay map")
    chk.add_argument("--record", action="store_true", help="Save a quiet check for run history or a requested map")
    chk.add_argument("--trigger", choices=("schedule", "email", "manual", "replay"))
    judge = sub.add_parser("judge")
    verdict = judge.add_mutually_exclusive_group(required=True)
    verdict.add_argument("--status", choices=VERDICTS)
    verdict.add_argument("--hold", action="store_true", help="Hold the draft for unresolved evidence")
    judge.add_argument("--reason", required=True)
    judge.add_argument("--replacement", help="Agent-written replacement for an eligible claim")
    fix = sub.add_parser("fix")
    map_cmd = sub.add_parser("map")
    decide = sub.add_parser("decide")
    decide.add_argument("--from", dest="decisions_file", type=Path, metavar="JSON")
    decide.add_argument("--claim")
    decide.add_argument("--run")
    decide.add_argument("choice", nargs="?", choices=("apply", "skip"))
    judge.add_argument("--claim", required=True)
    for command in (judge, fix, map_cmd):
        command.add_argument("--run", required=True)
    for command in (reg, chk, judge, fix, map_cmd, decide):
        command.add_argument("--workspace", type=Path, default=Path(os.getenv("RECALLPRESS_WORKSPACE", "workspace")))
    for command in (reg, chk):
        command.add_argument("--series-dir", type=Path, default=Path(os.getenv("RECALLPRESS_SERIES", ROOT / "data/series")))
    return cli


def execute(args):
    work = args.workspace.resolve()
    with locked(work):
        if args.command in ("register", "check"):
            archive = read_series(args.series_dir)
        if args.command == "register":
            return register(work, args.file, args.registered_on, archive, args.claims)
        if args.command == "check":
            day = args.as_of or observed_today()
            if args.context and not (args.as_of and args.offline):
                raise ValueError("Use --context with an offline, dated replay")
            if not args.offline:
                reg = read_register(work)
                docs = {d["document_id"] for d in reg["documents"] if d["registered"] <= day}
                pairs = [(r["series_id"], r["period"]) for c in reg["claims"] if c["document_id"] in docs
                         for r in engine.observations(c)]
                if args.series_dir.resolve() == work:
                    raise ValueError("Choose separate series and workspace folders")
                with locked(args.series_dir):
                    archive = read_series(args.series_dir)
                    refresh(args.series_dir, archive, pairs)
            trigger = args.trigger or ("replay" if args.as_of else "manual")
            return engine.check(work, archive, day, trigger, bool(args.as_of or trigger == "replay"), args.record, args.context)
        if args.command == "judge":
            return engine.judge(work, args.run, args.claim, "unchecked" if args.hold else args.status, args.reason, args.replacement)
        if args.command == "fix":
            return engine.fix(work, args.run)
        if args.command == "map":
            return engine.render_map(work, args.run)
        if args.decisions_file:
            if args.choice or args.claim:
                raise ValueError("Use --from JSON alone or with a matching --run")
            from web.apply_decisions import import_decisions
            payload = json.loads(args.decisions_file.read_text(encoding="utf-8"))
            if args.run and args.run != payload["run_id"]:
                raise ValueError("The map export belongs to a different run")
            return import_decisions(payload, work)
        if not all((args.run, args.claim, args.choice)):
            raise ValueError("Supply --from JSON or --run ID --claim ID apply|skip")
        return engine.decide(work, args.run, args.claim, args.choice)


def main():
    args = parser().parse_args()
    try:
        result = execute(args)
    except KeyError as exc:
        print(f"Recall Press stopped: The input is missing a required field or entry: {exc}.", file=sys.stderr)
        return 1
    except (OSError, ValueError, TypeError, BadZipFile) as exc:
        print(f"Recall Press stopped: {exc}", file=sys.stderr)
        return 1
    print(json.dumps({k: v for k, v in result.items() if k != "register_snapshot"}, ensure_ascii=False, indent=2))
    if args.command == "fix":
        saved = json.loads(Path(result["result"]).read_text(encoding="utf-8"))
        for verdict in saved["verdicts"]:
            if verdict.get("replacement_file"):
                print("Corrected:", args.workspace.resolve() / verdict["replacement_file"], file=sys.stderr)
        for item in saved["updated_files"]:
            print("Updated deck:", args.workspace.resolve() / item["file"], file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
