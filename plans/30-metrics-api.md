# 30 — Unified metrics API: caching, OpenAPI, export, widgets

**Area:** Data · **Effort:** M–L · **Impact:** High · **Conflict group:** apps/api · **Depends on:** `00` (api auth + rate limit lands there first).

## Problem

`apps/api` (Hono Worker) is the de-facto metrics backend but has **no KV caching** (recomputes ClickHouse/external calls every request), no OpenAPI/docs (README documents a drifted `/api/ai-description`), and no export/emb, widgets. `/api/insights/overview` swallows partial failures via `allSettled` with no `errors[]`. Once `00` adds auth+rate-limit, this plan makes it a real service every dashboard + external embed can consume.

## Outcome / acceptance criteria

- [ ] KV caching layer with per-endpoint TTL + stale-while-revalidate; ClickHouse/external calls shielded.
- [ ] OpenAPI spec (`@hono/zod-openapi`) + Swagger UI route; README corrected to real endpoints.
- [ ] Export endpoints `GET /api/**/export?format=csv|json`.
- [ ] Embeddable widget endpoints (SVG/iframe) for AI %, tokens, coding hours — usable in blog/README.
- [ ] `/api/insights/overview` returns `errors[]` metadata + `generatedAt`.

## Scope

**In:** caching, OpenAPI, export, widgets, error metadata. **Out:** auth/rate-limit (`00`), freshness table + status page (`31`), dashboard UI (`32`).

## Key files

- `apps/api/src/index.ts`, `apps/api/src/routes/{insights,ai-percentage,card-description-streaming}.ts`, new `src/lib/cache.ts`, new `src/routes/{export,widgets}.ts`, `src/openapi.ts`, `apps/api/wrangler.toml` (KV), `apps/api/README.md`

## Approach

1. Add a KV binding; wrap handlers in a `cached(key, ttl, fn)` helper with SWR.
2. Add `@hono/zod-openapi`: define zod schemas per route, serve `/openapi.json` + Swagger UI. Fix README drift.
3. Add `export` (csv/json) + `widgets` (SVG/iframe) routes built on the cached metrics.
4. Add `errors[]` + `generatedAt` to `/api/insights/overview`.
5. Deploy; verify caching (repeat calls hit KV), docs render, exports download, a widget embeds in a test page.

## Verification

```
pnpm --filter @duyet/api run check-types && pnpm --filter @duyet/api run test
curl -s https://api.duyet.net/openapi.json | jq '.info.title'
curl -s "https://api.duyet.net/api/ai/percentage/history?format=csv" -H "Authorization: Bearer $API_TOKEN" | head
```

## Risks

- Cache invalidation — keep TTLs modest; add a purge on deploy if needed.
- Widgets are a new public surface — ensure they inherit auth/rate-limit posture from `00` (or are explicitly public + cached).

## Kickoff Prompt

> You are running plan `plans/30-metrics-api.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. **Requires `plans/00` auth+rate-limit already landed on `apps/api`** — if not, land that first.
>
> Deliver in `apps/api`: (1) a KV caching layer (`src/lib/cache.ts`) with per-endpoint TTL + stale-while-revalidate; add the KV binding to `wrangler.toml`. (2) OpenAPI via `@hono/zod-openapi` with zod schemas per route, an `/openapi.json` + Swagger UI route, and a corrected README (real endpoints: `/api/llm/generate`, `/api/ai/percentage/*`, `/api/insights/overview`). (3) `export?format=csv|json` endpoints. (4) Embeddable SVG/iframe widget endpoints for AI %, tokens, coding hours. (5) `errors[]` + `generatedAt` on `/api/insights/overview`.
>
> Verify `check-types`+`test`, deploy, and confirm repeat calls hit KV, `/openapi.json` renders, an export downloads, and a widget embeds in a scratch HTML page. Semantic commits (`feat(api)`). Update the plan Status.
