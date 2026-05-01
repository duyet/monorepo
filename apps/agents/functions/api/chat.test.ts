import { describe, test, expect, mock } from "bun:test";

/**
 * Tests for the Chat API Pages Function.
 *
 * The function uses AI SDK v6 createUIMessageStream + streamText with Workers AI.
 * We mock the AI SDK, provider, auth, and database modules to test request
 * validation, rate limiting, and tool registration paths.
 */

// Capture tools passed to streamText for assertion
let lastStreamTextArgs: any = null;

// Mock AI SDK modules before importing the function
mock.module("ai", () => ({
  streamText: mock((args: any) => {
    lastStreamTextArgs = args;
    return {
      toUIMessageStream: () => new ReadableStream(),
    };
  }),
  createUIMessageStream: mock(({ execute }: any) => {
    if (execute)
      execute({ writer: { merge: mock(() => {}) } });
    return new ReadableStream();
  }),
  createUIMessageStreamResponse: mock((_opts: any) =>
    new Response("data: test-stream\n\n", {
      headers: { "Content-Type": "text/event-stream" },
    })
  ),
  tool: (config: any) => config,
  convertToModelMessages: mock((msgs: any[]) =>
    msgs.map((m: any) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : m.parts?.[0]?.text || "",
    }))
  ),
  stepCountIs: mock((n: number) => ({ type: "stepCount", stepCount: n })),
  pruneMessages: mock(({ messages }: any) => messages),
}));

mock.module("workers-ai-provider", () => ({
  createWorkersAI: mock(() => ({
    chat: mock((model: string) => ({
      modelId: model,
      provider: "workersai.chat",
    })),
  })),
}));

// Track mock auth state for tests
let mockAuthUser: { userId: string } | null = null;

mock.module("../../lib/auth", () => ({
  getUserFromRequest: mock(() => Promise.resolve(mockAuthUser)),
  getClientIp: mock(() => "127.0.0.1"),
  hashIp: mock(() => Promise.resolve("mock-ip-hash")),
}));

// Track mock DB state
let mockRateLimitResult: { allowed: boolean; remaining: number; total: number } | null = null;
let mockConversationExists = false;

mock.module("../../lib/db/client", () => ({
  createDatabaseClient: mock(() => ({
    consumeRateLimit: mock(() => Promise.resolve(mockRateLimitResult)),
    getConversation: mock(() => Promise.resolve(mockConversationExists ? { id: "test" } : null)),
    createConversation: mock(() => Promise.resolve()),
  })),
}));

// Now import the function
const chatModule = await import("./chat");
const onRequestPost = chatModule.onRequestPost;

function makeContext(body: any, env: Record<string, any> = {}, headers: Record<string, string> = {}): any {
  return {
    request: new Request("https://agents.duyet.net/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    env: {
      AI: { run: mock(() => Promise.resolve({ response: "ok" })) },
      CF_AIG_GATEWAY_ID: "monorepo",
      ...env,
    },
  };
}

describe("Chat API — onRequestPost", () => {
  test("returns streaming response in fast mode", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: { id: "msg-1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      mode: "fast",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
  });

  test("returns streaming response in agent mode", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "Search blog about Spark" }],
      },
      mode: "agent",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });

  test("defaults to agent mode when mode not specified", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "Hi" }],
      },
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });

  test("returns 400 on malformed JSON", async () => {
    const ctx = {
      request: new Request("https://agents.duyet.net/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
      env: { AI: { run: mock(() => Promise.resolve({ response: "ok" })) } },
    };

    const response = await onRequestPost(ctx as any);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Invalid request body");
  });

  test("returns 400 when neither message nor messages provided", async () => {
    const ctx = makeContext({
      id: "conv-1",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("message or messages is required");
  });

  test("accepts tool approval flow with messages array", async () => {
    // Tool approval flow sends raw messages array (bypasses per-message schema)
    const ctx = makeContext({
      id: "conv-1",
      messages: [
        { id: "msg-1", role: "user", parts: [{ type: "text", text: "Show GitHub" }] },
        { id: "msg-2", role: "assistant", parts: [{}] },
      ],
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });
});

describe("Tool calling — AGENT_TOOLS registration", () => {
  // Helper: make agent-mode request to capture tools
  async function getAgentTools() {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "agent",
    });
    await onRequestPost(ctx);
    return lastStreamTextArgs.tools;
  }

  test("registers all 7 tools in agent mode", async () => {
    const tools = await getAgentTools();
    const names = Object.keys(tools);
    expect(names).toContain("searchBlog");
    expect(names).toContain("getBlogPost");
    expect(names).toContain("getCV");
    expect(names).toContain("getGitHub");
    expect(names).toContain("getAnalytics");
    expect(names).toContain("getAbout");
    expect(names).toContain("fetchLlmsTxt");
    expect(names).toHaveLength(7);
  });

  test("all tools have descriptions", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(tool.description).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(10);
    }
  });

  test("all tools have parameter schemas", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(tool.parameters).toBeDefined();
    }
  });

  test("all tools have execute functions", async () => {
    const tools = await getAgentTools();
    for (const [, tool] of Object.entries(tools) as [string, any][]) {
      expect(typeof tool.execute).toBe("function");
    }
  });

  test("agent mode sets stopWhen with stepCountIs(5)", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "agent",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.stopWhen).toEqual({ type: "stepCount", stepCount: 5 });
  });

  test("agent mode sets toolChoice to auto", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "agent",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.toolChoice).toBe("auto");
  });

  test("fast mode does not set tools", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "fast",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.tools).toBeUndefined();
  });

  test("fast mode does not set stopWhen", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "fast",
    });
    await onRequestPost(ctx);
    expect(lastStreamTextArgs.stopWhen).toBeUndefined();
  });

  test("agent mode uses higher temperature than fast mode", async () => {
    // Agent mode
    let ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "agent",
    });
    await onRequestPost(ctx);
    const agentTemp = lastStreamTextArgs.temperature;

    // Fast mode
    ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "test" }],
      },
      mode: "fast",
    });
    await onRequestPost(ctx);
    const fastTemp = lastStreamTextArgs.temperature;

    expect(agentTemp).toBeGreaterThan(fastTemp);
  });
});

describe("Rate limiting — unauthenticated users", () => {
  test("returns 429 when rate limit exceeded for anonymous user", async () => {
    mockRateLimitResult = { allowed: false, remaining: 0, total: 10 };
    mockAuthUser = null;

    const ctx = makeContext(
      {
        id: "conv-1",
        message: {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hi" }],
        },
        mode: "fast",
      },
      { DB: {} }
    );

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(429);
    const json = await response.json();
    expect(json.error).toContain("Rate limit");
    expect(json.limit).toBe(10);

    // Verify rate-limit response headers
    expect(response.headers.get("Retry-After")).toBe("86400");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

    mockRateLimitResult = null;
  });

  test("allows request when under rate limit for anonymous user", async () => {
    mockRateLimitResult = { allowed: true, remaining: 5, total: 10 };
    mockAuthUser = null;

    const ctx = makeContext(
      {
        id: "conv-1",
        message: {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hi" }],
        },
        mode: "fast",
      },
      { DB: {} }
    );

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    mockRateLimitResult = null;
  });

  test("authenticated users bypass rate limiting", async () => {
    mockAuthUser = { userId: "user_123" };
    mockRateLimitResult = null;

    const ctx = makeContext(
      {
        id: "conv-1",
        message: {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hi" }],
        },
        mode: "fast",
      },
      { DB: {} },
      { Authorization: "Bearer mock-token" }
    );

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    mockAuthUser = null;
  });

  test("works without DB binding (no rate limiting applied)", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "Hi" }],
      },
      mode: "fast",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });
});

describe("Authentication — user extraction", () => {
  test("logs anonymous user when no auth header", async () => {
    const ctx = makeContext({
      id: "conv-1",
      message: {
        id: "msg-1",
        role: "user",
        parts: [{ type: "text", text: "Hi" }],
      },
      mode: "fast",
    });

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
  });

  test("extracts user from valid JWT auth header", async () => {
    mockAuthUser = { userId: "user_456" };
    const ctx = makeContext(
      {
        id: "conv-1",
        message: {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Hi" }],
        },
        mode: "fast",
      },
      {},
      { Authorization: "Bearer mock-token" }
    );

    const response = await onRequestPost(ctx);
    expect(response.status).toBe(200);
    mockAuthUser = null;
  });
});
