import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CloudflareSyncer } from "../cloudflare.syncer";
import {
  createMockClickHouseClient,
  expectSyncFailsWithoutWriting,
  type MockClickHouseClient,
} from "./test-fixtures";

describe("CloudflareSyncer", () => {
  let mockClient: MockClickHouseClient;

  beforeEach(() => {
    mockClient = createMockClickHouseClient();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("should create syncer instance", () => {
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be CloudflareSyncer instance", () => {
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeInstanceOf(CloudflareSyncer);
  });

  test("should fail the sync without writing when CLOUDFLARE credentials are missing", async () => {
    await expectSyncFailsWithoutWriting({
      syncer: new CloudflareSyncer(mockClient),
      client: mockClient,
      missingEnvVars: [
        "CLOUDFLARE_ZONE_ID",
        "CLOUDFLARE_API_KEY",
        "CLOUDFLARE_API_TOKEN",
      ],
      errorMentions: "CLOUDFLARE",
    });
  });
});
