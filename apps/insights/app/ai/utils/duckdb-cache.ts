import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ANALYTICS_CACHE_PATH } from "../../../lib/analytics-cache-path";

export { ANALYTICS_CACHE_PATH };

function normalizeDuckDBValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : value.toString();
  }

  return value;
}

export async function executeDuckDBQuery(
  query: string
): Promise<Record<string, unknown>[]> {
  if (!existsSync(ANALYTICS_CACHE_PATH)) return [];

  try {
    const result = spawnSync(
      "bun",
      [join(process.cwd(), "scripts", "query-duckdb-cache.ts"), query],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: process.env,
        maxBuffer: 64 * 1024 * 1024,
      }
    );

    if (result.status !== 0) {
      throw new Error(result.stderr.trim() || "DuckDB cache query failed");
    }

    const rows = JSON.parse(result.stdout) as Record<string, unknown>[];
    return rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          normalizeDuckDBValue(value),
        ])
      )
    );
  } catch (error) {
    console.warn(
      "[DuckDB Cache] Query failed:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}
