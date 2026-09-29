/**
 * The hybrid fetch deliberately does *not* follow the reader's period.
 *
 * `getHybridDailyActivity` splits the request: everything older than
 * `freshDataDays` comes from ClickHouse, and only that bounded fresh tail is
 * requested from the WakaTime API. It used to compute that tail's range with a
 * private ternary clamped to `last_30_days`; it now uses the shared elapsed-day
 * mapping, which covers the tail instead of truncating it.
 *
 * This is the deliberate exception to "one selector, one window", so the wire
 * value is pinned here: the fresh tail must stay bounded to the configured
 * window, and must not widen to whatever the selected period was.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_HYBRID_CONFIG } from "../types";

vi.mock("../clickhouse", () => ({
  hasActivityData: async () => false,
  getClickHouseActivity: async () => [],
}));

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

/** The `range` query value of the single insights request the fetch makes. */
async function freshRangeFor(
  days: number | "all",
  config?: { freshDataDays: number }
): Promise<string | null> {
  vi.resetModules();
  const hybrid = await import("../hybrid-fetch");

  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => jsonResponse({ data: { days: [] } }));

  let range: string | null = null;
  try {
    await hybrid.getHybridDailyActivity(days, config);
    for (const [input] of fetchSpy.mock.calls) {
      const url = String(input);
      if (url.includes("/insights/days")) {
        range = new URL(url).searchParams.get("range");
      }
    }
  } finally {
    fetchSpy.mockRestore();
  }

  return range;
}

describe("hybrid fetch fresh-tail range", () => {
  beforeEach(() => {
    // `environment.d.ts` declares every key `readonly`, so go through vitest
    // rather than assigning to `process.env` directly.
    vi.stubEnv("WAKATIME_API_KEY", "test-key");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("defaults to the configured 7-day fresh tail", async () => {
    expect(DEFAULT_HYBRID_CONFIG.freshDataDays).toBe(7);
    expect(await freshRangeFor("all")).toBe("last_7_days");
    expect(await freshRangeFor(365)).toBe("last_7_days");
    expect(await freshRangeFor(30)).toBe("last_7_days");
  });

  test("follows a widened fresh tail instead of clamping it", async () => {
    // The old ternary returned `last_30_days` for every value above 7, so a
    // 90-day tail would have been under-covered. The shared elapsed-day mapping
    // rounds up to a range that actually contains the tail.
    expect(await freshRangeFor("all", { freshDataDays: 30 })).toBe(
      "last_30_days"
    );
    expect(await freshRangeFor("all", { freshDataDays: 90 })).toBe(
      "last_6_months"
    );
    expect(await freshRangeFor("all", { freshDataDays: 400 })).toBe("all_time");
  });
});
