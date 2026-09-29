import { describe, expect, it, vi } from "vitest"

/**
 * The app serves these queries from ClickHouse and falls back to a DuckDB cache
 * when ClickHouse is unavailable. **A user must not see different numbers
 * depending on which backend answered**, so every query is emitted twice and
 * the two spellings have to be the same query.
 *
 * They were not always. `getCCUsageModels` counted rows with `COUNT()` on the
 * ClickHouse side and `COUNT(*)` on the DuckDB side — harmless today only
 * because both count rows in a `GROUP BY`, and a landmine the moment the
 * expression moved into a `HAVING` or a window. This suite exists so that
 * class of drift fails a test instead of waiting for someone to read both
 * halves carefully.
 *
 * The fetchers are exercised through their public entry points with the
 * ClickHouse and DuckDB transports mocked, so what is asserted is the SQL
 * that actually goes over the wire.
 */

type DateRangeDays = number | "all";
const RANGES: DateRangeDays[] = [1, 7, 30, 90, 365, "all"];

/** The two statements `executeAnalyticsQuery` was called with. */
type Sent = { clickhouse: string; duckdb: string };

const sent: Sent[] = [];
const counters: Record<string, unknown> = {};

// `executeServerClickHouseQuery` is reached through a dynamic import of
// "./database"; `executeDuckDBCacheQuery` through "./duckdb-cache". Both are
// mocked so the test never touches a database.
vi.mock("../database", () => ({
  // Returns **no rows** rather than rows on purpose: `executeAnalyticsQuery`
  // only falls through to the DuckDB cache when ClickHouse yields nothing, so
  // a successful-with-data mock would leave the second statement unobserved
  // and the whole suite vacuous.
  executeClickHouseQuery: vi.fn(async (query: string) => {
    sent.push({ clickhouse: query, duckdb: "" });
    return { success: true, data: [] };
  }),
  testClickHouseConnection: vi.fn(async () => ({
    success: true,
    message: "",
    details: {},
  })),
}));

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(async (query: string) => {
    const last = sent[sent.length - 1];
    if (last) last.duckdb = query;
    return [];
  }),
}));

const {
  getCCUsageModels,
  getCCUsageProjects,
  getCCUsageCosts,
  getCCUsageActivityByModel,
  getCCUsageMetrics,
} = await import("../data-fetchers");

/** Run a fetcher for a range and return the two statements it emitted. */
async function capture(
  fn: (days: DateRangeDays) => Promise<unknown>,
  days: DateRangeDays = 30
): Promise<Sent> {
  sent.length = 0;
  await fn(days);
  expect(sent.length).toBeGreaterThan(0);
  return sent[0]!;
}

/** Collapse whitespace so formatting differences are not mistaken for drift. */
const norm = (sql: string) => sql.replace(/\s+/g, " ").trim();

/**
 * The clauses that must be identical for the two statements to be the same
 * query.
 *
 * Two differences are legitimate and are normalised away, because they are the
 * entire point of the dialect split:
 *
 * - how "now" is spelled (`today()` vs `current_date`), inside `WHERE`;
 * - the *first selected* expression, which ClickHouse needs no cast for and
 *   DuckDB does (`date` vs `CAST(date AS VARCHAR) as date`).
 *
 * Everything else — **including the rest of the SELECT list**, the source
 * table, `GROUP BY`, `ORDER BY` and `LIMIT` — must match character for
 * character.
 *
 * The SELECT list is deliberately **not** excluded. An earlier version of this
 * dropped the whole clause to sidestep the date cast, and the consequence was
 * that a dialect silently dropping a token column from `SUM(...)` still
 * passed. That was found by mutating the source and watching nothing fail — a
 * reminder that a passing equivalence test means nothing until you have
 * watched it fail.
 */
function sharedClauses(sql: string): string[] {
  return norm(sql)
    // Two alternatives, not `\b`: after `today()` the next character is a
    // space, and `)` and a space are both non-word, so a trailing word
    // boundary there never matches and the normalisation silently did nothing.
    .replace(/today\(\)|current_date/g, "<now>")
    // Date-truncation expressions, which differ per dialect and appear in both
    // the SELECT list and the GROUP BY. Within one dialect the two must agree
    // with each other — asserted separately. This runs *before* the first-item
    // rule so that the rule sees a plain `<day>` rather than a cast plus a
    // trailing alias it would not match.
    .replace(
      /toDate\(\s*\w+\s*\)|CAST\(\s*\w+\s+AS (?:DATE|VARCHAR)\)(?:::VARCHAR)?/gi,
      "<day>"
    )
    // The first selected item, optionally aliased: `date`, `date as date`,
    // `<day> as date`. The alias is spelled the same on both sides — only the
    // expression it aliases differs.
    .replace(
      /^SELECT\s+(?:<day>|[A-Za-z_]\w*)(?:\s+as\s+date)?,/i,
      "SELECT <day>,"
    )
    .split(/(?=\b(?:SELECT|FROM|GROUP BY|ORDER BY|LIMIT)\b)/i)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

describe("the two dialect statements are the same query", () => {
  const fetchers = [
    ["getCCUsageModels", getCCUsageModels],
    ["getCCUsageProjects", getCCUsageProjects],
    ["getCCUsageCosts", getCCUsageCosts],
    ["getCCUsageActivityByModel", getCCUsageActivityByModel],
    ["getCCUsageMetrics", getCCUsageMetrics],
  ] as const;

  for (const [name, fn] of fetchers) {
    it(`${name}: identical FROM, GROUP BY, ORDER BY, LIMIT and aggregates`, async () => {
      const { clickhouse, duckdb } = await capture(fn as (d: DateRangeDays) => Promise<unknown>);

      expect(clickhouse).not.toBe("");
      expect(duckdb).not.toBe("");

      // Same source table.
      expect(norm(clickhouse)).toMatch(/FROM (\S+)/);
      expect(norm(duckdb).match(/FROM (\S+)/)?.[0]).toBe(
        norm(clickhouse).match(/FROM (\S+)/)?.[0]
      );

      // Same shape outside the legitimately-differing date spelling.
      expect(sharedClauses(duckdb)).toEqual(sharedClauses(clickhouse));
    });
  }

  it("getCCUsageModels counts rows the same way on both dialects", async () => {
    // The regression this file exists for. `COUNT()` is ClickHouse-only
    // syntax; `COUNT(*)` is portable, so both sides now emit the same one.
    const { clickhouse, duckdb } = await capture(getCCUsageModels);
    expect(clickhouse).toContain("COUNT(*) as usage_count");
    expect(duckdb).toContain("COUNT(*) as usage_count");
    expect(clickhouse).not.toMatch(/COUNT\(\s*\)/);
    expect(duckdb).not.toMatch(/COUNT\(\s*\)/);
  });

  it("getCCUsageActivityByModel truncates with the same expression it groups by", async () => {
    // `SELECT toDate(x)` with `GROUP BY CAST(x AS DATE)` is how a per-day
    // series silently collapses into one row. Each dialect must use its own
    // spelling in *both* places, and only its own.
    //
    // The DuckDB group-by expression gained a `::VARCHAR` it did not have
    // before: grouping by the string form rather than the date form. Same
    // groups, same ordering, and it now matches the projected column exactly —
    // but it is a change to emitted SQL and is called out rather than buried.
    const { clickhouse, duckdb } = await capture(getCCUsageActivityByModel);
    for (const [sql, spelling, other] of [
      [clickhouse, "toDate(created_at)", "CAST("],
      [duckdb, "CAST(created_at AS DATE)::VARCHAR", "toDate("],
    ] as const) {
      const select = /^\s*(.+?)\s+as\s+date,\s*$/im.exec(sql)?.[1]?.trim();
      const group = /GROUP BY\s+(.+?)\s*,\s*model_name/i.exec(sql)?.[1]?.trim();
      expect(select, sql).toBe(spelling);
      expect(group, sql).toBe(spelling);
      expect(sql).not.toContain(other);
    }
  });

  it("spells `now` the way each dialect requires", async () => {
    const { clickhouse, duckdb } = await capture(getCCUsageModels);
    expect(clickhouse).toContain("today() - INTERVAL 30 DAY");
    expect(duckdb).toContain("current_date - INTERVAL 30 DAY");
    expect(clickhouse).not.toContain("current_date");
    expect(duckdb).not.toContain("today()");
  });

  it("emits no WHERE clause at all for an unbounded range", async () => {
    for (const fn of [getCCUsageModels, getCCUsageProjects, getCCUsageCosts]) {
      sent.length = 0;
      await fn("all");
      const { clickhouse, duckdb } = sent[0]!;
      expect(clickhouse, "clickhouse").not.toMatch(/\bWHERE\b/i);
      expect(duckdb, "duckdb").not.toMatch(/\bWHERE\b/i);
    }
  });

  it("applies the same interval to every bounded range", async () => {
    for (const days of RANGES.filter((d) => d !== "all")) {
      const { clickhouse, duckdb } = await capture(getCCUsageModels, days);
      const interval = `INTERVAL ${days} DAY`;
      expect(clickhouse, `days=${days}`).toContain(interval);
      expect(duckdb, `days=${days}`).toContain(interval);
    }
  });
})
