import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../env.js";
import {
  buildClickHouseRequest,
  clampHistoryDays,
  executeClickHouseQuery,
  getClickHouseConfig,
} from "./ai-percentage.js";

const PASSWORD = "s3cret-clickhouse-pass";

const env: Env = {
  CLICKHOUSE_DATABASE: "analytics",
  CLICKHOUSE_HOST: "ch.example.com",
  CLICKHOUSE_PASSWORD: PASSWORD,
  CLICKHOUSE_PORT: "8443",
  CLICKHOUSE_PROTOCOL: "https",
  CLICKHOUSE_USER: "reader",
};

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
    expect(getClickHouseConfig({})).toBeNull();
    expect(buildClickHouseRequest({}, "SELECT 1")).toBeNull();
  });
});

describe("clampHistoryDays", () => {
  it("defaults invalid values to 365 and caps large requests", () => {
    expect(clampHistoryDays(NaN)).toBe(365);
    expect(clampHistoryDays(0)).toBe(365);
    expect(clampHistoryDays(365)).toBe(365);
    expect(clampHistoryDays(9999)).toBe(730);
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
