import { afterEach, describe, expect, test, vi } from "vitest";
import { pingClickHouse } from "../data-fetchers";

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
