import { describe, expect, it, vi } from "vitest";
import {
  ingestRunId,
  jsonMap,
  mapEntries,
  openedWorkflowRun,
  persistOpenedWorkflowRun,
  persistOpenedWorkflowRunVerified,
  persistWorkflowRun,
  type D1Runner,
  SELECT_LATEST_WORKFLOW_RUN_ID_SQL,
  SELECT_WORKFLOW_RUN_ID_SQL,
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
    expect(UPSERT_WORKFLOW_RUN_SQL).toContain("RETURNING id, started_at");
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
  it("upserts via RETURNING then confirms lastRun", async () => {
    const run = vi.fn().mockResolvedValue({ success: true });
    const first = vi.fn().mockResolvedValue({ id: "wf-1", started_at: 1 });
    const bind = vi.fn().mockReturnValue({ run, first });
    const prepare = vi.fn().mockReturnValue({ bind, first });
    await persistOpenedWorkflowRunVerified(
      { prepare } as D1Runner,
      "wf-1",
      1,
      "create"
    );
    expect(prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(prepare).toHaveBeenCalledWith(SELECT_WORKFLOW_RUN_ID_SQL);
    expect(prepare).toHaveBeenCalledWith(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
    expect(first).toHaveBeenCalled();
  });

  it("throws after retries when RETURNING misses", async () => {
    const prepare = vi.fn().mockReturnValue({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async () => null,
      }),
      first: async () => null,
    });
    await expect(
      persistOpenedWorkflowRunVerified({ prepare } as D1Runner, "wf-1", 1, "create")
    ).rejects.toThrow(/RETURNING missed wf-1/);
    expect(prepare).toHaveBeenCalledTimes(3);
  });

  it("throws when RETURNING echoes the id but lastRun is still another row", async () => {
    const prepare = vi.fn((sql: string) => ({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async () =>
          sql.includes("ORDER BY")
            ? { id: "42d830a9-689c-4e9a-9e91-98e812016b97" }
            : { id: "wf-1", started_at: 1 },
      }),
      first: async () =>
        sql.includes("ORDER BY")
          ? { id: "42d830a9-689c-4e9a-9e91-98e812016b97" }
          : { id: "wf-1", started_at: 1 },
    }));
    await expect(
      persistOpenedWorkflowRunVerified({ prepare } as D1Runner, "wf-1", 1, "create")
    ).rejects.toThrow(/lastRun is 42d830a9/);
    expect(prepare).toHaveBeenCalled();
  });
});
