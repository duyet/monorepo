import { describe, expect, it, vi } from "vitest";
import {
  type D1Runner,
  ingestRunId,
  jsonMap,
  mapEntries,
  openedWorkflowRun,
  persistOpenedWorkflowRun,
  persistOpenedWorkflowRunVerified,
  persistWorkflowRun,
  SELECT_LATEST_WORKFLOW_RUN_ID_SQL,
  UPSERT_WORKFLOW_RUN_SQL,
} from "../workflow-run.js";

describe("UPSERT_WORKFLOW_RUN_SQL", () => {
  it("inserts on first write and updates the same id on conflict", () => {
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain("INSERT INTO workflow_runs");
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain("ON CONFLICT(id) DO UPDATE SET");
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain(
      "finished_at = excluded.finished_at"
    );
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain("stats = excluded.stats");
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain(
      "started_at = excluded.started_at"
    );
    expect(UPSERT_WORKFLOW_RUN_SQL).not.toContain("RETURNING");
  });
});

describe("D1Runner", () => {
  it("accepts D1Database so Env.DB assigns at tickIngest/persist", () => {
    const use = (_db: D1Runner): void => undefined;
    use({} as D1Database);
  });
});

describe("persistWorkflowRun", () => {
  it("binds the row onto the upsert statement", async () => {
    const run = vi.fn().mockResolvedValue({ success: true });
    const first = vi.fn();
    const bind = vi.fn().mockReturnValue({ run, first });
    const prepare = vi.fn().mockReturnValue({ bind });
    await persistWorkflowRun(
      { prepare },
      {
        id: "wf-1",
        startedAt: 100,
        finishedAt: 200,
        itemsFetched: 3,
        itemsNew: 1,
        error: null,
        statsJson: "{}",
      }
    );
    expect(prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(bind).toHaveBeenCalledWith("wf-1", 100, 200, 3, 1, null, "{}");
    expect(run).toHaveBeenCalledOnce();
  });
});

describe("jsonMap", () => {
  it("rebuilds a Map from entries after JSON round-trip", () => {
    const original = new Map<string, { n: number }>([["a", { n: 1 }]]);
    const restored = jsonMap(
      JSON.parse(JSON.stringify(mapEntries(original))) as [
        string,
        { n: number },
      ][]
    );
    expect(restored.get("a")).toEqual({ n: 1 });
    expect(restored.size).toBe(1);
  });

  it("does not throw .get on a JSON-serialized Map (empty object)", () => {
    const lost = JSON.parse(JSON.stringify(new Map([["a", 1]]))) as Record<
      string,
      number
    >;
    expect(lost).toEqual({});
    const restored = jsonMap(lost);
    expect(restored.get("a")).toBeUndefined();
    expect(restored.size).toBe(0);
  });
});

describe("ingestRunId", () => {
  it("uses the Cloudflare Workflow instance id when present", () => {
    expect(
      ingestRunId({ instanceId: "10f6c28b-f168-4126-800b-7868ce8850ee" })
    ).toBe("10f6c28b-f168-4126-800b-7868ce8850ee");
  });

  it("falls back to a uuid when instanceId is missing", () => {
    const id = ingestRunId({});
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});

describe("openedWorkflowRun", () => {
  it("sets finished_at to started_at so runsToday counts the open row", () => {
    const row = openedWorkflowRun("wf-1", 1_700_000_000, "create");
    expect(row.id).toBe("wf-1");
    expect(row.startedAt).toBe(1_700_000_000);
    expect(row.finishedAt).toBe(1_700_000_000);
    expect(row.itemsFetched).toBe(0);
    expect(JSON.parse(row.statsJson).steps).toEqual([
      { name: "create", action: "started" },
    ]);
  });
});

describe("SELECT_LATEST_WORKFLOW_RUN_ID_SQL", () => {
  it("breaks started_at ties with id DESC so lastRun is deterministic", () => {
    expect(SELECT_LATEST_WORKFLOW_RUN_ID_SQL).toContain(
      "ORDER BY started_at DESC, id DESC"
    );
  });
});

describe("persistOpenedWorkflowRun", () => {
  it("no-ops without a db or id", async () => {
    await persistOpenedWorkflowRun(undefined, "wf-1", 1, "create");
    await persistOpenedWorkflowRun({ prepare: vi.fn() }, null, 1, "open-run");
  });

  it("swallows D1 failures so create() still returns the instance id", async () => {
    const prepare = vi.fn().mockReturnValue({
      bind: () => ({
        run: () => Promise.reject(new Error("D1 unavailable")),
        first: () => Promise.resolve(null),
      }),
    });
    await expect(
      persistOpenedWorkflowRun({ prepare }, "wf-1", 1, "create")
    ).resolves.toBeUndefined();
  });
});

describe("persistOpenedWorkflowRunVerified", () => {
  it("upserts via .run() then confirms lastRun (not INSERT RETURNING)", async () => {
    const run = vi.fn().mockResolvedValue({
      success: true,
      meta: { changes: 1 },
      results: [],
    });
    const first = vi.fn().mockResolvedValue({ id: "wf-1", started_at: 1 });
    const bind = vi.fn().mockReturnValue({ run, first });
    const prepare = vi.fn((sql: string) => ({
      bind,
      first: sql.includes("ORDER BY")
        ? async () => ({ id: "wf-1", started_at: 1 })
        : first,
      run: sql.includes("ORDER BY")
        ? async () => ({ results: [{ id: "wf-1" }] })
        : run,
    }));
    await persistOpenedWorkflowRunVerified(
      { prepare } as D1Runner,
      "wf-1",
      1,
      "create"
    );
    expect(prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(prepare).toHaveBeenCalledWith(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
    expect(run).toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
  });

  it("uses batch write+lastRun SELECT when batch is bound", async () => {
    const bind = vi.fn().mockReturnValue({
      run: async () => ({ success: true, meta: { changes: 1 }, results: [] }),
    });
    const prepare = vi.fn((sql: string) => ({
      bind,
      run: async () =>
        sql.includes("ORDER BY")
          ? { results: [{ id: "wf-batch" }] }
          : { success: true, meta: { changes: 1 }, results: [] },
    }));
    const batch = vi.fn(async (stmts: { run: () => Promise<unknown> }[]) => {
      const results = [];
      for (const stmt of stmts) results.push(await stmt.run());
      return results;
    });
    await persistOpenedWorkflowRunVerified(
      { prepare, batch } as D1Runner,
      "wf-batch",
      1,
      "create"
    );
    expect(batch).toHaveBeenCalledOnce();
    expect(prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(prepare).toHaveBeenCalledWith(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
    expect(bind).toHaveBeenCalled();
  });

  it("throws after retries when lastRun SELECT misses", async () => {
    const prepare = vi.fn().mockReturnValue({
      bind: () => ({
        run: async () => ({ success: true, meta: { changes: 1 } }),
        first: async () => null,
      }),
      first: async () => null,
      run: async () => ({ results: [] }),
    });
    await expect(
      persistOpenedWorkflowRunVerified(
        { prepare } as D1Runner,
        "wf-1",
        1,
        "create"
      )
    ).rejects.toThrow(/lastRun is null after persist wf-1/);
    expect(prepare).toHaveBeenCalled();
  });

  it("throws when the write reports success but lastRun is still another row", async () => {
    const prepare = vi.fn((sql: string) => ({
      bind: () => ({
        run: async () => ({
          success: true,
          meta: { changes: 1 },
          results: [{ id: "wf-1" }],
        }),
        first: async () =>
          sql.includes("ORDER BY")
            ? { id: "42d830a9-689c-4e9a-9e91-98e812016b97" }
            : { id: "wf-1", started_at: 1 },
      }),
      first: async () =>
        sql.includes("ORDER BY")
          ? { id: "42d830a9-689c-4e9a-9e91-98e812016b97" }
          : { id: "wf-1", started_at: 1 },
      run: async () =>
        sql.includes("ORDER BY")
          ? { results: [{ id: "42d830a9-689c-4e9a-9e91-98e812016b97" }] }
          : { success: true, meta: { changes: 1 }, results: [{ id: "wf-1" }] },
    }));
    await expect(
      persistOpenedWorkflowRunVerified(
        { prepare } as D1Runner,
        "wf-1",
        1,
        "create"
      )
    ).rejects.toThrow(/lastRun is 42d830a9/);
    expect(prepare).toHaveBeenCalled();
  });

  it("invokes native-style D1 batch with the binding as this", async () => {
    /** Host-object D1 `batch` throws if extracted (`const fn = db.batch`).
     * #1415's type-check follow-up did that and live force POST 500'd. */
    class HostStyleD1 {
      lastId = "42d830a9-689c-4e9a-9e91-98e812016b97";
      started = new Map<string, number>([[this.lastId, 1]]);

      latest() {
        const id = [...this.started.entries()].sort(
          (a, b) => b[1] - a[1] || b[0].localeCompare(a[0])
        )[0]?.[0];
        this.lastId = id ?? this.lastId;
        return {
          id: this.lastId,
          started_at: this.started.get(this.lastId),
          results: [
            { id: this.lastId, started_at: this.started.get(this.lastId) },
          ],
        };
      }

      prepare(sql: string) {
        const isLatest = sql.includes("ORDER BY");
        return {
          bind: (...args: unknown[]) => ({
            run: async () => {
              const id = args[0] as string;
              const startedAt = args[1] as number;
              this.started.set(id, startedAt);
              return {
                success: true,
                meta: { changes: 1, rows_written: 1 },
                results: [],
              };
            },
            first: async () => this.latest(),
            all: async () => this.latest(),
          }),
          run: async () =>
            isLatest
              ? this.latest()
              : { success: true, meta: { changes: 1 }, results: [] },
          first: async () => this.latest(),
          all: async () => this.latest(),
        };
      }

      async batch(statements: { run: () => Promise<unknown> }[]) {
        if (this == null || typeof this.prepare !== "function") {
          throw new TypeError(
            "Illegal invocation: D1Database.batch requires the binding receiver"
          );
        }
        const results = [];
        for (const stmt of statements) results.push(await stmt.run());
        return results;
      }
    }

    const db = new HostStyleD1();
    const extracted = db.batch;
    await expect(extracted([])).rejects.toThrow(/Illegal invocation/);
    await persistOpenedWorkflowRunVerified(
      db as unknown as D1Runner,
      "wf-new",
      2,
      "create"
    );
    expect(db.lastId).toBe("wf-new");
  });

  it("falls back to .run() + lastRun SELECT when batch throws", async () => {
    let lastId = "42d830a9-689c-4e9a-9e91-98e812016b97";
    const prepare = vi.fn((sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: async () => {
          lastId = args[0] as string;
          return { success: true, meta: { changes: 1 }, results: [] };
        },
        first: async () => ({ id: lastId }),
      }),
      first: async () => ({ id: lastId }),
      all: async () => ({ results: [{ id: lastId }] }),
      run: async () =>
        sql.includes("ORDER BY")
          ? { results: [{ id: lastId }] }
          : { success: true, meta: { changes: 1 }, results: [] },
    }));
    const batch = vi.fn(async () => {
      throw new TypeError("Illegal invocation");
    });
    await persistOpenedWorkflowRunVerified(
      { prepare, batch } as D1Runner,
      "wf-fallback",
      2,
      "create"
    );
    expect(batch).toHaveBeenCalled();
    expect(lastId).toBe("wf-fallback");
  });

  it("does not treat empty D1 write-shaped batch SELECT results as lastRun", async () => {
    let lastId = "42d830a9-689c-4e9a-9e91-98e812016b97";
    const prepare = vi.fn((sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: async () => {
          lastId = args[0] as string;
          return { success: true, meta: { changes: 1 }, results: [] };
        },
        first: async () => ({ id: lastId }),
      }),
      first: async () => ({ id: lastId }),
      all: async () => ({ results: [{ id: lastId }] }),
      run: async () =>
        sql.includes("ORDER BY")
          ? { success: true, meta: {}, results: [] }
          : { success: true, meta: { changes: 1 }, results: [] },
    }));
    const batch = vi.fn(async (stmts: { run: () => Promise<unknown> }[]) => {
      const results = [];
      for (const stmt of stmts) results.push(await stmt.run());
      return results;
    });
    await persistOpenedWorkflowRunVerified(
      { prepare, batch } as D1Runner,
      "wf-new",
      2,
      "create"
    );
    expect(lastId).toBe("wf-new");
  });
});
