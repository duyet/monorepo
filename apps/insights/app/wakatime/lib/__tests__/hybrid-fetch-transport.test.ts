/**
 * The hybrid fetch goes through the shared transport.
 *
 * `fetchFreshActivityFromAPI` used to assemble its own request — key, base-URL
 * join, Basic header, `fetch`, `.catch -> []` — which is how the hybrid path
 * ended up with neither the timeout nor the response cache the stats path had.
 * These tests pin what it gained and what it must not have lost: the same Basic
 * auth, an abort signal on every request, its own `[WakaTime Hybrid]` failure
 * vocabulary, and the empty array that keeps a dashboard rendering when WakaTime
 * is unreachable.
 *
 * The transport's own behaviour is in `transport.test.ts`; the range the fresh
 * tail sends is in `hybrid-fetch-range.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../clickhouse", () => ({
  hasActivityData: async () => false,
  getClickHouseActivity: async () => [],
}));

/** A hung WakaTime: never answers, rejects when its signal aborts. */
function hungResponse(init: RequestInit | undefined): Promise<never> {
  return new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () =>
      reject(new DOMException("The operation was aborted.", "AbortError"))
    );
  });
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

function errorResponse(status: number): Response {
  return {
    ok: false,
    status,
    statusText: "",
    json: async () => ({}),
  } as unknown as Response;
}

async function loadHybrid() {
  vi.resetModules();
  return import("../hybrid-fetch");
}

describe("hybrid fetch transport", () => {
  beforeEach(() => {
    vi.stubEnv("WAKATIME_API_KEY", "waka_test_key");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("authenticates with Basic and sends an abort signal", async () => {
    const hybrid = await loadHybrid();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ data: { days: [] } }));

    await hybrid.getHybridActivityForChart(30);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain(
      "https://wakatime.com/api/v1/users/current/insights/days?range="
    );
    const headers = init.headers as Record<string, string>;
    expect(atob(headers.Authorization.slice("Basic ".length))).toBe(
      "waka_test_key"
    );
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  test("keeps its own [WakaTime Hybrid] failure vocabulary", async () => {
    const hybrid = await loadHybrid();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(401));

    await hybrid.getHybridActivityForChart(30);

    expect(console.error).toHaveBeenCalledWith(
      "[WakaTime Hybrid] API authentication failed",
      expect.stringContaining("URL: https://wakatime.com/api/v1")
    );
  });

  test("a hung WakaTime resolves to an empty chart, not a rejection", async () => {
    // The `.catch -> []` this path depended on, now expressed as the
    // transport's timeout classification. `/wakatime` awaits this inside
    // `Promise.allSettled` and reads `[]` off the result, so a blackholed
    // connection costs an empty chart instead of an unbounded render.
    // Fake timers go on after the modules are loaded: advancing a clock does
    // not advance module loading, and the first request can only start once the
    // dynamic import behind `getHybridActivityForChart` has resolved.
    const { WAKA_FETCH_TIMEOUT_MS } = await import("../transport");
    const hybrid = await loadHybrid();

    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) =>
      hungResponse(init)
    );

    const pending = hybrid.getHybridActivityForChart(30);
    await vi.advanceTimersByTimeAsync(WAKA_FETCH_TIMEOUT_MS * 2);

    await expect(pending).resolves.toEqual([]);
  });

  test("a failing WakaTime also resolves to an empty chart", async () => {
    const hybrid = await loadHybrid();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(500));

    await expect(hybrid.getHybridActivityForChart(30)).resolves.toEqual([]);
  });

  test("a missing key is warned about once, in the hybrid voice", async () => {
    vi.stubEnv("WAKATIME_API_KEY", "");
    const hybrid = await loadHybrid();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(hybrid.getHybridActivityForChart(30)).resolves.toEqual([]);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "[WakaTime Hybrid] WAKATIME_API_KEY not set"
    );
  });

  test("a second read of the same window costs no second request", async () => {
    // The cache the hybrid path never had. `/insights/days` is also requested
    // by `getActivityFromInsights` for the same window on a `/wakatime/7` render.
    const hybrid = await loadHybrid();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ data: { days: [] } }));

    await hybrid.getHybridActivityForChart(30);
    await hybrid.getHybridActivityForChart(30);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
