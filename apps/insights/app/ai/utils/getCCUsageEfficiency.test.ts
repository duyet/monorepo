import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./database", () => ({
  executeClickHouseQuery: vi.fn(),
  testClickHouseConnection: vi.fn(),
}));

vi.mock("./duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(),
}));

import { executeClickHouseQuery } from "./database";
import { executeDuckDBQuery } from "./duckdb-cache";
import { getCCUsageEfficiency } from "./data-fetchers";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "ccusage-efficiency.json",
    ),
    "utf-8",
  ),
) as {
  rows: Record<string, unknown>[];
  series: Array<{ date: string; "Efficiency Score": number }>;
};

beforeEach(() => {
  vi.resetModules();
  vi.mocked(executeClickHouseQuery).mockReset();
  vi.mocked(executeDuckDBQuery).mockReset();
  vi.mocked(executeClickHouseQuery).mockResolvedValue({
    success: true,
    data: fixture.rows,
  });
  vi.mocked(executeDuckDBQuery).mockResolvedValue(fixture.rows);
});

describe("getCCUsageEfficiency", () => {
  test("rounds fixture tokens-per-dollar into an efficiency score", async () => {
    await expect(getCCUsageEfficiency()).resolves.toEqual(fixture.series);
  });
});
