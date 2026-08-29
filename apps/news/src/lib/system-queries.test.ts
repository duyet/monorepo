import { describe, expect, it } from "vitest";
import { WORKFLOW_RUN_STARTED_AT_ORDER_SQL } from "../../worker/workflow-run.js";
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

  it("orders lastRun with epoch-normalized started_at so leftover ms rows cannot stay on top", async () => {
    const seen: string[] = [];
    const inner = makeDb({
      "FROM workflow_runs": {
        all: async () => ({ results: [] }),
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
    const db = {
      prepare(sql: string) {
        seen.push(sql);
        return inner.prepare(sql);
      },
    } as unknown as D1Database;

    await loadSystemStats(db, {});
    const runsSql = seen.find(
      (sql) => sql.includes("FROM workflow_runs") && sql.includes("LIMIT 30")
    );
    expect(runsSql).toContain(WORKFLOW_RUN_STARTED_AT_ORDER_SQL);
    expect(runsSql).not.toContain("ORDER BY started_at DESC");
  });
});
