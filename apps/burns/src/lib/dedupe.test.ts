import { describe, expect, test } from "vitest";
import {
  DEDUPED_DAILY_TABLE,
  dedupedDailyCte,
  withDedupedDaily,
} from "./dedupe";

describe("dedupedDailyCte", () => {
  const sql = dedupedDailyCte();

  test("keeps one row per date, source, machine and model", () => {
    expect(sql).toMatch(
      /PARTITION BY date, source, machine_name, model_name\s+ORDER BY/,
    );
    expect(sql).toMatch(/\) = 1/);
  });

  test("prefers the hub copy (non-empty account_id) over the direct copy", () => {
    expect(sql).toContain("(COALESCE(account_id, '') <> '') AS is_hub_copy");
    expect(sql).toMatch(/ORDER BY is_hub_copy DESC/);
  });

  test("sums inside each copy before choosing one, so copies never add up", () => {
    const inner = sql.slice(0, sql.indexOf("QUALIFY"));
    expect(inner).toMatch(/GROUP BY date, source, machine_name, model_name, is_hub_copy/);
    expect(inner).toContain("WHERE record_type = 'daily'");
  });

  test("exposes the table name that queries read", () => {
    expect(sql.startsWith(`${DEDUPED_DAILY_TABLE} AS (`)).toBe(true);
  });
});

describe("withDedupedDaily", () => {
  test("prefixes a select with the CTE", () => {
    const out = withDedupedDaily("SELECT 1 FROM deduped_daily");
    expect(out.startsWith("WITH deduped_daily AS (")).toBe(true);
    expect(out.endsWith("SELECT 1 FROM deduped_daily")).toBe(true);
  });
});
