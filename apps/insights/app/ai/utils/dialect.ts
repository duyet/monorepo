import type { DateRangeDays } from "../types";
import { buildDateCondition, validateDaysParameter } from "./queries";

/**
 * DuckDB date filter for a column.
 *
 * Exported for `insight-metrics.ts`, which builds its own DuckDB statements
 * from it. Expressed through {@link DIALECT} so the `current_date` spelling
 * has exactly one home.
 */
export function getDuckDBDateCondition(days: DateRangeDays, column: string): string {
  return dateFilter("duckdb", days, column);
}

/**
 * The analytics dialect axis, in one place.
 *
 * The app serves these queries from ClickHouse and falls back to a DuckDB
 * cache when ClickHouse is unavailable, so **the same logical query is emitted
 * twice**. That only works if the two spellings are provably the same query,
 * which is the property the duplication kept quietly breaking — see
 * `getCCUsageModels`, which counted rows with `COUNT()` on one side and
 * `COUNT(*)` on the other.
 *
 * Only three things actually differ between the dialects:
 *
 * 1. how "now" is spelled — `today()` vs `current_date`;
 * 2. how a timestamp is truncated to a date and rendered as a string;
 * 3. one interval filter that ClickHouse needs table-qualified, because its
 *    `MAX(last_activity) AS last_activity` alias shadows the raw column and
 *    the engine resolves an unqualified `WHERE` reference to the aggregate.
 *
 * Everything else — column list, aggregation, `GROUP BY`, `ORDER BY`, `LIMIT`
 * — must be identical, and that is enforced by `data-fetchers.test.ts`.
 */
export const DIALECT = {
  clickhouse: {
    now: "today()",
    /** Truncate a timestamp to a date, rendered as a string. */
    toDate: (column: string) => `toDate(${column})`,
  },
  duckdb: {
    now: "current_date",
    toDate: (column: string) => `CAST(${column} AS DATE)::VARCHAR`,
  },
} as const;

export type Dialect = keyof typeof DIALECT;

/** The date filter for one dialect, on one column. */
export function dateFilter(
  dialect: Dialect,
  days: DateRangeDays,
  column: string,
): string {
  return buildDateCondition(column, days, DIALECT[dialect].now);
}

/**
 * Inclusive interval filter that survives a shadowing select alias.
 *
 * `getCCUsageProjects` selects `MAX(last_activity) AS last_activity`, so
 * ClickHouse resolves an unqualified `WHERE last_activity` to that aggregate
 * and rejects the query ("aggregate function ... found in WHERE"). Qualifying
 * the column forces it to the raw one. Returns `""` for an unbounded range,
 * matching `buildDateCondition`.
 */
export function qualifiedIntervalFilter(
  dialect: Dialect,
  days: DateRangeDays,
  column: string,
): string {
  const safeDays = validateDaysParameter(days);
  if (safeDays === "all") return "";
  return `WHERE ${column} >= ${DIALECT[dialect].now} - INTERVAL ${safeDays} DAY`;
}
