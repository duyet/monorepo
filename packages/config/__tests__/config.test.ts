import { describe, expect, test } from "vitest";
import {
  apiConfig,
  calculateBackoffDelay,
  getPeriodDays,
  getWakaTimeRange,
  getWakaTimeRangeForElapsedDays,
  githubConfig,
  homelabConfig,
  ogHeadLinks,
  ogMetaFromConfig,
  PERIODS,
  uiConfig,
  wakatimeConfig,
} from "../src";

describe("@duyet/config", () => {
  describe("App Configuration", () => {
    /**
     * This block previously asserted on `appConfig`, `blogConfig`,
     * `insightsConfig` and `appConfig.urls` — four values with **zero
     * consumers**. `@duyet/config/app` had no importers at all, and of the
     * eleven exported values only `homelabConfig` had a consumer
     * (`apps/homelab/src/routes/__root.tsx`, and only its `.metadata`).
     *
     * The tests passed the whole time, which is the problem: they pinned
     * config that nothing read, so they could never fail for a reason anyone
     * cared about, and they made the file look load-bearing.
     *
     * What replaces them tests the invariant that actually matters — that
     * whatever this package exports is read by someone — rather than
     * re-asserting the contents of a value. The reachability check is
     * mechanical and lives in `scripts/app-registry-coverage.test.ts`'s
     * spirit; here it is a smaller, local version that reads the repo.
     */

    test("exports metadata an app can actually consume through ogMetaFromConfig", () => {
      // The opt-in path is `ogMetaFromConfig`, so anything left in
      // `app.config.ts` has to survive that round trip. `ogHeadLinks` is the
      // other half — `apps/homelab` uses both.
      const meta = ogMetaFromConfig(homelabConfig.metadata);

      const prop = (key: string) =>
        meta.find((tag) => tag.property === key)?.content;
      const named = (key: string) =>
        meta.find((tag) => tag.name === key)?.content;

      expect(prop("og:url")).toBe("https://homelab.duyet.net");
      expect(prop("og:title")).toBe("Homelab Dashboard | duyet.net");
      expect(prop("og:image")).toBe("https://homelab.duyet.net/og.png");
      expect(prop("og:locale")).toBe("en_US");
      expect(named("twitter:card")).toBe("summary_large_image");
      expect(named("twitter:creator")).toBe("@_duyet");

      expect(
        ogHeadLinks(homelabConfig.metadata).map((link) => link.rel),
      ).toContain("manifest");
    });

    test("does not export any value that no app reads", () => {
      // The check that would have caught the original problem. Reads the repo
      // and fails if a name exported from `app.config.ts` has no consumer
      // outside this package's own barrel and tests.
      const { readFileSync, readdirSync, statSync } = require("node:fs") as
        typeof import("node:fs");
      const { join } = require("node:path") as typeof import("node:path");
      const { fileURLToPath } = require("node:url") as typeof import("node:url");

      const pkgDir = fileURLToPath(new URL("..", import.meta.url));
      const repoRoot = join(pkgDir, "..", "..");

      // Handles both shapes: `export const x`, `export interface x`,
      // `export type x`, and a trailing `export { a, b }` re-export list.
      const source = readFileSync(join(pkgDir, "src/app.config.ts"), "utf8");
      const declared = [
        ...source.matchAll(
          /^export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/gm,
        ),
      ].map((m) => m[1]);
      const reexported = [...source.matchAll(/^export\s*\{([^}]*)\}/gm)].flatMap(
        (m) =>
          m[1]
            .split(",")
            .map((part) => part.trim().split(/\s+as\s+/).pop() ?? "")
            .filter(Boolean),
      );
      const exported = [...new Set([...declared, ...reexported])];

      const sourceFiles: string[] = [];
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          if (entry === "node_modules" || entry === "dist" || entry === ".turbo") {
            continue;
          }
          const full = join(dir, entry);
          if (statSync(full).isDirectory()) {
            walk(full);
          } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.ts$/.test(entry)) {
            sourceFiles.push(full);
          }
        }
      };
      walk(join(repoRoot, "apps"));
      walk(join(repoRoot, "packages"));

      const orphaned = exported.filter(
        (name) =>
          !sourceFiles.some(
            (file) =>
              file !== join(pkgDir, "src/app.config.ts") &&
              new RegExp(`\\b${name}\\b`).test(readFileSync(file, "utf8")),
          ),
      );

      expect(orphaned).toEqual([]);
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
      });

      /**
       * `"all"` is the unbounded window, and it is *not* the same as `365`.
       *
       * `PERIODS` (the period switcher both in this package and in
       * `apps/insights/lib/periods.ts`) offers `365` and `"all"` as two
       * separate options. If they resolved to the same range the switcher would
       * be offering the same data twice under two labels, so `"all"` must be
       * `all_time` — the value WakaTime documents for both `/stats/{range}` and
       * `/insights?range=`.
       *
       * This assertion is the regression guard for the shipped bug: the stats
       * path used to send `last_year` here while the insights path sent
       * `all_time` for the same selection.
       */
      test('maps "all" to the unbounded all_time, not to last_year', () => {
        expect(getWakaTimeRange("all")).toBe("all_time");
        expect(getWakaTimeRange("all")).not.toBe(getWakaTimeRange(365));
      });

      /**
       * The switcher and this mapping must stay in step, or a visible option
       * silently falls through to the `last_30_days` default.
       */
      test("resolves every day value the period switcher offers", () => {
        // No fall-through: a day value with no `rangeMapping` entry would be
        // served the `last_30_days` default and quietly show the wrong window.
        for (const period of PERIODS) {
          expect(wakatimeConfig.rangeMapping[period.days]).toBeDefined();
        }
      });

      test("should fallback to last_30_days for unknown values", () => {
        expect(getWakaTimeRange(999)).toBe("last_30_days");
      });
    });

    describe("getWakaTimeRangeForElapsedDays", () => {
      test("rounds up to the smallest range that covers the day count", () => {
        expect(getWakaTimeRangeForElapsedDays(0)).toBe("last_7_days");
        expect(getWakaTimeRangeForElapsedDays(7)).toBe("last_7_days");
        expect(getWakaTimeRangeForElapsedDays(8)).toBe("last_30_days");
        expect(getWakaTimeRangeForElapsedDays(30)).toBe("last_30_days");
        expect(getWakaTimeRangeForElapsedDays(31)).toBe("last_6_months");
        expect(getWakaTimeRangeForElapsedDays(180)).toBe("last_6_months");
        expect(getWakaTimeRangeForElapsedDays(181)).toBe("last_year");
        expect(getWakaTimeRangeForElapsedDays(365)).toBe("last_year");
        expect(getWakaTimeRangeForElapsedDays(366)).toBe("all_time");
        expect(getWakaTimeRangeForElapsedDays(10_000)).toBe("all_time");
      });

      test("never resolves to a shorter window than the day count asks for", () => {
        // The reason this is a separate function: under-covering a backfill
        // silently drops rows, so every ladder step has to round up.
        const cover: Record<string, number> = {
          last_7_days: 7,
          last_30_days: 30,
          last_6_months: 180,
          last_year: 365,
        };
        for (const days of [1, 7, 8, 30, 31, 90, 180, 181, 365, 366, 5000]) {
          const range = getWakaTimeRangeForElapsedDays(days);
          expect(cover[range] ?? Infinity).toBeGreaterThanOrEqual(days);
        }
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
