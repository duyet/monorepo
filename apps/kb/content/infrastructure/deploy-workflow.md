---
title: "Deploy Workflow"
category: "infrastructure"
tags: ["cloudflare", "deploy", "ci", "workflow"]
links: ["tanstack-start-ssg-migration", "blog-wasm-prerender-ci", "commit-push-deploy", "cloudflare-rocket-loader"]
summary: "Apps deploy to Cloudflare Pages via cf-deploy-prod.sh; blog CI builds WASM first; run deploys in background to avoid blocking."
updated: "2026-05-26"
---

# Deploy Workflow

Every app in the monorepo deploys to Cloudflare Pages. The deploy script is `scripts/cf-deploy-prod.sh`, invoked per-app as `bun run cf:deploy:prod`.

## Manual deploy pattern

After committing and pushing:

```bash
cd apps/<app> && bun run cf:deploy:prod
```

Always run deploys with `run_in_background: true` (in agent sessions) so the next task isn't blocked on Cloudflare's ~30–60 s upload time. Do NOT run two background deploys in parallel — `cf-deploy-prod.sh` renames `.env.local` to `.env.local.deploy-bak` during the run; parallel invocations collide on that rename and lose `CLOUDFLARE_API_TOKEN`.

## CI pipeline (`cf-deploy.yml`)

The GitHub Actions workflow deploys on push to `master` using a matrix over all apps. The blog matrix entry has additional steps:

1. `dtolnay/rust-toolchain@stable`
2. `jetli/wasm-pack-action`
3. `bun run wasm:build:release`
4. `bun build` + deploy

All other apps skip the Rust/WASM steps.

## CI validation commands

```bash
# Check recent master CI runs
gh run list --branch master --event push --limit 10 \
  --json databaseId,headSha,status,conclusion,name,updatedAt

# Inspect a failed job
gh run view <run-id> --job <job-id> --log-failed
```

## Output directories

All TanStack Start apps build to `dist/client/`. The `wrangler.toml` for each app sets:

```toml
pages_build_output_dir = "dist/client"
```

## Verification

After a deploy notification, confirm the production URL returns 200 and the expected content. A blog deploy is healthy if `dist/client/` contains 700+ `index.html` files. If every post URL serves the homepage, WASM was likely missing during the build — see the WASM prerender CI article.
