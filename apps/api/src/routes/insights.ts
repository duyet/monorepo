import { Hono, type Context } from "hono";
import type { Env } from "../env.js";

const insightsRouter = new Hono<{ Bindings: Env }>();
const FETCH_TIMEOUT_MS = 10_000;
const FALLBACK_CORS_ORIGIN = "https://insights.duyet.net";

interface TrafficGroup {
  date: { date: string };
  sum: {
    bytes?: number;
    cachedBytes?: number;
    pageViews: number;
    requests: number;
  };
  uniq: { uniques: number };
}

interface CloudflareData {
  viewer: { zones: Array<{ httpRequests1dGroups: TrafficGroup[] }> };
}

const EMPTY_OVERVIEW = {
  aiActivity: [],
  aiMetrics: {
    activeDays: 0,
    cacheTokens: 0,
    dailyAverage: 0,
    topModel: "N/A",
    totalCost: 0,
    totalTokens: 0,
  },
  aiModels: [],
  cloudflare: {
    data: { viewer: { zones: [{ httpRequests1dGroups: [] }] } },
    days: 30,
    generatedAt: new Date().toISOString(),
    totalPageviews: 0,
    totalRequests: 0,
  },
  posthog: {
    avgVisitorsPerPage: 0,
    blogUrl: "",
    paths: [],
    totalViews: 0,
    totalVisitors: 0,
  },
  wakaLanguages: [],
  wakaMetrics: {
    avgDailyHours: 0,
    daysActive: 0,
    topLanguage: "N/A",
    totalHours: 0,
  },
  wakaTrend: [],
};

function getClickHouseConfig(
  env: Env
): { headers: Record<string, string>; url: string } | null {
  const host = env.CLICKHOUSE_HOST;
  const password = env.CLICKHOUSE_PASSWORD;
  const user = env.CLICKHOUSE_USER || "default";
  const protocol = env.CLICKHOUSE_PROTOCOL || "https";
  const port = env.CLICKHOUSE_PORT || "443";

  if (!host || !password) {
    return null;
  }

  return {
    headers: {
      "X-ClickHouse-Key": password,
      "X-ClickHouse-User": user,
    },
    url: `${protocol}://${host}:${port}`,
  };
}

async function queryClickHouse(
  env: Env,
  query: string
): Promise<Record<string, unknown>[]> {
  const config = getClickHouseConfig(env);
  if (!config) return [];

  const database = env.CLICKHOUSE_DATABASE || "default";
  try {
    const response = await fetch(`${config.url}?database=${database}`, {
      body: `${query}\nFORMAT JSONEachRow`,
      headers: {
        ...config.headers,
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      method: "POST",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    const results: Record<string, unknown>[] = [];

    for (const line of text.trim().split("\n").filter(Boolean)) {
      try {
        results.push(JSON.parse(line) as Record<string, unknown>);
      } catch {
        console.warn("Skipping malformed ClickHouse JSONEachRow line");
      }
    }

    return results;
  } catch (error) {
    console.error("ClickHouse insights query failed:", error);
    return [];
  }
}

async function getAiOverview(env: Env) {
  const metrics = await queryClickHouse(
    env,
    `
      SELECT
        SUM(total_tokens) as total_tokens,
        SUM(cache_creation_tokens + cache_read_tokens) as cache_tokens,
        SUM(total_cost) as total_cost,
        COUNT(DISTINCT date) as active_days
      FROM ccusage_usage_daily
      WHERE date >= today() - INTERVAL 30 DAY
    `
  );

  const activity = await queryClickHouse(
    env,
    `
      SELECT
        date,
        SUM(total_tokens) as total_tokens,
        SUM(total_cost) as total_cost
      FROM ccusage_usage_daily
      WHERE date >= today() - INTERVAL 30 DAY
      GROUP BY date
      ORDER BY date ASC
    `
  );

  const models = await queryClickHouse(
    env,
    `
      SELECT
        model_name,
        SUM(cost) as total_cost,
        SUM(input_tokens + output_tokens + cache_creation_tokens + cache_read_tokens) as total_tokens,
        COUNT() as usage_count
      FROM ccusage_model_breakdowns
      WHERE created_at >= now() - INTERVAL 30 DAY
      GROUP BY model_name
      ORDER BY total_tokens DESC
      LIMIT 10
    `
  );

  const metricRow = metrics[0] ?? {};
  const totalTokens = Number(metricRow.total_tokens) || 0;
  const activeDays = Number(metricRow.active_days) || 0;
  const totalModelTokens = models.reduce(
    (sum, row) => sum + (Number(row.total_tokens) || 0),
    0
  );

  return {
    aiActivity: activity.map((row) => ({
      "Total Cost": Number(row.total_cost) || 0,
      "Total Tokens": Math.round((Number(row.total_tokens) || 0) / 1000),
      date: String(row.date),
    })),
    aiMetrics: {
      activeDays,
      cacheTokens: Math.round(Number(metricRow.cache_tokens) || 0),
      dailyAverage: activeDays > 0 ? Math.round(totalTokens / activeDays) : 0,
      topModel: String(models[0]?.model_name || "N/A"),
      totalCost: Number(metricRow.total_cost) || 0,
      totalTokens,
    },
    aiModels: models.map((row) => ({
      cost: Number(row.total_cost) || 0,
      name: String(row.model_name || "Unknown"),
      percent:
        totalModelTokens > 0
          ? Math.round(
              ((Number(row.total_tokens) || 0) / totalModelTokens) * 100
            )
          : 0,
      tokens: Number(row.total_tokens) || 0,
      usageCount: Number(row.usage_count) || 0,
    })),
  };
}

async function getWakaOverview(env: Env) {
  if (!env.WAKATIME_API_KEY) {
    return {
      wakaLanguages: [],
      wakaMetrics: EMPTY_OVERVIEW.wakaMetrics,
      wakaTrend: [],
    };
  }

  const auth = `Basic ${btoa(env.WAKATIME_API_KEY)}`;
  const response = await fetch(
    "https://wakatime.com/api/v1/users/current/stats/last_30_days",
    {
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    return {
      wakaLanguages: [],
      wakaMetrics: EMPTY_OVERVIEW.wakaMetrics,
      wakaTrend: [],
    };
  }

  const json = (await response.json()) as {
    data?: {
      daily_average?: number;
      days_minus_holidays?: number;
      languages?: Array<{
        name: string;
        percent: number;
        total_seconds: number;
      }>;
      total_seconds?: number;
    };
  };
  const data = json.data;
  const languages = data?.languages ?? [];

  const trend = await getWakaMonthlyTrend(auth);

  return {
    wakaLanguages: languages.slice(0, 8),
    wakaMetrics: {
      avgDailyHours: Number(data?.daily_average || 0) / 3600,
      daysActive: Number(data?.days_minus_holidays) || 0,
      topLanguage: languages[0]?.name || "N/A",
      totalHours: Number(data?.total_seconds || 0) / 3600,
    },
    wakaTrend: trend,
  };
}

async function getWakaMonthlyTrend(auth: string) {
  const response = await fetch(
    "https://wakatime.com/api/v1/users/current/insights/days/all_time",
    {
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) return [];

  const json = (await response.json()) as {
    data?: { days?: Array<{ date?: string; total?: number }> };
  };

  const monthly = new Map<string, number>();
  for (const day of json.data?.days ?? []) {
    if (!day.date || day.total == null) continue;
    const yearMonth = day.date.slice(0, 7);
    monthly.set(yearMonth, (monthly.get(yearMonth) || 0) + Number(day.total));
  }

  return Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([yearMonth, totalSeconds]) => {
      const [year, month] = yearMonth.split("-").map(Number);
      return {
        displayDate: new Date(Date.UTC(year, month - 1)).toLocaleDateString(
          "en-US",
          { month: "short", timeZone: "UTC", year: "numeric" }
        ),
        hours: Math.round((totalSeconds / 3600) * 10) / 10,
        yearMonth,
      };
    });
}

async function getCloudflareOverview(env: Env) {
  const zoneId = env.CLOUDFLARE_ZONE_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    return {
      cloudflare: {
        ...EMPTY_OVERVIEW.cloudflare,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    body: JSON.stringify({
      query: `
        query viewer($zoneTag: string, $date_start: string, $date_end: string) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                orderBy: [date_ASC]
                limit: 1000
                filter: { date_geq: $date_start, date_lt: $date_end }
              ) {
                date: dimensions { date }
                sum { requests pageViews cachedBytes bytes }
                uniq { uniques }
              }
            }
          }
        }
      `,
      variables: {
        date_end: endDate.toISOString().split("T")[0],
        date_start: startDate.toISOString().split("T")[0],
        zoneTag: zoneId,
      },
    }),
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    return {
      cloudflare: {
        ...EMPTY_OVERVIEW.cloudflare,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  const data = (await response.json()) as { data?: CloudflareData };
  const groups =
    data.data?.viewer.zones[0]?.httpRequests1dGroups ??
    EMPTY_OVERVIEW.cloudflare.data.viewer.zones[0].httpRequests1dGroups;

  return {
    cloudflare: {
      data: data.data ?? EMPTY_OVERVIEW.cloudflare.data,
      days: 30,
      generatedAt: new Date().toISOString(),
      totalPageviews: groups.reduce(
        (sum, item) => sum + Number(item.sum.pageViews || 0),
        0
      ),
      totalRequests: groups.reduce(
        (sum, item) => sum + Number(item.sum.requests || 0),
        0
      ),
    },
  };
}

async function getPostHogOverview(env: Env) {
  const apiKey = env.POSTHOG_API_KEY;
  const projectId = env.POSTHOG_PROJECT_ID;

  if (!apiKey || !projectId) {
    return {
      posthog: {
        ...EMPTY_OVERVIEW.posthog,
        blogUrl: env.VITE_DUYET_BLOG_URL ?? "",
      },
    };
  }

  const response = await fetch(
    `https://app.posthog.com/api/projects/${projectId}/query/`,
    {
      body: JSON.stringify({
        query: {
          breakdownBy: "Page",
          dateRange: { date_from: "-30d", date_to: null },
          doPathCleaning: false,
          includeBounceRate: true,
          includeScrollDepth: false,
          kind: "WebStatsTableQuery",
          limit: 20,
          properties: [],
        },
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    return {
      posthog: {
        ...EMPTY_OVERVIEW.posthog,
        blogUrl: env.VITE_DUYET_BLOG_URL ?? "",
      },
    };
  }

  const data = (await response.json()) as {
    columns?: string[];
    results?: (string | number | [number])[][];
  };
  const columns = data.columns ?? [];
  const pathIndex = columns.findIndex((column) => {
    const normalized = column.toLowerCase();
    return (
      normalized.includes("page") ||
      normalized.includes("path") ||
      normalized.includes("breakdown_value")
    );
  });
  const visitorsIndex = columns.findIndex((column) => {
    const normalized = column.toLowerCase();
    return normalized.includes("visitor") || normalized.includes("unique");
  });
  const viewsIndex = columns.findIndex((column) => {
    const normalized = column.toLowerCase();
    return normalized.includes("view") || normalized.includes("pageview");
  });

  if (pathIndex === -1 || visitorsIndex === -1 || viewsIndex === -1) {
    return {
      posthog: {
        ...EMPTY_OVERVIEW.posthog,
        blogUrl: env.VITE_DUYET_BLOG_URL ?? "",
      },
    };
  }

  const paths = (data.results ?? []).map((row) => {
    const viewsValue = row[viewsIndex];
    const visitorsValue = row[visitorsIndex];

    return {
      path: String(row[pathIndex] || ""),
      views: Number(Array.isArray(viewsValue) ? viewsValue[0] : viewsValue) || 0,
      visitors:
        Number(
          Array.isArray(visitorsValue) ? visitorsValue[0] : visitorsValue
        ) || 0,
    };
  });
  const totalVisitors = paths.reduce((sum, path) => sum + path.visitors, 0);
  const totalViews = paths.reduce((sum, path) => sum + path.views, 0);

  return {
    posthog: {
      avgVisitorsPerPage:
        paths.length > 0 ? Math.round(totalVisitors / paths.length) : 0,
      blogUrl: env.VITE_DUYET_BLOG_URL ?? "",
      paths,
      totalViews,
      totalVisitors,
    },
  };
}

function setCors(c: Context<{ Bindings: Env }>) {
  const origin = c.req.header("Origin");
  const allowedOrigin =
    origin &&
    (/^https:\/\/(insights\.)?duyet\.net$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))
      ? origin
      : FALLBACK_CORS_ORIGIN;

  c.header("Access-Control-Allow-Origin", allowedOrigin);
  c.header("Vary", "Origin");
}

insightsRouter.get("/overview", async (c) => {
  try {
    const [ai, waka, cloudflare, posthog] = await Promise.allSettled([
      getAiOverview(c.env),
      getWakaOverview(c.env),
      getCloudflareOverview(c.env),
      getPostHogOverview(c.env),
    ]);

    setCors(c);
    c.header(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600"
    );
    return c.json({
      ...EMPTY_OVERVIEW,
      ...(ai.status === "fulfilled" ? ai.value : {}),
      ...(waka.status === "fulfilled" ? waka.value : {}),
      ...(cloudflare.status === "fulfilled" ? cloudflare.value : {}),
      ...(posthog.status === "fulfilled" ? posthog.value : {}),
    });
  } catch (error) {
    console.error("Error fetching insights overview:", error);
    setCors(c);
    return c.json(EMPTY_OVERVIEW);
  }
});

insightsRouter.options("*", (c) => {
  setCors(c);
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.body(null, 204);
});

export default insightsRouter;
