# 31 — Data observability: freshness, status page, alerts, quality

**Area:** Data · **Effort:** M · **Impact:** High · **Conflict group:** data-sync + api + insights + CI · **Depends on:** `30` (freshness surfaced via api) helpful.

## Problem

Dashboards are stale-by-design with **no freshness signal** and a **silent-failure culture** (empty catches, `failOnError:false`, `allSettled` without reporting). `ai-code-percentage` has **no scheduled sync** so ai-percentage silently rots; its **TimeRange filter is wired to nothing** (`days=365` hardcoded). Raw tables grow unbounded; backfills can't resume. Nobody is alerted when a sync breaks.

## Outcome / acceptance criteria

- [ ] A `data_sync_status` table (per-source last-run, row count, status, watermark) written by every syncer.
- [ ] api exposes freshness; every dashboard shows an "updated X ago" badge.
- [ ] A public status page (per-source sync status + a deep `/health` covering dependencies).
- [ ] `ai-code-percentage` has a dedicated daily workflow.
- [ ] ai-percentage TimeRange filter actually drives the charts (thread `days`).
- [ ] Anomaly alerts (spike/drop/zero-row) on key metrics → Slack/GitHub summary.
- [ ] Post-sync data-quality checks that fail loudly (non-null keys, monotonic dates, row-count deltas).
- [ ] Backfill watermark/resume + retention for raw tables.

## Scope

**In:** everything above. **Out:** api caching/docs (`30`), date-range/drill-down UI (`32`).

## Key files

- `apps/data-sync/src/lib/base/syncer.ts`, new `src/lib/validate.ts` + `src/commands/alerts.ts`, `src/config/retention.config.ts`, `src/syncers/*`, new migration for `data_sync_status`
- `apps/api/src/index.ts` (deep `/health`), `apps/api/src/routes/insights.ts`
- `apps/insights/**` (freshness badges + new `status.tsx`), `apps/burns/src`, `apps/ai-percentage/{components,src/routes,lib}`
- `.github/workflows/` (new `data-sync-ai-code-percentage.yml`, alert step in the template)

## Approach

1. Add the `data_sync_status` table + write watermarks from `BaseSyncer`. Extend retention to raw tables.
2. Deep `/health` in api (checks ClickHouse + external deps); expose freshness on metrics endpoints.
3. Freshness badges across insights/burns/ai-percentage; new `insights/status` page.
4. New daily `ai-code-percentage` workflow; fix ai-percentage TimeRange (thread `days` into SWR keys + API `days`).
5. `validate.ts` post-sync assertions (fail the job); `alerts.ts` anomaly detection → existing Slack webhook.
6. Deploy; QA badges, status page, a deliberately-stale source alerting.

## Verification

```
pnpm --filter @duyet/data-sync run check-types
pnpm --filter @duyet/data-sync exec tsx src/index.ts migrate status
# Manual: dashboards show "updated X ago"; /status lists sources; ai-percentage range switch changes the chart.
```

## Risks

- False-positive anomaly/quality alerts on legitimately sparse days — tune thresholds; start warn-only.
- Migration ordering — see `90` for the misordered `20250109_*` rename; sequence the new migration correctly.

## Kickoff Prompt

> You are running plan `plans/31-data-observability.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md` (data-sync command notes), then the plan.
>
> Deliver: (1) a `data_sync_status` table + watermarks written by `BaseSyncer`, and extend `retention.config.ts` to cover raw tables. (2) A deep `/health` in `apps/api` (checks ClickHouse + deps) and freshness fields on metrics endpoints. (3) "updated X ago" badges across insights/burns/ai-percentage + a new `apps/insights/src/routes/status.tsx`. (4) A dedicated daily `data-sync-ai-code-percentage.yml` workflow. (5) Fix the ai-percentage TimeRange filter so it actually drives the charts (thread `days` into the SWR keys + API `days` — today `AIPercentageTrend.tsx`/`AIPercentageChart.tsx` hardcode 365). (6) `src/lib/validate.ts` post-sync quality checks that fail the job + `src/commands/alerts.ts` anomaly detection to the existing Slack webhook (start warn-only). (7) Backfill watermark/resume.
>
> Verify `check-types` + `migrate status`, deploy, and browser-QA freshness badges + the status page, and confirm the ai-percentage range switch changes the chart. Semantic commits (`feat(insights)`, `feat(api)`, `ci`, `feat` for data-sync). Update the plan Status and note thresholds in `docs/ai/core-memory.md`.
