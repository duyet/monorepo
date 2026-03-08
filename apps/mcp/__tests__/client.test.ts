/**
 * Unit tests for the ClickHouse HTTP client.
 *
 * Validates:
 *   - Read-only query enforcement
 *   - Query building (JSONEachRow format appended)
 *   - Named parameter injection
 *   - HTTP error propagation
 *   - Response parsing (JSONEachRow lines → objects)
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { assertReadOnly, ClickHouseClient } from "../src/clickhouse/client";
import type { Env } from "../src/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    MCP_AGENT: {} as DurableObjectNamespace,
    CLICKHOUSE_HOST: "https://clickhouse.example.com",
    CLICKHOUSE_USER: "default",
    CLICKHOUSE_PASSWORD: "secret",
    CLICKHOUSE_DATABASE: "analytics",
    MCP_AUTH_TOKEN: "test-token",
    ...overrides,
  };
}

// ── assertReadOnly ────────────────────────────────────────────────────────────

describe("assertReadOnly", () => {
  it("allows SELECT", () => {
    expect(() => assertReadOnly("SELECT 1")).not.toThrow();
    expect(() => assertReadOnly("  select * from foo")).not.toThrow();
  });

  it("allows SHOW", () => {
    expect(() => assertReadOnly("SHOW TABLES")).not.toThrow();
  });

  it("allows DESCRIBE / DESC", () => {
    expect(() => assertReadOnly("DESCRIBE TABLE foo")).not.toThrow();
    expect(() => assertReadOnly("DESC foo")).not.toThrow();
  });

  it("allows EXPLAIN", () => {
    expect(() => assertReadOnly("EXPLAIN SELECT 1")).not.toThrow();
  });

  it("allows WITH (CTE)", () => {
    expect(() =>
      assertReadOnly("WITH t AS (SELECT 1) SELECT * FROM t")
    ).not.toThrow();
  });

  it("rejects INSERT", () => {
    expect(() => assertReadOnly("INSERT INTO foo VALUES (1)")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects UPDATE", () => {
    expect(() => assertReadOnly("UPDATE foo SET bar = 1")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects DELETE", () => {
    expect(() => assertReadOnly("DELETE FROM foo")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects DROP", () => {
    expect(() => assertReadOnly("DROP TABLE foo")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects CREATE", () => {
    expect(() => assertReadOnly("CREATE TABLE foo (id Int32)")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects TRUNCATE", () => {
    expect(() => assertReadOnly("TRUNCATE TABLE foo")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects ALTER", () => {
    expect(() => assertReadOnly("ALTER TABLE foo ADD COLUMN bar String")).toThrow(
      /Read-only violation/
    );
  });

  it("rejects empty queries", () => {
    expect(() => assertReadOnly("")).toThrow(/Read-only violation/);
    expect(() => assertReadOnly("   ")).toThrow(/Read-only violation/);
  });

  it("rejects multi-statement queries", () => {
    expect(() => assertReadOnly("SELECT 1; DROP TABLE foo")).toThrow(
      /multi-statement/
    );
  });

  it("allows semicolons inside string literals", () => {
    expect(() =>
      assertReadOnly("SELECT * FROM t WHERE name = 'foo;bar'")
    ).not.toThrow();
  });
});

// ── ClickHouseClient.query ────────────────────────────────────────────────────

describe("ClickHouseClient.query", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("appends FORMAT JSONEachRow when not present", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"x":1}\n'),
    });

    const client = new ClickHouseClient(makeEnv());
    await client.query("SELECT 1 AS x");

    const [_url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(init.body).toContain("FORMAT JSONEachRow");
  });

  it("does NOT double-append FORMAT when already present", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"x":1}\n'),
    });

    const client = new ClickHouseClient(makeEnv());
    await client.query("SELECT 1 AS x FORMAT JSONEachRow");

    const [_url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = init.body as string;
    const count = (body.match(/FORMAT/gi) || []).length;
    expect(count).toBe(1);
  });

  it("parses JSONEachRow response into array of objects", async () => {
    const lines = ['{"a":1,"b":"foo"}', '{"a":2,"b":"bar"}'].join("\n");
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(lines),
    });

    const client = new ClickHouseClient(makeEnv());
    const result = await client.query("SELECT a, b FROM t");

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ a: 1, b: "foo" });
    expect(result.data[1]).toEqual({ a: 2, b: "bar" });
    expect(result.rows).toBe(2);
  });

  it("returns empty array for empty response", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    });

    const client = new ClickHouseClient(makeEnv());
    const result = await client.query("SELECT 1 WHERE 0 = 1");
    expect(result.data).toHaveLength(0);
    expect(result.rows).toBe(0);
  });

  it("injects named params as param_<name> query string entries", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"n":42}\n'),
    });

    const client = new ClickHouseClient(makeEnv());
    await client.query("SELECT {n:UInt32}", { n: 42 });

    const [urlStr] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const url = new URL(urlStr);
    expect(url.searchParams.get("param_n")).toBe("42");
  });

  it("throws on HTTP error response", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Code: 60. Table unknown."),
    });

    const client = new ClickHouseClient(makeEnv());
    await expect(client.query("SELECT 1")).rejects.toThrow(
      /ClickHouse HTTP 500/
    );
  });

  it("rejects non-SELECT queries before fetch", async () => {
    const client = new ClickHouseClient(makeEnv());
    await expect(client.query("INSERT INTO t VALUES (1)")).rejects.toThrow(
      /Read-only violation/
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends correct auth headers", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
    });

    const client = new ClickHouseClient(
      makeEnv({ CLICKHOUSE_USER: "alice", CLICKHOUSE_PASSWORD: "s3cr3t" })
    );
    await client.query("SELECT 1");

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-ClickHouse-User"]).toBe("alice");
    expect(headers["X-ClickHouse-Key"]).toBe("s3cr3t");
  });
});

// ── ClickHouseClient.ping ─────────────────────────────────────────────────────

describe("ClickHouseClient.ping", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true on 200 OK", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
    });

    const client = new ClickHouseClient(makeEnv());
    expect(await client.ping()).toBe(true);
  });

  it("returns false on non-OK response", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
    });

    const client = new ClickHouseClient(makeEnv());
    expect(await client.ping()).toBe(false);
  });

  it("returns false on network error", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network failure")
    );

    const client = new ClickHouseClient(makeEnv());
    expect(await client.ping()).toBe(false);
  });
});
