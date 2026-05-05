import { getAgentByName, routeAgentRequest } from "agents";
import { ChatAgent } from "./agents/chat-agent";
import { getUserFromRequest } from "./lib/auth";
import { getConversationWithMessages, listConversationsByUser } from "./lib/repository";

interface Env {
  AI: Ai;
  DB: D1Database;
  ChatAgent: DurableObjectNamespace<ChatAgent>;
  CLERK_ISSUER_URL?: string;
  AI_GATEWAY?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

async function handleCompatChat(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env.CLERK_ISSUER_URL);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    sessionId?: string;
    conversationId?: string;
    title?: string;
  };

  const text = body.message?.trim();
  if (!text) return json({ error: "message is required" }, 400);

  const sessionId = body.sessionId?.trim() || `home-${user.userId}`;
  const conversationId = body.conversationId?.trim() || crypto.randomUUID();

  const agent = await getAgentByName(env.ChatAgent, sessionId);
  await agent.setSession({ userId: user.userId, conversationId, title: body.title });
  const result = await agent.submitMessage({ userId: user.userId, text });

  return json({
    sessionId,
    conversationId: result.conversationId,
    assistantText: result.assistantText,
  });
}

async function handleConversations(request: Request, env: Env): Promise<Response> {
  const user = await getUserFromRequest(request, env.CLERK_ISSUER_URL);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    const data = await getConversationWithMessages(env.DB, id, user.userId);
    if (!data.conversation) return json({ error: "Not found" }, 404);
    return json(data);
  }

  const conversations = await listConversationsByUser(env.DB, user.userId);
  return json({ conversations });
}

export { ChatAgent };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return json({}, 204);

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json({ ok: true, service: "duyet-agents" });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleCompatChat(request, env);
    }

    if (url.pathname === "/api/conversations" && request.method === "GET") {
      return handleConversations(request, env);
    }

    const routed = await routeAgentRequest(request, env);
    if (routed) return routed;

    return json({ error: "Not Found" }, 404);
  },
};
