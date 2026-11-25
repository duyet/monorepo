import { Database } from "duckdb-async";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { withDedupedDaily } from "./dedupe";

let db: Database;

type Row = {
  date: string;
  source: string;
  machine: string;
  model: string;
  account: string | null;
  type?: string;
  tokens: number;
  cost: number;
};

const rows: Row[] = [
  // direct-only key: counted as is
  { date: "2026-01-01", source: "a", machine: "m1", model: "x", account: null, tokens: 100, cost: 1 },
  // hub-only key: counted as is
  { date: "2026-01-01", source: "a", machine: "m2", model: "x", account: "acc", tokens: 200, cost: 2 },
  // paired key: hub wins, including its corrected cost
  { date: "2026-01-02", source: "b", machine: "m1", model: "y", account: null, tokens: 300, cost: 50 },
  { date: "2026-01-02", source: "b", machine: "m1", model: "y", account: "acc", tokens: 300, cost: 5 },
  // empty-string account_id is a direct copy
  { date: "2026-01-02", source: "b", machine: "m1", model: "y", account: "", tokens: 300, cost: 60 },
  // two component rows inside one copy are summed
  { date: "2026-01-03", source: "c", machine: "m1", model: "z", account: "acc", tokens: 10, cost: 0.5 },
  { date: "2026-01-03", source: "c", machine: "m1", model: "z", account: "acc", tokens: 20, cost: 0.25 },
  { date: "2026-01-03", source: "c", machine: "m1", model: "z", account: null, tokens: 30, cost: 9 },
  // non-daily rows are excluded
  { date: "2026-01-04", source: "d", machine: "m1", model: "w", account: null, type: "session", tokens: 999, cost: 99 },
];

async function deduped() {
  const out = await db.all(
    withDedupedDaily(
      "SELECT CAST(date AS VARCHAR) AS date, source, machine_name, model_name, total_tokens, cost FROM deduped_daily ORDER BY date, source, machine_name",
    ),
  );
  return out.map((r) => ({
    date: String(r.date),
    source: String(r.source),
    machine: String(r.machine_name),
    tokens: Number(r.total_tokens),
    cost: Number(r.cost),
  }));
}

beforeAll(async () => {
  db = await Database.create(":memory:");
  await db.exec(`CREATE TABLE ccusage_events (
    record_type VARCHAR, date DATE, source VARCHAR, machine_name VARCHAR,
    model_name VARCHAR, account_id VARCHAR,
    input_tokens BIGINT, output_tokens BIGINT,
    cache_creation_tokens BIGINT, cache_read_tokens BIGINT,
    total_tokens BIGINT, cost DOUBLE
  )`);
  for (const r of rows) {
    await db.run(
      "INSERT INTO ccusage_events VALUES (?, CAST(? AS DATE), ?, ?, ?, ?, 0, 0, 0, 0, ?, ?)",
      r.type ?? "daily", r.date, r.source, r.machine, r.model, r.account, r.tokens, r.cost,
    );
  }
});

afterAll(async () => {
  await db.close();
});

describe("withDedupedDaily", () => {
  test("keeps direct-only and hub-only keys", async () => {
    const out = await deduped();
    expect(out.find((r) => r.source === "a" && r.machine === "m1")).toMatchObject({ tokens: 100, cost: 1 });
    expect(out.find((r) => r.source === "a" && r.machine === "m2")).toMatchObject({ tokens: 200, cost: 2 });
  });

  test("prefers the hub copy when both exist, with its cost", async () => {
    const out = (await deduped()).filter((r) => r.source === "b");
    expect(out).toEqual([{ date: "2026-01-02", source: "b", machine: "m1", tokens: 300, cost: 5 }]);
  });

  test("sums component rows inside the chosen copy only", async () => {
    const out = (await deduped()).filter((r) => r.source === "c");
    expect(out).toHaveLength(1);
    expect(out[0].tokens).toBe(30);
    expect(out[0].cost).toBeCloseTo(0.75);
  });

  test("excludes non-daily rows", async () => {
    expect((await deduped()).some((r) => r.source === "d")).toBe(false);
  });

  test("grand total counts each key once", async () => {
    const [row] = await db.all(withDedupedDaily("SELECT SUM(total_tokens) AS t FROM deduped_daily"));
    expect(Number(row.t)).toBe(100 + 200 + 300 + 30);
  });
});
