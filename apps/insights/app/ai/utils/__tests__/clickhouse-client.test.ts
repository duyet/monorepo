import { beforeEach, describe, expect, test, vi } from "vitest";
import { testClickHouseConnection } from "../clickhouse-client";

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
] as const;

async function withEnv(
  overrides: Record<string, string | undefined>,
  fn: () => Promise<void>,
) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, overrides);
  try {
    await fn();
  } finally {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  }
}

describe("testClickHouseConnection", () => {
  test("reports missing env vars without touching the network", async () => {
    await withEnv({}, async () => {
      const result = await testClickHouseConnection();
      expect(result).toEqual({
        success: false,
        message: "Missing required environment variables",
        details: {
          hasHost: false,
          hasUser: false,
          hasPassword: false,
          hasDatabase: false,
        },
      });
    });
  });

  test("details reflect which env vars are actually set", async () => {
    await withEnv({ CLICKHOUSE_HOST: "db.internal" }, async () => {
      const result = await testClickHouseConnection();
      expect(result).toEqual({
        success: false,
        message: "Missing required environment variables",
        details: {
          hasHost: true,
          hasUser: false,
          hasPassword: false,
          hasDatabase: false,
        },
      });
    });
  });
});

describe("executeClickHouseQueryLegacy", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.CLICKHOUSE_HOST;
    delete process.env.CLICKHOUSE_USER;
    delete process.env.CLICKHOUSE_PASSWORD;
    delete process.env.CLICKHOUSE_DATABASE;
  });

  test("returns an empty array when ClickHouse is not configured", async () => {
    const { executeClickHouseQueryLegacy } = await import(
      "../clickhouse-client"
    );

    await expect(executeClickHouseQueryLegacy("SELECT 1")).resolves.toEqual(
      []
    );
  });
});
