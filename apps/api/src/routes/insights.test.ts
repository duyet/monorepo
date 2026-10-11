import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../env.js";
import {
  EMPTY_OVERVIEW,
  getAiOverview,
  getCloudflareOverview,
  getPostHogOverview,
  getWakaOverview,
} from "../lib/insights.js";
import insightsRouter from "./insights.js";

const ENV: Env = {};

function okJson(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
}

/** 2xx response whose body is not JSON, e.g. a truncated upstream reply. */
function unparseableJson(): Response {
  return {
    json: async (): Promise<unknown> => {
      throw new SyntaxError("Unexpected end of JSON input");
    },
    ok: true,
  } as Response;
}

function stubFetch(handler: (url: string, init?: RequestInit) => Response) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init)
  );
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/insights/overview", () => {
  it("returns the zeroed overview with a fallback origin and caching", async () => {
    stubFetch(() => okJson({}));
    const res = await insightsRouter.request("/overview", {}, ENV);

    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://insights.duyet.net"
    );
    expect(res.headers.get("Vary")).toBe("Origin");
    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=300, stale-while-revalidate=3600"
    );

    const body = (await res.json()) as Record<string, unknown>;
    expect(Object.keys(body).sort()).toEqual(
      Object.keys(EMPTY_OVERVIEW).sort()
    );
    expect(body.aiMetrics).toEqual(EMPTY_OVERVIEW.aiMetrics);
    expect(body.posthog).toEqual(EMPTY_OVERVIEW.posthog);
    expect(body.wakaMetrics).toEqual(EMPTY_OVERVIEW.wakaMetrics);
  });

  it("echoes an allowed localhost origin", async () => {
    stubFetch(() => okJson({}));
    const res = await insightsRouter.request(
      "/overview",
      { headers: { Origin: "http://localhost:3000" } },
      ENV
    );

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000"
    );
  });

  it("falls back to the canonical origin for a disallowed one", async () => {
    stubFetch(() => okJson({}));
    const res = await insightsRouter.request(
      "/overview",
      { headers: { Origin: "https://evil.example.com" } },
      ENV
    );

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://insights.duyet.net"
    );
  });

  it("merges a fulfilled source over the defaults", async () => {
    stubFetch((_url, init) => {
      const query = String(init?.body ?? "");
      if (query.includes("active_days")) {
        return {
          ok: true,
          text: async () => '{"total_tokens":100,"active_days":2}\n',
        } as Response;
      }
      if (query.includes("ccusage_usage_daily")) {
        return {
          ok: true,
          text: async () =>
            '{"date":"2026-09-01","total_tokens":50,"total_cost":1.5}\n',
        } as Response;
      }
      return okJson({});
    });

    const res = await insightsRouter.request("/overview", {}, {
      ...ENV,
      CLICKHOUSE_HOST: "ch.example.com",
      CLICKHOUSE_PASSWORD: "pw",
    } as Env);
    const body = (await res.json()) as { aiMetrics: Record<string, number> };

    expect(body.aiMetrics.totalTokens).toBe(100);
    expect(body.aiMetrics.activeDays).toBe(2);
    expect(body.aiMetrics.dailyAverage).toBe(50);
  });

  it("stamps generatedAt per request, not at module load", async () => {
    // EMPTY_OVERVIEW is a module constant. When a source rejects the route
    // falls back to it, and it used to carry the isolate's boot time as the
    // data timestamp — so a degraded response claimed to be hours old.
    vi.useFakeTimers();
    try {
      const now = new Date("2030-06-06T06:06:06Z");
      vi.setSystemTime(now);
      stubFetch(() => {
        throw new Error("network unreachable");
      });

      const res = await insightsRouter.request("/overview", {}, {
        CLOUDFLARE_API_TOKEN: "token",
        CLOUDFLARE_ZONE_ID: "zone",
      } as Env);
      const body = (await res.json()) as {
        cloudflare: { generatedAt: string; totalRequests: number };
      };

      expect(body.cloudflare.totalRequests).toBe(0);
      expect(body.cloudflare.generatedAt).toBe(now.toISOString());
    } finally {
      vi.useRealTimers();
    }
  });

  it("answers OPTIONS with 204 and the preflight headers", async () => {
    const res = await insightsRouter.request(
      "/overview",
      { method: "OPTIONS" },
      ENV
    );

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS"
    );
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type"
    );
  });
});

describe("GET /api/insights/overview caching under ClickHouse failure", () => {
  const CH_ENV = {
    CLICKHOUSE_HOST: "ch.example.com",
    CLICKHOUSE_PASSWORD: "secret",
  } as Env;

  function stubCache() {
    const store = new Map<string, Response>();
    vi.stubGlobal("caches", {
      default: {
        match: async (r: Request) => store.get(r.url)?.clone(),
        put: async (u: string, r: Response) => void store.set(u, r),
      },
    });
    return store;
  }

  it("does not store the zeroed overview when ClickHouse fails", async () => {
    const store = stubCache();
    stubFetch(
      () => ({ ok: false, status: 503, text: async () => "down" }) as Response
    );

    const res = await insightsRouter.request("/overview", {}, CH_ENV);

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(store.size).toBe(0);
  });

  it("stores the overview when ClickHouse answers", async () => {
    const store = stubCache();
    stubFetch(
      () =>
        ({ ok: true, json: async () => ({}), text: async () => "" }) as Response
    );

    const res = await insightsRouter.request("/overview", {}, CH_ENV);

    expect(res.headers.get("Cache-Control")).toMatch(/public/);
    expect(store.size).toBe(1);
  });
});

describe("insight sources degrade instead of throwing", () => {
  it("getAiOverview zeroes out when ClickHouse is unconfigured", async () => {
    const overview = await getAiOverview(ENV);

    expect(overview.aiMetrics).toEqual(EMPTY_OVERVIEW.aiMetrics);
    expect(overview.aiActivity).toEqual([]);
    expect(overview.aiModels).toEqual([]);
  });

  it("getWakaOverview zeroes out without an API key", async () => {
    expect(await getWakaOverview(ENV)).toEqual({
      wakaLanguages: [],
      wakaMetrics: EMPTY_OVERVIEW.wakaMetrics,
      wakaTrend: [],
    });
  });

  it("getWakaOverview zeroes out on a non-2xx response", async () => {
    stubFetch(() => ({ ok: false, status: 500 }) as Response);

    expect(await getWakaOverview({ WAKATIME_API_KEY: "key" } as Env)).toEqual({
      wakaLanguages: [],
      wakaMetrics: EMPTY_OVERVIEW.wakaMetrics,
      wakaTrend: [],
    });
  });

  it("getWakaOverview keeps the stats when the monthly-trend fetch breaks", async () => {
    // The stats call and the trend call are independent. A failure in the
    // second one must not throw, because the route's allSettled would then
    // drop the (already fetched) stats and report zero coding time.
    stubFetch((url) => {
      if (url.includes("/insights/days/")) {
        return unparseableJson();
      }
      return okJson({
        data: {
          daily_average: 7200,
          days_minus_holidays: 3,
          languages: [{ name: "TypeScript", percent: 90, total_seconds: 100 }],
          total_seconds: 36_000,
        },
      });
    });

    const overview = await getWakaOverview({ WAKATIME_API_KEY: "key" } as Env);

    expect(overview.wakaMetrics).toEqual({
      avgDailyHours: 2,
      daysActive: 3,
      topLanguage: "TypeScript",
      totalHours: 10,
    });
    expect(overview.wakaLanguages).toHaveLength(1);
    expect(overview.wakaTrend).toEqual([]);
  });

  it("GET /overview still reports WakaTime when only the trend fetch breaks", async () => {
    stubFetch((url) => {
      if (url.includes("/insights/days/")) {
        throw new Error("trend endpoint timed out");
      }
      return okJson({
        data: {
          daily_average: 7200,
          days_minus_holidays: 3,
          languages: [{ name: "TypeScript", percent: 90, total_seconds: 100 }],
          total_seconds: 36_000,
        },
      });
    });

    const res = await insightsRouter.request("/overview", {}, {
      WAKATIME_API_KEY: "key",
    } as Env);
    const body = (await res.json()) as {
      wakaMetrics: Record<string, unknown>;
      wakaTrend: unknown[];
    };

    expect(body.wakaMetrics).toEqual({
      avgDailyHours: 2,
      daysActive: 3,
      topLanguage: "TypeScript",
      totalHours: 10,
    });
    expect(body.wakaTrend).toEqual([]);
  });

  it("getWakaOverview converts seconds to hours and buckets the trend", async () => {
    stubFetch((url) => {
      if (url.includes("/insights/days/")) {
        return okJson({
          data: {
            days: [
              { date: "2026-08-01", total: 3600 },
              { date: "2026-08-15", total: 1800 },
            ],
          },
        });
      }
      return okJson({
        data: {
          daily_average: 7200,
          days_minus_holidays: 3,
          languages: [{ name: "TypeScript", percent: 90, total_seconds: 100 }],
          total_seconds: 36_000,
        },
      });
    });

    const overview = await getWakaOverview({ WAKATIME_API_KEY: "key" } as Env);

    expect(overview.wakaMetrics).toEqual({
      avgDailyHours: 2,
      daysActive: 3,
      topLanguage: "TypeScript",
      totalHours: 10,
    });
    expect(overview.wakaTrend).toEqual([
      {
        displayDate: expect.stringContaining("2026"),
        hours: 1.5,
        yearMonth: "2026-08",
      },
    ]);
  });

  it("getPostHogOverview maps the page/visitor/view columns", async () => {
    stubFetch(() =>
      okJson({
        columns: ["Page", "Unique visitors", "Page views"],
        results: [
          ["/a", 4, 10],
          ["/b", 6, 20],
        ],
      })
    );

    const overview = await getPostHogOverview({
      POSTHOG_API_KEY: "key",
      POSTHOG_PROJECT_ID: "1",
    } as Env);

    expect(overview.posthog.paths).toEqual([
      { path: "/a", views: 10, visitors: 4 },
      { path: "/b", views: 20, visitors: 6 },
    ]);
    expect(overview.posthog).toMatchObject({
      avgVisitorsPerPage: 5,
      totalViews: 30,
      totalVisitors: 10,
    });
  });

  it("getPostHogOverview zeroes out when columns are unrecognized", async () => {
    stubFetch(() => okJson({ columns: ["nope"], results: [] }));

    expect(
      (
        await getPostHogOverview({
          POSTHOG_API_KEY: "k",
          POSTHOG_PROJECT_ID: "1",
        } as Env)
      ).posthog
    ).toEqual({ ...EMPTY_OVERVIEW.posthog, blogUrl: "" });
  });

  it("no source rejects on a 2xx response with an unparseable body", async () => {
    // A throwing source is merged as EMPTY_OVERVIEW by the route, so a
    // truncated/garbled upstream body must degrade inside the source instead.
    stubFetch(() => unparseableJson());

    const env = {
      CLOUDFLARE_API_TOKEN: "token",
      CLOUDFLARE_ZONE_ID: "zone",
      POSTHOG_API_KEY: "key",
      POSTHOG_PROJECT_ID: "1",
      WAKATIME_API_KEY: "key",
    } as Env;

    expect(await getCloudflareOverview(env)).toMatchObject({
      cloudflare: { days: 30, totalPageviews: 0, totalRequests: 0 },
    });
    expect((await getPostHogOverview(env)).posthog).toEqual({
      ...EMPTY_OVERVIEW.posthog,
      blogUrl: "",
    });
    expect(await getWakaOverview(env)).toEqual({
      wakaLanguages: [],
      wakaMetrics: EMPTY_OVERVIEW.wakaMetrics,
      wakaTrend: [],
    });
  });

  it("getPostHogOverview uses VITE_DUYET_BLOG_URL for the blog link", async () => {
    stubFetch(() => okJson({}));

    const overview = await getPostHogOverview({
      VITE_DUYET_BLOG_URL: "https://blog.duyet.net",
    } as Env);

    expect(overview.posthog.blogUrl).toBe("https://blog.duyet.net");
  });
});
