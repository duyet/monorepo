import { describe, expect, test, vi } from "vitest";
import {
  cancelScheduledTaskTool,
  calculateTool,
  type ScheduleHandle,
  scheduleTaskTool,
} from "./tools";

/** Minimal stand-in for the Agent's schedule API. */
function fakeSchedules(
  overrides: Partial<ScheduleHandle> = {}
): ScheduleHandle {
  return {
    cancelSchedule: vi.fn().mockResolvedValue(true),
    getSchedules: vi.fn().mockResolvedValue([]),
    schedule: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as ScheduleHandle;
}

async function run<TInput>(
  tool: { execute?: (input: TInput, options: never) => unknown },
  input: TInput
): Promise<unknown> {
  return (tool.execute as (input: TInput) => unknown)(input);
}

describe("cancelScheduledTaskTool", () => {
  test("confirms a real cancellation", async () => {
    const schedules = fakeSchedules();

    expect(
      await run(cancelScheduledTaskTool(schedules), { taskId: "task-1" })
    ).toBe("Task task-1 cancelled.");
  });

  test("does not claim success when the scheduler found nothing to cancel", async () => {
    // Agent.cancelSchedule resolves false for an unknown id; it does not throw.
    const schedules = fakeSchedules({
      cancelSchedule: vi.fn().mockResolvedValue(false),
    });

    const result = await run(cancelScheduledTaskTool(schedules), {
      taskId: "ghost",
    });

    expect(result).not.toBe("Task ghost cancelled.");
    expect(String(result)).toContain("ghost");
    expect(String(result)).toMatch(/not found|no scheduled task/i);
  });

  test("still surfaces a thrown scheduler error", async () => {
    const schedules = fakeSchedules({
      cancelSchedule: vi.fn().mockRejectedValue(new Error("storage down")),
    });

    expect(
      await run(cancelScheduledTaskTool(schedules), { taskId: "task-2" })
    ).toBe("Error cancelling task: Error: storage down");
  });
});

describe("scheduleTaskTool", () => {
  test("refuses a description over the cap without touching the scheduler", async () => {
    const schedules = fakeSchedules();

    const result = await run(scheduleTaskTool(schedules), {
      description: "d".repeat(501),
      when: { type: "delayed", delayInSeconds: 60 },
    });

    expect(result).toBe("Task description is too long.");
    expect(schedules.schedule).not.toHaveBeenCalled();
  });

  test("stops scheduling at the task cap", async () => {
    const schedules = fakeSchedules({
      getSchedules: vi.fn().mockResolvedValue(new Array(25).fill({})),
    });

    expect(
      await run(scheduleTaskTool(schedules), {
        description: "ping",
        when: { type: "delayed", delayInSeconds: 60 },
      })
    ).toMatch(/limit reached/i);
    expect(schedules.schedule).not.toHaveBeenCalled();
  });

  test("passes the resolved schedule input through", async () => {
    const schedules = fakeSchedules();

    expect(
      await run(scheduleTaskTool(schedules), {
        description: "ping",
        when: { type: "cron", cron: "0 9 * * *" },
      })
    ).toBe('Task scheduled: "ping" (cron: 0 9 * * *)');
    expect(schedules.schedule).toHaveBeenCalledWith("0 9 * * *", "ping");
  });
});

describe("calculateTool", () => {
  test("reports division and modulo by zero instead of Infinity/NaN", async () => {
    expect(await run(calculateTool(), { a: 1, b: 0, operator: "/" })).toEqual({
      error: "Division by zero",
    });
    expect(await run(calculateTool(), { a: 1, b: 0, operator: "%" })).toEqual({
      error: "Modulo by zero",
    });
  });
});
