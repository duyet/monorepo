import { getWakaTimeRangeForElapsedDays } from "@duyet/config/api";
import { describe, expect, test, vi } from "vitest";
import {
  fetchWakaTimeJson,
  WAKA_TIME_ACTIVITY_STYLE,
  WAKA_TIME_DEFAULT_STYLE,
  WAKA_TIME_INSIGHT_RANGES,
  WAKA_TIME_INSIGHTS_STYLE,
  wakaTimeApiError,
  wakaTimeApiUrl,
} from "../wakatime";

/**
 * The WakaTime transport was duplicated across six syncers. These tests pin the
 * shared implementations to the exact URLs and error strings the individual
 * syncers produced before, so the deduplication cannot change which API is
 * called or how a failure is reported.
 */

const WAKATIME_BASE_URL = "https://wakatime.com/api/v1";

/** Mirrors `BaseSyncer.isRetryable`, which decides retry counts by message. */
const RETRYABLE_PATTERNS = [
  /timeout/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
  /429/,
  /503/,
  /rate limit/i,
  /temporarily unavailable/i,
];

function response(status: number, statusText = ""): Response {
  return { ok: false, status, statusText } as Response;
}

describe("wakaTimeApiUrl", () => {
  test("matches the inline template for paths without a query", () => {
    expect(wakaTimeApiUrl("/users/current/projects", "key-123")).toBe(
      `${WAKATIME_BASE_URL}/users/current/projects?api_key=key-123`
    );
    expect(wakaTimeApiUrl("/users/current/goals", "key-123")).toBe(
      `${WAKATIME_BASE_URL}/users/current/goals?api_key=key-123`
    );
  });

  test("matches the inline template for per-range insight paths", () => {
    for (const range of WAKA_TIME_INSIGHT_RANGES) {
      expect(
        wakaTimeApiUrl(`/users/current/insights/best_day/${range}`, "k")
      ).toBe(
        `${WAKATIME_BASE_URL}/users/current/insights/best_day/${range}?api_key=k`
      );
      expect(
        wakaTimeApiUrl(`/users/current/insights/weekday/${range}`, "k")
      ).toBe(
        `${WAKATIME_BASE_URL}/users/current/insights/weekday/${range}?api_key=k`
      );
    }
  });

  test("appends with & when the path already carries a query string", () => {
    expect(
      wakaTimeApiUrl("/users/current/insights/days?range=last_7_days", "k")
    ).toBe(
      `${WAKATIME_BASE_URL}/users/current/insights/days?range=last_7_days&api_key=k`
    );
    expect(
      wakaTimeApiUrl("/users/current/durations?date=2026-05-25", "k")
    ).toBe(
      `${WAKATIME_BASE_URL}/users/current/durations?date=2026-05-25&api_key=k`
    );
  });
});

describe("getWakaTimeRangeForElapsedDays, as the backfill syncers call it", () => {
  // The ladder itself now lives in `@duyet/config`; what matters here is that
  // moving it there did not shift a single threshold the syncers depended on.
  test("preserves the threshold ladder shared by wakatime and wakatime-activity", () => {
    expect(getWakaTimeRangeForElapsedDays(0)).toBe("last_7_days");
    expect(getWakaTimeRangeForElapsedDays(7)).toBe("last_7_days");
    expect(getWakaTimeRangeForElapsedDays(8)).toBe("last_30_days");
    expect(getWakaTimeRangeForElapsedDays(30)).toBe("last_30_days");
    expect(getWakaTimeRangeForElapsedDays(31)).toBe("last_6_months");
    expect(getWakaTimeRangeForElapsedDays(180)).toBe("last_6_months");
    expect(getWakaTimeRangeForElapsedDays(181)).toBe("last_year");
    expect(getWakaTimeRangeForElapsedDays(365)).toBe("last_year");
    expect(getWakaTimeRangeForElapsedDays(366)).toBe("all_time");
    expect(getWakaTimeRangeForElapsedDays(10000)).toBe("all_time");
  });
});

describe("wakaTimeApiError", () => {
  test("default style keeps the 401/403/429 wording of the stats syncers", () => {
    expect(wakaTimeApiError(response(401)).message).toBe(
      "WakaTime API authentication failed: Invalid or expired API key"
    );
    expect(wakaTimeApiError(response(403)).message).toBe(
      "WakaTime API access forbidden - check permissions"
    );
    expect(wakaTimeApiError(response(429)).message).toBe(
      "WakaTime API rate limit exceeded"
    );
    expect(wakaTimeApiError(response(500, "Server Error")).message).toBe(
      "WakaTime API error: 500 Server Error"
    );
  });

  test("insights style has no 403 branch, so 403 stays generic", () => {
    expect(
      wakaTimeApiError(response(401), WAKA_TIME_INSIGHTS_STYLE).message
    ).toBe("WakaTime API authentication failed: Invalid or expired API key");
    expect(
      wakaTimeApiError(response(403, "Forbidden"), WAKA_TIME_INSIGHTS_STYLE)
        .message
    ).toBe("WakaTime API error: 403 Forbidden");
    expect(
      wakaTimeApiError(response(429), WAKA_TIME_INSIGHTS_STYLE).message
    ).toBe("WakaTime API rate limit exceeded");
  });

  test("activity style keeps its shorter wording and omits statusText", () => {
    expect(
      wakaTimeApiError(response(401), WAKA_TIME_ACTIVITY_STYLE).message
    ).toBe("WakaTime API authentication failed");
    expect(
      wakaTimeApiError(response(429), WAKA_TIME_ACTIVITY_STYLE).message
    ).toBe("WakaTime API rate limit exceeded");
    expect(
      wakaTimeApiError(response(500, "Server Error"), WAKA_TIME_ACTIVITY_STYLE)
        .message
    ).toBe("WakaTime API error: 500");
  });

  test("401/403 stay non-retryable so withRetry fails fast, as before", () => {
    // BaseSyncer.isRetryable matches on the message text. Pin the exact
    // retryability of each status so a wording change here cannot silently
    // multiply or remove API calls.
    const retryable = (message: string) =>
      RETRYABLE_PATTERNS.some((p) => p.test(message));

    for (const style of [
      WAKA_TIME_DEFAULT_STYLE,
      WAKA_TIME_INSIGHTS_STYLE,
      WAKA_TIME_ACTIVITY_STYLE,
    ]) {
      expect(retryable(wakaTimeApiError(response(401), style).message)).toBe(
        false
      );
      expect(retryable(wakaTimeApiError(response(403), style).message)).toBe(
        false
      );
    }
  });

  test("429 stays retryable via the /rate limit/i pattern, as before", () => {
    // Worth pinning explicitly: the dedicated 429 wording contains
    // "rate limit", which BaseSyncer treats as retryable, so a 429 is retried
    // with backoff. A "nicer" message without that phrase would change the
    // request count against the API.
    for (const style of [
      WAKA_TIME_DEFAULT_STYLE,
      WAKA_TIME_INSIGHTS_STYLE,
      WAKA_TIME_ACTIVITY_STYLE,
    ]) {
      const message = wakaTimeApiError(response(429), style).message;
      expect(message).toBe("WakaTime API rate limit exceeded");
      expect(RETRYABLE_PATTERNS.some((p) => p.test(message))).toBe(true);
    }
  });
});

describe("fetchWakaTimeJson", () => {
  test("sends the data-sync User-Agent and parses JSON on success", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { ok: true } }),
    } as Response);

    const result = await fetchWakaTimeJson<{ data: { ok: boolean } }>(
      "https://example.test/x"
    );

    expect(result).toEqual({ data: { ok: true } });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://example.test/x");
    expect((init as RequestInit).headers).toEqual({
      "User-Agent": "data-sync-app",
    });

    fetchSpy.mockRestore();
  });

  test("throws the styled error without parsing the body on non-OK", async () => {
    const json = vi.fn();
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json,
    } as unknown as Response);

    await expect(fetchWakaTimeJson("https://example.test/x")).rejects.toThrow(
      "WakaTime API authentication failed: Invalid or expired API key"
    );
    expect(json).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
