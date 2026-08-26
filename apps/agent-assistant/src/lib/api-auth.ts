import {
  getBearerToken,
  timingSafeEqualStrings as timingSafeEqual,
} from "@duyet/libs/workers-auth";

export const ASSISTANT_ALLOWED_ORIGINS = [
  "https://agent-assistant.duyet.net",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
] as const;

export interface AssistantAuthEnv {
  AGENT_API_TOKEN?: string;
  ASSISTANT_API_TOKEN?: string;
}

export { getBearerToken, timingSafeEqual };

export function getConfiguredAssistantTokens(env: AssistantAuthEnv): string[] {
  return [env.ASSISTANT_API_TOKEN, env.AGENT_API_TOKEN].filter(
    (token): token is string => Boolean(token)
  );
}

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  const allowOrigin = (ASSISTANT_ALLOWED_ORIGINS as readonly string[]).includes(
    origin
  )
    ? origin
    : "https://agent-assistant.duyet.net";

  return {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": allowOrigin,
    Vary: "Origin",
  };
}

export function unauthorizedResponse(request: Request): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json",
    },
    status: 401,
  });
}

export function authorizeAssistantRequest(
  request: Request,
  env: AssistantAuthEnv
): Response | null {
  const configured = getConfiguredAssistantTokens(env);
  if (configured.length === 0) {
    return unauthorizedResponse(request);
  }

  const token = getBearerToken(request);
  if (
    !token ||
    !configured.some((expected) => timingSafeEqual(token, expected))
  ) {
    return unauthorizedResponse(request);
  }

  return null;
}

export function getAssistantClientToken(): string | undefined {
  const viteEnv =
    typeof import.meta !== "undefined"
      ? (
          import.meta as ImportMeta & {
            env?: Record<string, string | undefined>;
          }
        ).env
      : undefined;
  if (viteEnv?.VITE_ASSISTANT_API_TOKEN) {
    return viteEnv.VITE_ASSISTANT_API_TOKEN;
  }

  if (typeof process !== "undefined") {
    return (
      process.env.VITE_ASSISTANT_API_TOKEN ||
      process.env.ASSISTANT_API_TOKEN ||
      process.env.AGENT_API_TOKEN
    );
  }

  return undefined;
}

export function getAssistantClientHeaders(): Record<string, string> {
  const token = getAssistantClientToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
