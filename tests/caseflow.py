"""Exercise the CLI with publication text only; consult expected claims after registration."""
from pathlib import Path

from recallpress.__main__ import execute, parser
from recallpress.storage import ROOT, load


def run_case(path, tmp_path, *, publication=None):
    case = load(path)
    workspace = tmp_path / "workspace"
    def cli(*args):
        return execute(parser().parse_args([*map(str, args), "--workspace", str(workspace)]))
    if publication is None:
        publication = tmp_path / "sample.md"
        publication.write_text("\n\n".join(c["sentence"] for c in case["claims"]))
    original = publication.read_bytes()
    rows = cli("register", publication, "--registered-on", case["registered_on"])["claims"]
    actual = {c["sentence"]: c for c in rows}
    assert set(actual) == {c["sentence"] for c in case["claims"]}, f"Detected {list(actual)}"
    identities = {}
    for label in case["claims"]:
        claim = actual[label["sentence"]]
        for key in ("series_id", "period", "stance", "value_cited", "vintage_cited"):
            assert claim[key] == label[key], (label["claim_id"], key, claim[key], label[key])
        assert claim["assertion"]["type"] == label["assertion"]["type"]
        identities[claim["claim_id"]] = label["claim_id"]
    def inventory():
        return {p.relative_to(workspace): (p.stat().st_mtime_ns, p.read_bytes()) for p in workspace.rglob("*") if p.is_file()}
    for item in case["checks"]:
        for _ in range(item.get("repeat", 1)):
            before = inventory()
            result = cli("check", "--offline", "--as-of", item["as_of"])
            assert result["no_change"] == item["no_change"]
            verdicts = {identities[v["claim_id"]]: v for v in result["verdicts"]}
            for ref in item["expected"]:
                v = verdicts[ref["claim_id"]]
                assert v["status"] == ref["status"] and v["reason"], (ref, v)
            if item["no_change"]:
                assert inventory() == before
                continue
            args = ["--run", result["run_id"]]
            report = cli("fix", *args)
            assert report["replacement_files"] == sum(e["status"] in ("now_wrong", "number_only") for e in item["expected"])
            assert Path(cli("map", *args)["map"]).exists()
            after = inventory()
            assert cli("check", "--offline", "--as-of", item["as_of"])["no_change"]
            assert inventory() == after
    assert publication.read_bytes() == original
