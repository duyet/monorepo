import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../env.js";
import {
  EMPTY_OVERVIEW,
  getAiOverview,
  getPostHogOverview,
  getWakaOverview,
} from "../lib/insights.js";
import insightsRouter from "./insights.js";

const ENV: Env = {};

function okJson(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
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

  it("getPostHogOverview uses VITE_DUYET_BLOG_URL for the blog link", async () => {
    stubFetch(() => okJson({}));

    const overview = await getPostHogOverview({
      VITE_DUYET_BLOG_URL: "https://blog.duyet.net",
    } as Env);

    expect(overview.posthog.blogUrl).toBe("https://blog.duyet.net");
  });
});
