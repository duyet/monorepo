import type { ClickHouseClient } from "@clickhouse/client";
import { expect, vi } from "vitest";
import type { SyncOptions, SyncResult } from "../../lib/base/types";

/**
 * Shared fixtures for the syncer suites in this directory.
 *
 * Deliberately not named `*.test.ts`: this app's vitest `include` only collects
 * `*.test.ts` under `src/`, so this module is imported by the suites instead of
 * being collected as a suite of its own.
 */

/** A `vi.fn()` that accepts any arguments and resolves. */
export type MockFn = ReturnType<typeof vi.fn>;

/** A `ClickHouseClient` whose three methods are mocks. */
export type MockClickHouseClient = ClickHouseClient & {
  insert: MockFn;
  query: MockFn;
  close: MockFn;
};

/**
 * A ClickHouse client whose `insert`/`query`/`close` all resolve and which
 * records the arguments it was handed, so tests can assert on them.
 *
 * Build a fresh one per test: the call history is part of what the suites check.
 * Pass `insert` to keep a handle on a specific mock — a suite that needs to
 * assert on inserted rows while other tests assert the opposite.
 */
export function createMockClickHouseClient(overrides: {
  insert?: MockFn;
} = {}): MockClickHouseClient {
  return {
    insert: overrides.insert ?? vi.fn(() => Promise.resolve()),
    query: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  } as unknown as MockClickHouseClient;
}

/** The part of a syncer `expectSyncFailsWithoutWriting` needs. */
export interface Syncable {
  sync: (options: SyncOptions) => Promise<SyncResult>;
}

export interface FailWithoutWritingOptions {
  /** The syncer under test. */
  syncer: Syncable;
  /** The client the syncer writes through, used to prove nothing was written. */
  client: ClickHouseClient;
  /** Env vars to clear to reproduce the unconfigured case. */
  missingEnvVars: string[];
  /** Substring the reported error has to mention, e.g. the missing service. */
  errorMentions: string;
}

/**
 * Asserts the invariant every "missing credentials" test exists to protect: a
 * sync that cannot reach its API reports the failure and writes nothing.
 *
 * `BaseSyncer.sync()` never rejects — it catches and reports through
 * `SyncResult.errors` — so this asserts on the result rather than on a throw.
 * The no-write check is the one that matters: a green `success: false` alone
 * would still pass if the syncer had already written a partial batch.
 */
export async function expectSyncFailsWithoutWriting({
  syncer,
  client,
  missingEnvVars,
  errorMentions,
}: FailWithoutWritingOptions): Promise<void> {
  for (const name of missingEnvVars) {
    vi.stubEnv(name, undefined);
  }

  const result = await syncer.sync({ dryRun: true });

  expect(result.success).toBe(false);
  expect(result.errors[0]?.message).toContain(errorMentions);
  expect(result.recordsInserted).toBe(0);
  expect(client.insert).not.toHaveBeenCalled();
}
