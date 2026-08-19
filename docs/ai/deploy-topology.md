# Cloudflare deploy topology

How Pages apps, Workers, shared packages, and WASM rebuilds relate. No
behavior change without a real `pnpm run cf:deploy -- --dry-run`.

## Two deploy trains

| Train | Workflow | Trigger | What it ships |
| --- | --- | --- | --- |
| Pages | `.github/workflows/cf-deploy.yml` (prod) and `cf-deploy-preview.yml` (PRs) | push to `master`/`main`, PRs, daily cron for `burns` | Any `apps/*` with `pages_build_output_dir` in `wrangler.toml` **and** a `cf:deploy:prod` script. Discovery is `scripts/cf-pages-apps.ts` — do not hardcode the app list. |
| Workers | `.github/workflows/cf-worker-deploy.yml` | path filters on `apps/agent-api`, `apps/api`, `apps/news`, `packages/**` | `duyet-agents-api`, `duyet-api`, `news` |

Orchestration locally / in CI Pages jobs: `scripts/cf-deploy.ts`. App-level `cf:deploy:prod` scripts remain authoritative when present.

## Change detection (`scripts/cf-deploy.ts`)

Rebuilds are keyed off `git diff --name-only origin/master...HEAD` over:

- `apps/`
- `packages/`
- `turbo.json`
- `package.json`
- **`pnpm-lock.yaml`** (the real lockfile — not `bun.lock` / `bun.lockb`)
- `.env.production`
- `scripts/`

A lockfile-only or `packages/**` change rebuilds every requested Pages app. `--force` skips detection and rebuilds all requested targets (`pnpm run cf:deploy -- --force`).

## Dependency graph (what pulls a rebuild)

```
packages/{components,libs,config,urls,profile,interfaces,tailwind-config,tsconfig,wasm}
        │
        ├─► Pages (static HTML at build time)
        │     home, blog, cv, insights, photos, homelab, llm-timeline,
        │     kb, burns, x-algo, ai-percentage, agent-ui, agent-assistant
        │
        └─► Workers
              api            (Hono, api.duyet.net)
              agent-api      (chat, agents-api.duyet.net — dashboard route commented)
              news           (ingest workflow + SSR, news.duyet.net)
              paid-api       (x402; own wrangler, not in cf-worker-deploy.yml)

WASM (pnpm run wasm:build) is a build-time input for photos (exif) and
libs/string (utils). Pages CI installs the Rust toolchain when those
trees change.
```

Runtime data, not deploy edges:

- `insights` / `ai-percentage` / `burns` read ClickHouse / MotherDuck / GitHub at **build** time.
- `agent-ui` talks to `agent-api` at **runtime** (`/api/v1/chat` same-origin proxy in production).
- `news` hourly ingest is GitHub Actions → `POST /api/admin/ingest`, not a Worker cron.

## Pages vs Worker race

`cf-deploy.yml` and `cf-worker-deploy.yml` both fire on `master` pushes and do **not** `needs:` each other. That is safe for static Pages that bake data at build time.

The one runtime coupling is **agent-ui → agent-api**. A breaking Worker contract can land while Pages still serves the previous UI (or the reverse). Prefer:

1. Additive Worker changes first, then UI.
2. Manual `workflow_dispatch` of `cf-worker-deploy.yml` before merging a UI that requires the new API.

`news` is both a Pages-style TanStack app **and** a Worker (`wrangler.toml` has a Worker main plus assets). It deploys on the Worker train so package changes that only hit `packages/**` still ship the news client.

## Per-app command

```
pnpm run cf:deploy            # changed Pages apps, preview
pnpm run cf:deploy -- --prod  # production
pnpm run cf:deploy -- --force
pnpm run cf:deploy -- --dry-run
```

Worker apps use their own `pnpm run deploy` / `pnpm run cf:deploy:prod` from `apps/api`, `apps/agent-api`, `apps/news`.
