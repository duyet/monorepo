import { describe, expect, it } from "vitest";
import { WORKFLOW_RUN_STARTED_AT_ORDER_SQL } from "../../worker/workflow-run.js";
import { attachLlmCallsToRuns, loadSystemStats } from "./system-queries";

function makeDb(stubs: Record<string, unknown>) {
  return {
    prepare(sql: string) {
      const key = Object.keys(stubs).find((k) => sql.includes(k));
      const stub = key
        ? stubs[key]
        : { first: async () => null, all: async () => ({ results: [] }) };
      return {
        bind: (..._args: unknown[]) => stub,
        first: async () =>
          (stub as { first?: () => Promise<unknown> }).first?.(),
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
    expect(stats.runs[0]?.finished_at).toBe(
      Math.floor((msStarted + 60_000) / 1000)
    );
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

describe("attachLlmCallsToRuns", () => {
  it("attributes calls by timestamp window and sums usage", () => {
    const runs = [
      {
        id: "run-a",
        started_at: 1_700_000_000,
        finished_at: 1_700_000_120,
        items_fetched: 3,
        items_new: 1,
        error: null,
        stats: { tokens: 10 },
      },
      {
        id: "run-b",
        started_at: 1_700_000_200,
        finished_at: 1_700_000_300,
        items_fetched: 0,
        items_new: 0,
        error: null,
        stats: null,
      },
    ];
    const calls = [
      {
        ts: 1_700_000_010_000,
        task: "score",
        model: "anyrouter/gpt-test",
        ok: true,
        tokens: 100,
        durationMs: 1200,
        promptChars: 40,
        promptTokens: 80,
        completionTokens: 20,
        cachedTokens: 50,
        error: null,
      },
      {
        ts: 1_700_000_050_000,
        task: "translate",
        model: "anyrouter/gpt-test",
        ok: true,
        tokens: 40,
        durationMs: 800,
        promptChars: 20,
        promptTokens: 30,
        completionTokens: 10,
        cachedTokens: 0,
        error: null,
      },
      {
        ts: 1_700_000_250_000,
        task: "tldr",
        model: "anyrouter/other",
        ok: false,
        tokens: 0,
        durationMs: 500,
        promptChars: 10,
        promptTokens: null,
        completionTokens: null,
        cachedTokens: null,
        error: "timeout",
      },
    ];

    const attached = attachLlmCallsToRuns(runs, calls);
    expect(attached[0]?.llm?.models).toEqual(["anyrouter/gpt-test"]);
    expect(attached[0]?.llm?.tokens).toBe(140);
    expect(attached[0]?.llm?.cachedTokens).toBe(50);
    expect(attached[0]?.llm?.durationMs).toBe(2000);
    expect(attached[0]?.llm?.calls).toBe(2);
    expect(attached[0]?.llm?.attempts).toHaveLength(2);

    expect(attached[1]?.llm?.calls).toBe(1);
    expect(attached[1]?.llm?.failures).toBe(1);
    expect(attached[1]?.llm?.models).toEqual([]);
  });
});
