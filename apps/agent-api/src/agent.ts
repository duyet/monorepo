import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import { callable, type Schedule } from "agents";
import { getSchedulePrompt, scheduleSchema } from "agents/schedule";
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
  type UIMessage,
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { z } from "zod";
import { buildSystemPrompt } from "./prompt";

export interface Env {
  AGENT_API_TOKEN?: string;
  AI: Ai;
  ChatAgent: DurableObjectNamespace<ChatAgent>;
  CLERK_AUTHORIZED_PARTIES?: string;
  CLERK_JWT_KEY?: string;
  CLERK_SECRET_KEY?: string;
}

interface ChatState {
  authMode?: "api-token" | "clerk";
  ownerId?: string;
  timezone?: string;
  updatedAt: number;
}

interface SubmitApiMessageInput {
  authMode: "api-token" | "clerk";
  message: string;
  ownerId: string;
  timezone?: string;
}

interface PendingInteraction {
  input?: unknown;
  state?: string;
  toolCallId?: string;
  toolName?: string;
  type: string;
}

export interface SubmitApiMessageResult {
  assistantText: string;
  interactionRequired: boolean;
  messages: UIMessage[];
  pendingInteractions: PendingInteraction[];
  status: "aborted" | "completed" | "skipped";
}

export class SessionOwnerMismatchError extends Error {
  code = "SESSION_OWNER_MISMATCH" as const;

  constructor() {
    super("Session owner mismatch");
  }
}

function inlineDataUrls(messages: ModelMessage[]): ModelMessage[] {
  return messages.map((message) => {
    if (message.role !== "user" || typeof message.content === "string") {
      return message;
    }

    return {
      ...message,
      content: message.content.map((part) => {
        if (part.type !== "file" || typeof part.data !== "string") {
          return part;
        }

        const match = part.data.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return part;

        try {
          const bytes = Uint8Array.from(atob(match[2] ?? ""), (char) =>
            char.charCodeAt(0)
          );
          return { ...part, data: bytes, mediaType: match[1] };
        } catch {
          return part;
        }
      }),
    };
  });
}

function assertHttpsUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("MCP server URL is invalid");
  }

  if (parsed.protocol !== "https:" || !parsed.hostname) {
    throw new Error("MCP server URL must use HTTPS");
  }
}

function getTextFromParts(parts: UIMessage["parts"]): string {
  return parts
    .map((part) => {
      if (part.type === "text") return part.text;
      return "";
    })
    .join("")
    .trim();
}

function getLatestAssistantText(messages: UIMessage[]): string {
  const latest = [...messages].reverse().find((message) => {
    return message.role === "assistant";
  });

  return latest ? getTextFromParts(latest.parts) : "";
}

function hasReasoningParts(messages: UIMessage[]): boolean {
  return messages.some((message) => {
    return message.parts.some((part) => part.type === "reasoning");
  });
}

function stripReasoningParts(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.filter((part) => part.type !== "reasoning"),
  }));
}

function getPendingInteractions(messages: UIMessage[]): PendingInteraction[] {
  const latest = [...messages].reverse().find((message) => {
    return message.role === "assistant";
  });
  if (!latest) return [];

  return latest.parts.flatMap((part) => {
    const record = part as Record<string, unknown>;
    const type = String(record.type ?? "");
    if (type !== "tool" && !type.startsWith("tool-")) return [];

    const state = String(record.state ?? "");
    const hasOutput =
      "output" in record ||
      state === "output-available" ||
      state === "output-error";
    if (hasOutput) return [];

    if (
      state.includes("approval") ||
      state.includes("input") ||
      state === "" ||
      state === "partial-call"
    ) {
      return [
        {
          input: record.input,
          state,
          toolCallId:
            typeof record.toolCallId === "string" ? record.toolCallId : undefined,
          toolName:
            typeof record.toolName === "string"
              ? record.toolName
              : type.replace(/^tool-/, ""),
          type,
        },
      ];
    }

    return [];
  });
}

function getLocalTime(timezone: string): string {
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
  } catch {
    return new Date().toISOString();
  }
}

export class ChatAgent extends AIChatAgent<Env, ChatState> {
  initialState: ChatState = {
    updatedAt: Date.now(),
  };

  maxPersistedMessages = 100;

  onStart() {
    this.mcp.configureOAuthCallback({
      customHandler: (result) => {
        if (result.authSuccess) {
          return new Response("<script>window.close();</script>", {
            headers: { "content-type": "text/html" },
            status: 200,
          });
        }

        return new Response(
          `Authentication Failed: ${result.authError || "Unknown error"}`,
          { headers: { "content-type": "text/plain" }, status: 400 }
        );
      },
    });
  }

  @callable()
  async addServer(name: string, url: string) {
    assertHttpsUrl(url);
    return this.addMcpServer(name, url);
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  async submitApiMessage(
    input: SubmitApiMessageInput
  ): Promise<SubmitApiMessageResult> {
    const content = input.message.trim();
    if (!content) throw new Error("Message is required");
    if (content.length > 8000) throw new Error("Message is too long");

    if (this.state.ownerId && this.state.ownerId !== input.ownerId) {
      throw new SessionOwnerMismatchError();
    }

    this.setState({
      ...this.state,
      authMode: input.authMode,
      ownerId: input.ownerId,
      timezone: input.timezone?.trim() || this.state.timezone,
      updatedAt: Date.now(),
    });

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: content }],
    };

    const result = await this.saveMessages((messages) => [
      ...messages,
      userMessage,
    ]);
    const messages = hasReasoningParts(this.messages)
      ? stripReasoningParts(this.messages)
      : this.messages;

    if (messages !== this.messages) {
      await this.persistMessages(messages);
    }

    const pendingInteractions = getPendingInteractions(messages);

    this.setState({ ...this.state, updatedAt: Date.now() });

    return {
      assistantText: getLatestAssistantText(messages),
      interactionRequired: pendingInteractions.length > 0,
      messages,
      pendingInteractions,
      status: result.status,
    };
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });
    const timezone = this.state.timezone?.trim();

    const timezoneTool = timezone
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

    const result = streamText({
      model: workersai("@cf/moonshotai/kimi-k2.6", {
        sessionAffinity: this.sessionAffinity,
      }),
      system: buildSystemPrompt({
        schedulePrompt: getSchedulePrompt({ date: new Date() }),
      }),
      messages: pruneMessages({
        messages: inlineDataUrls(await convertToModelMessages(this.messages)),
        reasoning: "all",
        toolCalls: "before-last-2-messages",
      }),
      tools: {
        ...mcpTools,
        getUserTimezone: timezoneTool,
        calculate: tool({
          description:
            "Perform a math calculation with two numbers. Requires user approval for large numbers.",
          inputSchema: z.object({
            a: z.number().describe("First number"),
            b: z.number().describe("Second number"),
            operator: z
              .enum(["+", "-", "*", "/", "%"])
              .describe("Arithmetic operator"),
          }),
          needsApproval: async ({ a, b }) =>
            Math.abs(a) > 1000 || Math.abs(b) > 1000,
          execute: async ({ a, b, operator }) => {
            const operations: Record<string, (x: number, y: number) => number> =
              {
                "+": (x, y) => x + y,
                "-": (x, y) => x - y,
                "*": (x, y) => x * y,
                "/": (x, y) => x / y,
                "%": (x, y) => x % y,
              };

            if (operator === "/" && b === 0) {
              return { error: "Division by zero" };
            }

            if (operator === "%" && b === 0) {
              return { error: "Modulo by zero" };
            }

            return {
              expression: `${a} ${operator} ${b}`,
              result: operations[operator]?.(a, b),
            };
          },
        }),
        scheduleTask: tool({
          description:
            "Schedule a task to be executed later. Use this when the user asks to be reminded or wants something done later.",
          inputSchema: scheduleSchema,
          execute: async ({ when, description }) => {
            if (description.length > 500) {
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
              const existingTasks = await this.getSchedules();
              if (existingTasks.length >= 25) {
                return "Task limit reached. Cancel an existing task before scheduling another one.";
              }

              this.schedule(input, "executeTask", description, {
                idempotent: true,
              });
              return `Task scheduled: "${description}" (${when.type}: ${input})`;
            } catch (error) {
              return `Error scheduling task: ${String(error)}`;
            }
          },
        }),
        getScheduledTasks: tool({
          description: "List all tasks that have been scheduled",
          inputSchema: z.object({}),
          execute: async () => {
            const tasks = await this.getSchedules();
            return tasks.length > 0 ? tasks : "No scheduled tasks found.";
          },
        }),
        cancelScheduledTask: tool({
          description: "Cancel a scheduled task by its ID",
          inputSchema: z.object({
            taskId: z.string().describe("The ID of the task to cancel"),
          }),
          execute: async ({ taskId }) => {
            try {
              await this.cancelSchedule(taskId);
              return `Task ${taskId} cancelled.`;
            } catch (error) {
              return `Error cancelling task: ${String(error)}`;
            }
          },
        }),
      },
      stopWhen: stepCountIs(5),
      abortSignal: options?.abortSignal,
    });

    return result.toUIMessageStreamResponse({ sendReasoning: false });
  }

  async executeTask(description: string, _task: Schedule<string>) {
    console.log(`Executing scheduled task: ${description}`);

    this.broadcast(
      JSON.stringify({
        type: "scheduled-task",
        description,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
