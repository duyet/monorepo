import { getWakaTimeRange, wakatimeConfig } from "@duyet/config";
import { sanitizePathLabel } from "@/lib/sanitize-path";
import {
  type WakaTimeErrorStyle,
  wakaTimeApiKey,
  wakaTimeFetch,
  wakaTimeJson,
  WAKA_TIME_STATS_STYLE,
} from "./lib/transport";

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
  const totalHours = (data.total_seconds || 0) / 3600;
  const avgDailyHours = (data.daily_average || 0) / 3600;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    avgDailyHours: Math.round(avgDailyHours * 10) / 10,
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
      percent: Math.round((lang?.percent || 0) * 100) / 100,
      total_seconds: lang?.total_seconds || 0,
    }));
}

interface DurationItem {
  project: string;
  time: number;
  duration: number;
  ai_additions?: number;
  ai_deletions?: number;
  human_additions?: number;
  human_deletions?: number;
}

interface DurationsResponse {
  data?: DurationItem[];
  start?: string;
  end?: string;
  timezone?: string;
}

// Helper function to add delay between requests (rate limiting)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Statuses WakaTime returns for the premium-only `/durations` endpoint. 402 is
 * the documented answer; 401 and 403 are what a free-tier key actually gets, so
 * all three are treated as "needs premium" rather than as errors.
 */
const PREMIUM_DURATIONS_STATUSES = new Set([402, 401, 403]);

/**
 * The sweep keeps the shared transport's timeout and its log lines, but owns its
 * own failure wording: a 402 is an expected answer for most accounts, so
 * reporting it as an error would print one error per day of a 30-day sweep. The
 * premium ladder below reports those, and `onHttpError` reports everything else
 * with the day in the message.
 */
const DURATIONS_STYLE: WakaTimeErrorStyle = {
  ...WAKA_TIME_STATS_STYLE,
  transport: "Error fetching WakaTime activity with AI data:",
};

// Get activity from durations endpoint (with AI breakdown) for smaller periods
async function getActivityFromDurations(
  days: number
): Promise<Array<{ date: string; "Human Hours": number; "AI Hours": number }>> {
  // Checked before the sweep rather than per request: without a key the loop
  // would spend `days` round trips logging the same warning.
  if (!wakaTimeApiKey()) {
    return [];
  }

  const numDays = days;
  const activityMap = new Map<
    string,
    { humanSeconds: number; aiSeconds: number }
  >();

  // Track consecutive failures to detect premium-only endpoints
  let consecutivePremiumErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 5; // Fall back after 5 consecutive 402s

  // Fetch durations for each day in the range
  for (let i = 0; i < numDays; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    const result = await wakaTimeFetch<DurationsResponse>(
      wakatimeConfig.endpoints.durations(dateStr),
      {
        onHttpError: (error) => {
          // Premium statuses are reported by the ladder below, once.
          if (PREMIUM_DURATIONS_STATUSES.has(error.status)) return;
          console.error(
            `WakaTime API error fetching durations for ${dateStr}: ${error.status}`,
            `URL: ${error.url}`
          );
        },
        style: DURATIONS_STYLE,
      }
    );

    if (!result.ok) {
      if (result.reason === "http") {
        // 402 = Payment Required (premium feature), 401/403 = auth issues
        // These are expected for free tier accounts
        consecutivePremiumErrors++;

        // If we get many consecutive premium errors, fall back early
        if (consecutivePremiumErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.warn(
            `WakaTime durations endpoint requires premium account (status ${result.status}). Falling back to aggregated stats after ${consecutivePremiumErrors} errors.`
          );
          // If we have some data, use it; otherwise fall back
          if (activityMap.size > 0) {
            break; // Use what we have
          }
          return getFallbackActivityData(numDays);
        }

        // Log once on first error, then silently continue
        if (i === 0) {
          console.warn(
            `WakaTime durations endpoint requires premium account (status ${result.status}). Will attempt to fetch available days.`
          );
        }
        // Continue to next day instead of breaking
        continue;
      }

      // A dropped connection or a timeout ends the sweep: there is no
      // per-day status to reason about, so the days already collected (or
      // nothing) is the answer. The transport logged the reason.
      break;
    }

    // Reset counter on successful request
    consecutivePremiumErrors = 0;

    const data = result.data;

    if (data.data && Array.isArray(data.data)) {
      let dayHumanSeconds = 0;
      let dayAiSeconds = 0;

      for (const duration of data.data) {
        if (duration.duration) {
          // Estimate human vs AI contributions based on additions/deletions
          const humanAdditions = duration.human_additions || 0;
          const humanDeletions = duration.human_deletions || 0;
          const aiAdditions = duration.ai_additions || 0;
          const aiDeletions = duration.ai_deletions || 0;

          const totalActivity =
            humanAdditions + humanDeletions + aiAdditions + aiDeletions;

          // If we have activity data, allocate duration based on ratio
          if (totalActivity > 0) {
            const humanRatio = (humanAdditions + humanDeletions) / totalActivity;
            const aiRatio = (aiAdditions + aiDeletions) / totalActivity;

            dayHumanSeconds += duration.duration * humanRatio;
            dayAiSeconds += duration.duration * aiRatio;
          } else {
            // Default to 80% human, 20% AI if no activity data
            dayHumanSeconds += duration.duration * 0.8;
            dayAiSeconds += duration.duration * 0.2;
          }
        }
      }

      if (dayHumanSeconds > 0 || dayAiSeconds > 0) {
        activityMap.set(dateStr, {
          humanSeconds: dayHumanSeconds,
          aiSeconds: dayAiSeconds,
        });
      }
    }

    // Rate limiting: small delay between requests to stay under 10 req/sec
    // 30 requests * 100ms = 3 seconds total (well under rate limit)
    if (i < numDays - 1) {
      await delay(100);
    }
  }

  // If no data was fetched (premium endpoint failed), return fallback
  if (activityMap.size === 0) {
    return getFallbackActivityData(numDays);
  }

  // Convert to sorted array, most recent first
  const sortedDates = Array.from(activityMap.keys()).sort().reverse();

  return sortedDates.map((date) => {
    const activity = activityMap.get(date)!;
    const humanHours = (activity.humanSeconds / 3600).toFixed(2);
    const aiHours = (activity.aiSeconds / 3600).toFixed(2);

    return {
      date,
      "Human Hours": Number.parseFloat(humanHours),
      "AI Hours": Number.parseFloat(aiHours),
    };
  });
}

// Get activity from insights endpoint (total hours only) for larger periods
async function getActivityFromInsights(
  days: number | "all"
): Promise<Array<{ date: string; "Total Hours": number }>> {
  // The same mapping the stats path uses, deliberately: the reader picked one
  // option in the period switcher, so `/stats/` and `/insights/days?range=` must
  // describe the same window. This used to be a second ladder that sent
  // `all_time` here while `/stats/` received `last_year` for the same selection.
  const range = getWakaTimeRange(days);

  // The transport reports a missing key, a bad status, a timeout and a dropped
  // connection identically here: a `null` body, which is the empty array this
  // function has always returned for a failed request. It used to log
  // `WakaTime insights API error: <status>` with no 401/403/429 wording, which
  // the shared ladder now covers.
  const data = await wakaTimeJson<InsightsResponse>(
    wakatimeConfig.endpoints.insights.days(range)
  );

  if (!data?.data?.days || !Array.isArray(data.data.days)) {
    if (data) console.warn("No days data available from WakaTime insights");
    return [];
  }

  // Check if data is up to date for large ranges
  if (data.data.is_up_to_date === false) {
    console.warn(
      `WakaTime insights data not fully up to date for range: ${range}`
    );
  }

  // Filter by dataStartYear and limit if specified number of days
  const startYear = wakatimeConfig.dataStartYear;
  const filteredDays = data.data.days
    .filter((day) => {
      if (!day.date || day.total == null) return false;
      const date = new Date(day.date);
      return date.getFullYear() >= startYear;
    })
    .slice(0, typeof days === "number" ? days : undefined);

  return filteredDays.map((day) => ({
    date: day.date,
    "Total Hours": toHours(day.total),
  }));
}

// Union type for activity data formats
type ActivityWithAI = Array<{
  date: string;
  "Human Hours": number;
  "AI Hours": number;
}>;
type ActivityTotalOnly = Array<{ date: string; "Total Hours": number }>;

export async function getWakaTimeActivityWithAI(
  days: number | "all" = 30
): Promise<ActivityWithAI | ActivityTotalOnly> {
  const numDays = typeof days === "number" ? days : 9999;

  // Try hybrid fetch first (ClickHouse + API)
  try {
    const { getHybridActivityForChart } = await import("./lib/hybrid-fetch");
    const hybridData = await getHybridActivityForChart(days);

    if (hybridData.length > 0) {
      return hybridData as ActivityWithAI;
    }
  } catch (error) {
    console.warn(
      "[WakaTime] Hybrid fetch not available, using API fallback:",
      error
    );
  }

  // Fallback to API-only approach
  // Use insights endpoint for larger ranges (365+ days) - total hours only
  if (numDays >= 365) {
    return getActivityFromInsights(days);
  }

  // For smaller ranges, try durations endpoint first (has AI breakdown)
  // but fall back to insights if durations returns insufficient data
  if (typeof days === "number" && days <= 30) {
    const durationsData = await getActivityFromDurations(days);

    // Check if we got sufficient data (at least 50% of requested days)
    // Durations endpoint often fails for older days (premium required)
    const minExpectedDays = Math.floor(days * 0.5);

    if (durationsData.length >= minExpectedDays) {
      return durationsData;
    }

    // Fall back to insights endpoint for complete data (no AI breakdown)
    return getActivityFromInsights(days);
  }

  // For 31-364 days, use insights (durations would be too slow)
  return getActivityFromInsights(days);
}

// Fallback to aggregated stats when premium endpoint is unavailable
// Returns empty array — no data is better than fabricated numbers
async function getFallbackActivityData(_days: number) {
  return [];
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
      percent: Math.round((item?.percent || 0) * 100) / 100,
      total_seconds: item?.total_seconds || 0,
      hours: Math.round(((item?.total_seconds || 0) / 3600) * 10) / 10,
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
    hours: Math.round((best.total_seconds / 3600) * 10) / 10,
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

// Helper functions for data processing
const toHours = (seconds: number) => Math.round((seconds / 3600) * 10) / 10;

// Interface definitions for WakaTime API responses
interface DayData {
  date: string;
  total: number;
}

interface InsightsResponse {
  data?: {
    days?: DayData[];
    is_up_to_date?: boolean;
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
