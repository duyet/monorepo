# Live worker

`https://api.duyet.net` is the published Worker. A Pages 200 on `https://duyet.net` or `https://duyet.net/openapi.json` does not mean this origin updated.

## Sub-features

- `live-health` `GET https://api.duyet.net/health` is HTTP 200.
- `live-root` `GET https://api.duyet.net/` lists current `endpoints`.
- `live-contact` `POST /api/contact` is not 404 on a current SHA.
- `live-vs-pages` Pages OpenAPI is not used as Worker proof.

## How to get to it (user POV)

- Open `https://api.duyet.net/`.
- Compare `https://api.duyet.net/openapi.json` with `https://duyet.net/openapi.json`.

## Driving it with verify-api

Preconditions:

- Network egress to `api.duyet.net` is allowed.
- No local wrangler is required.

- **Live.** Run `.cursor/skills/verify-api/bin/verify-api drive live-worker`. `"healthStatus": 200`.
- **Current script.** `"listsContact": true` on `GET /`. `"contactStatus"` is not `404`.
- **Proof.** `evidenceDir/live-root.json`. Record `cf-cache-status` when present. HIT plus a body without `contact` is the previous Worker.

## Gotchas

- CF cache can keep the old `GET /` body. Check `endpoints.contact`, not only HTTP 200.
- After a failed `wrangler deploy`, Total Upload in the log does not mean the new script is live.
