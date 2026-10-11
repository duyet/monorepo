import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../database", () => ({
  executeClickHouseQuery: vi.fn(),
}));

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(),
}));

import { getCCUsageActivityRaw } from "../data-fetchers";
import { executeClickHouseQuery } from "../database";
import { executeDuckDBQuery } from "../duckdb-cache";

const clickHouse = vi.mocked(executeClickHouseQuery);
const duckdb = vi.mocked(executeDuckDBQuery);

describe("getCCUsageActivityRaw", () => {
  beforeEach(() => {
    clickHouse.mockReset();
    duckdb.mockReset();
  });

  test("maps a ClickHouse row into activity numbers", async () => {
    clickHouse.mockResolvedValue({
      success: true,
      data: [
        {
          date: "2026-03-04",
          "Total Tokens": "20",
          "Input Tokens": "8",
          "Output Tokens": "7",
          "Cache Tokens": "5",
          "Total Cost": "2.5",
        },
      ],
    });

    await expect(getCCUsageActivityRaw(7)).resolves.toEqual([
      {
        date: "2026-03-04",
        "Total Tokens": 20,
        "Input Tokens": 8,
        "Output Tokens": 7,
        "Cache Tokens": 5,
        "Total Cost": 2.5,
      },
    ]);
  });

  test("returns an empty list when both sources have no rows", async () => {
    clickHouse.mockResolvedValue({ success: true, data: [] });
    duckdb.mockResolvedValue([]);

    await expect(getCCUsageActivityRaw(7)).resolves.toEqual([]);
  });
});
