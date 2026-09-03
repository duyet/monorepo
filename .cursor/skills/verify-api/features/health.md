# Health

Callers can ask whether the Worker is up. `GET /health` returns `{status:"ok"}`. `GET /` returns `{name, version, status:"healthy", endpoints}`.

## Sub-features

- `health-ok` answers `GET /health` with HTTP 200 and `"status":"ok"`.
- `health-root` answers `GET /` with HTTP 200 and `"status":"healthy"`.
- `health-submissions-listed` includes `contact`, `jd`, and `comments` in `endpoints` on a current build.

## How to get to it (user POV)

- Open `https://api.duyet.net/health`.
- Open `https://api.duyet.net/`.
- Hit the same paths on local `wrangler dev` (`http://127.0.0.1:8787`).

## Driving it with verify-api

Preconditions:

- `verify-api doctor` reports `productionD1Safe: true`.

- **Health.** Run `.cursor/skills/verify-api/bin/verify-api drive health`. `"healthStatus": 200` and `"healthOk": true`. Harness is `hono-app.request`.
- **Root.** Same command. `"rootStatus": 200` and `"rootHealthy": true`.
- **Endpoints.** `"listsContact": true`. A current bundle lists `contact` under `endpoints`.
- **Proof.** `evidenceDir/health.json` and `evidenceDir/root.json` hold the bodies.

## Gotchas

- Live `api.duyet.net` can be CF HIT on the previous Worker. A 200 without `contact` is the old deploy, not a pass for submissions.
- Global rate limit is 600/minute. Health checks are cheap; do not loop.
