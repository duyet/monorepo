/**
 * API Configuration
 *
 * Centralized configuration for external API integrations.
 * Contains endpoints, timeouts, retry logic, and other API-level settings.
 */

export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}

export interface CacheConfig {
  revalidate: number; // seconds
  tags?: string[];
}

// Default cache configuration - 1 hour
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  revalidate: 3600,
};

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelayMs: 1000,
};

// GitHub API Configuration
export const githubConfig = {
  baseUrl: "https://api.github.com",
  version: "v3",
  endpoints: {
    searchRepositories: "/search/repositories",
    userRepos: (username: string) => `/users/${username}/repos`,
  },
  headers: {
    accept: "application/vnd.github.v3+json",
    userAgent: "insights-app",
  },
  pagination: {
    perPage: 100,
    maxPages: 10, // GitHub Search API limit: 1000 results max
  },
  retry: DEFAULT_RETRY_CONFIG,
  cache: DEFAULT_CACHE_CONFIG,
  rateLimit: {
    maxRetries: 3,
    retryStatuses: [403, 429],
  },
};

/**
 * The range values WakaTime accepts on `/users/current/stats/{range}` and on
 * `/users/current/insights/{type}?range=`. Both resources document the same
 * list, so a value that is valid for one is valid for the other — which is what
 * makes "one selector, one window" enforceable.
 *
 * @see https://wakatime.com/developers#stats
 * @see https://wakatime.com/developers#insights
 */
export type WakaTimeRange =
  | "last_7_days"
  | "last_30_days"
  | "last_6_months"
  | "last_year"
  | "all_time";

// WakaTime API Configuration
export const wakatimeConfig = {
  baseUrl: "https://wakatime.com/api/v1",
  endpoints: {
    currentUser: "/users/current",
    stats: (range: string) => `/users/current/stats/${range}`,
    durations: (date: string) => `/users/current/durations?date=${date}`,
    insights: {
      days: (range: string) => `/users/current/insights/days?range=${range}`,
      weekday: (range: string) =>
        `/users/current/insights/weekday?range=${range}`,
      bestDay: (range: string) =>
        `/users/current/insights/best_day?range=${range}`,
    },
  },
  ranges: {
    last_7_days: "last_7_days",
    last_30_days: "last_30_days",
    last_6_months: "last_6_months",
    last_year: "last_year",
    all_time: "all_time",
  } satisfies Record<WakaTimeRange, WakaTimeRange>,
  /**
   * Selector mapping: the `days` value a reader picks in the period switcher
   * (see `PERIODS` in `apps/insights/lib/periods.ts`) -> the range on the wire.
   *
   * `"all"` is unbounded, not `last_year`. The switcher already offers `365`
   * for the bounded year, so mapping `"all"` to `last_year` as well would make
   * two distinct options request the identical window.
   */
  rangeMapping: {
    7: "last_7_days",
    30: "last_30_days",
    90: "last_6_months",
    365: "last_year",
    all: "all_time",
  } as Record<number | "all", WakaTimeRange>,
  cache: DEFAULT_CACHE_CONFIG,
  dataStartYear: 2025, // Only show data from 2025 onwards
  topLanguagesLimit: 8,
};

// PostHog API Configuration
export const posthogConfig = {
  baseUrl: "https://app.posthog.com/api",
  endpoints: {
    query: (projectId: string) => `/projects/${projectId}/query/`,
  },
  headers: {
    contentType: "application/json",
  },
  cache: {
    revalidate: 3600,
    tags: ["posthog"],
  } as CacheConfig,
};

// Cloudflare API Configuration
export const cloudflareConfig = {
  baseUrl: "https://api.cloudflare.com/client/v4",
  endpoints: {
    zones: "/zones",
    analytics: (zoneId: string) => `/zones/${zoneId}/analytics/dashboard`,
  },
  cache: DEFAULT_CACHE_CONFIG,
};

// ClickHouse Configuration
export const clickhouseConfig = {
  defaultPort: {
    http: 8123,
    https: 443,
  },
  defaultProtocol: "https",
  timeout: {
    request: 60000, // 60 seconds
    execution: 60, // 60 seconds (clickhouse_settings)
  },
  limits: {
    maxResultRows: "10000",
    maxMemoryUsage: "1G",
  },
  retry: {
    maxRetries: 2,
    backoffMultiplier: 1.5,
    initialDelayMs: 500,
  },
};

/**
 * Selector mapping: the `days` value a reader picks in the period switcher ->
 * the `range` sent to WakaTime.
 *
 * This is the **only** mapping a user-facing `?range=` may use, so
 * `/users/current/stats/{range}` and `/users/current/insights?range=` can never
 * describe two different windows for one selection. It used to have three
 * diverged copies alongside it, one of which sent `all_time` here and
 * `last_year` on the same page.
 *
 * Use {@link getWakaTimeRangeForElapsedDays} instead when the input is an
 * arbitrary day count rather than a selectable option.
 */
export function getWakaTimeRange(days: number | "all"): WakaTimeRange {
  if (typeof days === "number") {
    return (
      wakatimeConfig.rangeMapping[days] || wakatimeConfig.ranges.last_30_days
    );
  }
  return wakatimeConfig.rangeMapping.all;
}

/**
 * Elapsed-day mapping: an arbitrary day count -> the smallest WakaTime range
 * that *contains* it.
 *
 * Deliberately different from {@link getWakaTimeRange}, which resolves a
 * selectable option exactly and falls back to `last_30_days` for anything
 * unrecognised. Backfills must round *up*, because an under-covering range
 * silently drops rows the caller asked for, so the thresholds step through
 * `last_7_days` / `last_30_days` / `last_6_months` / `last_year` and end at the
 * unbounded `all_time`. There is no `"all"` input: a caller that wants
 * everything passes a day count large enough to land on `all_time`.
 */
export function getWakaTimeRangeForElapsedDays(days: number): WakaTimeRange {
  const { ranges } = wakatimeConfig;
  if (days <= 7) return ranges.last_7_days;
  if (days <= 30) return ranges.last_30_days;
  if (days <= 180) return ranges.last_6_months;
  if (days <= 365) return ranges.last_year;
  return ranges.all_time;
}

// Helper function to calculate exponential backoff delay
export function calculateBackoffDelay(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  return config.initialDelayMs * config.backoffMultiplier ** retryCount;
}

// Export all API configs
export const apiConfig = {
  github: githubConfig,
  wakatime: wakatimeConfig,
  posthog: posthogConfig,
  cloudflare: cloudflareConfig,
  clickhouse: clickhouseConfig,
  defaults: {
    cache: DEFAULT_CACHE_CONFIG,
    retry: DEFAULT_RETRY_CONFIG,
  },
  helpers: {
    getWakaTimeRange,
    getWakaTimeRangeForElapsedDays,
    calculateBackoffDelay,
  },
};
