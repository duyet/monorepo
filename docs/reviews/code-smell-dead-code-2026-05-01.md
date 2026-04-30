# Code Smell and Dead Code Review - 2026-05-01

## Scope

- Reviewed changes since `2026-04-29T21:00:53Z`.
- Recently modified files:
  - `CLAUDE.md`
  - `apps/insights/app/ai/utils/data-fetchers.ts`
  - `apps/insights/scripts/sync-analytics-cache.ts`
  - `apps/photos/lib/duckdb-provider.ts`

## Findings

### Warning: unused ClickHouse HTTP client in SSH cache sync mode

- File: `apps/insights/scripts/sync-analytics-cache.ts`
- Lines before fix: `368-375`, `319-321`, `403`
- Issue: `main()` always created a ClickHouse HTTP client, but `fetchRows()` immediately bypassed that client in SSH mode and used `runSshClickHouseQuery()` instead.
- Fix: create the HTTP client only for direct ClickHouse mode, use an explicit SSH fetch mode when no HTTP client is needed, close the client only when it exists, and keep the HTTP config helper direct-mode-only.
- Behavior impact: none intended. Direct mode still uses the same client config. SSH mode still runs the same SSH query path.

## Dead Code Evidence

No confident dead-code removals were found in recently modified non-test files.

Search evidence:

```bash
rg -n "\b(useSshClickHouse|getSshHost|getClickHouseConfig|materializeQueryParams|sqlString|querySpecs|UNSPLASH_USERNAME)\b" . -g '!**/*.test.*' -g '!**/__tests__/**'
```

The reviewed symbols all had live non-test references, or were part of the same executable script flow.
