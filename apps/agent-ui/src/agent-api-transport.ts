import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

export interface AgentChatResponse {
  assistantText?: string;
  authMode?: "api-token" | "clerk";
  error?: string;
  interactionRequired?: boolean;
  messages?: unknown[];
  ok?: boolean;
  pendingInteractions?: unknown[];
  sessionId?: string;
  status?: string;
}

export interface AgentApiTransportOptions {
  apiUrl: string;
  getSessionId: () => string;
  getTimezone: () => string;
  getToken: () => Promise<string | null>;
  onResponse?: (response: AgentChatResponse) => void;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${path}`;
}

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function latestUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "user") {
      return messageText(message);
    }
  }

  return "";
}

async function responseError(response: Response): Promise<Error> {
  const body = await response.text();

  if (!body) {
    return new Error(`Agent API request failed with ${response.status}`);
  }

  try {
    const parsed = JSON.parse(body) as { error?: string };
    return new Error(parsed.error ?? body);
  } catch {
    return new Error(body);
  }
}

function textToUiMessageStream(text: string): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start" });
      controller.enqueue({ type: "start-step" });
      controller.enqueue({ id: "text-1", type: "text-start" });
      controller.enqueue({
        delta: text || "No response.",
        id: "text-1",
        type: "text-delta",
      });
      controller.enqueue({ id: "text-1", type: "text-end" });
      controller.enqueue({ type: "finish-step" });
      controller.enqueue({ finishReason: "stop", type: "finish" });
      controller.close();
    },
  });
}

export class AgentApiTransport implements ChatTransport<UIMessage> {
  private readonly apiUrl: string;
  private readonly getSessionId: () => string;
  private readonly getTimezone: () => string;
  private readonly getToken: () => Promise<string | null>;
  private readonly onResponse?: (response: AgentChatResponse) => void;

  constructor(options: AgentApiTransportOptions) {
    this.apiUrl = options.apiUrl;
    this.getSessionId = options.getSessionId;
    this.getTimezone = options.getTimezone;
    this.getToken = options.getToken;
    this.onResponse = options.onResponse;
  }

  async sendMessages({
    abortSignal,
    messages,
  }: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const token = await this.getToken();
    if (!token) {
      throw new Error("Sign in again before sending a message.");
    }

    const message = latestUserText(messages);
    if (!message) {
      throw new Error("Message is empty.");
    }

    const response = await fetch(joinUrl(this.apiUrl, "/api/v1/chat"), {
      body: JSON.stringify({
        message,
        sessionId: this.getSessionId(),
        timezone: this.getTimezone(),
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: abortSignal,
    });

    if (!response.ok) {
      throw await responseError(response);
    }

    const payload = (await response.json()) as AgentChatResponse;
    this.onResponse?.(payload);

    return textToUiMessageStream(payload.assistantText ?? "");
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}
