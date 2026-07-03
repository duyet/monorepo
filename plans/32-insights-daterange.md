# 32 — Insights: free date-range + drill-down + YoY

**Area:** Data · **Effort:** L · **Impact:** High · **Conflict group:** apps/insights · **Depends on:** `30` (cached, range-aware api) strongly; `31` (freshness).

## Problem

Insights only offers fixed period switches (30d/90d/6m/1y/all) — no free date-range picker, no click-through drill-down, no year-over-year. The data is build-time only. This plan makes insights genuinely explorable, backed by the cached metrics API so ranges can be dynamic without per-request ClickHouse load.

## Outcome / acceptance criteria

- [ ] A shared date-range picker (shadcn) driving all insights sections; range persisted in the URL.
- [ ] Charts support drill-down (click a bar/point → detail view or filtered sub-range).
- [ ] Year-over-year / historical trend comparisons where meaningful (traffic, tokens, coding hours).
- [ ] Dynamic ranges served by the cached api (`30`) — not a full rebuild per range.
- [ ] A unified insights home tying the sections together ("life dashboard" direction).

## Scope

**In:** date-range, drill-down, YoY, dynamic fetch, unified home. **Out:** api caching (`30`), freshness/alerts (`31`).

## Key files

- `apps/insights/src/routes/**` (ai, github, wakatime, blog, compare/*, new index), `apps/insights/app/**/utils/*` (range-aware queries), shared date-range component (shadcn)
- consumes `apps/api` range-aware endpoints from `30`

## Approach

1. Build a shadcn date-range picker; thread the selected range through a URL param into section loaders.
2. Move runtime range fetches to the cached api endpoints (`30`) so arbitrary ranges don't rebuild; keep the prerendered default for first paint.
3. Add drill-down interactions (Recharts click handlers → detail/sub-range).
4. Add YoY overlays where the data supports it.
5. Compose a unified insights home. Deploy; QA range changes, drill-down, YoY, light/dark, mobile.

## Verification

```
pnpm --filter @duyet/insights run check-types
# Manual: pick an arbitrary range → charts update from api (not stale build data); drill into a bar; YoY overlay renders.
```

## Risks

- Prerender vs dynamic tension — default range prerendered, custom ranges fetched client-side from api. Keep the static-first default.
- Requires `30`'s range-aware, cached endpoints — sequence after `30`.

## Kickoff Prompt

> You are running plan `plans/32-insights-daterange.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md` (note: insights is static frontend + Worker API calls — do NOT use TanStack Start server functions for runtime data; call `apps/api`), then the plan. **Requires `plans/30`'s cached, range-aware api endpoints.**
>
> Deliver in `apps/insights`: (1) a shared shadcn date-range picker driving all sections, range persisted in the URL. (2) Runtime custom-range fetches from the cached `apps/api` endpoints (keep the prerendered default range for first paint). (3) Drill-down on charts (Recharts click → detail/sub-range). (4) Year-over-year overlays for traffic/tokens/coding-hours. (5) A unified insights home composing the sections.
>
> Keep shadcn + recharts only, static-first (default prerendered, custom ranges client-fetched from api). Verify `check-types`, deploy, and browser-QA arbitrary range changes, drill-down, and YoY in light/dark at desktop and ~390px. Semantic commits (`feat(insights)`). Update the plan Status.
