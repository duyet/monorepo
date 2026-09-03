# duyet-api verification map

This directory is the maintained source for verifying user-facing behavior of `apps/api` (`https://api.duyet.net`). Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Work from the monorepo root with pnpm 10.
- Put `.cursor/skills/verify-api/bin` on `PATH` or invoke the binary by repo-relative path.
- Run `verify-api doctor` and require `deployUsesHelper: true` and `productionD1Safe: true`.
- For HTTP features, run `verify-api drive health` (Hono `app.request`). `dev-start` is optional `wrangler dev` and can spin a reload loop in this environment.
- `production-d1` and `live-worker` do not use the local server.

## Driving conventions

- Start every local HTTP recipe from a healthy `dev-start` unless the feature is config-only.
- Treat paths as literal (`/health`, `/openapi.json`, `/api/contact`).
- Run HTTP through `verify-api drive`.
- Cleanup stops only the wrangler PID in `/tmp/verify-api/state.json`. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the request (method, path, status) and the response body, not only that the port is open.
- Config proof includes `deploy:plan` JSON (`stripD1`, `productionHasD1`, `applyMigrations`).
- Live proof includes `cf-cache-status` and whether `GET /` lists `contact`.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-api` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Production D1 deploy](./production-d1.md) covers CI `wrangler deploy` without nameless D1 auto-provision.
- [Health](./health.md) covers `GET /` and `GET /health`.
- [OpenAPI](./openapi.md) covers `GET /openapi.json` listing submission paths.
- [Contact submission](./submissions-contact.md) covers `POST /api/contact`.
- [Live worker](./live-worker.md) covers `https://api.duyet.net` versus the Pages OpenAPI mirror.
