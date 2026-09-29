/**
 * One reader selection, one time window.
 *
 * `wakatime-utils.tsx` used to carry two "days -> range" ladders: the shared
 * `getWakaTimeRange` for `/users/current/stats/{range}`, and a private
 * `getInsightsRange` for `/users/current/insights/days?range=`. For the
 * `"all"` option they disagreed — the stats request received `last_year` and
 * the insights request `all_time` — so a single period selection produced two
 * different windows on the same page.
 *
 * These tests assert the wire value, not the mapping: for every day value the
 * period switcher offers, `/stats/` and `/insights/` must be asked for the same
 * range, and it must be the one the option means.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PERIODS } from "@/lib/periods";

/**
 * The hybrid path (ClickHouse plus a bounded fresh tail) is pinned separately in
 * `lib/__tests__/hybrid-fetch-range.test.ts`. Stub it to an empty result so
 * `getWakaTimeActivityWithAI` falls through to the WakaTime API path, which is
 * the one whose `?range=` has to agree with `/stats/`.
 */
vi.mock("../lib/hybrid-fetch", () => ({
  getHybridActivityForChart: vi.fn(async () => []),
}));

/** The range each `days` value is documented to mean, and must send. */
const EXPECTED: Record<string, string> = {
  "7": "last_7_days",
  "30": "last_30_days",
  "365": "last_year",
  all: "all_time",
};

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

/**
 * The `/durations` endpoint is premium-only on most accounts, and the production
 * code already handles it failing: the request throws, the day map stays empty,
 * and the activity falls through to the insights endpoint. Rejecting on the
 * first day also keeps the loop from spending its 100ms inter-request delay 30
 * times over.
 */
function mockWakaTime(): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes("/durations")) {
      throw new Error("durations unavailable");
    }
    return jsonResponse({
      data: {
        days: [],
        total_seconds: 0,
        daily_average: 0,
        languages: [],
        editors: [],
        operating_systems: [],
      },
    });
  });
}

interface Wire {
  /** `/users/current/stats/{range}` path segment. */
  statsRange: string | undefined;
  /** `/users/current/insights/days?range=` query value. */
  insightsRange: string | null;
}

/**
 * Drive the real `getWakaTimeStats` and `getWakaTimeActivityWithAI` and report
 * what each put on the wire.
 *
 * `vi.resetModules()` reloads the module so its 5-minute response cache — keyed
 * by URL — starts empty. Without it the second call for a given period would be
 * served from cache and never reach the spy.
 */
async function wireFor(days: number | "all"): Promise<Wire> {
  vi.resetModules();
  const utils = await import("../wakatime-utils");

  const fetchSpy = mockWakaTime();
  let statsRange: string | undefined;
  let insightsRange: string | null = null;

  try {
    await utils.getWakaTimeStats(days);
    await utils.getWakaTimeActivityWithAI(days);

    for (const [input] of fetchSpy.mock.calls) {
      const url = String(input);
      if (url.includes("/stats/")) {
        statsRange = url.slice(url.indexOf("/stats/") + "/stats/".length);
      }
      if (url.includes("/insights/days")) {
        insightsRange = new URL(url).searchParams.get("range");
      }
    }
  } finally {
    fetchSpy.mockRestore();
  }

  return { statsRange, insightsRange };
}

describe("the WakaTime ?range= parameter", () => {
  beforeEach(() => {
    // `environment.d.ts` declares every key `readonly`, so go through vitest
    // rather than assigning to `process.env` directly.
    vi.stubEnv("WAKATIME_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("the period switcher still offers exactly the days values pinned here", () => {
    // Guards the other direction: a new option added to the switcher would make
    // the table above incomplete rather than silently untested.
    expect(PERIODS.map((p) => String(p.days)).sort()).toEqual(
      Object.keys(EXPECTED).sort()
    );
  });

  for (const period of PERIODS) {
    test(`"${period.value}" (${period.label}) sends ${EXPECTED[String(period.days)]} to both endpoints`, async () => {
      const { statsRange, insightsRange } = await wireFor(period.days);

      expect(statsRange).toBe(EXPECTED[String(period.days)]);
      expect(insightsRange).toBe(EXPECTED[String(period.days)]);
    });
  }

  /**
   * The bug itself. Before the consolidation `"all"` produced
   * `/users/current/stats/last_year` and
   * `/users/current/insights/days?range=all_time` from one selection.
   */
  test('"all" is the same window on /stats/ and /insights/', async () => {
    const { statsRange, insightsRange } = await wireFor("all");

    expect(statsRange).toBe("all_time");
    expect(insightsRange).toBe("all_time");
    expect(statsRange).toBe(insightsRange);
    // `365` is the switcher's bounded-year option; if "all" collapsed onto it,
    // two different labels would be serving identical data.
    expect(statsRange).not.toBe(EXPECTED["365"]);
  });
});
