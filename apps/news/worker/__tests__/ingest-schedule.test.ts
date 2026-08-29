import { describe, expect, it, vi } from "vitest";
import {
  armAlarmAt,
  ensureIngestAlarm,
  INGEST_ALARM_ARM_DELAY_MS,
  INGEST_ALARM_INTERVAL_MS,
  INGEST_MIN_INTERVAL_MS,
  INGEST_SCHEDULER_NAME,
  nextAlarmAt,
  persistCreatedIngestRun,
  persistCreatedIngestRunVerified,
  shouldSkipIngest,
  tickIngest,
} from "../ingest-schedule.js";
import {
  type D1Runner,
  SELECT_LATEST_WORKFLOW_RUN_ID_SQL,
  SELECT_WORKFLOW_RUN_ID_SQL,
  UPSERT_WORKFLOW_RUN_SQL,
} from "../workflow-run.js";

function trackingDb(order: string[], lastRunId?: { current: string }): D1Runner {
  const prepare = vi.fn((sql: string) => {
    if (sql.startsWith("INSERT")) order.push("persist");
    else if (sql.includes("ORDER BY")) order.push("verify-last");
    else order.push("verify");
    return {
      bind: (...args: unknown[]) => {
        if (typeof args[0] === "string" && lastRunId) {
          lastRunId.current = args[0];
        }
        const id = (args[0] as string | undefined) ?? lastRunId?.current;
        return {
          run: async () => ({
            success: true,
            meta: { changes: 1, rows_written: 1 },
            results: [{ id, started_at: 1 }],
          }),
          first: async <T>() => ({ id, started_at: 1 }) as T,
        };
      },
      first: async <T>() =>
        ({ id: lastRunId?.current, started_at: 1 }) as T,
    };
  });
  return { prepare };
}

describe("shouldSkipIngest", () => {
  it("runs when there is no previous start", () => {
    expect(shouldSkipIngest(null, 1_000)).toBe(false);
    expect(shouldSkipIngest(undefined, 1_000)).toBe(false);
  });

  it("skips inside the 45-minute window", () => {
    const started = 1_000_000;
    expect(
      shouldSkipIngest(started, started + INGEST_MIN_INTERVAL_MS - 1)
    ).toBe(true);
  });

  it("runs again after the window", () => {
    const started = 1_000_000;
    expect(shouldSkipIngest(started, started + INGEST_MIN_INTERVAL_MS)).toBe(
      false
    );
  });

  it("ignores the window when force is set", () => {
    const started = 1_000_000;
    expect(shouldSkipIngest(started, started + 1, { force: true })).toBe(false);
  });
});

describe("alarm timestamps", () => {
  it("schedules the next hourly alarm from now", () => {
    expect(nextAlarmAt(0)).toBe(INGEST_ALARM_INTERVAL_MS);
  });

  it("arms a cold scheduler quickly", () => {
    expect(armAlarmAt(0)).toBe(INGEST_ALARM_ARM_DELAY_MS);
  });
});

describe("tickIngest", () => {
  it("fails closed when DB is unbound so POST cannot return a phantom id", async () => {
    const create = vi.fn();
    await expect(
      tickIngest({
        NEWS_INGEST: { create } as unknown as Workflow,
      })
    ).rejects.toThrow(/requires DB/);
    expect(create).not.toHaveBeenCalled();
  });

  it("falls back to NEWS_INGEST.create({ id }) when no scheduler is bound", async () => {
    const order: string[] = [];
    const lastRunId = { current: "" };
    const create = vi.fn(async (opts?: { id?: string }) => {
      order.push("create");
      return { id: opts?.id };
    });
    const result = await tickIngest({
      DB: trackingDb(order, lastRunId),
      NEWS_INGEST: { create } as unknown as Workflow,
    });
    expect(result.skipped).toBe(false);
    expect(create).toHaveBeenCalledWith({ id: result.id });
  });

  it("writes and lastRun-verifies workflow_runs before create()", async () => {
    const order: string[] = [];
    const lastRunId = { current: "" };
    const db = trackingDb(order, lastRunId);
    const create = vi.fn(async (opts?: { id?: string }) => {
      order.push("create");
      return { id: opts?.id };
    });
    const result = await tickIngest({
      DB: db,
      NEWS_INGEST: { create } as unknown as Workflow,
    });
    expect(result.skipped).toBe(false);
    expect(order).toEqual(["persist", "verify", "verify-last", "create"]);
    expect(create).toHaveBeenCalledWith({ id: result.id });
    expect(db.prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(db.prepare).toHaveBeenCalledWith(SELECT_WORKFLOW_RUN_ID_SQL);
    expect(db.prepare).toHaveBeenCalledWith(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
  });

  it("persists on the Worker DB then create({ id }) when the scheduler is bound", async () => {
    const order: string[] = [];
    const lastRunId = { current: "" };
    const db = trackingDb(order, lastRunId);
    const canStart = vi.fn(async () => {
      order.push("gate");
      return { id: null, skipped: false };
    });
    const startInstance = vi.fn();
    const markStarted = vi.fn(async () => {
      order.push("mark");
    });
    const create = vi.fn(async (opts?: { id?: string }) => {
      order.push("create");
      return { id: opts?.id };
    });
    const result = await tickIngest(
      {
        DB: db,
        NEWS_INGEST: { create } as unknown as Workflow,
        NEWS_INGEST_SCHEDULER: {
          idFromName: (name: string) => {
            expect(name).toBe(INGEST_SCHEDULER_NAME);
            return "id";
          },
          get: () => ({
            tick: vi.fn(),
            canStart,
            startInstance,
            markStarted,
            ensureArmed: vi.fn(),
          }),
        } as unknown as DurableObjectNamespace,
      },
      { force: true }
    );
    expect(canStart).toHaveBeenCalledWith({ force: true });
    expect(startInstance).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith({ id: result.id });
    expect(markStarted).toHaveBeenCalledWith(result.id);
    expect(order).toEqual([
      "gate",
      "persist",
      "verify",
      "verify-last",
      "create",
      "mark",
    ]);
    expect(db.prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
  });

  it("does not persist or create when the scheduler skips", async () => {
    const prepare = vi.fn();
    const startInstance = vi.fn();
    const create = vi.fn();
    const result = await tickIngest({
      DB: { prepare },
      NEWS_INGEST: { create } as unknown as Workflow,
      NEWS_INGEST_SCHEDULER: {
        idFromName: () => "id",
        get: () => ({
          tick: vi.fn(),
          canStart: vi.fn().mockResolvedValue({
            id: null,
            skipped: true,
            reason: "ran recently",
          }),
          startInstance,
          markStarted: vi.fn(),
          ensureArmed: vi.fn(),
        }),
      } as unknown as DurableObjectNamespace,
    });
    expect(result).toEqual({
      id: null,
      skipped: true,
      reason: "ran recently",
    });
    expect(prepare).not.toHaveBeenCalled();
    expect(startInstance).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rethrows canStart failures instead of proceeding as skipped:false", async () => {
    const prepare = vi.fn();
    const create = vi.fn();
    await expect(
      tickIngest({
        DB: { prepare },
        NEWS_INGEST: { create } as unknown as Workflow,
        NEWS_INGEST_SCHEDULER: {
          idFromName: () => "id",
          get: () => ({
            tick: vi.fn(),
            canStart: vi.fn().mockRejectedValue(new Error("DO unavailable")),
            startInstance: vi.fn(),
            markStarted: vi.fn(),
            ensureArmed: vi.fn(),
          }),
        } as unknown as DurableObjectNamespace,
      })
    ).rejects.toThrow(/DO unavailable/);
    expect(prepare).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("rethrows NEWS_INGEST.create failures after persist (no 2xx phantom)", async () => {
    const order: string[] = [];
    const lastRunId = { current: "" };
    const create = vi.fn(async () => {
      order.push("create");
      throw new Error("workflow create rejected");
    });
    const markStarted = vi.fn();
    await expect(
      tickIngest({
        DB: trackingDb(order, lastRunId),
        NEWS_INGEST: { create } as unknown as Workflow,
        NEWS_INGEST_SCHEDULER: {
          idFromName: () => "id",
          get: () => ({
            tick: vi.fn(),
            canStart: vi.fn().mockResolvedValue({ id: null, skipped: false }),
            startInstance: vi.fn(),
            markStarted,
            ensureArmed: vi.fn(),
          }),
        } as unknown as DurableObjectNamespace,
      })
    ).rejects.toThrow(/workflow create rejected/);
    expect(order).toEqual(["persist", "verify", "verify-last", "create"]);
    expect(markStarted).not.toHaveBeenCalled();
  });

  it("rethrows markStarted failures after create so POST is not SUCCESS", async () => {
    const order: string[] = [];
    const lastRunId = { current: "" };
    const create = vi.fn(async (opts?: { id?: string }) => {
      order.push("create");
      return { id: opts?.id };
    });
    const markStarted = vi
      .fn()
      .mockRejectedValue(new Error("markStarted storage failed"));
    await expect(
      tickIngest({
        DB: trackingDb(order, lastRunId),
        NEWS_INGEST: { create } as unknown as Workflow,
        NEWS_INGEST_SCHEDULER: {
          idFromName: () => "id",
          get: () => ({
            tick: vi.fn(),
            canStart: vi.fn().mockResolvedValue({ id: null, skipped: false }),
            startInstance: vi.fn(),
            markStarted,
            ensureArmed: vi.fn(),
          }),
        } as unknown as DurableObjectNamespace,
      })
    ).rejects.toThrow(/markStarted storage failed/);
    expect(create).toHaveBeenCalledOnce();
    expect(markStarted).toHaveBeenCalledTimes(3);
  });
});

describe("persistCreatedIngestRun", () => {
  it("skips skipped ticks", async () => {
    const prepare = vi.fn();
    await persistCreatedIngestRun(
      { prepare },
      { id: null, skipped: true, reason: "ran recently" }
    );
    expect(prepare).not.toHaveBeenCalled();
  });
});

describe("persistCreatedIngestRunVerified", () => {
  it("throws when DB is unbound", async () => {
    await expect(
      persistCreatedIngestRunVerified(undefined, {
        id: "wf-missing",
        skipped: false,
      })
    ).rejects.toThrow(/requires DB/);
  });

  it("throws when D1 does not RETURN the row", async () => {
    const prepare = vi.fn().mockReturnValue({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async () => null,
      }),
      first: async () => null,
    });
    await expect(
      persistCreatedIngestRunVerified(
        { prepare },
        { id: "wf-missing", skipped: false }
      )
    ).rejects.toThrow(/RETURNING missed wf-missing/);
  });
});

describe("ensureIngestAlarm", () => {
  it("is a no-op without a scheduler binding", async () => {
    await expect(ensureIngestAlarm({})).resolves.toBeUndefined();
  });

  it("asks the stub to arm when bound", async () => {
    const ensureArmed = vi.fn().mockResolvedValue(undefined);
    await ensureIngestAlarm({
      NEWS_INGEST_SCHEDULER: {
        idFromName: () => "id",
        get: () => ({
          tick: vi.fn(),
          canStart: vi.fn(),
          startInstance: vi.fn(),
          markStarted: vi.fn(),
          ensureArmed,
        }),
      } as unknown as DurableObjectNamespace,
    });
    expect(ensureArmed).toHaveBeenCalledOnce();
  });
});
