import { getAgentByName, routeAgentRequest } from "agents";
import { z } from "zod";
import {
  authenticateRequest,
  getAuthorizedParties,
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

export { ChatAgent };
export type { Env };

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  sessionId: z.string().trim().min(1).max(128).optional(),
  timezone: z.string().trim().min(1).max(128).optional(),
});

function allowedOrigins(env: Env): string[] {
  return getAuthorizedParties(env);
}

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  return allowedOrigins(env).includes(origin) ? origin : null;
}

function withCors(request: Request, env: Env, response: Response): Response {
  if (response.status === 101) return response;

  const origin = getCorsOrigin(request, env);
  const headers = new Headers(response.headers);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,X-Requested-With"
  );
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function json(
  request: Request,
  env: Env,
  data: unknown,
  status = 200
): Response {
  return withCors(
    request,
    env,
    Response.json(data, {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function text(
  request: Request,
  env: Env,
  body: string,
  status = 200
): Response {
  return withCors(
    request,
    env,
    new Response(body, {
      status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

function preflight(request: Request, env: Env): Response {
  if (request.headers.get("Origin") && !getCorsOrigin(request, env)) {
    return new Response(null, { status: 403 });
  }

  return withCors(request, env, new Response(null, { status: 204 }));
}

function apiInfo() {
  return {
    name: "duyet agents API",
    version: "0.1.0",
    status: "healthy",
    endpoints: {
      health: "/health",
      chat: "/api/v1/chat",
      nativeAgent: "/agents/ChatAgent/:sessionId",
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
    "- /agents/ChatAgent/:sessionId",
    "",
    "## Auth",
    "Use Authorization: Bearer <Clerk session token> from monorepo apps, or Authorization: Bearer <AGENT_API_TOKEN> for server-to-server calls.",
  ].join("\n");
}

function getApiSessionId(auth: AuthContext, requestedSessionId?: string): string {
  if (auth.mode === "api-token") {
    return normalizeSessionPart(requestedSessionId ?? "");
  }

  return normalizeSessionPart(requestedSessionId ?? "default");
}

function hasSubmitApiMessage(
  agent: unknown
): agent is {
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

function scopedAgentRequest(request: Request, auth: AuthContext): Request | null {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts[0] !== "agents" || parts[1] !== "ChatAgent" || !parts[2]) {
    return null;
  }

  parts[2] = getScopedSessionName(auth, parts[2]);
  url.pathname = `/${parts.join("/")}`;

  return new Request(url, request);
}

async function handleChat(request: Request, env: Env, auth: AuthContext) {
  const parsed = chatRequestSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!parsed.success) {
    return json(
      request,
      env,
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
    return json(
      request,
      env,
      { error: "sessionId is required for AGENT_API_TOKEN requests" },
      400
    );
  }

  const sessionId = getApiSessionId(auth, parsed.data.sessionId);
  const agentSessionId = getScopedSessionName(auth, sessionId);
  const agent: unknown = await getAgentByName(env.ChatAgent, agentSessionId);
  if (!hasSubmitApiMessage(agent)) {
    return json(request, env, { error: "Agent request failed" }, 500);
  }

  try {
    const result = await agent.submitApiMessage({
      authMode: auth.mode,
      message: parsed.data.message,
      ownerId: auth.ownerId,
      timezone: parsed.data.timezone,
    });

    return json(request, env, {
      ok: true,
      authMode: auth.mode,
      sessionId,
      agentSessionId,
      status: result.interactionRequired ? "interaction_required" : result.status,
      assistantText: result.assistantText,
      interactionRequired: result.interactionRequired,
      pendingInteractions: result.pendingInteractions,
      messages: result.messages,
    });
  } catch (error) {
    const status = isSessionOwnerMismatchError(error) ? 403 : 500;
    return json(
      request,
      env,
      { error: status === 403 ? "Forbidden" : "Agent request failed" },
      status
    );
  }
}

async function requireAuth(
  request: Request,
  env: Env
): Promise<AuthContext | Response> {
  const auth = await authenticateRequest(request, env);
  if (auth) return auth;

  return json(
    request,
    env,
    { error: "Unauthorized. Provide a Clerk session token or AGENT_API_TOKEN." },
    401
  );
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return preflight(request, env);
  }

  const url = new URL(request.url);

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/agents")) {
    return json(request, env, apiInfo());
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return json(request, env, { ok: true, service: "duyet-agents-api" });
  }

  if (request.method === "GET" && url.pathname === "/llms.txt") {
    return text(request, env, llmsText());
  }

  if (request.method === "POST" && url.pathname === "/api/v1/chat") {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;
    return handleChat(request, env, auth);
  }

  if (url.pathname.startsWith("/agents/")) {
    const auth = await requireAuth(request, env);
    if (auth instanceof Response) return auth;

    const scopedRequest = scopedAgentRequest(request, auth);
    if (!scopedRequest) {
      return json(request, env, { error: "Unknown agent route" }, 404);
    }

    const routed = await routeAgentRequest(scopedRequest, env);
    return routed
      ? withCors(request, env, routed)
      : json(request, env, { error: "Not Found" }, 404);
  }

  return json(request, env, { error: "Not Found" }, 404);
}

export default {
  fetch(request: Request, env: Env) {
    return handleRequest(request, env);
  },
} satisfies ExportedHandler<Env>;
