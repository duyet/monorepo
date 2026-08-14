import { describe, expect, it } from "vitest";
import { handleThreadsRequest, type ThreadsEnv } from "./threads-api";

const TOKEN = "assistant-secret";

function makeEnv(overrides: Partial<ThreadsEnv> = {}): ThreadsEnv {
  return {
    ASSISTANT_API_TOKEN: TOKEN,
    THREAD_STORE: {
      get: () => ({}),
      idFromName: (name: string) => name,
    },
    ...overrides,
  };
}

function threadRequest(path: string, init: RequestInit = {}): Request {
  return new Request(`https://agent-assistant.duyet.net${path}`, init);
}

describe("handleThreadsRequest", () => {
  it("returns 401 without a token before touching thread storage", async () => {
    let storeUsed = false;
    const response = await handleThreadsRequest(
      threadRequest("/api/threads", { method: "POST" }),
      "POST",
      "threads",
      makeEnv({
        THREAD_STORE: {
          get: () => {
            storeUsed = true;
            return {};
          },
          idFromName: (name: string) => {
            storeUsed = true;
            return name;
          },
        },
      })
    );

    expect(response.status).toBe(401);
    expect(storeUsed).toBe(false);
  });

  it("returns 401 for a bad token", async () => {
    const response = await handleThreadsRequest(
      threadRequest("/api/threads", {
        headers: { Authorization: "Bearer wrong" },
        method: "POST",
      }),
      "POST",
      "threads",
      makeEnv()
    );
    expect(response.status).toBe(401);
  });

  it("creates a thread with a valid token", async () => {
    const response = await handleThreadsRequest(
      threadRequest("/api/threads", {
        headers: { Authorization: `Bearer ${TOKEN}` },
        method: "POST",
      }),
      "POST",
      "threads",
      makeEnv()
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { thread_id?: string };
    expect(body.thread_id).toEqual(expect.any(String));
  });

  it("rejects unauthenticated stream runs", async () => {
    const response = await handleThreadsRequest(
      threadRequest("/api/threads/abc/runs/stream", {
        body: JSON.stringify({ input: {} }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      "POST",
      "threads/abc/runs/stream",
      makeEnv()
    );
    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated state reads", async () => {
    const response = await handleThreadsRequest(
      threadRequest("/api/threads/abc/state"),
      "GET",
      "threads/abc/state",
      makeEnv()
    );
    expect(response.status).toBe(401);
  });

  it("loads the shipped backend graph when reading thread state", async () => {
    const { getCompiledGraph } = await import("../../backend/agent");
    expect(typeof getCompiledGraph).toBe("function");

    const response = await handleThreadsRequest(
      threadRequest("/api/threads/abc/state", {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }),
      "GET",
      "threads/abc/state",
      makeEnv()
    );

    const body = (await response.json()) as { error?: string };
    expect(body.error ?? "").not.toMatch(/Cannot find module|Failed to resolve/);
    expect(response.status).not.toBe(401);
  });
});
