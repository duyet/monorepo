import { afterEach, beforeEach, describe, expect, vi, test } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { WakaTimeSyncer } from "../wakatime.syncer";

describe("WakaTimeSyncer", () => {
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
    const syncer = new WakaTimeSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be WakaTimeSyncer instance", () => {
    const syncer = new WakaTimeSyncer(mockClient);
    expect(syncer).toBeInstanceOf(WakaTimeSyncer);
  });

  // `BaseSyncer.sync()` never rejects: it catches and reports through
  // SyncResult.errors, so this asserts on the result rather than a throw.
  test("should fail the sync without writing when WAKATIME_API_KEY is missing", async () => {
    vi.stubEnv("WAKATIME_API_KEY", undefined);

    const syncer = new WakaTimeSyncer(mockClient);
    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.message).toContain("WAKATIME_API_KEY");
    expect(result.recordsInserted).toBe(0);
    expect(mockClient.insert).not.toHaveBeenCalled();
  });
});
