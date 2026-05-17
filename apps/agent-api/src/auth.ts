import { verifyToken } from "@clerk/backend";

export const DEFAULT_AUTHORIZED_PARTIES = [
  "https://duyet.net",
  "https://blog.duyet.net",
  "https://cv.duyet.net",
  "https://insights.duyet.net",
  "https://photos.duyet.net",
  "https://homelab.duyet.net",
  "https://llm-timeline.duyet.net",
  "https://ai-percentage.duyet.net",
  "https://agents.duyet.net",
  "https://agents-api.duyet.net",
];

const MAX_TOKEN_BYTES = 4096;
export const SESSION_PART_MAX_LENGTH = 96;
export const SCOPED_SESSION_MAX_LENGTH = 192;

export interface AuthEnv {
  AGENT_API_TOKEN?: string;
  CLERK_AUTHORIZED_PARTIES?: string;
  CLERK_JWT_KEY?: string;
  CLERK_SECRET_KEY?: string;
}

export interface AuthContext {
  mode: "api-token" | "clerk";
  ownerId: string;
  subject?: string;
  sessionId?: string;
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function getAuthorizedParties(env: AuthEnv): string[] {
  const configured =
    env.CLERK_AUTHORIZED_PARTIES?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  return configured.length > 0
    ? [...new Set(configured)]
    : DEFAULT_AUTHORIZED_PARTIES;
}

export function timingSafeEqual(left?: string, right?: string): boolean {
  if (!left || !right) return false;

  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const leftBuffer = new Uint8Array(MAX_TOKEN_BYTES);
  const rightBuffer = new Uint8Array(MAX_TOKEN_BYTES);

  let mismatch = leftBytes.length ^ rightBytes.length;
  if (leftBytes.length > MAX_TOKEN_BYTES || rightBytes.length > MAX_TOKEN_BYTES) {
    mismatch = 1;
  }

  leftBuffer.set(leftBytes.slice(0, MAX_TOKEN_BYTES));
  rightBuffer.set(rightBytes.slice(0, MAX_TOKEN_BYTES));

  for (let index = 0; index < MAX_TOKEN_BYTES; index += 1) {
    mismatch |= leftBuffer[index] ^ rightBuffer[index];
  }

  return mismatch === 0;
}

function normalizePem(value: string): string {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function getVerifiedClerkClaims(
  payload: unknown
): { sid?: string; sub: string } | null {
  if (!payload || typeof payload !== "object") return null;

  const claims = payload as Record<string, unknown>;
  if (typeof claims.sub !== "string" || !claims.sub) return null;

  return {
    sub: claims.sub,
    sid: typeof claims.sid === "string" ? claims.sid : undefined,
  };
}

async function verifyClerkSession(
  token: string,
  env: AuthEnv
): Promise<AuthContext | null> {
  if (!env.CLERK_JWT_KEY && !env.CLERK_SECRET_KEY) return null;

  try {
    const payload = getVerifiedClerkClaims(
      await verifyToken(token, {
        authorizedParties: getAuthorizedParties(env),
        jwtKey: env.CLERK_JWT_KEY ? normalizePem(env.CLERK_JWT_KEY) : undefined,
        secretKey: env.CLERK_SECRET_KEY,
      })
    );

    if (!payload) return null;

    return {
      mode: "clerk",
      ownerId: payload.sub,
      subject: payload.sub,
      sessionId: payload.sid,
    };
  } catch {
    return null;
  }
}

export async function authenticateRequest(
  request: Request,
  env: AuthEnv
): Promise<AuthContext | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  if (timingSafeEqual(token, env.AGENT_API_TOKEN)) {
    return { mode: "api-token", ownerId: "api-token" };
  }

  const clerkAuth = await verifyClerkSession(token, env);
  if (clerkAuth) return clerkAuth;

  return null;
}

export function normalizeSessionPart(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SESSION_PART_MAX_LENGTH);

  return normalized || "default";
}

export function getScopedSessionName(
  auth: AuthContext,
  requestedSessionId: string
): string {
  const owner = normalizeSessionPart(auth.ownerId);
  const requested = normalizeSessionPart(requestedSessionId);
  return `${auth.mode}-${owner}-${requested}`.slice(
    0,
    SCOPED_SESSION_MAX_LENGTH
  );
}
