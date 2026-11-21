import fcntl
import hashlib
import json
import os
import re
import tempfile
from contextlib import contextmanager
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def save(path, obj):
    data = (json.dumps(obj, ensure_ascii=False, indent=2, allow_nan=False) + "\n").encode()
    if path.exists() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
        try:
            temp.write(data)
            temp.close()
            os.replace(temp.name, path)
        finally:
            Path(temp.name).unlink(missing_ok=True)


@contextmanager
def locked(workspace):
    workspace.mkdir(parents=True, exist_ok=True)
    fd = os.open(workspace, os.O_RDONLY)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX)
        yield
    finally:
        os.close(fd)


def fingerprint(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def safe_id(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,149}", value):
        raise ValueError(f"Invalid identifier {value!r}")
    return value


def iso(value):
    return date.fromisoformat(value).isoformat()


def read_series(directory):
    result = {}
    for path in sorted(directory.glob("*.json")):
        series = load(path)
        sid = safe_id(series["series_id"])
        if sid in result:
            raise ValueError(f"Duplicate series {sid}")
        if path.stem != sid:
            raise ValueError(f"Archive filename must match its series_id: {path}")
        for obs in series["observations"]:
            obs["vintages"].sort(key=lambda v: v["published"])
        result[sid] = series
    if not result:
        raise ValueError(f"No vintage archives found in {directory}")
    return result


def visible(series, period, day):
    for obs in series["observations"]:
        if obs["period"] == period:
            return [v for v in obs["vintages"] if v["published"] <= day]
    return []
