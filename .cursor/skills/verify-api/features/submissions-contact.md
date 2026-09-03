# Contact submission

`POST /api/contact` accepts `{name, email, message}` as JSON. A valid body is 202 `{id, status:"pending"}` when D1 is bound, 503 when `SUBMISSIONS_DB` is missing, and 404 on a Worker that never shipped the route.

## Sub-features

- `contact-json` requires `Content-Type: application/json`.
- `contact-accept` returns 202 with `status: pending` when D1 is bound.
- `contact-unavailable` returns 503 `{error:"Service Unavailable"}` when the production deploy omitted D1.
- `contact-honeypot` returns 202 and stores nothing when `website` is non-empty.

## How to get to it (user POV)

- `POST https://api.duyet.net/api/contact` with JSON.
- `POST https://duyet.net/api/contact` through the home Pages proxy.
- `POST http://127.0.0.1:8787/api/contact` under `wrangler dev`.

## Driving it with verify-api

Preconditions:

- Workspace `node_modules` is installed.
- Body is `{name, email, message}` JSON.

- **Post.** Run `.cursor/skills/verify-api/bin/verify-api drive submissions-contact`. Status is `202` (D1 bound) or `503` (no binding). Never `404`. Harness is `hono-app.request`.
- **Honeypot.** Same command posts `website: "http://spam.example"` and expects `202`.
- **Proof.** `evidenceDir/contact.json` has the status and a body that is not `{"error":"Not Found"}`.

## Gotchas

- Live `api.duyet.net` returned 404 for this path while Pages OpenAPI already listed it. 404 means the Worker SHA is old, not that the parser rejected the body.
- Rate limit is 5 per IP per 10 minutes on this route, plus the global 600/minute limiter.
- Do not log the submitted fields. The route tests fail if a field or client IP appears on stdout.
