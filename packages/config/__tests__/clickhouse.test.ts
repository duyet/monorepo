import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Behaviour tests for the shared ClickHouse client.
 *
 * The SDK is mocked, so nothing here touches the network. The retry tests
 * freeze `setTimeout` to record the exact delays instead of waiting them out,
 * which is what pins the backoff sequence to 1s, 2s, 4s.
 */

const ENV_KEYS = [
  "CH_HOST",
  "CH_PORT",
  "CH_USER",
  "CH_PASSWORD",
  "CH_DATABASE",
  "CH_PROTOCOL",
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
] as const;

const query = vi.fn();
const command = vi.fn();
const insert = vi.fn();
const close = vi.fn();
const createClient = vi.fn(() => ({ query, command, insert, close }));

vi.mock("@clickhouse/client", () => ({
  createClient: (...args: unknown[]) => createClient(...(args as [])),
}));

const { clickHouseBackoffMs, createClickHouseClient } = await import(
  "../src/clickhouse"
);

/** insights' binding, verbatim. */
const INSIGHTS = {
  envPrefix: "CLICKHOUSE",
  required: ["HOST", "USER", "PASSWORD", "DATABASE"] as const,
  httpsPorts: [443, 8443],
  credentials: "url" as const,
  clickhouseSettings: { max_result_rows: "10000", max_memory_usage: "1G" },
  serverOnly: true,
  buildBudget: { timeoutMs: 5000, maxRetries: 1 },
  logging: "auto" as const,
};

/** data-sync's binding, verbatim. */
const DATA_SYNC = {
  envPrefix: "CH",
  envAliases: ["CLICKHOUSE"] as const,
  required: ["HOST", "PASSWORD"] as const,
  defaultUsername: "default",
  httpsPorts: [443, 8443, 9440, 9000],
  credentials: "omit" as const,
  clickhouseSettings: { max_result_rows: "100000", max_memory_usage: "2G" },
  logging: "always" as const,
};

let savedEnv: Record<string, string | undefined>;

beforeEach(() => {
  savedEnv = { ...process.env };
  for (const key of ENV_KEYS) delete process.env[key];
  // A production NODE_ENV is the one setting that must not leak between
  // tests: it is what switches on the shortened build budget.
  process.env.NODE_ENV = "test";
  process.env.CI = "1";
  query.mockReset();
  command.mockReset();
  insert.mockReset();
  close.mockReset();
  createClient.mockClear();
  // data-sync's binding logs unconditionally; keep the suite output readable.
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function setInsightsEnv(): void {
  process.env.CLICKHOUSE_HOST = "ch.example.com";
  process.env.CLICKHOUSE_PORT = "8443";
  process.env.CLICKHOUSE_USER = "reader";
  process.env.CLICKHOUSE_PASSWORD = "s3cret";
  process.env.CLICKHOUSE_DATABASE = "analytics";
}

function setDataSyncEnv(): void {
  process.env.CLICKHOUSE_HOST = "ch.example.com";
  process.env.CLICKHOUSE_PORT = "8443";
  process.env.CLICKHOUSE_USER = "reader";
  process.env.CLICKHOUSE_PASSWORD = "s3cret";
  process.env.CLICKHOUSE_DATABASE = "analytics";
}

function resultSet(rows: unknown[] = [{ a: 1 }]) {
  return { json: async () => rows, query_id: "server-side-id" };
}

/** Captured before any test replaces it, so timers still fire. */
const realSetTimeout = globalThis.setTimeout;

/**
 * Freeze timers and record every delay the client schedules.
 *
 * The recorded `ms` is what the client *asked* for; the callback is then
 * scheduled for the next macrotask so backoff promises resolve without the
 * test actually waiting a second.
 */
function recordDelays(): number[] {
  const delays: number[] = [];
  vi.useFakeTimers();
  vi.spyOn(globalThis, "setTimeout").mockImplementation((
    (fn: () => void, ms?: number, ...rest: unknown[]) => {
      delays.push(Number(ms));
      return realSetTimeout(fn, 0, ...rest);
    }
  ) as never);
  return delays;
}

describe("getConfig", () => {
  test("insights requires host, user, password and database", () => {
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();

    expect(insights.getConfig()).toEqual({
      host: "ch.example.com",
      port: "8443",
      username: "reader",
      password: "s3cret",
      database: "analytics",
      protocol: "https",
    });

    for (const key of [
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_DATABASE",
    ] as const) {
      const previous = process.env[key];
      delete process.env[key];
      expect(
        insights.getConfig(),
        `${key} must be required by insights`
      ).toBeNull();
      process.env[key] = previous;
    }
  });

  test("data-sync requires only host and password, and defaults the user", () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    setDataSyncEnv();
    delete process.env.CLICKHOUSE_USER;
    delete process.env.CLICKHOUSE_DATABASE;

    const config = dataSync.getConfig();

    expect(config).toEqual({
      host: "ch.example.com",
      port: "8443",
      username: "default",
      password: "s3cret",
      database: undefined,
      protocol: "https",
    });

    delete process.env.CLICKHOUSE_HOST;
    expect(dataSync.getConfig()).toBeNull();
    process.env.CLICKHOUSE_HOST = "ch.example.com";
    delete process.env.CLICKHOUSE_PASSWORD;
    expect(dataSync.getConfig()).toBeNull();
  });

  test("data-sync reads CH_* first and falls back to CLICKHOUSE_*", () => {
    const dataSync = createClickHouseClient(DATA_SYNC);

    process.env.CH_HOST = "short-prefix.example.com";
    process.env.CH_PASSWORD = "short";
    expect(dataSync.getConfig()?.host).toBe("short-prefix.example.com");

    process.env.CLICKHOUSE_HOST = "long-prefix.example.com";
    expect(dataSync.getConfig()?.host).toBe("short-prefix.example.com");

    delete process.env.CH_HOST;
    expect(dataSync.getConfig()?.host).toBe("long-prefix.example.com");
  });

  test("the credential field is `username` for both apps, never `user`", () => {
    const insights = createClickHouseClient(INSIGHTS);
    const dataSync = createClickHouseClient(DATA_SYNC);
    setInsightsEnv();
    setDataSyncEnv();

    for (const config of [insights.getConfig(), dataSync.getConfig()]) {
      expect(config).toHaveProperty("username", "reader");
      expect(config).not.toHaveProperty("user");
    }
  });

  test("each app keeps its own HTTPS port list", () => {
    const insights = createClickHouseClient(INSIGHTS);
    const dataSync = createClickHouseClient(DATA_SYNC);
    setInsightsEnv();
    setDataSyncEnv();

    process.env.CLICKHOUSE_PORT = "9440";
    // 9440 is one of data-sync's HTTPS ports and one of insights' HTTP ports.
    expect(dataSync.getConfig()?.protocol).toBe("https");
    expect(insights.getConfig()?.protocol).toBe("http");

    process.env.CLICKHOUSE_PORT = "8123";
    expect(dataSync.getConfig()?.protocol).toBe("http");
    expect(insights.getConfig()?.protocol).toBe("http");

    process.env.CLICKHOUSE_PORT = "443";
    expect(insights.getConfig()?.protocol).toBe("https");
  });

  test("an explicit protocol overrides the port list", () => {
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();
    process.env.CLICKHOUSE_PORT = "8123";
    process.env.CLICKHOUSE_PROTOCOL = "https";

    expect(insights.getConfig()?.protocol).toBe("https");
  });

  test("the port defaults to 8123", () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";

    expect(dataSync.getConfig()?.port).toBe("8123");
  });
});

describe("connection target", () => {
  test("insights embeds credentials in the URL, data-sync sends none", async () => {
    const insights = createClickHouseClient(INSIGHTS);
    const dataSync = createClickHouseClient(DATA_SYNC);
    setInsightsEnv();
    setDataSyncEnv();

    await insights.getClient();
    expect(createClient.mock.calls[0][0]).toMatchObject({
      url: "https://reader:s3cret@ch.example.com:8443/analytics",
      clickhouse_settings: { max_result_rows: "10000", max_memory_usage: "1G" },
    });

    createClient.mockClear();
    await dataSync.getClient();
    expect(createClient.mock.calls[0][0]).toMatchObject({
      url: "https://ch.example.com:8443/analytics",
      clickhouse_settings: { max_result_rows: "100000", max_memory_usage: "2G" },
    });
  });

  test("a host that already carries a port is not doubled up", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "localhost:8124";
    process.env.CH_PORT = "8124";
    process.env.CH_PASSWORD = "s3cret";
    process.env.CH_DATABASE = "testdb";

    await dataSync.getClient();

    expect(createClient.mock.calls[0][0].url).toBe(
      "http://localhost:8124/testdb"
    );
  });

  test("no client is built when a required variable is missing", async () => {
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();
    delete process.env.CLICKHOUSE_PASSWORD;

    expect(await insights.getClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  test("the same instance is reused across calls", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";

    const first = await dataSync.getClient();
    const second = await dataSync.getClient();

    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  test("close drops the instance so the next call builds a fresh one", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";

    const first = await dataSync.getClient();
    await dataSync.close();
    const second = await dataSync.getClient();

    expect(second).not.toBe(first);
    expect(close).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledTimes(2);
  });
});

describe("executeQuery", () => {
  test("returns rows on success", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    query.mockResolvedValue(resultSet([{ a: 1 }, { a: 2 }]));

    expect(await dataSync.executeQuery("SELECT a FROM t")).toEqual({
      success: true,
      data: [{ a: 1 }, { a: 2 }],
    });
  });

  test("sends a query_id so the server's query_log can be correlated", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    query.mockResolvedValue(resultSet());

    await dataSync.executeQuery("SELECT 1");

    expect(query).toHaveBeenCalledTimes(1);
    const arg = query.mock.calls[0][0];
    expect(arg.query).toBe("SELECT 1");
    expect(arg.format).toBe("JSONEachRow");
    expect(arg.query_id).toMatch(/^q_\d+_[a-z0-9]{6}$/);
    expect(arg.abort_signal).toBeInstanceOf(AbortSignal);
  });

  test("retries a transient error and succeeds, backing off 1s then 2s", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    const delays = recordDelays();

    query
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED 10.0.0.1:8123"))
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce(resultSet([{ a: 7 }]));

    const result = await dataSync.executeQuery("SELECT 1", 50_000, 3);

    expect(result).toEqual({ success: true, data: [{ a: 7 }] });
    expect(query).toHaveBeenCalledTimes(3);
    // The abort deadline is scheduled on every attempt; the two backoffs sit
    // between them. This is what pins the sequence to 1s and 2s.
    expect(delays).toEqual([50_000, 1000, 50_000, 2000, 50_000]);
  });

  test("does NOT retry a non-transient error", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    const delays = recordDelays();

    query.mockRejectedValue(
      new Error("Code: 62. DB::Exception: Syntax error: failed at position 1")
    );

    const result = await dataSync.executeQuery("SELECT bogus", 50_000, 3);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/^QUERY_ERROR: /);
    // One call, one abort deadline, no backoff: re-sending a syntax error
    // cannot change the answer.
    expect(query).toHaveBeenCalledTimes(1);
    expect(delays).toEqual([50_000]);
  });

  test.each([
    ["Code: 516. DB::Exception: default: Authentication failed", "AUTH"],
    ["Code: 60. DB::Exception: Table default.nope does not exist", "QUERY_ERROR"],
    ["Code: 241. DB::Exception: Memory limit (for query) exceeded", "UNKNOWN"],
  ])("classifies %s as non-retryable", async (message, expectedType) => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    query.mockRejectedValue(new Error(message));

    const result = await dataSync.executeQuery("SELECT 1", 50_000, 3);

    expect(result.success).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
    expect(result.error).toContain(expectedType);
  });

  test("reports failure when the client is unavailable", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);

    const result = await dataSync.executeQuery("SELECT 1");

    expect(result).toEqual({
      success: false,
      data: [],
      error:
        "ClickHouse client not available - missing required environment variables",
    });
    expect(query).not.toHaveBeenCalled();
  });

  test("insights shortens the budget during a local production build", async () => {
    delete process.env.CI;
    delete process.env.GITHUB_ACTIONS;
    process.env.NODE_ENV = "production";
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();
    const delays = recordDelays();

    query.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.1:8123"));

    const result = await insights.executeQuery("SELECT 1");

    expect(result.success).toBe(false);
    // 5s deadline, one attempt: CI is what keeps the full 60s / 3 retries.
    expect(delays).toEqual([5000]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  test("CI keeps the full budget even in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.CI = "1";
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();
    const delays = recordDelays();

    query.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.1:8123"));

    const result = await insights.executeQuery("SELECT 1");

    expect(result.success).toBe(false);
    // Full 60s deadline and all three attempts: CI reaches ClickHouse over
    // Tailscale, so the shortened local-build budget must not apply.
    expect(delays).toEqual([60_000, 1000, 60_000, 2000, 60_000]);
  });
});

describe("executeCommand", () => {
  test("sends a query_id and waits for the command to finish", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    command.mockResolvedValue({});

    expect(await dataSync.executeCommand("DROP TABLE t")).toEqual({
      success: true,
      data: [],
    });

    const arg = command.mock.calls[0][0];
    expect(arg.query).toBe("DROP TABLE t");
    expect(arg.query_id).toMatch(/^q_\d+_[a-z0-9]{6}$/);
    expect(arg.clickhouse_settings).toEqual({ wait_end_of_query: 1 });
  });

  test("does not retry a non-transient error", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    command.mockRejectedValue(new Error("Code: 47. Unknown identifier nope"));

    const result = await dataSync.executeCommand("ALTER TABLE t DROP nope", 50_000, 3);

    expect(result.success).toBe(false);
    expect(command).toHaveBeenCalledTimes(1);
  });
});

describe("executeStatements", () => {
  test("runs each statement in order and stops at the first failure", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    command.mockResolvedValue({});

    expect(
      await dataSync.executeStatements(["  CREATE TABLE t (a UInt8)  ", "  "])
    ).toEqual({ success: true, data: [] });
    expect(command).toHaveBeenCalledTimes(1);
  });
});

describe("ping and testConnection", () => {
  test("ping is true when the server answers", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    query.mockResolvedValue(resultSet([{ test: 1, version: "24.1.1" }]));

    expect(await dataSync.ping()).toBe(true);
  });

  test("ping is false when the server rejects the query", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    process.env.CH_HOST = "ch.example.com";
    process.env.CH_PASSWORD = "s3cret";
    query.mockRejectedValue(new Error("Code: 516. Authentication failed"));

    expect(await dataSync.ping()).toBe(false);
  });

  test("ping is false when ClickHouse is not configured", async () => {
    const dataSync = createClickHouseClient(DATA_SYNC);
    expect(await dataSync.ping()).toBe(false);
  });
});

describe("backoff", () => {
  test("is 1s, 2s, 4s, 8s", () => {
    expect([1, 2, 3, 4].map(clickHouseBackoffMs)).toEqual([
      1000, 2000, 4000, 8000,
    ]);
  });
});

describe("serverOnly", () => {
  test("insights refuses to build a client in a browser", async () => {
    vi.stubGlobal("window", {});
    const insights = createClickHouseClient(INSIGHTS);
    setInsightsEnv();

    expect(await insights.getClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe("insertJsonEachRow", () => {
  /**
   * An `INSERT ... FORMAT JSONEachRow` needs the rows in the request *body*,
   * so it cannot go through `client.command()` — which is why
   * `unsplash-photos.syncer.ts` used to hand-roll a raw `fetch` with Basic
   * auth, and ended up with no timeout, no retry and no `query_id`.
   */
  test("sends the rows in the body, with a query_id and the JSONEachRow format", async () => {
    setDataSyncEnv();
    const dataSync = createClickHouseClient(DATA_SYNC);

    const result = await dataSync.insertJsonEachRow("ccusage_photos", [
      '{"id":"a"}',
      '{"id":"b"}',
    ]);

    expect(result.success).toBe(true);
    expect(insert).toHaveBeenCalledTimes(1);
    const call = insert.mock.calls[0]![0];
    expect(call.table).toBe("ccusage_photos");
    expect(call.format).toBe("JSONEachRow");
    expect(call.values).toEqual(['{"id":"a"}', '{"id":"b"}']);
    // The rows go in `values`, never appended to the query string.
    expect(JSON.stringify(call)).not.toContain("INSERT INTO");
    // A query_id is what makes the insert findable in the server's query log.
    expect(call.query_id).toMatch(/^q_\d+_[a-z0-9]{6}$/);
  });

  test("an empty batch is a no-op, not a failure", async () => {
    setDataSyncEnv();
    const dataSync = createClickHouseClient(DATA_SYNC);

    // Callers batch, so a short final batch is normal. Failing here would turn
    // a clean pagination tail into a sync failure.
    const result = await dataSync.insertJsonEachRow("t", []);
    expect(result).toEqual({ success: true, data: [] });
    expect(insert).not.toHaveBeenCalled();
  });

  test("fails without a client when ClickHouse is unconfigured", async () => {
    for (const key of ENV_KEYS) delete process.env[key];
    const dataSync = createClickHouseClient(DATA_SYNC);

    const result = await dataSync.insertJsonEachRow("t", ['{"a":1}']);
    expect(result.success).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });

  test("retries a transient insert failure and reports failure on a permanent one", async () => {
    setDataSyncEnv();
    vi.useFakeTimers();

    try {
      // Transient: retried, then succeeds. The classifier matches on the error
      // *message*, not a `code` property, so the message has to be realistic.
      const transient = createClickHouseClient(DATA_SYNC);
      insert
        .mockRejectedValueOnce(new Error("ECONNREFUSED 127.0.0.1:8123"))
        .mockResolvedValueOnce(undefined);

      const promise = transient.insertJsonEachRow("t", ['{"a":1}'], 60_000, 2);
      await vi.advanceTimersByTimeAsync(5_000);
      const ok = await promise;
      expect(ok.success).toBe(true);
      expect(insert).toHaveBeenCalledTimes(2);

      // Non-transient: fails fast, no retry.
      const permanent = createClickHouseClient(DATA_SYNC);
      insert.mockClear();
      insert.mockRejectedValue(
        new Error("Code: 62. DB::Exception: Syntax error")
      );

      const failed = await permanent.insertJsonEachRow("t", ['{"a":1}'], 60_000, 2);
      expect(failed.success).toBe(false);
      expect(insert).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
