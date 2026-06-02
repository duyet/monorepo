#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec pnpm exec tsx "$SCRIPT_DIR/cf-deploy-prod.ts" "$@"
