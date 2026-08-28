import { describe, expect, it, vi } from "vitest";
import {
  ingestRunId,
  jsonMap,
  mapEntries,
  persistWorkflowRun,
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
  });
});

describe("persistWorkflowRun", () => {
  it("binds the row onto the upsert statement", async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    const bind = vi.fn().mockReturnValue({ run });
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
