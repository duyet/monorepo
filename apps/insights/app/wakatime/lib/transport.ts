/**
 * One WakaTime transport for `apps/insights`.
 *
 * `wakatime-utils.tsx` and `lib/hybrid-fetch.ts` each assembled their own
 * request out of the same five steps: read `WAKATIME_API_KEY`, join
 * `wakatimeConfig.baseUrl` onto the endpoint, build the Basic header, `fetch`,
 * then branch on `res.ok`. The copies had drifted — only the stats path had the
 * 5-minute response cache, and *neither* passed a timeout, so a WakaTime socket
 * that accepted the connection and then went quiet held a `/wakatime` render
 * open until the platform gave up on it. This module is the single
 * implementation of all five steps, plus the cache, plus the failure ladder.
 *
 * Every call site degrades: a missing key, a non-OK status, a timeout, a
 * dropped connection and an unreadable body all resolve to a failed
 * {@link WakaTimeResult} and a log line, never a rejection. Route loaders wrap
 * these in `Promise.allSettled` and read `[]` / `EMPTY_WAKATIME_OVERVIEW` off
 * the result, so a WakaTime outage renders an empty dashboard instead of an
 * error page.
 *
 * ## Why `apps/api` is not folded in
 *
 * `apps/api/src/lib/insights.ts` is a third copy of this transport, and it is
 * deliberately left there. It is a Cloudflare Worker: the key arrives as
 * `env.WAKATIME_API_KEY` (a binding) rather than `process.env`, the base64
 * encoder is the Worker-global `btoa` rather than `Buffer`, the module graph is
 * ESM with fully-specified `./x.js` specifiers rather than `@/` aliases, and the
 * app does not depend on `@duyet/config` at all — it hardcodes the stats URL
 * and the trend range. Sharing one implementation would mean a platform-neutral
 * module in `packages/` with an injected key and an injected base URL, which is
 * a wider refactor than this duplication is worth, and this app is a Vite
 * bundle that must not acquire a Worker-shaped concern to save one module.
 *
 * The Worker copy is not missing what the two copies here were missing: it
 * already sends `AbortSignal.timeout(FETCH_TIMEOUT_MS)`, and its trend request
 * is already `.catch`-guarded so it cannot discard the stats it just fetched.
 * Nothing about the bug this module fixes applies to it, and consolidating it
 * is its own piece of work rather than a drive-by from this lane.
 *
 * The same reasoning is why `apps/data-sync` keeps its own transport
 * (`src/lib/wakatime.ts`): it authenticates with `?api_key=` instead of a
 * header and syncs under `tsx` rather than Vite. That file is the precedent
 * this one follows — same per-style error ladder, extracted there first — so the
 * two are deliberately parallel and deliberately separate.
 *
 * @module app/wakatime/lib/transport
 */

import { wakatimeConfig } from "@duyet/config";

/**
 * Per-request ceiling on a single WakaTime call.
 *
 * There is no shared constant to import, so this is the value the repo already
 * uses for outbound provider fetches: `apps/api` uses `10_000` for WakaTime,
 * PostHog and Cloudflare, and `apps/api/src/lib/clickhouse.ts` uses `10_000`
 * for ClickHouse. Long enough for a slow `all_time` stats payload, short enough
 * that a blackholed connection becomes an empty dashboard in ten seconds
 * instead of an unbounded wait.
 *
 * This is a real behaviour change. A call that used to hang forever now fails
 * after this long, and a timeout takes exactly the path a 500 already took: the
 * route loaders turn each fetcher into an empty slice rather than an error, so
 * `/wakatime` renders with zeroed metrics, no chart series and no breakdown
 * rows, and the timeout itself is visible only in the server log. The hybrid
 * path's `.catch -> []`, which is what keeps a dashboard rendering, is
 * preserved by construction — the transport never rejects, so an empty array is
 * what a timeout produces.
 */
export const WAKA_FETCH_TIMEOUT_MS = 10_000;

/**
 * How long a parsed response is reused, keyed by full URL.
 *
 * Unchanged from the value the stats path has always used, and now applied to
 * every caller: `/insights/days` is requested by `getActivityFromInsights`, by
 * `getMonthlyTotals` and by the hybrid fetch's fresh tail, and a single render
 * can ask for the same window through more than one of them. Only successful
 * JSON is cached — a failure is retried on the next render.
 */
export const WAKA_CACHE_TTL_MS = 5 * 60 * 1000;

const TIMEOUT_MESSAGE = `WakaTime API request timed out after ${WAKA_FETCH_TIMEOUT_MS}ms`;

/** Everything a non-OK response can be classified from. */
export interface WakaTimeHttpError {
  status: number;
  statusText: string;
  url: string;
}

/**
 * How a call site talks about WakaTime failures.
 *
 * The wording is deliberately per-style rather than unified: two callers that
 * reach the same endpoint with different failure vocabularies must keep them,
 * or the log stops saying which path broke. Every log line is
 * `` `${prefix}${wording}` `` followed by the URL, so the style only carries
 * the vocabulary and this module owns the mechanism.
 */
export interface WakaTimeErrorStyle {
  /** Log prefix identifying the call site, e.g. `"[WakaTime Hybrid] "`. */
  prefix?: string;
  /** Wording for "the API key is not configured". */
  missingKey: string;
  /** Wording for a dropped connection or a body that never arrives. */
  transport: string;
  /** Wording per HTTP status. A status absent here falls through to `fallback`. */
  messages: Readonly<Record<number, string | undefined>>;
  /** Wording for a status with no dedicated message. */
  fallback: (error: WakaTimeHttpError) => string;
}

const withStatusText = (error: WakaTimeHttpError): string =>
  `WakaTime API error: ${error.status} ${error.statusText}`;

/**
 * The stats and insights vocabulary: the dashboard's default wording.
 *
 * 429 was missing here and is the one case this consolidation fixes. WakaTime
 * rate-limits per API key, and 429 used to be logged as a bare
 * `WakaTime API error: 429 Too Many Requests`, which reads like a provider bug.
 * `apps/data-sync` has classified 429 as its own case since its own transport
 * was extracted, and its `wakatime`, `wakatime-projects` and `wakatime-goals`
 * syncers each special-cased it, so this app was the odd one out.
 */
export const WAKA_TIME_STATS_STYLE: WakaTimeErrorStyle = {
  messages: {
    401: "WakaTime API authentication failed: Invalid or expired API key",
    403: "WakaTime API access forbidden - check permissions",
    429: "WakaTime API rate limit exceeded",
  },
  missingKey: "WAKATIME_API_KEY not found in environment variables",
  transport: "WakaTime API request failed:",
  fallback: withStatusText,
};

/**
 * The hybrid fetch's vocabulary, kept distinct on purpose: every line it has
 * always emitted is prefixed `[WakaTime Hybrid]`, and its messages drop
 * `statusText` so they stay short enough to read in a per-render log.
 *
 * 401 and 429 are the additions — the hybrid path used to log every non-OK
 * response as `[WakaTime Hybrid] API error: 401`, which cannot be told apart
 * from a provider fault. This is the shorter 401 form `apps/data-sync` uses for
 * its activity-style requests, and it deliberately has no 403 entry so 403 keeps
 * surfacing as the generic message.
 */
export const WAKA_TIME_HYBRID_STYLE: WakaTimeErrorStyle = {
  ...WAKA_TIME_STATS_STYLE,
  fallback: (error) => `API error: ${error.status}`,
  messages: {
    401: "API authentication failed",
    429: "API rate limit exceeded",
  },
  missingKey: "WAKATIME_API_KEY not set",
  prefix: "[WakaTime Hybrid] ",
  transport: "API fetch failed:",
};

/** Why a WakaTime request produced no data. */
export type WakaTimeFailure =
  | "no-api-key"
  | "http"
  | "timeout"
  | "network"
  | "invalid-body";

export type WakaTimeResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: WakaTimeFailure; status?: number };

export interface WakaTimeRequestOptions {
  /** Failure vocabulary. Default: {@link WAKA_TIME_STATS_STYLE}. */
  style?: WakaTimeErrorStyle;
  /**
   * Take over the log line for a non-OK response, for call sites that classify
   * statuses as control flow rather than as errors — the durations sweep treats
   * 402/401/403 as "premium account required" and reports them as one warning
   * instead of one error per day. The transport still returns the failure.
   */
  onHttpError?: (error: WakaTimeHttpError, message: string) => void;
}

/**
 * Parsed responses, keyed by full URL. Successful bodies only: caching a
 * failure would turn a five-minute WakaTime blip into a five-minute outage, and
 * caching an unreadable body would hand the same breakage to every caller.
 */
const responseCache = new Map<string, { data: unknown; expiry: number }>();

/**
 * The configured API key, or `null` after warning once per call. Every request
 * site needs the same "no key configured" guard, and each one bails out
 * differently, so only the lookup is shared.
 */
export function wakaTimeApiKey(
  style: WakaTimeErrorStyle = WAKA_TIME_STATS_STYLE
): string | null {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) {
    console.warn(`${style.prefix ?? ""}${style.missingKey}`);
    return null;
  }
  return apiKey;
}

/** Basic-auth header for the WakaTime API. */
function authHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
  };
}

/**
 * The one WakaTime request. Never throws and never rejects; a failure is a
 * `reason` on the result plus a log line, so an outage is visible in the logs
 * and invisible in the UI.
 */
export async function wakaTimeFetch<T>(
  endpoint: string,
  options: WakaTimeRequestOptions = {}
): Promise<WakaTimeResult<T>> {
  const style = options.style ?? WAKA_TIME_STATS_STYLE;
  const prefix = style.prefix ?? "";

  const apiKey = wakaTimeApiKey(style);
  if (!apiKey) {
    return { ok: false, reason: "no-api-key" };
  }

  const url = `${wakatimeConfig.baseUrl}${endpoint}`;

  const cached = responseCache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return { ok: true, data: cached.data as T };
  }

  // An AbortController rather than `AbortSignal.timeout` so the timer is ours:
  // it keeps running while the body is read (a response that arrives with a
  // stalled stream is the same failure as one that never arrives), it lets a
  // timeout be told apart from a dropped connection, and it is driven by fake
  // timers in the tests instead of a real ten-second wait.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WAKA_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: authHeaders(apiKey),
      signal: controller.signal,
    });

    if (!res.ok) {
      const error: WakaTimeHttpError = {
        status: res.status,
        statusText: res.statusText,
        url,
      };
      const message = style.messages[res.status] ?? style.fallback(error);

      if (options.onHttpError) {
        options.onHttpError(error, message);
      } else {
        console.error(`${prefix}${message}`, `URL: ${url}`);
      }

      return { ok: false, reason: "http", status: res.status };
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      console.error(
        `${prefix}WakaTime API returned a body that is not JSON`,
        `URL: ${url}`
      );
      return { ok: false, reason: "invalid-body" };
    }

    if (!data || typeof data !== "object") {
      console.error(
        `${prefix}WakaTime API returned invalid response format`,
        `URL: ${url}`
      );
      return { ok: false, reason: "invalid-body" };
    }

    responseCache.set(url, { data, expiry: Date.now() + WAKA_CACHE_TTL_MS });

    return { ok: true, data: data as T };
  } catch (error) {
    // Only this timer ever aborts, so an aborted signal *is* a timeout.
    const timedOut = controller.signal.aborted;
    console.error(
      `${prefix}${timedOut ? TIMEOUT_MESSAGE : style.transport}`,
      `URL: ${url}`,
      error
    );
    return { ok: false, reason: timedOut ? "timeout" : "network" };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * {@link wakaTimeFetch} for the call sites that just want the payload. The
 * `data | null` shape is what every consumer already handled, so a failure is
 * a `null` and the caller's existing empty-state branch runs.
 */
export async function wakaTimeJson<T>(
  endpoint: string,
  options: WakaTimeRequestOptions = {}
): Promise<T | null> {
  const result = await wakaTimeFetch<T>(endpoint, options);
  return result.ok ? result.data : null;
}

