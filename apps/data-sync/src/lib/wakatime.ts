import { wakatimeConfig } from "@duyet/config";

/**
 * Shared WakaTime transport helpers.
 *
 * The six WakaTime syncers each inlined the same
 * `withRetry(fetch) -> !res.ok -> status ladder -> res.json()` block, the same
 * `?api_key=` URL assembly, and two copies of the same day-count -> range
 * ladder. This module is the single implementation of those blocks.
 *
 * Two invariants, because this is a data path:
 *
 * 1. Call sites keep their own `this.withRetry(...)` wrapper, so retry counts
 *    and backoff behaviour are untouched by this extraction.
 * 2. Error wording is per-style rather than unified, so the exact message a
 *    syncer has always produced is preserved verbatim. Only the shared
 *    transport moved.
 */

export interface WakaTimeErrorStyle {
  /** Wording per HTTP status. Statuses absent here fall through to `fallback`. */
  messages: Readonly<Record<number, string | undefined>>;
  /** Message for any status without a dedicated entry. */
  fallback: (res: Response) => string;
}

const withStatusText = (res: Response): string =>
  `WakaTime API error: ${res.status} ${res.statusText}`;

/**
 * The wording used by `wakatime`, `wakatime-projects` and `wakatime-goals`:
 * all three special-cased 401, 403 and 429.
 */
export const WAKA_TIME_DEFAULT_STYLE: WakaTimeErrorStyle = {
  messages: {
    401: "WakaTime API authentication failed: Invalid or expired API key",
    403: "WakaTime API access forbidden - check permissions",
    429: "WakaTime API rate limit exceeded",
  },
  fallback: withStatusText,
};

/**
 * `wakatime-insights-best-day` and `wakatime-insights-weekday` never had a 403
 * branch, so 403 has always surfaced as the generic message. Preserved.
 */
export const WAKA_TIME_INSIGHTS_STYLE: WakaTimeErrorStyle = {
  messages: {
    401: "WakaTime API authentication failed: Invalid or expired API key",
    429: "WakaTime API rate limit exceeded",
  },
  fallback: withStatusText,
};

/** `wakatime-activity` uses shorter wording and omits `statusText`. Preserved. */
export const WAKA_TIME_ACTIVITY_STYLE: WakaTimeErrorStyle = {
  messages: {
    401: "WakaTime API authentication failed",
    429: "WakaTime API rate limit exceeded",
  },
  fallback: (res) => `WakaTime API error: ${res.status}`,
};

/** Map a non-OK WakaTime response onto an Error. Never returns null. */
export function wakaTimeApiError(
  res: Response,
  style: WakaTimeErrorStyle = WAKA_TIME_DEFAULT_STYLE
): Error {
  return new Error(style.messages[res.status] ?? style.fallback(res));
}

/**
 * GET a WakaTime JSON endpoint.
 *
 * `url` must already be assembled by `wakaTimeApiUrl`. This performs the
 * request, converts non-OK responses via `style`, and parses the body. Wrap
 * the call in `this.withRetry(...)` to keep the existing retry policy.
 */
export async function fetchWakaTimeJson<T>(
  url: string,
  style: WakaTimeErrorStyle = WAKA_TIME_DEFAULT_STYLE
): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "data-sync-app" },
  });

  if (!res.ok) {
    throw wakaTimeApiError(res, style);
  }

  return res.json() as Promise<T>;
}

/**
 * Join a WakaTime path onto the shared base URL and append the API key,
 * picking `?` or `&` based on whether the path already carries a query.
 */
export function wakaTimeApiUrl(path: string, apiKey: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${wakatimeConfig.baseUrl}${path}${separator}api_key=${apiKey}`;
}

/**
 * The day-count -> WakaTime range ladder, shared by the stats and activity
 * syncers. Note this is a threshold ladder, not the exact-day lookup in
 * `wakatimeConfig.rangeMapping` / `getWakaTimeRange`.
 */
export function wakaTimeRangeForDays(days: number): string {
  const { ranges } = wakatimeConfig;
  if (days <= 7) return ranges.last_7_days;
  if (days <= 30) return ranges.last_30_days;
  if (days <= 180) return ranges.last_6_months;
  if (days <= 365) return ranges.last_year;
  return ranges.all_time;
}

/**
 * The ranges the per-range insight syncers iterate. Both the best-day and the
 * weekday syncer must request the same set, so it is defined once here.
 */
export const WAKA_TIME_INSIGHT_RANGES = [
  "last_7_days",
  "last_30_days",
  "last_year",
  "all_time",
] as const;

export type WakaTimeInsightRange = (typeof WAKA_TIME_INSIGHT_RANGES)[number];
