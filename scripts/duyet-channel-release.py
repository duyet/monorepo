#!/usr/bin/env python3
"""Post-announce helper for the duyet CLI dist pipeline.

Reads the dist plan JSON from $PLAN (or --plan), downloads the five target
archives from the GitHub Release, writes SHA256SUMS, optionally minisigns it,
uploads missing assets, and opens a PR that updates apps/home/public/cli/.

Channel layout consumed by #1446 (installers) and #1447 (self-update):

  https://duyet.net/cli/stable.json
  https://duyet.net/cli/beta.json
  https://duyet.net/cli/minisign.pub

  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/duyet-<triple>.tar.xz
  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/duyet-x86_64-pc-windows-msvc.zip
  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/duyet-installer.sh
  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/duyet-installer.ps1
  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/SHA256SUMS
  https://github.com/duyet/monorepo/releases/download/duyet-vX.Y.Z/SHA256SUMS.minisig
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
TARGETS = (
    "aarch64-apple-darwin",
    "x86_64-apple-darwin",
    "aarch64-unknown-linux-musl",
    "x86_64-unknown-linux-musl",
    "x86_64-pc-windows-msvc",
)

ARCHIVE_SUFFIX = {
    "x86_64-pc-windows-msvc": ".zip",
}


def archive_name(target: str) -> str:
    suffix = ARCHIVE_SUFFIX.get(target, ".tar.xz")
    return f"duyet-{target}{suffix}"


def load_plan(raw: str) -> dict:
    return json.loads(raw)


def announcement_tag(plan: dict) -> str:
    tag = plan.get("announcement_tag") or plan.get("tag")
    if not tag:
        raise SystemExit("dist plan is missing announcement_tag")
    return str(tag)


def is_prerelease(plan: dict, tag: str) -> bool:
    if "announcement_is_prerelease" in plan:
        return bool(plan["announcement_is_prerelease"])
    return "-beta." in tag or "-alpha." in tag or "-rc." in tag


def version_from_tag(tag: str) -> str:
    rest = tag
    if rest.startswith("duyet-v"):
        rest = rest[len("duyet-v") :]
    elif rest.startswith("duyet-"):
        rest = rest[len("duyet-") :]
    elif rest.startswith("v"):
        rest = rest[1:]
    return rest


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def gh(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["gh", *args],
        check=check,
        text=True,
        capture_output=True,
    )


def write_channel_manifest(
    *,
    version: str,
    tag: str,
    published_at: str,
    artifacts_dir: Path,
    download_base: str,
) -> dict:
    targets: dict[str, dict] = {}
    for target in TARGETS:
        name = archive_name(target)
        path = artifacts_dir / name
        if not path.is_file():
            raise SystemExit(f"missing archive {name}")
        targets[target] = {
            "url": f"{download_base}/{name}",
            "sha256": sha256_file(path),
            "size": path.stat().st_size,
        }
    return {
        "schema": "duyet.cli.channel.v1",
        "version": version,
        "tag": tag,
        "published_at": published_at,
        "targets": targets,
    }


def minisign_sign(sums_path: Path, secret: str, work: Path) -> Path | None:
    if not secret.strip():
        print("MINISIGN_SECRET_KEY unset; skipping SHA256SUMS.minisig", file=sys.stderr)
        return None
    key_path = work / "minisign.key"
    key_path.write_text(secret if secret.endswith("\n") else secret + "\n")
    key_path.chmod(0o600)
    sig_path = Path(str(sums_path) + ".minisig")
    subprocess.run(
        ["minisign", "-S", "-s", str(key_path), "-m", str(sums_path), "-x", str(sig_path)],
        check=True,
    )
    return sig_path


def git(*args: str) -> None:
    subprocess.run(["git", *args], check=True)


def open_manifest_pr(channel: str, dest: Path, body: str) -> None:
    branch = f"chore/cli-{channel}-manifest"
    git("config", "user.name", "github-actions[bot]")
    git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    git("checkout", "-B", branch)
    git("add", str(dest))
    git("add", "apps/home/public/cli/minisign.pub")
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        check=True,
        text=True,
        capture_output=True,
    )
    if not status.stdout.strip():
        print("channel files unchanged; no PR")
        return
    git("commit", "-m", f"chore(duyet): refresh {channel} channel manifest")
    git("push", "-u", "origin", branch, "--force")
    existing = gh(
        "pr",
        "list",
        "--head",
        branch,
        "--json",
        "number",
        check=False,
    )
    if existing.returncode == 0 and json.loads(existing.stdout or "[]"):
        print(f"updated existing PR branch {branch}")
        return
    gh(
        "pr",
        "create",
        "--title",
        f"chore(duyet): {channel} channel manifest",
        "--body",
        body,
        "--base",
        "master",
        "--head",
        branch,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", default=os.environ.get("PLAN", ""))
    parser.add_argument("--plan-file")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--artifacts-dir", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    if args.plan_file:
        plan = json.loads(Path(args.plan_file).read_text())
    elif args.plan:
        plan = load_plan(args.plan)
    else:
        raise SystemExit("PLAN env or --plan-file required")

    tag = announcement_tag(plan)
    version = version_from_tag(tag)
    channel = "beta" if is_prerelease(plan, tag) else "stable"
    repo = os.environ.get("GITHUB_REPOSITORY", "duyet/monorepo")
    download_base = f"https://github.com/{repo}/releases/download/{tag}"

    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        artifacts = args.artifacts_dir or (work / "artifacts")
        artifacts.mkdir(parents=True, exist_ok=True)

        if args.artifacts_dir is None:
            gh("release", "download", tag, "--dir", str(artifacts), "--repo", repo)

        sums_lines = []
        for target in TARGETS:
            name = archive_name(target)
            path = artifacts / name
            if not path.is_file():
                raise SystemExit(f"missing archive {name} in {artifacts}")
            sums_lines.append(f"{sha256_file(path)}  {name}\n")
        sums_path = artifacts / "SHA256SUMS"
        sums_path.write_text("".join(sums_lines))

        published_at = (
            os.environ.get("GITHUB_RUN_STARTED_AT")
            or subprocess.check_output(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"], text=True).strip()
        )
        manifest = write_channel_manifest(
            version=version,
            tag=tag,
            published_at=published_at,
            artifacts_dir=artifacts,
            download_base=download_base,
        )

        if args.out:
            args.out.write_text(json.dumps(manifest, indent=2) + "\n")

        if args.dry_run:
            json.dump(manifest, sys.stdout, indent=2)
            sys.stdout.write("\n")
            return 0

        gh(
            "release",
            "upload",
            tag,
            str(sums_path),
            "--clobber",
            "--repo",
            repo,
        )
        sig = minisign_sign(sums_path, os.environ.get("MINISIGN_SECRET_KEY", ""), work)
        if sig is not None:
            gh("release", "upload", tag, str(sig), "--clobber", "--repo", repo)

        dest = Path("apps/home/public/cli") / f"{channel}.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(manifest, indent=2) + "\n")
        open_manifest_pr(
            channel,
            dest,
            f"Refresh `{channel}.json` for `{tag}`.\n\nCloses nothing; generated by the duyet dist pipeline.",
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
