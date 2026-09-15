#!/bin/sh
# duyet CLI installer (POSIX sh). macOS and Linux only.
# Usage: curl -fsSL https://duyet.net/install.sh | sh
#
# Env:
#   DUYET_CHANNEL        stable (default) | beta
#   DUYET_VERSION        pin a version (e.g. 0.1.0-beta.1); overrides channel
#   DUYET_INSTALL_DIR    default $HOME/.duyet/bin
#   DUYET_MODIFY_PATH    set to 1 to append PATH to a detected rc file
#   DUYET_BASE_URL       default https://duyet.net (channel manifests)
#   DUYET_GITHUB         default https://github.com/duyet/monorepo
#   DUYET_SKIP_VERIFY    set to 1 to skip SHA256 (tests only)

set -eu

BASE_URL="${DUYET_BASE_URL:-https://duyet.net}"
GITHUB_REPO="${DUYET_GITHUB:-https://github.com/duyet/monorepo}"
CHANNEL="${DUYET_CHANNEL:-stable}"
VERSION="${DUYET_VERSION:-}"
INSTALL_DIR="${DUYET_INSTALL_DIR:-${HOME}/.duyet/bin}"
MODIFY_PATH="${DUYET_MODIFY_PATH:-0}"

die() {
  printf '%s\n' "duyet-install: $*" >&2
  exit 1
}

info() {
  printf '%s\n' "duyet-install: $*" >&2
}

uname_s=$(uname -s 2>/dev/null || echo unknown)
uname_m=$(uname -m 2>/dev/null || echo unknown)

case "$uname_s" in
  MINGW*|MSYS*|CYGWIN*|Windows_NT)
    die "Windows Git Bash is not supported. Use PowerShell:
  irm ${BASE_URL}/install.ps1 | iex"
    ;;
esac

case "$uname_s-$uname_m" in
  Darwin-arm64|Darwin-aarch64) TARGET="aarch64-apple-darwin"; ARCHIVE_EXT="tar.xz" ;;
  Darwin-x86_64) TARGET="x86_64-apple-darwin"; ARCHIVE_EXT="tar.xz" ;;
  Linux-aarch64|Linux-arm64) TARGET="aarch64-unknown-linux-musl"; ARCHIVE_EXT="tar.xz" ;;
  Linux-x86_64|Linux-amd64) TARGET="x86_64-unknown-linux-musl"; ARCHIVE_EXT="tar.xz" ;;
  *) die "unsupported platform: $uname_s $uname_m" ;;
esac

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

need_cmd curl
need_cmd tar
if command -v sha256sum >/dev/null 2>&1; then
  SHA_CMD="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  SHA_CMD="shasum"
else
  die "need sha256sum or shasum"
fi

json_get() {
  # json_get KEY FILE — first string/number for a top-level or nested "key"
  _key=$1
  _file=$2
  if command -v python3 >/dev/null 2>&1; then
    python3 -c '
import json,sys
key=sys.argv[1]
data=json.load(open(sys.argv[2]))
cur=data
for part in key.split("."):
    if isinstance(cur, dict) and part in cur:
        cur=cur[part]
    else:
        sys.exit(0)
if isinstance(cur, dict):
    sys.exit(0)
print(cur)
' "$_key" "$_file"
    return 0
  fi
  # Fallback: grep the first "key": "value"
  sed -n "s/.*\"${_key}\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" "$_file" | head -n 1
}

TMPDIR_INSTALL=$(mktemp -d)
trap 'rm -rf "$TMPDIR_INSTALL"' EXIT INT HUP

MANIFEST="$TMPDIR_INSTALL/manifest.json"
if [ -n "$VERSION" ]; then
  VER_STRIP=$VERSION
  VER_STRIP=${VER_STRIP#duyet-v}
  VER_STRIP=${VER_STRIP#v}
  TAG="duyet-v${VER_STRIP}"
  # Version pin: GitHub Releases layout from #1444.
  ARCHIVE_NAME="duyet-${TARGET}.${ARCHIVE_EXT}"
  ARCHIVE_URL="${GITHUB_REPO}/releases/download/${TAG}/${ARCHIVE_NAME}"
  SUMS_URL="${GITHUB_REPO}/releases/download/${TAG}/SHA256SUMS"
  printf '%s\n' "{\"version\":\"${VER_STRIP}\",\"tag\":\"${TAG}\"}" >"$MANIFEST"
  info "pinning version ${VER_STRIP} (tag ${TAG})"
else
  MANIFEST_URL="${BASE_URL}/cli/${CHANNEL}.json"
  info "fetching channel manifest ${MANIFEST_URL}"
  curl -fsSL "$MANIFEST_URL" -o "$MANIFEST" || die "failed to fetch ${MANIFEST_URL} (channel manifests land with #1444)"
  TAG=$(json_get tag "$MANIFEST")
  VERSION_FROM_MANIFEST=$(json_get version "$MANIFEST")
  ARCHIVE_URL=$(json_get "targets.${TARGET}.url" "$MANIFEST")
  EXPECTED_SHA=$(json_get "targets.${TARGET}.sha256" "$MANIFEST")
  if [ -z "$ARCHIVE_URL" ]; then
    ARCHIVE_NAME="duyet-${TARGET}.${ARCHIVE_EXT}"
    if [ -z "$TAG" ]; then
      die "manifest ${MANIFEST_URL} has no tag or targets.${TARGET}.url (see #1444)"
    fi
    ARCHIVE_URL="${GITHUB_REPO}/releases/download/${TAG}/${ARCHIVE_NAME}"
  fi
  ARCHIVE_NAME=$(basename "$ARCHIVE_URL")
  SUMS_URL="${ARCHIVE_URL%/*}/SHA256SUMS"
  if [ -n "$VERSION_FROM_MANIFEST" ]; then
    VERSION="$VERSION_FROM_MANIFEST"
  fi
  info "channel ${CHANNEL} version ${VERSION:-unknown} tag ${TAG:-unknown}"
fi

ARCHIVE="$TMPDIR_INSTALL/$ARCHIVE_NAME"
SUMS="$TMPDIR_INSTALL/SHA256SUMS"
info "downloading ${ARCHIVE_URL}"
curl -fsSL "$ARCHIVE_URL" -o "$ARCHIVE" || die "failed to download ${ARCHIVE_URL} (release artifacts come from #1444)"

file_sha256() {
  if [ "$SHA_CMD" = "sha256sum" ]; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

# Compare hex digests ourselves. `shasum -c` on macOS can exit 0 when a sums
# file has no well-formed lines, which would accept a tampered SHA256SUMS.
sums_digest_for() {
  # $1 = sums file, $2 = archive basename
  awk -v n="$2" '
    $2 == n || $2 == ("*" n) { print $1; exit }
  ' "$1"
}

if [ "${DUYET_SKIP_VERIFY:-0}" != "1" ]; then
  GOT=$(file_sha256 "$ARCHIVE")
  if curl -fsSL "$SUMS_URL" -o "$SUMS" 2>/dev/null; then
    WANT=$(sums_digest_for "$SUMS" "$ARCHIVE_NAME")
    [ -n "$WANT" ] || die "SHA256SUMS has no entry for ${ARCHIVE_NAME}"
    [ "$GOT" = "$WANT" ] || die "SHA256 mismatch for ${ARCHIVE_NAME}"
  elif [ -n "${EXPECTED_SHA:-}" ] && [ "$EXPECTED_SHA" != "0000000000000000000000000000000000000000000000000000000000000000" ]; then
    [ "$GOT" = "$EXPECTED_SHA" ] || die "SHA256 mismatch: got ${GOT} expected ${EXPECTED_SHA}"
  else
    die "could not fetch SHA256SUMS from ${SUMS_URL} and manifest has no sha256"
  fi
fi

mkdir -p "$INSTALL_DIR"
info "unpacking to ${INSTALL_DIR}"
case "$ARCHIVE_NAME" in
  *.tar.xz) tar -xJf "$ARCHIVE" -C "$TMPDIR_INSTALL" ;;
  *.tar.gz) tar -xzf "$ARCHIVE" -C "$TMPDIR_INSTALL" ;;
  *.zip)
    need_cmd unzip
    unzip -q "$ARCHIVE" -d "$TMPDIR_INSTALL"
    ;;
  *) die "unknown archive type: ${ARCHIVE_NAME}" ;;
esac

BIN=$(find "$TMPDIR_INSTALL" -type f \( -name duyet -o -name duyet.exe \) | head -n 1)
[ -n "$BIN" ] || die "archive did not contain a duyet binary"
chmod +x "$BIN"
cp "$BIN" "$INSTALL_DIR/duyet"
info "installed ${INSTALL_DIR}/duyet"

if ! "$INSTALL_DIR/duyet" version >/dev/null 2>&1; then
  # version may print to stdout; still try once for the user
  "$INSTALL_DIR/duyet" version || info "warning: duyet version failed (binary may be a stub)"
else
  "$INSTALL_DIR/duyet" version || true
fi

PATH_LINE="export PATH=\"${INSTALL_DIR}:\$PATH\""
case "${SHELL:-}" in
  *zsh) RC="${ZDOTDIR:-$HOME}/.zshrc" ;;
  *bash) RC="$HOME/.bashrc" ;;
  *fish) RC="$HOME/.config/fish/config.fish"; PATH_LINE="fish_add_path ${INSTALL_DIR}" ;;
  *) RC="$HOME/.profile" ;;
esac

if [ "$MODIFY_PATH" = "1" ]; then
  if ! grep -F "$INSTALL_DIR" "$RC" >/dev/null 2>&1; then
    printf '\n# duyet CLI\n%s\n' "$PATH_LINE" >>"$RC"
    info "appended PATH to ${RC}"
  else
    info "${RC} already mentions ${INSTALL_DIR}"
  fi
else
  info "not editing shell rc files. Add this to PATH:"
  printf '\n  %s\n\n' "$PATH_LINE" >&2
fi
