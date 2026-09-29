import { afterEach, beforeEach, describe, expect, vi, test } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { WakaTimeInsightsWeekdaySyncer } from "../wakatime-insights-weekday.syncer";

describe("WakaTimeInsightsWeekdaySyncer", () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: vi.fn(() => Promise.resolve()),
      query: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should create syncer instance", () => {
    const syncer = new WakaTimeInsightsWeekdaySyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be WakaTimeInsightsWeekdaySyncer instance", () => {
    const syncer = new WakaTimeInsightsWeekdaySyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeInsightsWeekdaySyncer);
  });

  // `BaseSyncer.sync()` never rejects: it catches and reports through
  // SyncResult.errors, so this asserts on the result rather than a throw.
  test("should fail the sync without writing when WAKATIME_API_KEY is missing", async () => {
    vi.stubEnv("WAKATIME_API_KEY", undefined);

    const syncer = new WakaTimeInsightsWeekdaySyncer(mockClient);
    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.message).toContain("WAKATIME_API_KEY");
    expect(result.recordsInserted).toBe(0);
    expect(mockClient.insert).not.toHaveBeenCalled();
  });

  test("should transform weekday data into records correctly", async () => {
    const syncer = new WakaTimeInsightsWeekdaySyncer(mockClient);

    const mockData = [
      {
        range: "last_year" as const,
        weekday: 1,
        name: "Monday",
        total_seconds: 72000.5,
        average_seconds: 7200.2,
      },
      {
        range: "last_year" as const,
        weekday: 6,
        name: "Saturday",
        total_seconds: 14400,
        average_seconds: 1440,
      },
    ];

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockData) => Promise<unknown[]>;
      }
    ).transform(mockData);

    expect(records).toHaveLength(2);

    const monday = records[0] as Record<string, unknown>;
    expect(monday.range).toBe("last_year");
    expect(monday.weekday).toBe(1);
    expect(monday.name).toBe("Monday");
    // Float seconds should be rounded
    expect(monday.total_seconds).toBe(72001);
    expect(monday.average_seconds).toBe(7200);

    const saturday = records[1] as Record<string, unknown>;
    expect(saturday.weekday).toBe(6);
  });

  test("should fetch all four ranges producing 7 weekday records per range", async () => {
    vi.stubEnv("WAKATIME_API_KEY", "test-key-weekday");

    const syncer = new WakaTimeInsightsWeekdaySyncer(mockClient);

    const WEEKDAY_NAMES = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const makeWeekdayPayload = () => ({
      ok: true,
      json: () =>
        Promise.resolve({
          data: WEEKDAY_NAMES.map((name, id) => ({
            id,
            name,
            total: id * 1000,
            average: id * 100,
          })),
        }),
    });

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(makeWeekdayPayload() as Response)
      .mockResolvedValueOnce(makeWeekdayPayload() as Response)
      .mockResolvedValueOnce(makeWeekdayPayload() as Response)
      .mockResolvedValueOnce(makeWeekdayPayload() as Response);

    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(true);
    // 4 ranges × 7 weekdays = 28 records
    expect(result.recordsProcessed).toBe(28);
    expect(fetchSpy.mock.calls).toHaveLength(4);

    const urls = fetchSpy.mock.calls.map((c) => c[0] as string);
    expect(urls.every((u) => u.includes("/insights/weekday/"))).toBe(true);

    fetchSpy.mockRestore();
  });
});
