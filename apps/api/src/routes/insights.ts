import { Hono } from "hono";

interface Env {
  CLICKHOUSE_HOST?: string;
  CLICKHOUSE_PORT?: string;
  CLICKHOUSE_USER?: string;
  CLICKHOUSE_PASSWORD?: string;
  CLICKHOUSE_DATABASE?: string;
  CLICKHOUSE_PROTOCOL?: string;
  WAKATIME_API_KEY?: string;
}

const insightsRouter = new Hono<{ Bindings: Env }>();

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

function getClickHouseUrl(env: Env): string | null {
  const host = env.CLICKHOUSE_HOST;
  const password = env.CLICKHOUSE_PASSWORD;
  const user = env.CLICKHOUSE_USER || "default";
  const protocol = env.CLICKHOUSE_PROTOCOL || "https";
  const port = env.CLICKHOUSE_PORT || "443";

  if (!host || !password) {
    return null;
  }

  return `${protocol}://${user}:${encodeURIComponent(password)}@${host}:${port}`;
}

async function queryClickHouse(
  env: Env,
  query: string
): Promise<Record<string, unknown>[]> {
  const url = getClickHouseUrl(env);
  if (!url) return [];

  const database = env.CLICKHOUSE_DATABASE || "default";
  const response = await fetch(`${url}?database=${database}`, {
    body: `${query}\nFORMAT JSONEachRow`,
    headers: {
      Accept: "application/json",
      "Content-Type": "text/plain",
    },
    method: "POST",
  });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();
  return text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
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

  const response = await fetch(
    "https://wakatime.com/api/v1/users/current/stats/last_30_days",
    {
      headers: {
        Authorization: `Basic ${btoa(env.WAKATIME_API_KEY)}`,
      },
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

  return {
    wakaLanguages: languages.slice(0, 8),
    wakaMetrics: {
      avgDailyHours: Number(data?.daily_average || 0) / 3600,
      daysActive: Number(data?.days_minus_holidays) || 0,
      topLanguage: languages[0]?.name || "N/A",
      totalHours: Number(data?.total_seconds || 0) / 3600,
    },
    wakaTrend: [],
  };
}

insightsRouter.get("/overview", async (c) => {
  try {
    const [ai, waka] = await Promise.all([
      getAiOverview(c.env),
      getWakaOverview(c.env),
    ]);

    c.header("Access-Control-Allow-Origin", "*");
    c.header(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3600"
    );
    return c.json({
      ...EMPTY_OVERVIEW,
      ...ai,
      ...waka,
      cloudflare: {
        ...EMPTY_OVERVIEW.cloudflare,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching insights overview:", error);
    c.header("Access-Control-Allow-Origin", "*");
    return c.json(EMPTY_OVERVIEW);
  }
});

insightsRouter.options("*", (c) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.body(null, 204);
});

export default insightsRouter;
