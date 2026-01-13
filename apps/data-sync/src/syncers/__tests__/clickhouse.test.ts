import { describe, expect, beforeEach, afterEach, test } from "bun:test";

describe("ClickHouse Config", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear both CH_* and CLICKHOUSE_* variables
    process.env.CH_HOST = undefined;
    process.env.CH_PORT = undefined;
    process.env.CH_USER = undefined;
    process.env.CH_PASSWORD = undefined;
    process.env.CH_DATABASE = undefined;
    process.env.CLICKHOUSE_HOST = undefined;
    process.env.CLICKHOUSE_PORT = undefined;
    process.env.CLICKHOUSE_USER = undefined;
    process.env.CLICKHOUSE_PASSWORD = undefined;
    process.env.CLICKHOUSE_DATABASE = undefined;

    // Set test values using CLICKHOUSE_* prefix
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CLICKHOUSE_PORT = "8124";
    process.env.CLICKHOUSE_USER = "testuser";
    process.env.CLICKHOUSE_PASSWORD = "testpass";
    process.env.CLICKHOUSE_DATABASE = "testdb";
  });

  afterEach(() => {
    // Restore original environment
    process.env.CH_HOST = originalEnv.CH_HOST;
    process.env.CH_PORT = originalEnv.CH_PORT;
    process.env.CH_USER = originalEnv.CH_USER;
    process.env.CH_PASSWORD = originalEnv.CH_PASSWORD;
    process.env.CH_DATABASE = originalEnv.CH_DATABASE;
    process.env.CLICKHOUSE_HOST = originalEnv.CLICKHOUSE_HOST;
    process.env.CLICKHOUSE_PORT = originalEnv.CLICKHOUSE_PORT;
    process.env.CLICKHOUSE_USER = originalEnv.CLICKHOUSE_USER;
    process.env.CLICKHOUSE_PASSWORD = originalEnv.CLICKHOUSE_PASSWORD;
    process.env.CLICKHOUSE_DATABASE = originalEnv.CLICKHOUSE_DATABASE;
  });

  test("should return config when all env vars are set", async () => {
    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();

    expect(config).toEqual({
      host: "localhost:8124",
      port: "8124",
      user: "testuser",
      password: "testpass",
      database: "testdb",
      protocol: "http",
    });
  });

  test("should return null when HOST is missing", async () => {
    process.env.CH_HOST = undefined;
    process.env.CLICKHOUSE_HOST = undefined;
    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();
    expect(config).toBeNull();
  });

  test("should return null when PASSWORD is missing", async () => {
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CH_PASSWORD = undefined;
    process.env.CLICKHOUSE_PASSWORD = undefined;

    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();
    expect(config).toBeNull();
  });

  test("should detect HTTPS port correctly", async () => {
    process.env.CLICKHOUSE_HOST = "test-host.com";
    process.env.CLICKHOUSE_PORT = "443";

    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();

    expect(config?.protocol).toBe("https");
  });

  test("should detect HTTP port correctly", async () => {
    process.env.CLICKHOUSE_HOST = "test-host.com";
    process.env.CLICKHOUSE_PORT = "8123";

    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();

    expect(config?.protocol).toBe("http");
  });
});

describe("ClickHouse Client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear both CH_* and CLICKHOUSE_* variables
    process.env.CH_HOST = undefined;
    process.env.CH_PORT = undefined;
    process.env.CH_USER = undefined;
    process.env.CH_PASSWORD = undefined;
    process.env.CH_DATABASE = undefined;
    process.env.CLICKHOUSE_HOST = undefined;
    process.env.CLICKHOUSE_PORT = undefined;
    process.env.CLICKHOUSE_USER = undefined;
    process.env.CLICKHOUSE_PASSWORD = undefined;
    process.env.CLICKHOUSE_DATABASE = undefined;

    // Set test values using CLICKHOUSE_* prefix
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CLICKHOUSE_PORT = "8124";
    process.env.CLICKHOUSE_USER = "testuser";
    process.env.CLICKHOUSE_PASSWORD = "testpass";
    process.env.CLICKHOUSE_DATABASE = "testdb";
  });

  afterEach(async () => {
    // Close client and restore environment
    const { getClient, closeClient } = await import(
      "../../lib/clickhouse/client"
    );
    const client = getClient();
    if (client) {
      await closeClient();
    }

    process.env.CH_HOST = originalEnv.CH_HOST;
    process.env.CH_PORT = originalEnv.CH_PORT;
    process.env.CH_USER = originalEnv.CH_USER;
    process.env.CH_PASSWORD = originalEnv.CH_PASSWORD;
    process.env.CH_DATABASE = originalEnv.CH_DATABASE;
    process.env.CLICKHOUSE_HOST = originalEnv.CLICKHOUSE_HOST;
    process.env.CLICKHOUSE_PORT = originalEnv.CLICKHOUSE_PORT;
    process.env.CLICKHOUSE_USER = originalEnv.CLICKHOUSE_USER;
    process.env.CLICKHOUSE_PASSWORD = originalEnv.CLICKHOUSE_PASSWORD;
    process.env.CLICKHOUSE_DATABASE = originalEnv.CLICKHOUSE_DATABASE;
  });

  test("should return singleton client instance", async () => {
    const { getClient } = await import("../../lib/clickhouse/client");
    const client1 = getClient();
    const client2 = getClient();

    expect(client1).toBe(client2);
  });

  test("should return null when config is invalid", async () => {
    process.env.CH_PASSWORD = undefined;
    process.env.CLICKHOUSE_PASSWORD = undefined;

    const { getClient } = await import("../../lib/clickhouse/client");
    const client = getClient();

    expect(client).toBeNull();
  });
});
