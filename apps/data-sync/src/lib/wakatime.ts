/**
 * Imported from the `@duyet/config/api` subpath rather than the
 * `@duyet/config` barrel, and that is load-bearing — see
 * `src/lib/__tests__/config-imports.test.ts`.
 *
 * `@duyet/config` has no `"type": "module"`, so `tsx` loads it as CJS. Node's
 * `cjs-module-lexer` can enumerate a single module's named exports but not an
 * `export * from` re-export chain, so a *static named* import from the barrel
 * resolves to `undefined` names and throws at module instantiation:
 *
 *     SyntaxError: The requested module '@duyet/config' does not provide
 *     an export named 'wakatimeConfig'
 *
 * The barrel works fine from Vite (insights, homelab) and fine via `require()`.
 * It is only static named ESM imports from a tsx-run app that break, which is
 * why the whole data-sync CLI failed to start while `vitest` stayed green.
 */
import { wakatimeConfig } from "@duyet/config/api";

/**
 * Shared WakaTime transport helpers.
 *
 * The six WakaTime syncers each inlined the same
 * `withRetry(fetch) -> !res.ok -> status ladder -> res.json()` block and the
 * same `?api_key=` URL assembly. This module is the single implementation of
 * those blocks.
 *
 * The day-count -> range ladder is *not* here: it lives beside the endpoint
 * definitions in `@duyet/config/api` as `getWakaTimeRangeForElapsedDays`, so
 * the backfill syncers and the reader-facing selector share one source of
 * truth for the range strings.
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
