/**
 * Resolve the active analytics data source.
 *
 * Two backends share the same DuckDB query API:
 *   - Local: a DuckDB file under ANALYTICS_CACHE_PATH, populated by
 *     scripts/sync-analytics-cache.ts.
 *   - MotherDuck: cloud DuckDB, populated by scripts/sync-to-motherduck.ts.
 *
 * Dashboards call `getAnalyticsSource()` and the resolver picks
 * MotherDuck when MOTHERDUCK_TOKEN is set, else falls back to the
 * local file. This lets the same query layer power both offline
 * prerender (local cache) and live dashboards (MotherDuck) without
 * any code change at the call site.
 */
import { ANALYTICS_CACHE_PATH } from "./analytics-cache-path";

export type AnalyticsSource =
  | { kind: "motherduck"; database: string; token: string }
  | { kind: "local"; path: string };

export function getAnalyticsSource(): AnalyticsSource {
  const token = process.env.MOTHERDUCK_TOKEN;
  if (token) {
    return {
      kind: "motherduck",
      database: process.env.MOTHERDUCK_DATABASE ?? "duyet_analytics",
      token,
    };
  }
  return { kind: "local", path: ANALYTICS_CACHE_PATH };
}

export function describeAnalyticsSource(source: AnalyticsSource): string {
  return source.kind === "motherduck"
    ? `MotherDuck (md:${source.database})`
    : `Local DuckDB (${source.path})`;
}
