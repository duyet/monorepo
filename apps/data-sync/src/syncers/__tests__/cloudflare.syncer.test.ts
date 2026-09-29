import { afterEach, beforeEach, describe, expect, vi, test } from "vitest";
import type { ClickHouseClient } from "@clickhouse/client";
import { CloudflareSyncer } from "../cloudflare.syncer";

describe("CloudflareSyncer", () => {
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
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test("should be CloudflareSyncer instance", () => {
    const syncer = new CloudflareSyncer(mockClient);
    expect(syncer).toBeInstanceOf(CloudflareSyncer);
  });

  // `BaseSyncer.sync()` never rejects: it catches and reports through
  // SyncResult.errors, so this asserts on the result rather than a throw.
  test("should fail the sync without writing when CLOUDFLARE credentials are missing", async () => {
    vi.stubEnv("CLOUDFLARE_ZONE_ID", undefined);
    vi.stubEnv("CLOUDFLARE_API_KEY", undefined);
    vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);

    const syncer = new CloudflareSyncer(mockClient);
    const result = await syncer.sync({ dryRun: true });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.message).toContain("CLOUDFLARE");
    expect(result.recordsInserted).toBe(0);
    expect(mockClient.insert).not.toHaveBeenCalled();
  });
});
