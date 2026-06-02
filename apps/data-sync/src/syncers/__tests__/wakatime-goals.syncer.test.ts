import { beforeEach, describe, expect, vi, test } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { WakaTimeGoalsSyncer } from "../wakatime-goals.syncer";

describe("WakaTimeGoalsSyncer", () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: vi.fn(() => Promise.resolve()),
      query: vi.fn(() => Promise.resolve()),
      close: vi.fn(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  test("should create syncer instance", () => {
    const syncer = new WakaTimeGoalsSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be WakaTimeGoalsSyncer instance", () => {
    const syncer = new WakaTimeGoalsSyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeGoalsSyncer);
  });

  test("should throw error when WAKATIME_API_KEY is missing", async () => {
    const originalKey = process.env.WAKATIME_API_KEY;
    process.env.WAKATIME_API_KEY = undefined;

    const syncer = new WakaTimeGoalsSyncer(mockClient);

    try {
      await syncer.sync({ dryRun: true });
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      expect((error as Error).message).toContain("WAKATIME_API_KEY");
    }

    if (originalKey) {
      process.env.WAKATIME_API_KEY = originalKey;
    }
  });

  test("should transform goals into records correctly", async () => {
    const syncer = new WakaTimeGoalsSyncer(mockClient);

    const mockGoal = {
      id: "goal-abc",
      title: "Code 2 hours daily",
      custom_title: "Daily Habit",
      type: "coding_activity",
      seconds: 7200,
      status: "success",
      average_status: "success",
      range_text: "last 30 days",
      snoozed: false,
      modified_at: "2026-05-01T12:00:00Z",
    };

    // Access protected transform via type cast
    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockGoal[]) => Promise<unknown[]>;
      }
    ).transform([mockGoal]);

    expect(records).toHaveLength(1);
    const record = records[0] as Record<string, unknown>;
    expect(record.goal_id).toBe("goal-abc");
    expect(record.title).toBe("Code 2 hours daily");
    expect(record.custom_title).toBe("Daily Habit");
    expect(record.type).toBe("coding_activity");
    expect(record.seconds).toBe(7200);
    expect(record.status).toBe("success");
    expect(record.snoozed).toBe(0);
    expect(record.modified_at).toBe("2026-05-01 12:00:00");
  });

  test("should handle snoozed goal correctly", async () => {
    const syncer = new WakaTimeGoalsSyncer(mockClient);

    const mockGoal = {
      id: "goal-snoozed",
      title: "Weekend coding",
      type: "coding_activity",
      seconds: 3600,
      status: "pending",
      average_status: "fail",
      range_text: "last 7 days",
      snoozed: true,
      modified_at: "2026-05-10T08:00:00Z",
    };

    const records = await (
      syncer as unknown as {
        transform: (data: typeof mockGoal[]) => Promise<unknown[]>;
      }
    ).transform([mockGoal]);

    const record = records[0] as Record<string, unknown>;
    expect(record.snoozed).toBe(1);
    expect(record.custom_title).toBe("");
  });

  test("should fetch goals with correct API URL", async () => {
    process.env.WAKATIME_API_KEY = "test-key-123";

    const syncer = new WakaTimeGoalsSyncer(mockClient);

    const mockResponse = {
      data: [
        {
          id: "goal-1",
          title: "Test goal",
          type: "coding_activity",
          seconds: 3600,
          status: "success",
          average_status: "success",
          range_text: "last 7 days",
          modified_at: "2026-05-01T00:00:00Z",
        },
      ],
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(true);
    expect(result.recordsProcessed).toBe(1);

    const fetchedUrl = fetchSpy.mock.calls[0][0] as string;
    expect(fetchedUrl).toContain("/users/current/goals");
    expect(fetchedUrl).toContain("api_key=test-key-123");

    fetchSpy.mockRestore();
    delete process.env.WAKATIME_API_KEY;
  });
});
