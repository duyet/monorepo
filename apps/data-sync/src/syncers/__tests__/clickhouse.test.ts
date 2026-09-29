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

    // The credential field is `username` for both apps. It used to be `user`
    // here, which made this object structurally incompatible with the insights
    // one for no benefit.
    expect(config).toEqual({
      host: "localhost:8124",
      port: "8124",
      username: "testuser",
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
    const client = await getClient();
    if (client) {
      await closeClient();
    }

    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.doUnmock("@clickhouse/client");

    for (const key of [
      "CH_HOST",
      "CH_PORT",
      "CH_USER",
      "CH_PASSWORD",
      "CH_DATABASE",
      "CH_PROTOCOL",
    ]) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key as keyof typeof originalEnv];
      } else {
        delete process.env[key];
      }
    }
    for (const key of [
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_PORT",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_DATABASE",
      "CLICKHOUSE_PROTOCOL",
    ]) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key as keyof typeof originalEnv];
      } else {
        delete process.env[key];
      }
    }
  });

  test("should return singleton client instance", async () => {
    const { getClient } = await import("../../lib/clickhouse/client");
    const client1 = await getClient();
    const client2 = await getClient();

    expect(client1).toBe(client2);
  });

  test("should return null when config is invalid", async () => {
    delete process.env.CH_PASSWORD;
    delete process.env.CLICKHOUSE_PASSWORD;

    const { getClient } = await import("../../lib/clickhouse/client");
    const client = await getClient();

    expect(client).toBeNull();
  });

  /**
   * data-sync used to retry *every* failure, so a migration with a typo cost
   * 1s + 2s of backoff before the runner saw an error it could never fix.
   * Retries are now transient-only, which is the point of this block: if the
   * policy is widened again, this fails.
   */
  test("should not retry a non-transient error", async () => {
    const query = vi.fn().mockRejectedValue(
      new Error("Code: 62. DB::Exception: Syntax error: failed at position 1")
    );
    vi.doMock("@clickhouse/client", () => ({
      createClient: () => ({ query, command: vi.fn(), close: vi.fn() }),
    }));

    const { executeQuery } = await import("../../lib/clickhouse/client");
    const result = await executeQuery("SELECT bogus", 60_000, 3);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^QUERY_ERROR: /);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test("should retry a transient error and succeed", async () => {
    const query = vi
      .fn()
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED 10.0.0.1:8123"))
      .mockResolvedValueOnce({
        json: async () => [{ repo: "duyet/monorepo" }],
      });
    vi.doMock("@clickhouse/client", () => ({
      createClient: () => ({ query, command: vi.fn(), close: vi.fn() }),
    }));

    const { executeQuery } = await import("../../lib/clickhouse/client");
    const result = await executeQuery("SELECT repo FROM github_commits", 60_000, 3);

    expect(result).toEqual({
      success: true,
      data: [{ repo: "duyet/monorepo" }],
    });
    expect(query).toHaveBeenCalledTimes(2);
  });
});
