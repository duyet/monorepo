import { afterEach, beforeEach, describe, expect, vi, test } from "vitest";
import { WakaTimeInsightsBestDaySyncer } from "../wakatime-insights-best-day.syncer";
import {
  createMockClickHouseClient,
  expectSyncFailsWithoutWriting,
  type MockClickHouseClient,
} from "./test-fixtures";

describe("WakaTimeInsightsBestDaySyncer", () => {
  let mockClient: MockClickHouseClient;

  beforeEach(() => {
    mockClient = createMockClickHouseClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should create syncer instance", () => {
    const syncer = new WakaTimeInsightsBestDaySyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be WakaTimeInsightsBestDaySyncer instance", () => {
    const syncer = new WakaTimeInsightsBestDaySyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeInsightsBestDaySyncer);
  });

  test("should fail the sync without writing when WAKATIME_API_KEY is missing", async () => {
    await expectSyncFailsWithoutWriting({
      syncer: new WakaTimeInsightsBestDaySyncer(mockClient),
      client: mockClient,
      missingEnvVars: ["WAKATIME_API_KEY"],
      errorMentions: "WAKATIME_API_KEY",
    });
  });

  test("should transform best day data into records correctly", async () => {
    const syncer = new WakaTimeInsightsBestDaySyncer(mockClient);

    const mockData = [
      {
        range: "last_7_days" as const,
        date: "2026-05-20",
        total_seconds: 28800,
      },
      {
        range: "last_year" as const,
        date: "2025-12-01",
        total_seconds: 43200.7,
      },
    ];

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockData) => Promise<unknown[]>;
      }
    ).transform(mockData);

    expect(records).toHaveLength(2);

    const first = records[0] as Record<string, unknown>;
    expect(first.range).toBe("last_7_days");
    expect(first.date).toBe("2026-05-20");
    expect(first.total_seconds).toBe(28800);

    const second = records[1] as Record<string, unknown>;
    expect(second.range).toBe("last_year");
    // Float seconds should be rounded
    expect(second.total_seconds).toBe(43201);
  });

  test("should fetch all four ranges and produce one record per range", async () => {
    vi.stubEnv("WAKATIME_API_KEY", "test-key-best-day");

    const syncer = new WakaTimeInsightsBestDaySyncer(mockClient);

    const makeMockResponse = (date: string, seconds: number) => ({
      ok: true,
      json: () => Promise.resolve({ data: { date, total_seconds: seconds } }),
    });

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(makeMockResponse("2026-05-24", 10000) as Response)
      .mockResolvedValueOnce(makeMockResponse("2026-04-15", 20000) as Response)
      .mockResolvedValueOnce(makeMockResponse("2025-09-10", 30000) as Response)
      .mockResolvedValueOnce(makeMockResponse("2022-11-22", 50000) as Response);

    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(true);
    // One record per range (4 ranges)
    expect(result.recordsProcessed).toBe(4);
    expect(fetchSpy.mock.calls).toHaveLength(4);

    const urls = fetchSpy.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u.includes("last_7_days"))).toBe(true);
    expect(urls.some((u) => u.includes("last_30_days"))).toBe(true);
    expect(urls.some((u) => u.includes("last_year"))).toBe(true);
    expect(urls.some((u) => u.includes("all_time"))).toBe(true);

    fetchSpy.mockRestore();
  });
});
