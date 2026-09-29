import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WakaTimeSyncer } from "../wakatime.syncer";
import {
  createMockClickHouseClient,
  expectSyncFailsWithoutWriting,
  type MockClickHouseClient,
} from "./test-fixtures";

describe("WakaTimeSyncer", () => {
  let mockClient: MockClickHouseClient;

  beforeEach(() => {
    mockClient = createMockClickHouseClient();
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

  test("should fail the sync without writing when WAKATIME_API_KEY is missing", async () => {
    await expectSyncFailsWithoutWriting({
      syncer: new WakaTimeSyncer(mockClient),
      client: mockClient,
      missingEnvVars: ["WAKATIME_API_KEY"],
      errorMentions: "WAKATIME_API_KEY",
    });
  });
});
