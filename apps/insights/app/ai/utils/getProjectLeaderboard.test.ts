import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test, vi } from "vitest";

vi.mock("./duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(),
}));

import { executeDuckDBQuery } from "./duckdb-cache";
import { getProjectLeaderboard } from "./insight-metrics";

const fixture = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "__fixtures__",
      "project-leaderboard.json",
    ),
    "utf-8",
  ),
) as {
  rows: Record<string, unknown>[];
  leaderboard: Array<{
    name: string;
    tokens: number;
    cost: number;
    pct: number;
  }>;
};

describe("getProjectLeaderboard", () => {
  test("anonymizes fixture project paths and shares token volume", async () => {
    vi.mocked(executeDuckDBQuery).mockResolvedValue(fixture.rows);

    await expect(getProjectLeaderboard(30, 7)).resolves.toEqual(
      fixture.leaderboard,
    );
  });

  test("returns an empty list when the fixture query has no rows", async () => {
    vi.mocked(executeDuckDBQuery).mockResolvedValue([]);

    await expect(getProjectLeaderboard()).resolves.toEqual([]);
  });
});
