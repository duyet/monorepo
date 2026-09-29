import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildClickHouseRequest,
  executeClickHouseQuery,
  queryClickHouseRows,
} from "./clickhouse.js";
import {
  CLICKHOUSE_TEST_PASSWORD as PASSWORD,
  clickHouseTestEnv as env,
  expectClickHouseUnconfigured,
} from "./clickhouse.test-fixtures.js";

function textResponse(body: string, ok = true): Response {
  return { ok, text: async () => body } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request builder", () => {
  it("keeps credentials out of the URL", () => {
    const request = buildClickHouseRequest(env, "SELECT 1", "analytics");

    expect(request?.url).toBe("https://ch.example.com:8443?database=analytics");
    expect(request?.url).not.toContain(PASSWORD);
    expect(request?.headers["X-ClickHouse-Key"]).toBe(PASSWORD);
    expect(request?.body).toBe("SELECT 1");
  });

  it("returns null when ClickHouse is not configured", () => {
    expectClickHouseUnconfigured();
  });
});

describe("executeClickHouseQuery", () => {
  it("parses JSONEachRow lines", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(textResponse('{"a":1}\n{"a":2}\n'))
    );

    expect(await executeClickHouseQuery(env, "SELECT 1", "analytics")).toEqual([
      { a: 1 },
      { a: 2 },
    ]);
  });

  it("throws on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(textResponse("boom", false))
    );

    await expect(executeClickHouseQuery(env, "SELECT 1")).rejects.toThrow(
      /ClickHouse query failed/
    );
  });

  it("throws when the response exceeds the size guard", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(textResponse("x".repeat(1_048_577)))
    );

    await expect(executeClickHouseQuery(env, "SELECT 1")).rejects.toThrow(
      /response exceeded/
    );
  });
});

describe("queryClickHouseRows", () => {
  it("appends FORMAT JSONEachRow and uses the env database", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(textResponse('{"total_tokens":10}\n'));
    vi.stubGlobal("fetch", fetchMock);

    const rows = await queryClickHouseRows(env, "SELECT 1");

    expect(rows).toEqual([{ total_tokens: 10 }]);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ch.example.com:8443?database=analytics");
    expect(init.body).toBe("SELECT 1\nFORMAT JSONEachRow");
  });

  it("returns an empty list without fetching when unconfigured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await queryClickHouseRows({}, "SELECT 1")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("degrades to an empty list on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(textResponse("nope", false))
    );

    expect(await queryClickHouseRows(env, "SELECT 1")).toEqual([]);
  });

  it("skips malformed lines instead of failing the whole read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(textResponse('{"a":1}\nnot json\n{"a":2}\n'))
    );

    expect(await queryClickHouseRows(env, "SELECT 1")).toEqual([
      { a: 1 },
      { a: 2 },
    ]);
  });

  it("degrades to an empty list when the request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    expect(await queryClickHouseRows(env, "SELECT 1")).toEqual([]);
  });
});
