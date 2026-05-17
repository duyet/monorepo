import { describe, expect, test } from "bun:test";
import type { AuthContext } from "./auth";
import { toPublicMessageMetadata } from "./public-messages";
import { scopedAgentRequest } from "./routing";

const auth: AuthContext = {
  mode: "clerk",
  ownerId: "user_123",
  subject: "user_123",
};

describe("scopedAgentRequest", () => {
  test("accepts Cloudflare Agents kebab-case routing", () => {
    const request = new Request("https://agents.duyet.net/agents/chat-agent/main");
    const scoped = scopedAgentRequest(request, auth);

    expect(scoped).not.toBeNull();
    expect(new URL(scoped?.url ?? "").pathname).toBe(
      "/agents/chat-agent/clerk-user_123-main"
    );
  });

  test("keeps the documented ChatAgent route as an alias", () => {
    const request = new Request("https://agents.duyet.net/agents/ChatAgent/main");
    const scoped = scopedAgentRequest(request, auth);

    expect(scoped).not.toBeNull();
    expect(new URL(scoped?.url ?? "").pathname).toBe(
      "/agents/chat-agent/clerk-user_123-main"
    );
  });

  test("rejects unknown native agent classes", () => {
    const request = new Request("https://agents.duyet.net/agents/Other/main");

    expect(scopedAgentRequest(request, auth)).toBeNull();
  });
});

describe("toPublicMessageMetadata", () => {
  test("strips reasoning and non-text parts from public messages", () => {
    const messages = [
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          { type: "reasoning", text: "hidden chain of thought" },
          { type: "text", text: "Visible answer." },
          { state: "output-available", type: "tool-getUserTimezone" },
        ],
      },
    ];

    const metadata = toPublicMessageMetadata(messages as Parameters<
      typeof toPublicMessageMetadata
    >[0]);

    expect(metadata).toEqual([
      { id: "assistant-1", role: "assistant", text: "Visible answer." },
    ]);
    expect(JSON.stringify(metadata)).not.toContain("hidden chain of thought");
    expect(JSON.stringify(metadata)).not.toContain("tool-getUserTimezone");
  });
});
