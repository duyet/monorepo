import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import { callable, type Schedule } from "agents";
import { getSchedulePrompt } from "agents/schedule";
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import {
  getLatestAssistantText,
  getPendingInteractions,
  hasReasoningParts,
  inlineDataUrls,
  type PendingInteraction,
  stripReasoningParts,
} from "./message-parts";
import { buildSystemPrompt } from "./prompt";
import {
  calculateTool,
  cancelScheduledTaskTool,
  getScheduledTasksTool,
  scheduleTaskTool,
  type ScheduleHandle,
  timezoneTool,
} from "./tools";

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

export interface SubmitApiMessageResult {
  assistantText: string;
  interactionRequired: boolean;
  messages: UIMessage[];
  pendingInteractions: PendingInteraction[];
  status: "aborted" | "completed" | "error" | "skipped";
}

export class SessionOwnerMismatchError extends Error {
  code = "SESSION_OWNER_MISMATCH" as const;

  constructor() {
    super("Session owner mismatch");
  }
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

  /** Tool-facing view of the agent's schedule API. */
  private get scheduleHandle(): ScheduleHandle {
    return {
      cancelSchedule: (taskId) => this.cancelSchedule(taskId),
      getSchedules: () => this.getSchedules(),
      schedule: (input, description) =>
        this.schedule(input, "executeTask", description, { idempotent: true }),
    };
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });
    const schedules = this.scheduleHandle;

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
        getUserTimezone: timezoneTool(this.state.timezone?.trim()),
        calculate: calculateTool(),
        scheduleTask: scheduleTaskTool(schedules),
        getScheduledTasks: getScheduledTasksTool(schedules),
        cancelScheduledTask: cancelScheduledTaskTool(schedules),
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
