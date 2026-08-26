import { describe, expect, it } from "vitest";
import { loadSystemStats } from "./system-queries";

function makeDb(stubs: Record<string, unknown>) {
  return {
    prepare(sql: string) {
      const key = Object.keys(stubs).find((k) => sql.includes(k));
      const stub = key ? stubs[key] : { first: async () => null, all: async () => ({ results: [] }) };
      return {
        bind: (..._args: unknown[]) => stub,
        first: async () => (stub as { first?: () => Promise<unknown> }).first?.(),
        all: async () =>
          (stub as { all?: () => Promise<{ results: unknown[] }> }).all?.() ?? {
            results: [],
          },
      };
    },
  } as unknown as D1Database;
}

describe("loadSystemStats run timestamp normalization", () => {
  it("normalizes legacy millisecond workflow_runs timestamps", async () => {
    const msStarted = 1_700_000_000_000;
    const db = makeDb({
      "FROM workflow_runs": {
        all: async () => ({
          results: [
            {
              id: "run-1",
              started_at: msStarted,
              finished_at: msStarted + 60_000,
              items_fetched: 1,
              items_new: 1,
              error: null,
              stats: null,
            },
          ],
        }),
      },
      "SELECT llm_tokens": {
        all: async () => {
          throw new Error("no column");
        },
      },
      "FROM llm_calls": {
        all: async () => {
          throw new Error("no table");
        },
      },
      "SELECT stats FROM workflow_runs": {
        all: async () => ({ results: [{ stats: null }] }),
      },
    });

    const stats = await loadSystemStats(db, {});
    expect(stats.runs[0]?.started_at).toBe(Math.floor(msStarted / 1000));
    expect(stats.runs[0]?.finished_at).toBe(Math.floor((msStarted + 60_000) / 1000));
  });
});
