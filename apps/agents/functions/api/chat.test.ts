import { describe, test, expect, mock, beforeEach } from "bun:test";

/**
 * Tests for the Chat API Pages Function.
 *
 * Since the function uses AI SDK's streamText + workers-ai-provider,
 * we test the request validation and error handling paths.
 * The actual AI streaming is mocked since it requires a real Cloudflare AI binding.
 */

// Capture tools passed to streamText for assertion
let lastStreamTextArgs: any = null;

// Mock AI SDK modules before importing the function
mock.module("ai", () => ({
  streamText: mock((args: any) => {
    lastStreamTextArgs = args;
    return {
      toUIMessageStreamResponse: () =>
        new Response("data: test-stream\n\n", {
          headers: { "Content-Type": "text/event-stream" },
        }),
    };
  }),
  tool: (config: any) => config,
  convertToModelMessages: mock((msgs: any[]) =>
    msgs.map((m: any) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : m.parts?.[0]?.text || "",
    }))
  ),
}));

mock.module("workers-ai-provider", () => ({
  createWorkersAI: mock((_opts: any) => (_modelId: string) => ({
    modelId: _modelId,
    provider: "workers-ai",
  })),
}));

// Now import the function
const chatModule = await import("./chat");
const onRequestPost = chatModule.onRequestPost;

function makeContext(body: any, env: Record<string, any> = {}): any {
  return {
    request: new Request("https://agents.duyet.net/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    env: {
      AI: env.AI ?? { run: mock(() => Promise.resolve({ response: "test" })) },
      ...env,
    },
  };
}

describe("Chat API — onRequestPost", () => {
  test("returns 500 when AI binding is missing", async () => {
    const ctx = makeContext(
      { messages: [], mode: "fast" },
      { AI: undefined }
    );

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("AI binding");
  });

  test("returns streaming response in fast mode", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      ],
      mode: "fast",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
  });

  test("returns streaming response in agent mode", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Search blog about Spark" }] },
      ],
      mode: "agent",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });

  test("defaults to agent mode when mode not specified", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Hi" }] },
      ],
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });

  test("returns 500 on malformed request body", async () => {
    const ctx = {
      request: new Request("https://agents.duyet.net/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
      env: { AI: { run: mock(() => Promise.resolve({})) } },
    };

    const response = await onRequestPost(ctx as any);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toContain("Failed to process");
  });

  test("getGitHub tool has needsApproval set to true", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Show GitHub" }] },
      ],
      mode: "agent",
    });

    await onRequestPost(ctx);
    expect(lastStreamTextArgs.tools.getGitHub.needsApproval).toBe(true);
  });

  test("getAnalytics tool has needsApproval set to true", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Show analytics" }] },
      ],
      mode: "agent",
    });

    await onRequestPost(ctx);
    expect(lastStreamTextArgs.tools.getAnalytics.needsApproval).toBe(true);
  });

  test("searchBlog tool does not have needsApproval", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Search blog" }] },
      ],
      mode: "agent",
    });

    await onRequestPost(ctx);
    expect(lastStreamTextArgs.tools.searchBlog.needsApproval).toBeUndefined();
  });

  test("fast mode does not include tools", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      ],
      mode: "fast",
    });

    await onRequestPost(ctx);
    expect(lastStreamTextArgs.tools).toBeUndefined();
  });
});
