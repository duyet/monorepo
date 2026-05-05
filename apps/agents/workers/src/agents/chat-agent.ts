import { AIChatAgent } from "@cloudflare/ai-chat";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { addMessage, addSession, ensureConversation } from "../lib/repository";
import { buildPatternHint, detectPattern } from "./patterns";
import { baseTools } from "./tools";

export interface ChatState {
  conversationId: string;
  userId: string;
  title: string;
  mode: "fast" | "agent";
  updatedAt: number;
}

function getText(parts: UIMessage["parts"]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n")
    .trim();
}

export class ChatAgent extends AIChatAgent<any, ChatState> {
  initialState: ChatState = {
    conversationId: "",
    userId: "",
    title: "New chat",
    mode: "agent",
    updatedAt: Date.now(),
  };

  chatRecovery = true;

  async onChatMessage() {
    const env = (this as any).env as { AI: Ai; AI_GATEWAY?: string };

    const lastUserMessage = [...this.messages].reverse().find((m) => m.role === "user");
    const lastUserText = lastUserMessage ? getText(lastUserMessage.parts) : "";
    const pattern = detectPattern(lastUserText);

    const workersai = createWorkersAI({
      binding: env.AI,
      gateway: env.AI_GATEWAY ?? "monorepo",
    });

    const modelId =
      this.state.mode === "fast"
        ? "@cf/meta/llama-3.1-8b-instruct-fast"
        : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

    const model = workersai(modelId, {
      sessionAffinity: this.sessionAffinity,
    });

    const result = streamText({
      model,
      messages: await convertToModelMessages(this.messages),
      system: [
        "You are duyetbot for agents.duyet.net.",
        "Keep responses practical and concise.",
        buildPatternHint(pattern),
      ].join("\n"),
      tools: baseTools,
    });

    return result.toUIMessageStreamResponse();
  }

  async setSession(input: {
    userId: string;
    conversationId: string;
    title?: string;
    mode?: "fast" | "agent";
  }) {
    const env = (this as any).env as { DB: D1Database };
    const title = input.title?.trim() || "New chat";

    this.setState({
      ...this.state,
      userId: input.userId,
      conversationId: input.conversationId,
      title,
      mode: input.mode ?? "agent",
      updatedAt: Date.now(),
    });

    await ensureConversation(env.DB, input.conversationId, input.userId, title);
    await addSession(env.DB, this.name, input.userId, input.conversationId);

    return { ok: true };
  }

  async submitMessage(input: { userId: string; text: string }) {
    const env = (this as any).env as { DB: D1Database };
    const content = input.text.trim();
    if (!content) throw new Error("Message text is required");
    if (!this.state.conversationId || this.state.userId !== input.userId) {
      throw new Error("Session not initialized for this user");
    }

    const userMessage: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: content }],
    };

    await this.saveMessages((messages) => [...messages, userMessage]);

    const lastAssistant = [...this.messages].reverse().find((m) => m.role === "assistant");
    const assistantText = lastAssistant ? getText(lastAssistant.parts) : "";

    await addMessage(env.DB, {
      id: userMessage.id,
      conversationId: this.state.conversationId,
      role: "user",
      text: content,
      createdAt: Date.now(),
    });

    if (lastAssistant?.id) {
      await addMessage(env.DB, {
        id: lastAssistant.id,
        conversationId: this.state.conversationId,
        role: "assistant",
        text: assistantText,
        createdAt: Date.now(),
      });
    }

    this.setState({ ...this.state, updatedAt: Date.now() });

    return {
      conversationId: this.state.conversationId,
      assistantText,
      messages: this.messages,
    };
  }

  async getSnapshot(input: { userId: string }) {
    if (this.state.userId !== input.userId) throw new Error("Forbidden");

    return {
      conversationId: this.state.conversationId,
      title: this.state.title,
      messages: this.messages,
      updatedAt: this.state.updatedAt,
    };
  }
}
