# Production D1 deploy

Production `pnpm --filter api deploy` publishes `duyet-api` without calling Cloudflare `GET /accounts/.../d1/database/duyet-api-submissions` when `wrangler.toml` has no D1 `database_id` UUID. Remote migrations run only after that UUID is committed.

## Sub-features

- `d1-plan` prints `deploy:plan` JSON from the committed `wrangler.toml`.
- `d1-strip` omits `[[d1_databases]]` from the production config when `database_id` is missing or not a UUID.
- `d1-keep` keeps the binding and sets `applyMigrations` when `database_id` is a UUID.
- `d1-script` uses `tsx scripts/deploy.ts` as the `deploy` script, not a raw `wrangler deploy`.

## How to get to it (user POV)

- Push to `master` so `.github/workflows/cf-worker-deploy.yml` runs `pnpm run deploy` in `apps/api`.
- Run `pnpm --filter api deploy` locally with `CLOUDFLARE_API_TOKEN`.
- After creating D1 `duyet-api-submissions`, add `database_id` in `apps/api/wrangler.toml` and redeploy.

## Driving it with verify-api

Preconditions:

- `verify-api doctor` reports `deployUsesHelper: true`.
- Workspace dependencies are installed (`pnpm install`).

- **Doctor contract.** Run `.cursor/skills/verify-api/bin/verify-api doctor`. JSON has `"deployUsesHelper": true` and `"productionD1Safe": true`.
- **Plan.** Run `.cursor/skills/verify-api/bin/verify-api deploy-plan` (or `drive production-d1`). Exit `0`. `"ok": true`. While no UUID is committed, `"stripD1": true`, `"productionHasD1": false`, `"applyMigrations": false`, and the printed `toml` has no `[[d1_databases]]`.
- **Proof.** `evidenceDir/plan.json` contains that object. `apps/api/package.json` `scripts.deploy` contains `tsx scripts/deploy.ts`.

## Gotchas

- `wrangler.toml` still lists `[[d1_databases]]` without an id for local `wrangler dev`. Proof is the *planned* production toml, not the source file.
- `wrangler deploy --dry-run` on the *source* `wrangler.toml` still models the name lookup. Drive `deploy:plan`, not dry-run of the unstripped file.
- Pages `https://duyet.net/openapi.json` can list `/api/contact` while this Worker deploy is still red.
- After a UUID is committed, `"productionHasD1": true` and `"applyMigrations": true` is the passing shape. Do not expect strip forever.
