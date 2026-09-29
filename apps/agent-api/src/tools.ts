/**
 * Tool definitions for the chat agent. Each builder returns a tool bound to the
 * state it needs, so agent.ts only wires them into streamText.
 * @module tools
 */

import { scheduleSchema } from "agents/schedule";
import { tool } from "ai";
import { z } from "zod";

const MAX_TASK_DESCRIPTION_LENGTH = 500;
const MAX_SCHEDULED_TASKS = 25;

export interface ScheduleHandle {
  /** Sync in the SDK today; awaited so a future async swap needs no change. */
  getSchedules(): Promise<unknown[]> | unknown[];
  schedule(
    input: Date | number | string,
    description: string
  ): Promise<unknown>;
  cancelSchedule(taskId: string): Promise<unknown>;
}

export function getLocalTime(timezone: string): string {
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Reports the stored timezone and its local time. Without a stored timezone the
 * tool has no execute step, so the model must ask the browser for it.
 */
export function timezoneTool(timezone?: string) {
  return timezone
    ? tool({
        description:
          "Get the user's timezone and local time. Use this when you need to know the user's local time.",
        inputSchema: z.object({}),
        execute: async () => ({
          timezone,
          localTime: getLocalTime(timezone),
        }),
      })
    : tool({
        description:
          "Get the user's timezone from their browser. Use this when you need to know the user's local time.",
        inputSchema: z.object({}),
      });
}

const ARITHMETIC: Record<string, (x: number, y: number) => number> = {
  "+": (x, y) => x + y,
  "-": (x, y) => x - y,
  "*": (x, y) => x * y,
  "/": (x, y) => x / y,
  "%": (x, y) => x % y,
};

export function calculateTool() {
  return tool({
    description:
      "Perform a math calculation with two numbers. Requires user approval for large numbers.",
    inputSchema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
      operator: z
        .enum(["+", "-", "*", "/", "%"])
        .describe("Arithmetic operator"),
    }),
    needsApproval: async ({ a, b }) => Math.abs(a) > 1000 || Math.abs(b) > 1000,
    execute: async ({ a, b, operator }) => {
      if (operator === "/" && b === 0) {
        return { error: "Division by zero" };
      }

      if (operator === "%" && b === 0) {
        return { error: "Modulo by zero" };
      }

      return {
        expression: `${a} ${operator} ${b}`,
        result: ARITHMETIC[operator]?.(a, b),
      };
    },
  });
}

export function scheduleTaskTool(schedules: ScheduleHandle) {
  return tool({
    description:
      "Schedule a task to be executed later. Use this when the user asks to be reminded or wants something done later.",
    inputSchema: scheduleSchema,
    execute: async ({ when, description }) => {
      if (description.length > MAX_TASK_DESCRIPTION_LENGTH) {
        return "Task description is too long.";
      }

      if (when.type === "no-schedule") {
        return "Not a valid schedule input.";
      }

      let input: Date | number | string | null = null;
      if (when.type === "scheduled") {
        input = when.date;
      } else if (when.type === "delayed") {
        input = when.delayInSeconds;
      } else if (when.type === "cron") {
        input = when.cron;
      }

      if (!input) return "Invalid schedule type.";

      try {
        const existingTasks = await schedules.getSchedules();
        if (existingTasks.length >= MAX_SCHEDULED_TASKS) {
          return "Task limit reached. Cancel an existing task before scheduling another one.";
        }

        await schedules.schedule(input, description);
        return `Task scheduled: "${description}" (${when.type}: ${input})`;
      } catch (error) {
        return `Error scheduling task: ${String(error)}`;
      }
    },
  });
}

export function getScheduledTasksTool(schedules: ScheduleHandle) {
  return tool({
    description: "List all tasks that have been scheduled",
    inputSchema: z.object({}),
    execute: async () => {
      const tasks = await schedules.getSchedules();
      return tasks.length > 0 ? tasks : "No scheduled tasks found.";
    },
  });
}

export function cancelScheduledTaskTool(schedules: ScheduleHandle) {
  return tool({
    description: "Cancel a scheduled task by its ID",
    inputSchema: z.object({
      taskId: z.string().describe("The ID of the task to cancel"),
    }),
    execute: async ({ taskId }) => {
      try {
        await schedules.cancelSchedule(taskId);
        return `Task ${taskId} cancelled.`;
      } catch (error) {
        return `Error cancelling task: ${String(error)}`;
      }
    },
  });
}
