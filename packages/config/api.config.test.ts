import { expect, test } from "bun:test";
import {
  apiConfig,
  calculateBackoffDelay,
  getWakaTimeRange,
} from "./src/api.config";

test("calculateBackoffDelay() calculates exponential backoff", () => {
  const delay1 = calculateBackoffDelay(0);
  expect(delay1).toBe(1000);

  const delay2 = calculateBackoffDelay(1);
  expect(delay2).toBe(2000);

  const delay3 = calculateBackoffDelay(2);
  expect(delay3).toBe(4000);
});

test("calculateBackoffDelay() uses custom config", () => {
  const customConfig = {
    maxRetries: 5,
    backoffMultiplier: 3,
    initialDelayMs: 500,
  };

  const delay1 = calculateBackoffDelay(0, customConfig);
  expect(delay1).toBe(500);

  const delay2 = calculateBackoffDelay(1, customConfig);
  expect(delay2).toBe(1500);

  const delay3 = calculateBackoffDelay(2, customConfig);
  expect(delay3).toBe(4500);
});

test("getWakaTimeRange() returns range for number of days", () => {
  const range7 = getWakaTimeRange(7);
  expect(range7).toBe("last_7_days");

  const range30 = getWakaTimeRange(30);
  expect(range30).toBe("last_30_days");

  const range90 = getWakaTimeRange(90);
  expect(range90).toBe("last_6_months");

  const range365 = getWakaTimeRange(365);
  expect(range365).toBe("last_year");
});

test("getWakaTimeRange() returns last_year for undefined days", () => {
  const range = getWakaTimeRange(undefined as any);
  expect(range).toBe("last_year");
});

test("getWakaTimeRange() returns last_30_days for unknown days", () => {
  const range = getWakaTimeRange(9999);
  expect(range).toBe("last_30_days");
});

test("getWakaTimeRange() returns last_year for 'all' string", () => {
  const range = getWakaTimeRange("all");
  expect(range).toBe("last_year");
});

test("apiConfig has correct GitHub configuration", () => {
  const github = apiConfig.github;
  expect(github.baseUrl).toBe("https://api.github.com");
  expect(github.version).toBe("v3");
  expect(github.endpoints.searchRepositories).toBe("/search/repositories");
  expect(github.headers.accept).toBe("application/vnd.github.v3+json");
  expect(github.headers.userAgent).toBe("insights-app");
  expect(github.pagination.perPage).toBe(100);
  expect(github.pagination.maxPages).toBe(10);
});

test("apiConfig has correct WakaTime configuration", () => {
  const wakatime = apiConfig.wakatime;
  expect(wakatime.baseUrl).toBe("https://wakatime.com/api/v1");
  expect(wakatime.dataStartYear).toBe(2025);
  expect(wakatime.topLanguagesLimit).toBe(8);
  expect(wakatime.ranges.last_7_days).toBe("last_7_days");
  expect(wakatime.ranges.last_30_days).toBe("last_30_days");
  expect(wakatime.ranges.last_6_months).toBe("last_6_months");
  expect(wakatime.ranges.last_year).toBe("last_year");
  expect(wakatime.ranges.all_time).toBe("all_time");
});

test("apiConfig has correct PostHog configuration", () => {
  const posthog = apiConfig.posthog;
  expect(posthog.baseUrl).toBe("https://app.posthog.com/api");
  expect(posthog.cache.revalidate).toBe(3600);
  expect(posthog.cache.tags).toEqual(["posthog"]);
});

test("apiConfig has correct Cloudflare configuration", () => {
  const cloudflare = apiConfig.cloudflare;
  expect(cloudflare.baseUrl).toBe("https://api.cloudflare.com/client/v4");
  expect(cloudflare.endpoints.zones).toBe("/zones");
  expect(cloudflare.endpoints.analytics("zone123")).toBe(
    "/zones/zone123/analytics/dashboard"
  );
});

test("apiConfig has correct ClickHouse configuration", () => {
  const clickhouse = apiConfig.clickhouse;
  expect(clickhouse.defaultPort.http).toBe(8123);
  expect(clickhouse.defaultPort.https).toBe(443);
  expect(clickhouse.defaultProtocol).toBe("https");
  expect(clickhouse.timeout.request).toBe(60000);
  expect(clickhouse.timeout.execution).toBe(60);
  expect(clickhouse.limits.maxResultRows).toBe("10000");
  expect(clickhouse.limits.maxMemoryUsage).toBe("1G");
});

test("apiConfig has correct default configurations", () => {
  expect(apiConfig.defaults.cache.revalidate).toBe(3600);
  expect(apiConfig.defaults.retry.maxRetries).toBe(3);
  expect(apiConfig.defaults.retry.backoffMultiplier).toBe(2);
  expect(apiConfig.defaults.retry.initialDelayMs).toBe(1000);
});
