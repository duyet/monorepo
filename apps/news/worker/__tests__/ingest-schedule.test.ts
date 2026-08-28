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
  SELECT_WORKFLOW_RUN_ID_SQL,
  UPSERT_WORKFLOW_RUN_SQL,
} from "../workflow-run.js";

function trackingDb(order: string[]): D1Runner {
  const prepare = vi.fn((sql: string) => {
    order.push(sql.startsWith("INSERT") ? "persist" : "verify");
    return {
      bind: (...args: unknown[]) => ({
        run: async () => ({ success: true }),
        first: async <T>() => ({ id: args[0] as string }) as T,
      }),
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
  it("falls back to NEWS_INGEST.create({ id }) when no scheduler is bound", async () => {
    const create = vi.fn().mockResolvedValue({ id: "wf-1" });
    const result = await tickIngest({
      NEWS_INGEST: { create } as unknown as Workflow,
    });
    expect(result.skipped).toBe(false);
    expect(create).toHaveBeenCalledWith({ id: result.id });
  });

  it("writes and verifies workflow_runs before create()", async () => {
    const order: string[] = [];
    const db = trackingDb(order);
    const create = vi.fn(async (opts?: { id?: string }) => {
      order.push("create");
      return { id: opts?.id };
    });
    const result = await tickIngest({
      DB: db,
      NEWS_INGEST: { create } as unknown as Workflow,
    });
    expect(result.skipped).toBe(false);
    expect(order).toEqual(["persist", "verify", "create"]);
    expect(create).toHaveBeenCalledWith({ id: result.id });
    expect(db.prepare).toHaveBeenCalledWith(UPSERT_WORKFLOW_RUN_SQL);
    expect(db.prepare).toHaveBeenCalledWith(SELECT_WORKFLOW_RUN_ID_SQL);
  });

  it("persists on the Worker DB before startInstance when the scheduler is bound", async () => {
    const order: string[] = [];
    const db = trackingDb(order);
    const canStart = vi.fn(async () => {
      order.push("gate");
      return { id: null, skipped: false };
    });
    const startInstance = vi.fn(async (id: string) => {
      order.push("create");
      return { id, skipped: false };
    });
    const create = vi.fn();
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
            ensureArmed: vi.fn(),
          }),
        } as unknown as DurableObjectNamespace,
      },
      { force: true }
    );
    expect(canStart).toHaveBeenCalledWith({ force: true });
    expect(create).not.toHaveBeenCalled();
    expect(startInstance).toHaveBeenCalledWith(result.id);
    expect(order).toEqual(["gate", "persist", "verify", "create"]);
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
  it("throws when D1 does not read back the row", async () => {
    const prepare = vi.fn().mockReturnValue({
      bind: () => ({
        run: async () => ({ success: true }),
        first: async () => null,
      }),
    });
    await expect(
      persistCreatedIngestRunVerified(
        { prepare },
        { id: "wf-missing", skipped: false }
      )
    ).rejects.toThrow(/verify missed wf-missing/);
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
          ensureArmed,
        }),
      } as unknown as DurableObjectNamespace,
    });
    expect(ensureArmed).toHaveBeenCalledOnce();
  });
});
