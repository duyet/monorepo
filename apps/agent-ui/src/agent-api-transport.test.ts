import type { UIMessage, UIMessageChunk } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentApiTransport } from "./agent-api-transport";

function userMessage(text: string): UIMessage {
  return {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text }],
  };
}

async function collectText(stream: ReadableStream<UIMessageChunk>): Promise<string> {
  const reader = stream.getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value.type === "text-delta") text += value.delta;
  }
  return text;
}

describe("AgentApiTransport.sendMessages", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("POSTs /api/v1/chat and maps assistantText into the UI message stream", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe("https://agents.duyet.net/api/v1/chat");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toMatchObject({
        Authorization: "Bearer clerk-token",
        "Content-Type": "application/json",
      });
      expect(JSON.parse(String(init?.body))).toEqual({
        message: "What is Duyet working on?",
        sessionId: "web-session-1",
        timezone: "UTC",
      });
      return new Response(
        JSON.stringify({ ok: true, assistantText: "Shipping **agents**." }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const transport = new AgentApiTransport({
      apiUrl: "https://agents.duyet.net",
      getSessionId: () => "web-session-1",
      getTimezone: () => "UTC",
      getToken: async () => "clerk-token",
    });

    const stream = await transport.sendMessages({
      trigger: "submit-message",
      chatId: "web-session-1",
      messageId: undefined,
      abortSignal: undefined,
      messages: [userMessage("What is Duyet working on?")],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(collectText(stream)).resolves.toBe("Shipping **agents**.");
  });

  it("fails closed when there is no auth token", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const transport = new AgentApiTransport({
      apiUrl: "https://agents.duyet.net",
      getSessionId: () => "web-session-1",
      getTimezone: () => "UTC",
      getToken: async () => null,
    });

    await expect(
      transport.sendMessages({
        trigger: "submit-message",
        chatId: "web-session-1",
        messageId: undefined,
        abortSignal: undefined,
        messages: [userMessage("hello")],
      }),
    ).rejects.toThrow(/sign in/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
