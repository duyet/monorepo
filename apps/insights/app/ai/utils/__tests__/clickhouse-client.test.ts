import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Pins the insights binding to the shared ClickHouse client.
 *
 * The behaviour itself is covered in `@duyet/config/__tests__/clickhouse.test.ts`.
 * What this file guards is the *options object* in
 * `app/ai/utils/clickhouse-client.ts`, which had no test at all before the two
 * clients were merged: a dashboard silently falling back to the `default`
 * database, or losing its 10,000-row cap, would not have failed anything.
 */

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
  "CH_HOST",
  "CH_PASSWORD",
  "CI",
  "GITHUB_ACTIONS",
  "VERCEL",
  "CF_PAGES",
  "NODE_ENV",
] as const;

/** insights' tsconfig marks `process.env` read-only, so stub instead of assign. */
function setEnv(key: (typeof ENV_KEYS)[number], value: string | undefined = undefined): void {
  vi.stubEnv(key, value);
}

const query = vi.fn();
const createClient = vi.fn((_config: Record<string, unknown>) => ({
  query,
  command: vi.fn(),
  close: vi.fn(),
}));

vi.mock("@clickhouse/client", () => ({
  createClient: (config: Record<string, unknown>) => createClient(config),
}));

const {
  closeClickHouseClient,
  executeClickHouseQuery,
  getClickHouseConfig,
  testClickHouseConnection,
} = await import("../clickhouse-client");

beforeEach(() => {
  // insights' tsconfig marks `process.env` read-only, so everything below
  // goes through `vi.stubEnv` rather than assignment.
  for (const key of ENV_KEYS) setEnv(key);
  setEnv("NODE_ENV", "test");
  // Keeps the shortened local-build budget (5s, 1 attempt) out of the way.
  setEnv("CI", "1");
  setEnv("CLICKHOUSE_HOST", "ch.example.com");
  setEnv("CLICKHOUSE_PORT", "8443");
  setEnv("CLICKHOUSE_USER", "reader");
  setEnv("CLICKHOUSE_PASSWORD", "s3cret");
  setEnv("CLICKHOUSE_DATABASE", "analytics");
  query.mockReset();
  createClient.mockClear();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await closeClickHouseClient();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getClickHouseConfig", () => {
  test("reads the CLICKHOUSE_* variables", () => {
    expect(getClickHouseConfig()).toEqual({
      host: "ch.example.com",
      port: "8443",
      username: "reader",
      password: "s3cret",
      database: "analytics",
      protocol: "https",
    });
  });

  test("is null when the database is missing", () => {
    // insights never fell back to the `default` database on purpose: a
    // dashboard reading the wrong database is a wrong answer, not a failure.
    setEnv("CLICKHOUSE_DATABASE");
    expect(getClickHouseConfig()).toBeNull();
  });

  test("is null when the user is missing", () => {
    setEnv("CLICKHOUSE_USER");
    expect(getClickHouseConfig()).toBeNull();
  });

  test("does not read CH_*, which belong to data-sync", () => {
    setEnv("CLICKHOUSE_HOST");
    setEnv("CH_HOST", "data-sync.example.com");
    setEnv("CH_PASSWORD", "s3cret");

    expect(getClickHouseConfig()).toBeNull();
  });
});

describe("connection target", () => {
  test("embeds credentials in the URL and caps results at 10,000 rows", async () => {
    query.mockResolvedValue({ json: async () => [{ total: 1 }] });
    await executeClickHouseQuery("SELECT 1");

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient.mock.calls[0][0]).toMatchObject({
      url: "https://reader:s3cret@ch.example.com:8443/analytics",
      clickhouse_settings: { max_result_rows: "10000", max_memory_usage: "1G" },
    });
  });
});

describe("executeClickHouseQuery", () => {
  test("returns rows", async () => {
    query.mockResolvedValue({ json: async () => [{ a: 1 }] });

    expect(await executeClickHouseQuery("SELECT a FROM t")).toEqual({
      success: true,
      data: [{ a: 1 }],
    });
  });

  test("sends a query_id", async () => {
    query.mockResolvedValue({ json: async () => [] });

    await executeClickHouseQuery("SELECT 1");

    expect(query.mock.calls[0][0].query_id).toMatch(/^q_\d+_[a-z0-9]{6}$/);
  });

  test("retries a transient failure and returns the eventual rows", async () => {
    query
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED 10.0.0.1:8123"))
      .mockResolvedValueOnce({ json: async () => [{ a: 9 }] });

    expect(await executeClickHouseQuery("SELECT a FROM t")).toEqual({
      success: true,
      data: [{ a: 9 }],
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

  test("does not retry a non-transient failure", async () => {
    query.mockRejectedValue(
      new Error("Code: 60. DB::Exception: Table analytics.nope does not exist")
    );

    const result = await executeClickHouseQuery("SELECT * FROM nope");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^QUERY_ERROR: /);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test("reports a clear failure when ClickHouse is not configured", async () => {
    // The config gate only applies while no pooled client exists, so drop the
    // one the earlier tests built.
    await closeClickHouseClient();
    setEnv("CLICKHOUSE_PASSWORD");

    const result = await executeClickHouseQuery("SELECT 1");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/missing required environment variables/);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("testClickHouseConnection", () => {
  test("is false with the missing-variable message when unconfigured", async () => {
    setEnv("CLICKHOUSE_DATABASE");

    const result = await testClickHouseConnection();

    expect(result.success).toBe(false);
    expect(result.message).toBe("Missing required environment variables");
  });

  test("reports the server version on success", async () => {
    query.mockResolvedValue({
      json: async () => [{ test: 1, version: "24.1.1" }],
      query_id: "server-side-id",
    });

    const result = await testClickHouseConnection();

    expect(result.success).toBe(true);
    expect(result.details).toMatchObject({
      host: "ch.example.com",
      database: "analytics",
      protocol: "https",
      version: "24.1.1",
    });
  });
});
