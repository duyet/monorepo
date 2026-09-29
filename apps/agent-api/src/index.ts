import { getAgentByName, routeAgentRequest } from "agents";
import { z } from "zod";
import {
  authenticateRequest,
  getScopedSessionName,
  normalizeSessionPart,
  type AuthContext,
} from "./auth";
import {
  ChatAgent,
  SessionOwnerMismatchError,
  type Env,
  type SubmitApiMessageResult,
} from "./agent";
import { createHttp, type Http } from "./http";
import { toPublicMessageMetadata } from "./public-messages";
import { applyIpRateLimit } from "./rate-limit";
import { scopedAgentRequest } from "./routing";

export { ChatAgent };
export type { Env };

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  sessionId: z.string().trim().min(1).max(128).optional(),
  timezone: z.string().trim().min(1).max(128).optional(),
});

function apiInfo() {
  return {
    name: "duyet agents API",
    version: "0.1.0",
    status: "healthy",
    endpoints: {
      health: "/health",
      chat: "/api/v1/chat",
      nativeAgent: "/agents/chat-agent/:sessionId",
      nativeAgentAlias: "/agents/ChatAgent/:sessionId",
      llms: "/llms.txt",
    },
    auth: {
      chat: "Clerk session bearer token or AGENT_API_TOKEN bearer token",
      metadata: "public",
    },
  };
}

function llmsText(): string {
  return [
    "# duyet agents API",
    "",
    "API-only Cloudflare Agents Worker for duyet.net.",
    "",
    "## Endpoints",
    "- GET /health",
    "- POST /api/v1/chat",
    "- /agents/chat-agent/:sessionId",
    "- /agents/ChatAgent/:sessionId",
    "",
    "## Auth",
    "Use Authorization: Bearer <Clerk session token> from monorepo apps, or Authorization: Bearer <AGENT_API_TOKEN> for server-to-server calls.",
  ].join("\n");
}

function getApiSessionId(
  auth: AuthContext,
  requestedSessionId?: string
): string {
  if (auth.mode === "api-token") {
    return normalizeSessionPart(requestedSessionId ?? "");
  }

  return normalizeSessionPart(requestedSessionId ?? "default");
}

function hasSubmitApiMessage(agent: unknown): agent is {
  submitApiMessage: (input: {
    authMode: AuthContext["mode"];
    message: string;
    ownerId: string;
    timezone?: string;
  }) => Promise<SubmitApiMessageResult>;
} {
  return (
    typeof agent === "object" &&
    agent !== null &&
    "submitApiMessage" in agent &&
    typeof agent.submitApiMessage === "function"
  );
}

function isSessionOwnerMismatchError(error: unknown): boolean {
  return (
    error instanceof SessionOwnerMismatchError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "SESSION_OWNER_MISMATCH")
  );
}

async function handleChat(
  request: Request,
  env: Env,
  http: Http,
  auth: AuthContext
) {
  const parsed = chatRequestSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return http.json(
      {
        error: "Invalid request body",
        issues: parsed.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      },
      400
    );
  }

  if (auth.mode === "api-token" && !parsed.data.sessionId) {
    return http.json(
      { error: "sessionId is required for AGENT_API_TOKEN requests" },
      400
    );
  }

  const sessionId = getApiSessionId(auth, parsed.data.sessionId);
  const agentSessionId = getScopedSessionName(auth, sessionId);
  const agent: unknown = await getAgentByName(env.ChatAgent, agentSessionId);
  if (!hasSubmitApiMessage(agent)) {
    return http.json({ error: "Agent request failed" }, 500);
  }

  try {
    const result = await agent.submitApiMessage({
      authMode: auth.mode,
      message: parsed.data.message,
      ownerId: auth.ownerId,
      timezone: parsed.data.timezone,
    });

    return http.json({
      ok: true,
      authMode: auth.mode,
      sessionId,
      agentSessionId,
      status: result.interactionRequired
        ? "interaction_required"
        : result.status,
      assistantText: result.assistantText,
      interactionRequired: result.interactionRequired,
      pendingInteractions: result.pendingInteractions,
      messages: toPublicMessageMetadata(result.messages),
    });
  } catch (error) {
    const status = isSessionOwnerMismatchError(error) ? 403 : 500;
    return http.json(
      { error: status === 403 ? "Forbidden" : "Agent request failed" },
      status
    );
  }
}

async function requireAuth(
  request: Request,
  env: Env,
  http: Http
): Promise<AuthContext | Response> {
  const auth = await authenticateRequest(request, env);
  if (auth) return auth;

  return http.json(
    {
      error: "Unauthorized. Provide a Clerk session token or AGENT_API_TOKEN.",
    },
    401
  );
}

export async function handleRequest(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return createHttp(request, env).preflight();
  }

  const http = createHttp(request, env);
  const url = new URL(request.url);

  if (
    request.method === "GET" &&
    (url.pathname === "/" || url.pathname === "/agents")
  ) {
    return http.json(apiInfo());
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return http.json({ ok: true, service: "duyet-agents-api" });
  }

  if (request.method === "GET" && url.pathname === "/llms.txt") {
    return http.text(llmsText());
  }

  if (request.method === "POST" && url.pathname === "/api/v1/chat") {
    const rateLimit = applyIpRateLimit(request, env, "chat");
    if (!rateLimit.allowed) return rateLimit.response;

    const auth = await requireAuth(request, env, http);
    if (auth instanceof Response) {
      return http.withRateLimitHeaders(auth, rateLimit.headers);
    }
    return http.withRateLimitHeaders(
      await handleChat(request, env, http, auth),
      rateLimit.headers
    );
  }

  if (url.pathname.startsWith("/agents/")) {
    const rateLimit = applyIpRateLimit(request, env, "agents");
    if (!rateLimit.allowed) return rateLimit.response;

    const auth = await requireAuth(request, env, http);
    if (auth instanceof Response) {
      return http.withRateLimitHeaders(auth, rateLimit.headers);
    }

    const scopedRequest = scopedAgentRequest(request, auth);
    if (!scopedRequest) {
      return http.withRateLimitHeaders(
        http.json({ error: "Unknown agent route" }, 404),
        rateLimit.headers
      );
    }

    const routed = await routeAgentRequest(scopedRequest, env);
    return http.withRateLimitHeaders(
      routed ? http.withCors(routed) : http.json({ error: "Not Found" }, 404),
      rateLimit.headers
    );
  }

  return http.json({ error: "Not Found" }, 404);
}

export default {
  fetch(request: Request, env: Env) {
    return handleRequest(request, env);
  },
} satisfies ExportedHandler<Env>;
