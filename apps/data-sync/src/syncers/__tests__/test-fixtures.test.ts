import type { ClickHouseClient } from "@clickhouse/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SyncOptions, SyncResult } from "../../lib/base/types";
import {
  createMockClickHouseClient,
  expectSyncFailsWithoutWriting,
} from "./test-fixtures";

afterEach(() => {
  vi.unstubAllEnvs();
});

function syncResult(overrides: Partial<SyncResult> = {}): SyncResult {
  return {
    source: "test-source",
    success: false,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    errors: [
      {
        message: "WAKATIME_API_KEY environment variable not set",
        retryable: false,
      },
    ],
    startTime: new Date(0),
    endTime: new Date(0),
    durationMs: 0,
    ...overrides,
  };
}

describe("createMockClickHouseClient", () => {
  it("records the arguments each call was given", async () => {
    const client = createMockClickHouseClient();

    await client.query({ query: "SELECT 1" });
    await client.insert({ table: "monorepo_wakatime", values: [] });
    await client.close();

    expect(client.query).toHaveBeenCalledTimes(1);
    expect(client.query).toHaveBeenCalledWith({ query: "SELECT 1" });
    expect(client.insert).toHaveBeenCalledTimes(1);
    expect(client.insert).toHaveBeenCalledWith({
      table: "monorepo_wakatime",
      values: [],
    });
    expect(client.close).toHaveBeenCalledTimes(1);
  });

  it("resolves every call, so a suite can await a sync", async () => {
    const client = createMockClickHouseClient();

    await expect(client.insert({ table: "t", values: [] })).resolves
      .toBeUndefined();
    await expect(client.query({ query: "SELECT 1" })).resolves.toBeUndefined();
    await expect(client.close()).resolves.toBeUndefined();
  });

  it("gives each caller a fresh call history", async () => {
    const first = createMockClickHouseClient();
    const second = createMockClickHouseClient();

    await first.query({ query: "SELECT 1" });

    expect(first.query).toHaveBeenCalledTimes(1);
    expect(second.query).not.toHaveBeenCalled();
    expect(second.insert).not.toHaveBeenCalled();
  });

  it("keeps a caller-supplied insert mock", async () => {
    const insert = vi.fn(() => Promise.resolve());
    const client = createMockClickHouseClient({ insert });

    await client.insert({ table: "t", values: [] });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(client.insert).toBe(insert);
  });
});

describe("expectSyncFailsWithoutWriting", () => {
  it("clears the named env vars and syncs as a dry run", async () => {
    vi.stubEnv("WAKATIME_API_KEY", "leaked-key");
    vi.stubEnv("CLOUDFLARE_API_KEY", "leaked-key");
    const observed: { env: Array<string | undefined>; options?: SyncOptions } =
      { env: [] };

    await expectSyncFailsWithoutWriting({
      syncer: {
        sync: async (options) => {
          observed.options = options;
          observed.env.push(
            process.env.WAKATIME_API_KEY,
            process.env.CLOUDFLARE_API_KEY
          );
          return syncResult();
        },
      },
      client: createMockClickHouseClient(),
      missingEnvVars: ["WAKATIME_API_KEY", "CLOUDFLARE_API_KEY"],
      errorMentions: "WAKATIME_API_KEY",
    });

    expect(observed.env).toEqual([undefined, undefined]);
    expect(observed.options).toEqual({ dryRun: true });
  });

  it("passes when the syncer reports the failure and writes nothing", async () => {
    await expect(
      expectSyncFailsWithoutWriting({
        syncer: { sync: async () => syncResult() },
        client: createMockClickHouseClient(),
        missingEnvVars: ["WAKATIME_API_KEY"],
        errorMentions: "WAKATIME_API_KEY",
      })
    ).resolves.toBeUndefined();
  });

  it("fails when the reported error does not mention the missing setting", async () => {
    await expect(
      expectSyncFailsWithoutWriting({
        syncer: { sync: async () => syncResult() },
        client: createMockClickHouseClient(),
        missingEnvVars: ["WAKATIME_API_KEY"],
        errorMentions: "CLOUDFLARE",
      })
    ).rejects.toThrow();
  });

  // The whole point of the shared helper: a `success: false` result on its own
  // would still pass if the syncer had already written. Every other assertion
  // here is satisfied on purpose, so the only thing that can reject is the
  // no-write check.
  it("fails when the syncer reports failure but still wrote", async () => {
    const client = createMockClickHouseClient();

    await expect(
      expectSyncFailsWithoutWriting({
        syncer: {
          sync: async () => {
            await (client as ClickHouseClient).insert({
              table: "monorepo_wakatime",
              values: [],
            });
            return syncResult();
          },
        },
        client,
        missingEnvVars: ["WAKATIME_API_KEY"],
        errorMentions: "WAKATIME_API_KEY",
      })
    ).rejects.toThrow(/to not be called/);

    expect(client.insert).toHaveBeenCalledTimes(1);
  });
});
