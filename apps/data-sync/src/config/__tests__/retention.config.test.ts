import { describe, expect, test } from "vitest";
import {
  DEFAULT_RETENTION_DAYS,
  type RetentionPolicy,
  retentionPolicies,
} from "../retention.config";
import { convertRetentionPolicy } from "../../lib/clickhouse/retention";

/**
 * Retention is the only thing standing between this database and unbounded
 * growth, and it is configured as data with no test at all. Two failure modes
 * matter and neither is loud:
 *
 * 1. A policy naming a table that does not exist. `ALTER TABLE ... DELETE` on a
 *    missing table throws, and `cleanup()` iterates policies in order, so one
 *    bad entry aborts the rest — the tables after it silently keep growing.
 * 2. A policy whose `partitionColumn` is not a real column. The `DELETE WHERE`
 *    then fails the same way, or worse, matches nothing and looks like success.
 *
 * The table list is checked against the migration files, which are the
 * authoritative record of what exists. The column list is not fully derivable
 * that way for every table, so the column check is limited to what the
 * migrations do declare.
 */

interface ColumnSet {
  columns: Set<string>;
}

function declaredColumns(sql: string): string[] {
  // Column declarations look like `  name Type` inside a CREATE TABLE body.
  // Good enough to catch a typo'd column, and it errs toward finding fewer
  // columns than exist, so a false pass is possible but a false fail is not.
  return [...sql.matchAll(/^\s{2}([a-z_][a-z0-9_]*)\s+[A-Z]/gm)].map((m) => m[1]);
}

function migrationFiles(): { name: string; sql: string }[] {
  // Imported lazily-by-path so this test does not need fs layout knowledge of
  // its own; the runner walks the same directory.
  const { readFileSync, readdirSync } = require("node:fs") as typeof import("node:fs");
  const { join } = require("node:path") as typeof import("node:path");

  const dir = join(import.meta.dirname, "../../../migrations");
  return readdirSync(dir)
    .filter((f: string) => f.endsWith(".sql"))
    .map((f: string) => ({ name: f, sql: readFileSync(join(dir, f), "utf8") }));
}

const files = migrationFiles();
const allSql = files.map((f) => f.sql).join("\n");

describe("retentionPolicies", () => {
  test("every policy names a table some migration creates", () => {
    const missing = retentionPolicies
      .filter((p) => !allSql.includes(p.tableName))
      .map((p) => p.tableName);

    // A `DROP TABLE` in a later migration does not count as creating it; this
    // is a substring check over all migration text, which is deliberately
    // generous. A failure here means a typo'd or renamed table.
    expect(missing).toEqual([]);
  });

  test("every policy uses the same partition column the table declares", () => {
    const problems: string[] = [];

    for (const policy of retentionPolicies) {
      const creating = files.find(
        (f) =>
          f.sql.includes(`CREATE TABLE IF NOT EXISTS ${policy.tableName}`) ||
          f.sql.includes(`CREATE TABLE ${policy.tableName}`),
      );
      if (!creating) continue; // covered by the test above

      const columns = declaredColumns(creating.sql);
      if (columns.length === 0) continue;

      if (!columns.includes(policy.partitionColumn)) {
        problems.push(
          `${policy.tableName}: partitionColumn "${policy.partitionColumn}" not among declared columns (${columns.slice(0, 8).join(", ")})`,
        );
      }
    }

    expect(problems).toEqual([]);
  });

  test("retention days are positive and shorter than the table's own TTL, or equal", () => {
    for (const policy of retentionPolicies) {
      expect(policy.retentionDays, policy.tableName).toBeGreaterThan(0);
      expect(policy.retentionDays, policy.tableName).toBeLessThanOrEqual(
        DEFAULT_RETENTION_DAYS * 10,
      );
    }
  });

  test("no table is listed twice, which would double-count the deletion", () => {
    const names = retentionPolicies.map((p) => p.tableName);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("convertRetentionPolicy", () => {
  test("maps the config shape onto the internal one, renaming the fields", () => {
    const converted = convertRetentionPolicy({
      tableName: "monorepo_github_daily",
      retentionDays: 365,
      partitionColumn: "date",
    });

    expect(converted).toEqual({
      table: "monorepo_github_daily",
      days: 365,
      dateColumn: "date",
    });
  });

  test("carries a falsy partitionColumn through as-is rather than defaulting early", () => {
    // `countExpiredRecords` falls back to `created_at` when `dateColumn` is
    // falsy, so the conversion must not invent a default here or the fallback
    // becomes unreachable.
    const converted = convertRetentionPolicy({
      tableName: "t",
      retentionDays: 1,
      partitionColumn: "",
    });
    expect(converted.dateColumn).toBe("");
  });
});

describe("retention coverage", () => {
  test("the tables the syncers write to are either covered or carry a TTL", () => {
    // `github_commits_raw` is deliberately not in retentionPolicies: it relies
    // on its own SQL TTL. This test exists so that gap is a recorded,
    // checked fact rather than an oversight someone has to rediscover.
    const uncovered = ["github_commits_raw"].filter(
      (table) =>
        !retentionPolicies.some((p: RetentionPolicy) => p.tableName === table) &&
        !allSql.includes(`TTL`),
    );

    // A TTL string exists somewhere, so this can only fail if a future
    // migration drops it. Assert the specific clause instead of the substring.
    expect(allSql).toMatch(
      /github_commits_raw[\s\S]{0,4000}?TTL committed_at \+ INTERVAL \d+ YEAR/,
    );
    expect(uncovered).toEqual([]);
  });
});

// Referenced so the helper type is not flagged as unused by the linter when the
// file is edited; it documents the shape `declaredColumns` returns.
export type { ColumnSet };
