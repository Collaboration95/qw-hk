import json
from pathlib import Path

import pytest

from recallpress.__main__ import execute, parser


@pytest.fixture
def series(tmp_path):
    source = json.loads((Path(__file__).parent / "fixtures/observations.json").read_text())
    path = tmp_path / "series"
    path.mkdir()
    for name, row in source.items():
        if not isinstance(row, dict):
            continue
        vintages = [{"published": day, "value": n, "url": "https://example.invalid/release", "release": "Fixture release",
                     "accessed": "2026-11-19", "quote": str(n)} for day, n in row["vintages"]]
        dataset = {"series_id": name, "aliases": row.get("aliases", []), "title": name.capitalize(),
                   "unit": "%", "source": {"agency": "Synthetic test fixture", "licence": "Synthetic", "api_row": name,
                   "api_resource_id": "d_" + "0" * 32, "dataset_url": "https://example.invalid/dataset"},
                   "observations": [{"period": row["period"], "vintages": vintages}]}
        (path / f"{name}.json").write_text(json.dumps(dataset))
    return path


@pytest.fixture
def cli(tmp_path, series):
    def run(*args):
        args = list(map(str, args))
        if args[0] in ("check", "register"):
            args.extend(["--series-dir", str(series)])
        return execute(parser().parse_args(args + ["--workspace", str(tmp_path / "workspace")]))
    return run
