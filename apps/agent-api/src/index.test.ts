import { describe, expect, test } from "bun:test";
import type { AuthContext } from "./auth";
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
