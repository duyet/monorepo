import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { checkClickHouseHealth } from "../data-fetchers";

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
];

describe("checkClickHouseHealth", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const key of ENV_KEYS) delete process.env[key];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  test("resolves false when ClickHouse is not configured", async () => {
    await expect(checkClickHouseHealth()).resolves.toBe(false);
  });

  test("shares one in-flight promise across callers", async () => {
    const first = checkClickHouseHealth();
    const second = checkClickHouseHealth();
    expect(second).toBe(first);
    await expect(first).resolves.toBe(false);
  });
});
