import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("ClickHouse Config", () => {
  const originalEnv = { ...process.env };
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Clear both CH_* and CLICKHOUSE_* variables
    for (const key of ["CH_HOST", "CH_PORT", "CH_USER", "CH_PASSWORD", "CH_DATABASE",
      "CLICKHOUSE_HOST", "CLICKHOUSE_PORT", "CLICKHOUSE_USER", "CLICKHOUSE_PASSWORD", "CLICKHOUSE_DATABASE"]) {
      delete process.env[key];
    }

    // Set test values using CLICKHOUSE_* prefix
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    process.env.CLICKHOUSE_PORT = "8124";
    process.env.CLICKHOUSE_USER = "testuser";
    process.env.CLICKHOUSE_PASSWORD = "testpass";
    process.env.CLICKHOUSE_DATABASE = "testdb";
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // Restore original environment
    for (const key of ["CH_HOST", "CH_PORT", "CH_USER", "CH_PASSWORD", "CH_DATABASE",
      "CLICKHOUSE_HOST", "CLICKHOUSE_PORT", "CLICKHOUSE_USER", "CLICKHOUSE_PASSWORD", "CLICKHOUSE_DATABASE"]) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key as keyof typeof originalEnv];
      } else {
        delete process.env[key];
      }
    }
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
    delete process.env.CH_HOST;
    delete process.env.CLICKHOUSE_HOST;
    const { getClickHouseConfig } = await import("../../lib/clickhouse/client");
    const config = getClickHouseConfig();
    expect(config).toBeNull();
  });

  test("should return null when PASSWORD is missing", async () => {
    process.env.CLICKHOUSE_HOST = "localhost:8124";
    delete process.env.CH_PASSWORD;
    delete process.env.CLICKHOUSE_PASSWORD;

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
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Clear both CH_* and CLICKHOUSE_* variables
    delete process.env.CH_HOST;
    delete process.env.CH_PORT;
    delete process.env.CH_USER;
    delete process.env.CH_PASSWORD;
    delete process.env.CH_DATABASE;
    delete process.env.CLICKHOUSE_HOST;
    delete process.env.CLICKHOUSE_PORT;
    delete process.env.CLICKHOUSE_USER;
    delete process.env.CLICKHOUSE_PASSWORD;
    delete process.env.CLICKHOUSE_DATABASE;

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

    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();

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
    delete process.env.CH_PASSWORD;
    delete process.env.CLICKHOUSE_PASSWORD;

    const { getClient } = await import("../../lib/clickhouse/client");
    const client = getClient();

    expect(client).toBeNull();
  });
});
