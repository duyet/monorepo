#!/bin/sh
# Local stub-archive smoke for install.sh (no GitHub release required).
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
INSTALL_SH="$ROOT/public/install.sh"
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT INT HUP

mkdir -p "$WORKDIR/bin" "$WORKDIR/www/cli" "$WORKDIR/dist" "$WORKDIR/home"
printf '%s\n' '#!/bin/sh
if [ "$1" = version ]; then
  if [ "${2:-}" = --json ]; then
    printf "%s\n" "{\"ok\":true,\"schema\":\"duyet.version.v1\",\"data\":{\"version\":\"0.0.0-smoke\"}}"
  else
    echo "duyet 0.0.0-smoke"
  fi
  exit 0
fi
if [ "$1" = posts ]; then
  printf "%s\n" "{\"ok\":false}"
  exit 2
fi
echo "smoke stub"
' >"$WORKDIR/bin/duyet"
chmod +x "$WORKDIR/bin/duyet"

uname_s=$(uname -s)
uname_m=$(uname -m)
case "$uname_s-$uname_m" in
  Darwin-arm64|Darwin-aarch64) TARGET="aarch64-apple-darwin" ;;
  Darwin-x86_64) TARGET="x86_64-apple-darwin" ;;
  Linux-aarch64|Linux-arm64) TARGET="aarch64-unknown-linux-musl" ;;
  Linux-x86_64|Linux-amd64) TARGET="x86_64-unknown-linux-musl" ;;
  *) echo "skip: unsupported $uname_s $uname_m"; exit 0 ;;
esac

ARCHIVE_NAME="duyet-${TARGET}.tar.gz"
tar -czf "$WORKDIR/www/${ARCHIVE_NAME}" -C "$WORKDIR/bin" duyet
(
  cd "$WORKDIR/www"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$ARCHIVE_NAME" >SHA256SUMS
  else
    shasum -a 256 "$ARCHIVE_NAME" >SHA256SUMS
  fi
)
SHA=$(awk '{print $1}' "$WORKDIR/www/SHA256SUMS")

python3 - <<PY
import json
from pathlib import Path
root = Path("$WORKDIR/www")
target = "$TARGET"
sha = "$SHA"
name = "$ARCHIVE_NAME"
manifest = {
  "version": "0.0.0-smoke",
  "tag": "duyet-v0.0.0-smoke",
  "channel": "stable",
  "published_at": "1970-01-01T00:00:00Z",
  "targets": {
    target: {
      "url": "http://127.0.0.1:PORT/" + name,
      "sha256": sha,
      "size": (root / name).stat().st_size,
    }
  },
}
(root / "cli").mkdir(exist_ok=True)
(root / "cli" / "stable.json").write_text(json.dumps(manifest))
(root / "cli" / "beta.json").write_text(json.dumps({**manifest, "channel": "beta"}))
PY

PORT=$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)
sed -i.bak "s/:PORT/:$PORT/g" "$WORKDIR/www/cli/stable.json" "$WORKDIR/www/cli/beta.json"
rm -f "$WORKDIR/www/cli/stable.json.bak" "$WORKDIR/www/cli/beta.json.bak"

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$WORKDIR/www" >/dev/null 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null || true; rm -rf "$WORKDIR"' EXIT INT HUP
sleep 0.3

export HOME="$WORKDIR/home"
export DUYET_BASE_URL="http://127.0.0.1:${PORT}"
export DUYET_INSTALL_DIR="$HOME/.duyet/bin"
export DUYET_CHANNEL=stable
sh "$INSTALL_SH"
test -x "$DUYET_INSTALL_DIR/duyet"
"$DUYET_INSTALL_DIR/duyet" version --json | grep '"ok":true'

# Tampered checksum must fail and leave no binary.
# Use a well-formed 64-hex digest so both GNU sha256sum and macOS shasum parse
# the line; the installer compares the digest itself (not `shasum -c`).
rm -f "$DUYET_INSTALL_DIR/duyet"
BAD_SHA="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
printf '%s  %s\n' "$BAD_SHA" "$ARCHIVE_NAME" >"$WORKDIR/www/SHA256SUMS"
python3 - "$WORKDIR/www/cli/stable.json" "$BAD_SHA" <<'PY'
import json, sys
from pathlib import Path
p = Path(sys.argv[1])
data = json.loads(p.read_text())
for t in data.get("targets", {}).values():
    t["sha256"] = sys.argv[2]
p.write_text(json.dumps(data))
PY
set +e
sh "$INSTALL_SH"
status=$?
set -e
if [ "$status" -eq 0 ]; then
  echo "expected checksum failure" >&2
  exit 1
fi
test ! -e "$DUYET_INSTALL_DIR/duyet"

echo "install-sh-smoke: ok"
