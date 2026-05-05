#!/usr/bin/env bash
# Deploy an app to Cloudflare Pages production
# Temporarily hides .env.local so Next.js doesn't override production URLs
#
# Usage: scripts/cf-deploy-prod.sh <app-dir> <project-name> [output-dir]

set -euo pipefail

APP_DIR="$1"
PROJECT_NAME="$2"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Auto-detect output dir: use explicit arg, or read from wrangler.toml, or default to dist
if [ -n "${3:-}" ]; then
  OUTPUT_DIR="$3"
else
  # Read pages_build_output_dir from wrangler.toml if it exists
  WRANGLER_DIR=$(grep 'pages_build_output_dir' "$ROOT_DIR/apps/$APP_DIR/wrangler.toml" 2>/dev/null | sed 's/.*=[[:space:]]*"\([^"]*\)".*/\1/' || true)
  if [ -n "$WRANGLER_DIR" ]; then
    OUTPUT_DIR="$WRANGLER_DIR"
  else
    OUTPUT_DIR="dist"
  fi
fi
ENV_LOCAL="$ROOT_DIR/.env.local"
ENV_LOCAL_BAK="$ROOT_DIR/.env.local.deploy-bak"

cleanup() {
  if [ -f "$ENV_LOCAL_BAK" ]; then
    mv "$ENV_LOCAL_BAK" "$ENV_LOCAL"
  fi
}
trap cleanup EXIT

# Hide .env.local to prevent localhost URLs from overriding production
if [ -f "$ENV_LOCAL" ]; then
  mv "$ENV_LOCAL" "$ENV_LOCAL_BAK"
fi

cd "$ROOT_DIR/apps/$APP_DIR"

# Build with production env
bun run --env-file="$ROOT_DIR/.env.production" \
        --env-file="$ROOT_DIR/.env.production.local" \
        build

bunx wrangler@4.20.0 pages deploy "$OUTPUT_DIR" --project-name="$PROJECT_NAME" --commit-dirty=true
