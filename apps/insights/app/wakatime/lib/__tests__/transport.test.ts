/**
 * One WakaTime transport, and it times out.
 *
 * `wakatime-utils.tsx` and `lib/hybrid-fetch.ts` each assembled their own
 * request, and neither passed a timeout, so a WakaTime socket that accepted the
 * connection and went quiet held a `/wakatime` render open until the platform
 * gave up. `apps/api` and `apps/data-sync` both already bounded their WakaTime
 * calls; this app did not.
 *
 * These assert behaviour, not wiring: the timeout aborts the request (with fake
 * timers, so nothing waits ten seconds), a 401 produces the per-style message,
 * the Basic header carries the key, the cache answers a repeat request without
 * a second `fetch`, and every failure lands on the empty state the dashboard
 * already renders instead of throwing.
 *
 * The hybrid call site has its own file, `hybrid-fetch-transport.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// `getWakaTimeActivityWithAI` reaches the hybrid fetch, which asks ClickHouse
// whether it has history. That is a real network client, so it is stubbed out
// here and the freshness of this file's subject — the WakaTime request — is
// measured on its own.
vi.mock("../clickhouse", () => ({
  hasActivityData: async () => false,
  getClickHouseActivity: async () => [],
}));

/** The endpoint under test; the real paths live in `@duyet/config`. */
const STATS_ENDPOINT = "/users/current/stats/last_30_days";

const API_KEY = "waka_test_key";

/** A response the transport can classify. */
function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

function errorResponse(status: number, statusText = ""): Response {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  } as unknown as Response;
}

/**
 * Load a fresh copy of the module.
 *
 * The response cache is module state, keyed by URL and shared by every call
 * site, so a test that cares about the cache — or simply wants one `fetch` per
 * test — has to get a new instance of the module.
 */
async function loadTransport() {
  vi.resetModules();
  return import("../transport");
}

/** `console.error` calls, flattened to their first argument. */
function loggedErrors(spy: ReturnType<typeof vi.spyOn>): string[] {
  return (spy.mock.calls as unknown[][]).map((call) => String(call[0]));
}

describe("WakaTime transport", () => {
  beforeEach(() => {
    // `environment.d.ts` declares every key `readonly`, so go through vitest
    // rather than assigning to `process.env` directly.
    vi.stubEnv("WAKATIME_API_KEY", API_KEY);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("request timeout", () => {
    test("is the same ceiling apps/api and the ClickHouse client use", async () => {
      const { WAKA_FETCH_TIMEOUT_MS } = await loadTransport();

      // `apps/api/src/lib/insights.ts` uses 10_000 for WakaTime, PostHog and
      // Cloudflare; `apps/api/src/lib/clickhouse.ts` uses 10_000 for ClickHouse.
      // There is no shared constant to import, so the value is pinned here: a
      // future change has to be a decision, not a drift.
      expect(WAKA_FETCH_TIMEOUT_MS).toBe(10_000);
    });

    test("aborts a hung request instead of waiting forever", async () => {
      vi.useFakeTimers();
      const { WAKA_FETCH_TIMEOUT_MS, wakaTimeFetch } = await loadTransport();

      let signal: AbortSignal | undefined;
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation((_input, init) => {
          signal = init?.signal ?? undefined;
          // What a real fetch does when its signal aborts: reject.
          return new Promise((_resolve, reject) => {
            signal?.addEventListener("abort", () =>
              reject(new DOMException("The operation was aborted.", "AbortError"))
            );
          });
        });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const pending = wakaTimeFetch<{ data: unknown }>(STATS_ENDPOINT);
      // Nothing has timed out yet.
      expect(signal?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(WAKA_FETCH_TIMEOUT_MS);

      await expect(pending).resolves.toEqual({
        ok: false,
        reason: "timeout",
      });
      expect(signal?.aborted).toBe(true);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      // A timeout is not a provider fault and must not read like one.
      expect(loggedErrors(errorSpy)).toEqual([
        `WakaTime API request timed out after ${WAKA_FETCH_TIMEOUT_MS}ms`,
      ]);
    });

    test("does not abort a request that answers in time", async () => {
      vi.useFakeTimers();
      const { WAKA_FETCH_TIMEOUT_MS, wakaTimeJson } = await loadTransport();

      let signal: AbortSignal | undefined;
      vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
        signal = init?.signal ?? undefined;
        return Promise.resolve(okResponse({ data: { total_seconds: 60 } }));
      });

      const promise = wakaTimeJson<{ data: { total_seconds: number } }>(
        STATS_ENDPOINT
      );
      await vi.advanceTimersByTimeAsync(WAKA_FETCH_TIMEOUT_MS - 1);

      await expect(promise).resolves.toEqual({ data: { total_seconds: 60 } });
      expect(signal?.aborted).toBe(false);
    });
  });

  describe("failure ladder", () => {
    test("401 names the expired key, not the status", async () => {
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(401));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await wakaTimeFetch(STATS_ENDPOINT);

      expect(result).toEqual({ ok: false, reason: "http", status: 401 });
      expect(loggedErrors(errorSpy)).toEqual([
        "WakaTime API authentication failed: Invalid or expired API key",
      ]);
    });

    test("403 stays distinct from 401", async () => {
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(403));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeFetch(STATS_ENDPOINT);

      expect(loggedErrors(errorSpy)).toEqual([
        "WakaTime API access forbidden - check permissions",
      ]);
    });

    test("429 is a rate limit, not an unexplained provider error", async () => {
      // The case this consolidation fixes. Before it, 429 fell through to the
      // generic branch and logged `WakaTime API error: 429 Too Many Requests`,
      // which reads like WakaTime is broken. `apps/data-sync` has classified it
      // separately since its transport was extracted.
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(429));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeFetch(STATS_ENDPOINT);

      expect(loggedErrors(errorSpy)).toEqual([
        "WakaTime API rate limit exceeded",
      ]);
    });

    test("any other status keeps the status and statusText", async () => {
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        errorResponse(500, "Internal Server Error")
      );
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeFetch(STATS_ENDPOINT);

      expect(loggedErrors(errorSpy)).toEqual([
        "WakaTime API error: 500 Internal Server Error",
      ]);
    });

    test("the hybrid vocabulary stays prefixed and statusText-free", async () => {
      const { WAKA_TIME_HYBRID_STYLE, wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(500));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeFetch(STATS_ENDPOINT, { style: WAKA_TIME_HYBRID_STYLE });

      expect(loggedErrors(errorSpy)).toEqual([
        "[WakaTime Hybrid] API error: 500",
      ]);
    });

    test("the hybrid vocabulary tells 401 apart from a 500", async () => {
      const { WAKA_TIME_HYBRID_STYLE, wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse(401));
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeFetch(STATS_ENDPOINT, { style: WAKA_TIME_HYBRID_STYLE });

      expect(loggedErrors(errorSpy)).toEqual([
        "[WakaTime Hybrid] API authentication failed",
      ]);
    });

    test("a call site can claim the log line and still be told the status", async () => {
      // The durations sweep needs the status as control flow, and reports
      // 402/401/403 itself because they are an expected answer on free tiers.
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        errorResponse(402, "Payment Required")
      );
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const seen: Array<{ status: number; message: string }> = [];

      const result = await wakaTimeFetch(STATS_ENDPOINT, {
        onHttpError: (error, message) => {
          seen.push({ message, status: error.status });
        },
      });

      expect(result).toEqual({ ok: false, reason: "http", status: 402 });
      expect(seen).toEqual([
        {
          message: "WakaTime API error: 402 Payment Required",
          status: 402,
        },
      ]);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test("a body that is not JSON is not a network failure", async () => {
      const { wakaTimeFetch } = await loadTransport();
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON");
        },
      } as unknown as Response);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(wakaTimeFetch(STATS_ENDPOINT)).resolves.toEqual({
        ok: false,
        reason: "invalid-body",
      });
      expect(loggedErrors(errorSpy)).toEqual([
        "WakaTime API returned a body that is not JSON",
      ]);
    });

    test("a missing key is reported once and costs no request", async () => {
      vi.stubEnv("WAKATIME_API_KEY", "");
      const { wakaTimeFetch } = await loadTransport();
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await expect(wakaTimeFetch(STATS_ENDPOINT)).resolves.toEqual({
        ok: false,
        reason: "no-api-key",
      });
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        "WAKATIME_API_KEY not found in environment variables"
      );
    });
  });

  describe("request shape", () => {
    test("authenticates with Basic and the configured key", async () => {
      const { wakaTimeFetch } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse({ data: {} }));

      await wakaTimeFetch(STATS_ENDPOINT);

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`https://wakatime.com/api/v1${STATS_ENDPOINT}`);
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization.startsWith("Basic ")).toBe(true);
      expect(atob(headers.Authorization.slice("Basic ".length))).toBe(API_KEY);
    });

    test("every request carries an abort signal", async () => {
      const { wakaTimeJson } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse({ data: {} }));

      await wakaTimeJson(STATS_ENDPOINT);

      const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe("response cache", () => {
    test("answers a repeated request without a second fetch", async () => {
      vi.useFakeTimers();
      const { WAKA_CACHE_TTL_MS, wakaTimeJson } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse({ data: { total_seconds: 42 } }));

      const first = await wakaTimeJson<{ data: { total_seconds: number } }>(
        STATS_ENDPOINT
      );
      await vi.advanceTimersByTimeAsync(WAKA_CACHE_TTL_MS - 1);
      const second = await wakaTimeJson<{ data: { total_seconds: number } }>(
        STATS_ENDPOINT
      );

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(second).toEqual(first);
    });

    test("still refetches once the entry has expired", async () => {
      vi.useFakeTimers();
      const { WAKA_CACHE_TTL_MS, wakaTimeJson } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse({ data: { total_seconds: 42 } }));

      await wakaTimeJson(STATS_ENDPOINT);
      await vi.advanceTimersByTimeAsync(WAKA_CACHE_TTL_MS + 1);
      await wakaTimeJson(STATS_ENDPOINT);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    test("does not cache a failure", async () => {
      // Otherwise a five-minute WakaTime blip becomes a five-minute outage.
      const { wakaTimeJson } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(errorResponse(500));
      vi.spyOn(console, "error").mockImplementation(() => {});

      await wakaTimeJson(STATS_ENDPOINT);
      await wakaTimeJson(STATS_ENDPOINT);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    test("is keyed per URL, so a different window is a different request", async () => {
      const { wakaTimeJson } = await loadTransport();
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(okResponse({ data: {} }));

      await wakaTimeJson("/users/current/stats/last_7_days");
      await wakaTimeJson("/users/current/stats/last_year");

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  /**
   * The consequence of the timeout, as the reader sees it. These loaders are
   * what `/wakatime` awaits in `Promise.allSettled`, and a timeout takes the
   * same path a 500 already took: an empty slice, never a rejection.
   */
  describe("what the dashboard renders when WakaTime times out", () => {
    test("overview, languages, trend and heatmap all come back empty", async () => {
      vi.useFakeTimers();
      const { WAKA_FETCH_TIMEOUT_MS } = await loadTransport();
      vi.resetModules();
      const utils = await import("../../wakatime-utils");

      vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError"))
          );
        });
      });
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const pending = Promise.all([
        utils.getWakaTimeOverview(7),
        utils.getWakaTimeLanguages(7),
        utils.getWakaTimeMonthlyTrend(),
        utils.getWakaTimeHourlyHeatmap(),
      ]);
      await vi.advanceTimersByTimeAsync(WAKA_FETCH_TIMEOUT_MS * 2);

      const [overview, languages, trend, heatmap] = await pending;

      // Zeroed tiles, no chart series, no breakdown rows, no "best day" card.
      expect(overview.metrics).toEqual({
        avgDailyHours: 0,
        daysActive: 0,
        topLanguage: "N/A",
        totalHours: 0,
      });
      expect(overview.editors).toEqual([]);
      expect(overview.projects).toEqual([]);
      expect(overview.bestDay).toBeNull();
      expect(languages).toEqual([]);
      expect(trend).toEqual([]);
      expect(heatmap).toEqual([]);
    });

    test("the activity chart is empty too, and the page is still bounded", async () => {
      // The worst case this timeout prevents. `getWakaTimeActivityWithAI` walks
      // hybrid -> durations -> insights in series, so a hung WakaTime used to
      // cost three unbounded hangs. Now it costs three timeouts and returns an
      // empty series, which the activity chart already knows how to render.
      const { WAKA_FETCH_TIMEOUT_MS } = await loadTransport();
      vi.resetModules();
      const utils = await import("../../wakatime-utils");
      // `getWakaTimeActivityWithAI` reaches the hybrid fetch through a dynamic
      // import, and loading a module needs real time — which fake timers do not
      // advance. Pulling it into the registry first means the dynamic import
      // resolves from cache and the only thing left to wait on is the timeout.
      await import("../hybrid-fetch");

      vi.useFakeTimers();
      vi.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError"))
          );
        });
      });
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(console, "log").mockImplementation(() => {});

      const pending = utils.getWakaTimeActivityWithAI(7);
      // hybrid (1) + durations sweep (1, it stops at the first timeout) +
      // insights (1). A generous ceiling so the assertion is that it settles at
      // all, not the exact count.
      await vi.advanceTimersByTimeAsync(WAKA_FETCH_TIMEOUT_MS * 10);

      await expect(pending).resolves.toEqual([]);
    });
  });
});
