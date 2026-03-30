/**
 * Tests for the database re-export module
 * database.ts re-exports from clickhouse-client.ts
 */

import { describe, expect, test } from "bun:test";

describe("Database module", () => {
  test("should export executeClickHouseQuery function", async () => {
    const dbModule = await import("../../app/ai/utils/database");

    expect(dbModule.executeClickHouseQuery).toBeDefined();
    expect(typeof dbModule.executeClickHouseQuery).toBe("function");
  });

  test("should export executeClickHouseQueryLegacy function", async () => {
    const dbModule = await import("../../app/ai/utils/database");

    expect(dbModule.executeClickHouseQueryLegacy).toBeDefined();
    expect(typeof dbModule.executeClickHouseQueryLegacy).toBe("function");
  });

  test("executeClickHouseQuery should return a result object", async () => {
    const { executeClickHouseQuery } = await import(
      "../../app/ai/utils/database"
    );

    const result = await executeClickHouseQuery("SELECT 1", 5000, 1);
    expect(result).toBeDefined();
    expect(typeof result.success).toBe("boolean");
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("executeClickHouseQueryLegacy should return an array", async () => {
    const { executeClickHouseQueryLegacy } = await import(
      "../../app/ai/utils/database"
    );

    const result = await executeClickHouseQueryLegacy("SELECT 1");
    expect(Array.isArray(result)).toBe(true);
  });
});
