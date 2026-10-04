import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe("getModelCostShare", () => {
  let dir = "";

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "model-cost-share-"));
    const dbPath = join(dir, "analytics-cache.duckdb");
    const instance = await DuckDBInstance.create(dbPath);
    const connection = await instance.connect();
    await connection.run(`
      CREATE TABLE ccusage_model_breakdowns (
        created_at TIMESTAMP,
        model_name VARCHAR,
        input_tokens DOUBLE,
        output_tokens DOUBLE,
        cache_creation_tokens DOUBLE,
        cache_read_tokens DOUBLE,
        cost DOUBLE
      )
    `);
    await connection.run(`
      INSERT INTO ccusage_model_breakdowns VALUES
        ('2026-10-05', 'alpha', 10, 0, 0, 0, 3),
        ('2026-10-05', 'beta', 4, 0, 0, 0, 1)
    `);
    connection.closeSync();
    instance.closeSync();
    process.env.ANALYTICS_CACHE_PATH = dbPath;
  });

  afterAll(async () => {
    delete process.env.ANALYTICS_CACHE_PATH;
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  test("returns each model's cost share for the fixture", async () => {
    const { getModelCostShare } = await import("../insight-metrics");
    const share = await getModelCostShare("all");

    expect(share).toEqual([
      { name: "alpha", cost: 3, tokens: 10, pct: 75 },
      { name: "beta", cost: 1, tokens: 4, pct: 25 },
    ]);
  });
});
