import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { executeClickHouseQuery } from "../database";
import { executeDuckDBQuery } from "../duckdb-cache";
import {
  checkClickHouseHealth,
  getCCUsageActivity,
  getCCUsageMetrics,
  pingClickHouse,
} from "../data-fetchers";

// The real ClickHouse client stays in place by default so the ping and health
// tests keep exercising it. Only `executeClickHouseQuery` is swapped for a spy
// that delegates to the real implementation until a test overrides it.
vi.mock("../database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../database")>();
  return {
    ...actual,
    executeClickHouseQuery: vi.fn(actual.executeClickHouseQuery),
  };
});

vi.mock("../duckdb-cache", () => ({
  executeDuckDBQuery: vi.fn(),
}));

const clickHouse = vi.mocked(executeClickHouseQuery);
const duckDb = vi.mocked(executeDuckDBQuery);

const ENV_KEYS = [
  "CLICKHOUSE_HOST",
  "CLICKHOUSE_PORT",
  "CLICKHOUSE_USER",
  "CLICKHOUSE_PASSWORD",
  "CLICKHOUSE_DATABASE",
  "CLICKHOUSE_PROTOCOL",
];

describe("pingClickHouse", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("reports failure with the config error when ClickHouse env is missing", async () => {
    // Force the no-config branch: an empty value is treated as missing
    vi.stubEnv("CLICKHOUSE_HOST", "");
    vi.stubEnv("CLICKHOUSE_USER", "");
    vi.stubEnv("CLICKHOUSE_PASSWORD", "");
    vi.stubEnv("CLICKHOUSE_DATABASE", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await pingClickHouse();

    expect(result).toEqual({
      success: false,
      latencyMs: expect.any(Number),
      error:
        "ClickHouse client not available - missing required environment variables",
    });
  });

  test("always resolves with a latencyMs number", async () => {
    vi.stubEnv("CLICKHOUSE_HOST", "");
    vi.stubEnv("CLICKHOUSE_USER", "");
    vi.stubEnv("CLICKHOUSE_PASSWORD", "");
    vi.stubEnv("CLICKHOUSE_DATABASE", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await pingClickHouse();

    expect(typeof result.latencyMs).toBe("number");
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

describe("checkClickHouseHealth", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (const key of ENV_KEYS) delete process.env[key];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    }
  });

  test("resolves false when ClickHouse is not configured", async () => {
    await expect(checkClickHouseHealth()).resolves.toBe(false);
  });

  test("shares one in-flight promise across callers", async () => {
    const first = checkClickHouseHealth();
    const second = checkClickHouseHealth();
    expect(second).toBe(first);
    await expect(first).resolves.toBe(false);
  });
});

describe("getCCUsageMetrics", () => {
  test("maps a small usage fixture to overview metrics", async () => {
    clickHouse
      .mockResolvedValueOnce({
        success: true,
        data: [
          {
            total_tokens: 100,
            cache_tokens: 30,
            total_cost: 1.25,
            active_days: 4,
          },
        ],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ model_name: "claude-sonnet", total_tokens: 80 }],
      });

    const metrics = await getCCUsageMetrics(7);

    expect(metrics).toEqual({
      totalTokens: 100,
      dailyAverage: 25,
      activeDays: 4,
      cacheTokens: 30,
      totalCost: 1.25,
      topModel: "claude-sonnet",
    });
  });
});

describe("getCCUsageActivity", () => {
  const clickHouseRow = {
    date: "2026-01-01",
    "Total Tokens": 1500,
    "Input Tokens": 1000,
    "Output Tokens": 400,
    "Cache Tokens": 100,
    "Total Cost": 0.5,
  };

  test("maps query rows into thousand-token chart data", async () => {
    clickHouse.mockResolvedValue({
      success: true,
      data: [clickHouseRow],
    });
    duckDb.mockResolvedValue([]);

    expect(await getCCUsageActivity(30)).toEqual([
      {
        date: "2026-01-01",
        "Total Tokens": 2,
        "Input Tokens": 1,
        "Output Tokens": 0,
        "Cache Tokens": 0,
        "Total Cost": 0.5,
      },
    ]);
  });

  test("maps DuckDB cache rows when ClickHouse returns nothing", async () => {
    clickHouse.mockResolvedValue({ success: false, data: [] });
    duckDb.mockResolvedValue([clickHouseRow]);

    const result = await getCCUsageActivity(30);
    expect(result[0]?.["Total Tokens"]).toBe(2);
    expect(result[0]?.["Total Cost"]).toBe(0.5);
  });

  test("returns an empty array when both sources are empty", async () => {
    clickHouse.mockResolvedValue({ success: false, data: [] });
    duckDb.mockResolvedValue([]);

    expect(await getCCUsageActivity(30)).toEqual([]);
  });
});

describe("getCCUsageProjects", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("../database", () => ({
      executeClickHouseQuery: vi.fn(async () => ({ success: true, data: [] })),
    }));
    vi.doMock("../duckdb-cache", () => ({
      executeDuckDBQuery: vi.fn(async () => [
        {
          session_id: "s1",
          project_path: "/tmp/app",
          total_tokens: 40,
          total_cost: 1,
          last_activity: "2026-01-02",
        },
      ]),
    }));
  });

  test("anonymizes one cached project row", async () => {
    const { getCCUsageProjects } = await import("../data-fetchers");

    await expect(getCCUsageProjects(7)).resolves.toEqual([
      {
        projectName: "Project A",
        tokens: 40,
        relativeUsage: 100,
        lastActivity: "2026-01-02",
      },
    ]);
  });
});
