import { describe, test, expect } from "bun:test";
import {
  appConfig,
  blogConfig,
  insightsConfig,
  apiConfig,
  githubConfig,
  wakatimeConfig,
  uiConfig,
  PERIODS,
  getPeriodDays,
  getWakaTimeRange,
  calculateBackoffDelay,
} from "../src";

describe("@duyet/config", () => {
  describe("App Configuration", () => {
    test("should export all app configs", () => {
      expect(appConfig).toBeDefined();
      expect(appConfig.urls).toBeDefined();
      expect(appConfig.blog).toBeDefined();
      expect(appConfig.insights).toBeDefined();
    });

    test("should have valid blog configuration", () => {
      expect(blogConfig.metadata.title).toBe("Tôi là Duyệt");
      expect(blogConfig.metadata.lang).toBe("en");
      expect(blogConfig.fonts.inter.variable).toBe("--font-inter");
      expect(blogConfig.fontFamily).toContain("var(--font-inter)");
    });

    test("should have valid insights configuration", () => {
      expect(insightsConfig.metadata.title).toBe("Insights | duyet.net");
      expect(insightsConfig.header.longText).toBe("Insights");
    });

    test("should have valid app URLs", () => {
      expect(appConfig.urls.blog).toBeTruthy();
      expect(appConfig.urls.insights).toBeTruthy();
      expect(appConfig.urls.cv).toBeTruthy();
    });
  });

  describe("API Configuration", () => {
    test("should export all API configs", () => {
      expect(apiConfig).toBeDefined();
      expect(apiConfig.github).toBeDefined();
      expect(apiConfig.wakatime).toBeDefined();
      expect(apiConfig.posthog).toBeDefined();
    });

    test("should have valid GitHub configuration", () => {
      expect(githubConfig.baseUrl).toBe("https://api.github.com");
      expect(githubConfig.pagination.perPage).toBe(100);
      expect(githubConfig.pagination.maxPages).toBe(10);
      expect(githubConfig.retry.maxRetries).toBe(3);
    });

    test("should have valid WakaTime configuration", () => {
      expect(wakatimeConfig.baseUrl).toBe("https://wakatime.com/api/v1");
      expect(wakatimeConfig.topLanguagesLimit).toBe(8);
      expect(wakatimeConfig.dataStartYear).toBe(2025);
    });

    test("should have valid cache configuration", () => {
      expect(githubConfig.cache.revalidate).toBe(3600);
      expect(wakatimeConfig.cache.revalidate).toBe(3600);
    });
  });

  describe("UI Configuration", () => {
    test("should export all UI configs", () => {
      expect(uiConfig).toBeDefined();
      expect(uiConfig.periods).toBeDefined();
      expect(uiConfig.theme).toBeDefined();
      expect(uiConfig.navigation).toBeDefined();
    });

    test("should have valid period configuration", () => {
      expect(PERIODS).toHaveLength(4);
      expect(PERIODS[0].value).toBe("7");
      expect(PERIODS[1].value).toBe("30");
      expect(PERIODS[2].value).toBe("365");
      expect(PERIODS[3].value).toBe("all");
    });

    test("should have period helper functions", () => {
      expect(getPeriodDays("30")).toBe(30);
      expect(getPeriodDays("all")).toBe("all");
    });
  });

  describe("Helper Functions", () => {
    describe("getWakaTimeRange", () => {
      test("should map days to WakaTime ranges", () => {
        expect(getWakaTimeRange(7)).toBe("last_7_days");
        expect(getWakaTimeRange(30)).toBe("last_30_days");
        expect(getWakaTimeRange(90)).toBe("last_6_months");
        expect(getWakaTimeRange(365)).toBe("last_year");
        expect(getWakaTimeRange("all")).toBe("last_year");
      });

      test("should fallback to last_30_days for unknown values", () => {
        expect(getWakaTimeRange(999)).toBe("last_30_days");
      });
    });

    describe("calculateBackoffDelay", () => {
      test("should calculate exponential backoff correctly", () => {
        expect(calculateBackoffDelay(0)).toBe(1000); // 1s
        expect(calculateBackoffDelay(1)).toBe(2000); // 2s
        expect(calculateBackoffDelay(2)).toBe(4000); // 4s
        expect(calculateBackoffDelay(3)).toBe(8000); // 8s
      });

      test("should use custom retry config", () => {
        const config = {
          maxRetries: 3,
          backoffMultiplier: 3,
          initialDelayMs: 500,
        };
        expect(calculateBackoffDelay(0, config)).toBe(500);
        expect(calculateBackoffDelay(1, config)).toBe(1500);
        expect(calculateBackoffDelay(2, config)).toBe(4500);
      });
    });
  });
});
