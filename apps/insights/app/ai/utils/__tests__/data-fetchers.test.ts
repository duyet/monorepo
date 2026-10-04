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
