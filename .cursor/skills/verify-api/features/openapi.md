# OpenAPI

`GET /openapi.json` is the Worker document. It lists `/api/contact`, `/api/jd`, and `/api/comments` on a current build.

## Sub-features

- `openapi-200` answers HTTP 200 with `openapi` and `paths`.
- `openapi-submissions` includes the three submission paths.
- `openapi-worker-origin` is fetched from the Worker under test, not from `duyet.net`.

## How to get to it (user POV)

- Open `https://api.duyet.net/openapi.json`.
- Open `http://127.0.0.1:8787/openapi.json` under `wrangler dev`.
- Open `https://duyet.net/openapi.json` as the Pages mirror (not Worker proof).

## Driving it with verify-api

Preconditions:

- Workspace `node_modules` is installed.

- **Fetch.** Run `.cursor/skills/verify-api/bin/verify-api drive openapi`. `"status": 200`. Harness is `hono-app.request`.
- **Paths.** `"paths"` contains `/api/contact`, `/api/jd`, `/api/comments`.
- **Proof.** `evidenceDir/openapi.json` is the body from the Worker URL, not `https://duyet.net/openapi.json`.

## Gotchas

- After #1449, Pages mirrored OpenAPI while `api.duyet.net/openapi.json` still lacked the paths. Always compare origins.
- A 200 OpenAPI document without those three paths is the previous Worker.
