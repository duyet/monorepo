import { describe, expect, it, vi } from "vitest";
import {
  armAlarmAt,
  ensureIngestAlarm,
  INGEST_ALARM_ARM_DELAY_MS,
  INGEST_ALARM_INTERVAL_MS,
  INGEST_MIN_INTERVAL_MS,
  INGEST_SCHEDULER_NAME,
  nextAlarmAt,
  shouldSkipIngest,
  tickIngest,
} from "../ingest-schedule.js";

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
  it("falls back to NEWS_INGEST.create when no scheduler is bound", async () => {
    const create = vi.fn().mockResolvedValue({ id: "wf-1" });
    const result = await tickIngest({
      NEWS_INGEST: { create } as unknown as Workflow,
    });
    expect(create).toHaveBeenCalledOnce();
    expect(result).toEqual({ id: "wf-1", skipped: false });
  });

  it("delegates to the Durable Object stub when bound", async () => {
    const tick = vi.fn().mockResolvedValue({
      id: "wf-2",
      skipped: false,
    });
    const result = await tickIngest({
      NEWS_INGEST: { create: vi.fn() } as unknown as Workflow,
      NEWS_INGEST_SCHEDULER: {
        idFromName: (name: string) => {
          expect(name).toBe(INGEST_SCHEDULER_NAME);
          return "id";
        },
        get: () => ({ tick, ensureArmed: vi.fn() }),
      } as unknown as DurableObjectNamespace,
    });
    expect(tick).toHaveBeenCalledWith({});
    expect(result).toEqual({ id: "wf-2", skipped: false });
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
        get: () => ({ tick: vi.fn(), ensureArmed }),
      } as unknown as DurableObjectNamespace,
    });
    expect(ensureArmed).toHaveBeenCalledOnce();
  });
});
