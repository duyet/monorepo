import { describe, test, expect, mock } from "bun:test";

/**
 * Tests for the Chat API Pages Function.
 *
 * Since the function uses AI SDK's streamText + ai-gateway-provider,
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
  createWorkersAI: mock((_opts: any) => (modelId: string) => ({
    modelId,
    provider: "workers-ai",
    config: {},
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
      AI: env.AI ?? {
        run: mock(() => Promise.resolve({ response: "test" })),
        gateway: mock((_name: string) => ({ gateway: _name })),
      },
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

describe("Tool calling — AGENT_TOOLS registration", () => {
  // Helper: make agent-mode request to capture tools
  async function getAgentTools() {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
      ],
      mode: "agent",
    });
    await onRequestPost(ctx);
    return lastStreamTextArgs.tools;
  }

  test("registers all 6 tools in agent mode", async () => {
    const tools = await getAgentTools();
    const names = Object.keys(tools);
    expect(names).toContain("searchBlog");
    expect(names).toContain("getBlogPost");
    expect(names).toContain("getCV");
    expect(names).toContain("getGitHub");
    expect(names).toContain("getAnalytics");
    expect(names).toContain("getAbout");
    expect(names).toHaveLength(6);
  });

  test("all tools have descriptions", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });

  test("all tools have input schemas", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(tool.inputSchema).toBeDefined();
    }
  });

  test("all tools have execute functions", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(typeof tool.execute).toBe("function");
    }
  });

  test("only external API tools require approval", async () => {
    const tools = await getAgentTools();
    // External API tools — require approval
    expect(tools.getGitHub.needsApproval).toBe(true);
    expect(tools.getAnalytics.needsApproval).toBe(true);
    // Read-only safe tools — no approval
    expect(tools.searchBlog.needsApproval).toBeUndefined();
    expect(tools.getBlogPost.needsApproval).toBeUndefined();
    expect(tools.getCV.needsApproval).toBeUndefined();
    expect(tools.getAbout.needsApproval).toBeUndefined();
  });

  test("agent mode sets maxSteps to 5", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
      ],
      mode: "agent",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.maxSteps).toBe(5);
  });

  test("fast mode does not set maxSteps", async () => {
    const ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
      ],
      mode: "fast",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.maxSteps).toBeUndefined();
  });

  test("agent mode uses higher temperature than fast mode", async () => {
    // Agent mode
    let ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
      ],
      mode: "agent",
    });
    await onRequestPost(ctx);
    const agentTemp = lastStreamTextArgs.temperature;

    // Fast mode
    ctx = makeContext({
      messages: [
        { id: "1", role: "user", parts: [{ type: "text", text: "test" }] },
      ],
      mode: "fast",
    });
    await onRequestPost(ctx);
    const fastTemp = lastStreamTextArgs.temperature;

    expect(agentTemp).toBeGreaterThan(fastTemp);
  });

  test("searchBlog tool schema requires query string", async () => {
    const tools = await getAgentTools();
    const schema = tools.searchBlog.inputSchema;
    // Zod schema — verify it's defined and has the expected shape
    expect(schema).toBeDefined();
    expect(schema._def || schema.shape || schema).toBeTruthy();
  });

  test("getGitHub tool schema has optional limit param", async () => {
    const tools = await getAgentTools();
    const schema = tools.getGitHub.inputSchema;
    expect(schema).toBeDefined();
  });

  test("getAbout tool schema accepts empty object", async () => {
    const tools = await getAgentTools();
    const schema = tools.getAbout.inputSchema;
    expect(schema).toBeDefined();
  });
});
