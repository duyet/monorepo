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
  },
  rangeMapping: {
    7: "last_7_days",
    30: "last_30_days",
    90: "last_6_months",
    365: "last_year",
    all: "last_year",
  } as Record<number | "all", string>,
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

// Helper function to get WakaTime range from days
export function getWakaTimeRange(days: number | "all"): string {
  if (typeof days === "number") {
    return (
      wakatimeConfig.rangeMapping[days] || wakatimeConfig.ranges.last_30_days
    );
  }
  return wakatimeConfig.ranges.last_year;
}

// Helper function to calculate exponential backoff delay
export function calculateBackoffDelay(
  retryCount: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): number {
  return config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount);
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
    calculateBackoffDelay,
  },
};
