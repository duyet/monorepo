import { getWakaTimeRange, wakatimeConfig } from "@duyet/config";
import { sanitizePathLabel } from "@/lib/sanitize-path";
import type { InsightsResponse } from "./lib/activity";
import { wakaTimeJson } from "./lib/transport";
import { toHours, toPercent } from "./lib/units";

export { getWakaTimeActivityWithAI } from "./lib/activity";

interface WakaTimeBreakdownItem {
  name: string;
  percent: number;
  total_seconds: number;
  digital?: string;
  text?: string;
  hours?: number;
  minutes?: number;
  machine_name_id?: string;
}

interface WakaTimeBestDay {
  date?: string;
  text?: string;
  total_seconds?: number;
}

interface WakaTimeStats {
  data: {
    languages: WakaTimeBreakdownItem[];
    editors: WakaTimeBreakdownItem[];
    operating_systems: WakaTimeBreakdownItem[];
    categories?: WakaTimeBreakdownItem[];
    machines?: WakaTimeBreakdownItem[];
    projects?: WakaTimeBreakdownItem[];
    dependencies?: WakaTimeBreakdownItem[];
    best_day?: WakaTimeBestDay;
    days_including_holidays?: number;
    days_minus_holidays?: number;
    total_seconds: number;
    human_readable_total: string;
    human_readable_daily_average: string;
    daily_average: number;
  };
}

export interface WakaTimeBreakdown {
  name: string;
  percent: number;
  total_seconds: number;
  hours: number;
}

export interface WakaTimeBestDayInsight {
  date: string;
  text: string;
  totalSeconds: number;
  hours: number;
}

export interface WakaTimeOverview {
  metrics: WakaMetrics;
  editors: WakaTimeBreakdown[];
  operatingSystems: WakaTimeBreakdown[];
  categories: WakaTimeBreakdown[];
  machines: WakaTimeBreakdown[];
  projects: WakaTimeBreakdown[];
  bestDay: WakaTimeBestDayInsight | null;
}

export interface WakaMetrics {
  totalHours: number;
  avgDailyHours: number;
  daysActive: number;
  topLanguage: string;
}

// Using stats endpoint instead of summaries (summaries requires premium)

// The request itself — key, URL, Basic header, timeout, failure ladder and the
// five-minute response cache — lives in `./lib/transport`, shared with the
// hybrid fetch. Everything below is response shaping.

export async function getWakaTimeStats(
  days: number | "all" = 30
): Promise<WakaTimeStats | null> {
  const range = getWakaTimeRange(days);
  return wakaTimeJson<WakaTimeStats>(wakatimeConfig.endpoints.stats(range));
}

/**
 * Project a stats payload into the dashboard metric tiles. Shared by
 * getWakaTimeMetrics and getWakaTimeOverview so both stay in sync.
 */
function toMetrics(data: WakaTimeStats["data"]): WakaMetrics {
  return {
    totalHours: toHours(data.total_seconds || 0),
    avgDailyHours: toHours(data.daily_average || 0),
    daysActive: data.days_minus_holidays || 0,
    topLanguage: data.languages?.[0]?.name || "N/A",
  };
}

export async function getWakaTimeLanguages(days: number | "all" = 30) {
  const stats = await getWakaTimeStats(days);
  if (!stats?.data?.languages || !Array.isArray(stats.data.languages))
    return [];

  return stats.data.languages
    .slice(0, wakatimeConfig.topLanguagesLimit)
    .map((lang) => ({
      name: lang?.name || "Unknown",
      percent: toPercent(lang?.percent || 0),
      total_seconds: lang?.total_seconds || 0,
    }));
}

const EMPTY_WAKA_METRICS: WakaMetrics = {
  totalHours: 0,
  avgDailyHours: 0,
  daysActive: 0,
  topLanguage: "N/A",
};

/**
 * Fresh empty overview. Callers own the object they get back, so hand out a new
 * one every time rather than the shared EMPTY_WAKATIME_OVERVIEW constant.
 */
function emptyWakaTimeOverview(): WakaTimeOverview {
  return {
    metrics: { ...EMPTY_WAKA_METRICS },
    editors: [],
    operatingSystems: [],
    categories: [],
    machines: [],
    projects: [],
    bestDay: null,
  };
}

export async function getWakaTimeMetrics(
  days: number | "all" = 30
): Promise<WakaMetrics> {
  const stats = await getWakaTimeStats(days);
  if (!stats?.data) {
    return { ...EMPTY_WAKA_METRICS };
  }

  return toMetrics(stats.data);
}

function normalizeBreakdown(
  items: WakaTimeBreakdownItem[] | undefined,
  limit = 8
): WakaTimeBreakdown[] {
  if (!items || !Array.isArray(items)) return [];
  return items
    .filter((item) => (item?.total_seconds || 0) > 0)
    .slice(0, limit)
    .map((item) => ({
      name: sanitizePathLabel(item?.name),
      percent: toPercent(item?.percent || 0),
      total_seconds: item?.total_seconds || 0,
      hours: toHours(item?.total_seconds || 0),
    }));
}

export const EMPTY_WAKATIME_OVERVIEW: WakaTimeOverview = emptyWakaTimeOverview();

function extractBestDay(
  stats: WakaTimeStats | null
): WakaTimeBestDayInsight | null {
  const best = stats?.data?.best_day;
  if (!best?.date || !best.total_seconds) return null;
  return {
    date: best.date,
    text: best.text || "",
    totalSeconds: best.total_seconds,
    hours: toHours(best.total_seconds),
  };
}

/**
 * Fetch the full overview from a single stats call to avoid redundant API hits.
 */
export async function getWakaTimeOverview(
  days: number | "all" = 30
): Promise<WakaTimeOverview> {
  const stats = await getWakaTimeStats(days);

  if (!stats?.data) return emptyWakaTimeOverview();

  const { data } = stats;

  return {
    metrics: toMetrics(data),
    editors: normalizeBreakdown(data.editors),
    operatingSystems: normalizeBreakdown(data.operating_systems),
    categories: normalizeBreakdown(data.categories),
    machines: normalizeBreakdown(data.machines, 6),
    projects: normalizeBreakdown(data.projects, 10),
    bestDay: extractBestDay(stats),
  };
}

interface WeekdayData {
  percent: number;
  total_seconds: number;
}

interface WeekdayInsights {
  data?: {
    weekdays?: WeekdayData[];
    is_up_to_date?: boolean;
  };
}

// Generic helper to group and sum data
function groupSumBy<T>(
  items: T[],
  keyFn: (it: T) => string,
  valFn: (it: T) => number
): Map<string, number> {
  return items.reduce((map, it) => {
    const k = keyFn(it);
    const v = valFn(it);
    map.set(k, (map.get(k) || 0) + v);
    return map;
  }, new Map<string, number>());
}

// Monthly totals from the all_time insights feed, oldest first. Shared by the
// chart and the trend views, which only differ in how they label each row.
// The hard-coded `all_time` is the same value `getWakaTimeRange("all")`
// resolves to, so this "All time" view and the `/stats/` overview it sits next
// to cover one window.
async function getMonthlyTotals(): Promise<Array<[string, number]>> {
  const startYear = wakatimeConfig.dataStartYear;

  const insights: InsightsResponse | null = await wakaTimeJson<InsightsResponse>(
    wakatimeConfig.endpoints.insights.days(wakatimeConfig.ranges.all_time)
  );

  if (!insights?.data?.days || !Array.isArray(insights.data.days)) {
    console.warn("No days data available from WakaTime insights");
    return [];
  }

  // Filter by start year
  const filteredDays = insights.data.days.filter((day) => {
    if (!day.date || day.total == null) return false;
    const date = new Date(day.date);
    return date.getFullYear() >= startYear;
  });

  // Group by month
  const monthlyMap = groupSumBy(
    filteredDays,
    (day) => {
      const date = new Date(day.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return `${year}-${String(month).padStart(2, "0")}`;
    },
    (day) => day.total
  );

  // Convert to array and sort by year-month
  return Array.from(monthlyMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
}

// Get monthly activity data for charts (used when period is "all")
export async function getWakaTimeMonthlyActivity(): Promise<
  Array<{ date: string; "Total Hours": number }>
> {
  try {
    return (await getMonthlyTotals()).map(([yearMonth, totalSeconds]) => ({
      date: yearMonth,
      "Total Hours": toHours(totalSeconds),
    }));
  } catch (error) {
    console.error("Error fetching WakaTime monthly activity:", error);
    return [];
  }
}

// Get historical monthly activity trend for multiple years
export async function getWakaTimeMonthlyTrend() {
  try {
    return (await getMonthlyTotals()).map(([yearMonth, totalSeconds]) => {
      const [year, month] = yearMonth.split("-").map(Number);
      return {
        yearMonth,
        hours: toHours(totalSeconds),
        displayDate: new Date(year, month - 1).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
      };
    });
  } catch (error) {
    console.error("Error fetching WakaTime monthly trend:", error);
    return [];
  }
}

// Get hourly activity heatmap data by day of week
export async function getWakaTimeHourlyHeatmap() {
  const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;

  try {
    // Get weekday insights - use last_30_days as last_year may not be supported
    // by the weekday insights endpoint (returns 400)
    const weekdayInsights: WeekdayInsights | null =
      await wakaTimeJson<WeekdayInsights>(
        wakatimeConfig.endpoints.insights.weekday(
          wakatimeConfig.ranges.last_30_days
        )
      );

    if (
      !weekdayInsights?.data?.weekdays ||
      !Array.isArray(weekdayInsights.data.weekdays)
    ) {
      // Silently return empty - API might not support this endpoint for all accounts
      return [];
    }

    // Check if all weekdays have zero hours - if so, return empty array
    const hasData = weekdayInsights.data.weekdays.some(
      (weekday) => weekday.total_seconds > 0
    );
    if (!hasData) {
      return [];
    }

    // Map weekday data (0=Sunday to 6=Saturday)
    return weekdayInsights.data.weekdays.map((weekday, index) => ({
      day: WEEKDAYS[index] || "Unknown",
      dayIndex: index,
      hours: toHours(weekday.total_seconds),
      percent: Math.round(weekday.percent * 100) / 100,
    }));
  } catch (error) {
    console.error("Error fetching WakaTime hourly heatmap:", error);
    return [];
  }
}
