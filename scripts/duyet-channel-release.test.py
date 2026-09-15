#!/usr/bin/env python3
"""Unit test for channel manifest emission (no network)."""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "duyet-channel-release.py"
TARGETS = (
    "aarch64-apple-darwin",
    "x86_64-apple-darwin",
    "aarch64-unknown-linux-musl",
    "x86_64-unknown-linux-musl",
    "x86_64-pc-windows-msvc",
)


def archive_name(target: str) -> str:
    if target.endswith("windows-msvc"):
        return f"duyet-{target}.zip"
    return f"duyet-{target}.tar.xz"


def test_emits_five_targets() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        artifacts = Path(tmp) / "artifacts"
        artifacts.mkdir()
        for target in TARGETS:
            (artifacts / archive_name(target)).write_bytes(b"payload-" + target.encode())
        plan = {
            "announcement_tag": "duyet-v0.1.0",
            "announcement_is_prerelease": False,
        }
        plan_path = Path(tmp) / "plan.json"
        plan_path.write_text(json.dumps(plan))
        out = Path(tmp) / "stable.json"
        proc = subprocess.run(
            [
                "python3",
                str(SCRIPT),
                "--plan-file",
                str(plan_path),
                "--artifacts-dir",
                str(artifacts),
                "--dry-run",
                "--out",
                str(out),
            ],
            check=True,
            text=True,
            capture_output=True,
        )
        data = json.loads(proc.stdout)
        assert data["schema"] == "duyet.cli.channel.v1"
        assert data["version"] == "0.1.0"
        assert data["tag"] == "duyet-v0.1.0"
        assert set(data["targets"]) == set(TARGETS)
        linux = data["targets"]["x86_64-unknown-linux-musl"]
        assert linux["url"].endswith("duyet-x86_64-unknown-linux-musl.tar.xz")
        assert len(linux["sha256"]) == 64
        assert linux["size"] > 0
        win = data["targets"]["x86_64-pc-windows-msvc"]
        assert win["url"].endswith(".zip")
        disk = json.loads(out.read_text())
        assert disk == data


def test_beta_channel_from_tag() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        artifacts = Path(tmp) / "artifacts"
        artifacts.mkdir()
        for target in TARGETS:
            (artifacts / archive_name(target)).write_bytes(b"b")
        plan = {
            "announcement_tag": "duyet-v0.1.0-beta.1",
            "announcement_is_prerelease": True,
        }
        plan_path = Path(tmp) / "plan.json"
        plan_path.write_text(json.dumps(plan))
        proc = subprocess.run(
            [
                "python3",
                str(SCRIPT),
                "--plan-file",
                str(plan_path),
                "--artifacts-dir",
                str(artifacts),
                "--dry-run",
            ],
            check=True,
            text=True,
            capture_output=True,
        )
        data = json.loads(proc.stdout)
        assert data["version"] == "0.1.0-beta.1"
        assert len(data["targets"]) == 5


if __name__ == "__main__":
    test_emits_five_targets()
    test_beta_channel_from_tag()
    print("ok")
