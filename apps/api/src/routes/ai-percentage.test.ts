import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../index.js";
import {
  buildClickHouseRequest,
  executeClickHouseQuery,
} from "../lib/clickhouse.js";
import {
  CLICKHOUSE_TEST_PASSWORD as PASSWORD,
  clickHouseTestEnv as env,
  expectClickHouseUnconfigured,
} from "../lib/clickhouse.test-fixtures.js";
import {
  clampHistoryDays,
  getDateCondition,
  parseHistoryDays,
} from "./ai-percentage.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ClickHouse request builder", () => {
  it("keeps the password out of the URL and sends it as a header", () => {
    const request = buildClickHouseRequest(env, "SELECT 1", "analytics");

    expect(request).not.toBeNull();
    expect(request?.url).toBe("https://ch.example.com:8443?database=analytics");
    expect(request?.url).not.toContain(PASSWORD);
    expect(request?.url).not.toContain("reader:");
    expect(request?.url).not.toContain("@ch.example.com");
    expect(request?.headers["X-ClickHouse-Key"]).toBe(PASSWORD);
    expect(request?.headers["X-ClickHouse-User"]).toBe("reader");
  });

  it("returns null when ClickHouse is not configured", () => {
    expectClickHouseUnconfigured();
  });
});

describe("clampHistoryDays", () => {
  it("defaults invalid values to 365 and caps large requests", () => {
    expect(clampHistoryDays(NaN)).toBe(365);
    expect(clampHistoryDays(0)).toBe(365);
    expect(clampHistoryDays(365)).toBe(365);
    expect(clampHistoryDays(9999)).toBe(3650);
  });
});

describe("executeClickHouseQuery", () => {
  it("fetches a URL that does not include the password", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '{"ok":1}\n',
    });
    vi.stubGlobal("fetch", fetchMock);

    await executeClickHouseQuery(env, "SELECT 1", "analytics");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(calledUrl).toBe("https://ch.example.com:8443?database=analytics");
    expect(calledUrl).not.toContain(PASSWORD);
    expect(calledUrl).not.toMatch(/reader:/);
    expect((init.headers as Record<string, string>)["X-ClickHouse-Key"]).toBe(
      PASSWORD
    );
  });
});

describe("GET /api/ai/percentage/current", () => {
  it("sets Cache-Control on successful responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        '{"ai_percentage":26.5,"total_lines_added":125000,"human_lines_added":92000,"ai_lines_added":33000}\n',
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await app.request("/api/ai/percentage/current", {}, env);

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, stale-while-revalidate=86400"
    );
  });
});

describe("parseHistoryDays", () => {
  it("defaults invalid values to 365", () => {
    expect(parseHistoryDays(undefined)).toBe(365);
    expect(parseHistoryDays("abc")).toBe(365);
  });

  it("clamps out-of-range values", () => {
    expect(parseHistoryDays("0")).toBe(365);
    expect(parseHistoryDays("99999")).toBe(3650);
  });

  it("builds safe SQL date conditions", () => {
    expect(getDateCondition(parseHistoryDays("365"))).toBe(
      "WHERE date >= now() - INTERVAL 365 DAY"
    );
    expect(getDateCondition(parseHistoryDays("abc"))).toBe(
      "WHERE date >= now() - INTERVAL 365 DAY"
    );
    expect(getDateCondition(parseHistoryDays("0"))).toBe(
      "WHERE date >= now() - INTERVAL 365 DAY"
    );
    expect(getDateCondition(parseHistoryDays("99999"))).toBe(
      "WHERE date >= now() - INTERVAL 3650 DAY"
    );
  });
});
