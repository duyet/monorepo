---
name: verify-api
description: Drive and prove apps/api (api.duyet.net) over HTTP and the production Wrangler D1 deploy plan. Use when verifying duyet-api health, OpenAPI, submissions, or that CI wrangler deploy will not auto-provision D1 by name.
---

# Verify api (apps/api)

Agent-facing skill for the Hono Cloudflare Worker at `apps/api` (live: `https://api.duyet.net`). Public callers use HTTP. Production publish is `pnpm --filter api deploy` (`scripts/deploy.ts` after `esbuild`). Do not treat unit tests as proof that Wrangler will publish, and do not treat `https://duyet.net/openapi.json` as proof that `api.duyet.net` is on the same SHA.

Harness binary (the lever): `.cursor/skills/verify-api/bin/verify-api`. Always invoke it by that path from the repo root. It prints JSON. Evidence survives cleanup under `$VERIFY_API_EVIDENCE` (default `/tmp/verify-api/<run-id>/`).

Feature map: [`features/README.md`](features/README.md). Drive the mapped feature you are claiming, not a convenient substitute.

## Launch

From the monorepo root, with pnpm 10 and workspace `node_modules` installed.

Local Worker HTTP uses the Hono module in-process (`app.request` via `.cursor/skills/verify-api/scripts/drive-http.ts`). That is the same worker source Wrangler bundles. `wrangler dev` is optional and often spins in a reload loop on overlay filesystems; do not treat a hung `dev-start` as a failed health claim when `drive health` already passed.

```bash
.cursor/skills/verify-api/bin/verify-api drive health
```

Production D1 plan does not need a server:

```bash
.cursor/skills/verify-api/bin/verify-api prove --feature production-d1
```

## Doctor

Read-only. Run first whenever anything looks off:

```bash
.cursor/skills/verify-api/bin/verify-api doctor
```

Pass requires:

- `apps/api/wrangler.toml` `name = "duyet-api"`.
- `apps/api/package.json` `deploy` runs `tsx scripts/deploy.ts`.
- `apps/api/src/lib/d1-deploy-plan.ts` and `apps/api/scripts/plan-production-deploy.ts` exist.
- Production plan (`pnpm --filter api deploy:plan`) has `ok: true` and `productionHasD1: false` until a real `database_id` UUID is committed.

Do not drive an instance whose doctor reports `deployUsesHelper: false` or `productionD1Safe: false`.

## Drive

Prefer the lever over ad-hoc grep. Recipes live in `features/`. Stable handles:

- Health: `GET /` and `GET /health`.
- OpenAPI: `GET /openapi.json` paths `/api/contact`, `/api/jd`, `/api/comments`.
- Contact: `POST /api/contact` with `Content-Type: application/json`.
- Production D1: `deploy:plan` JSON; production toml must not contain nameless `[[d1_databases]]`.

```bash
.cursor/skills/verify-api/bin/verify-api prove --feature production-d1
```

That is the proven-drive command for the CI deploy contract. For HTTP after `dev-start`:

```bash
.cursor/skills/verify-api/bin/verify-api drive health
.cursor/skills/verify-api/bin/verify-api drive openapi
.cursor/skills/verify-api/bin/verify-api drive submissions-contact
```

Live `https://api.duyet.net` is a separate check (`drive live-worker`). CF HIT on an old body without `contact` in `endpoints` means the Worker did not publish.

## Evidence

Named location: `/tmp/verify-api/<run-id>/` (printed as `evidenceDir` in every command's JSON). Capture:

- `report.json` — lever output.
- `doctor.json` / `plan.json` — doctor and `deploy:plan`.
- `health.json` / `openapi.json` — HTTP bodies when those features ran.
- `dev.log` when this lever started `wrangler dev`.

Proof standards:

- Exercise the Worker HTTP (local wrangler or live `api.duyet.net`), not only Vitest.
- For the D1 deploy contract, exercise `planProductionDeploy` / `deploy:plan`, not a comment in `wrangler.toml`.
- `https://duyet.net/openapi.json` can list new paths while `api.duyet.net` still 404s them. Always fetch the Worker origin you claim.
- Cleanup must not delete this directory.

## Cleanup

```bash
.cursor/skills/verify-api/bin/verify-api cleanup
```

Stops only the `wrangler dev` PID this lever started (recorded in `/tmp/verify-api/state.json`). Never `pkill wrangler` / `pkill workerd`. Never delete `evidenceDir`.

## Proven drive

2026-09-03 — `.cursor/skills/verify-api/bin/verify-api prove --feature production-d1`

Verdict: **VERIFIED**. `deployUsesHelper: true`, `productionD1Safe: true`, `stripD1: true`, `productionHasD1: false`, `applyMigrations: false`. Planned production toml has `[[send_email]]` and no `[[d1_databases]]`. Evidence: `/tmp/verify-api/20260903T180812Z/`.

HTTP via Hono `app.request`: `drive health` 200 with `listsContact: true`; `drive openapi` has the three submission paths; `drive submissions-contact` is 503 (no D1) and honeypot 202.

```bash
pnpm --filter api test
pnpm --filter api check-types
.cursor/skills/verify-api/bin/verify-api prove --feature production-d1
.cursor/skills/verify-api/bin/verify-api drive health
```

```bash
.cursor/skills/verify-api/bin/verify-api doctor
.cursor/skills/verify-api/bin/verify-api deploy-plan
.cursor/skills/verify-api/bin/verify-api drive production-d1
.cursor/skills/verify-api/bin/verify-api drive health
.cursor/skills/verify-api/bin/verify-api drive openapi
.cursor/skills/verify-api/bin/verify-api drive submissions-contact
.cursor/skills/verify-api/bin/verify-api drive live-worker
.cursor/skills/verify-api/bin/verify-api prove --feature production-d1
.cursor/skills/verify-api/bin/verify-api dev-start
.cursor/skills/verify-api/bin/verify-api dev-stop
.cursor/skills/verify-api/bin/verify-api cleanup
```

`--help` or an empty invocation prints the same list instead of JSON. All other commands emit one JSON object on stdout. Non-zero exit means the claim is not verified.
