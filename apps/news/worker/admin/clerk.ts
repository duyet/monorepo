import type { Env } from "../types.js";

/** Decoded, signature-verified Clerk session token claims we care about. */
export interface ClerkPayload {
  sub: string;
  iss: string;
  exp: number;
  nbf?: number;
  [key: string]: unknown;
}

interface Jwk {
  kty: string;
  kid?: string;
  n?: string;
  e?: string;
  alg?: string;
  use?: string;
}

const CLOCK_SKEW_SECONDS = 10;
const JWKS_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Module-scope JWKS cache, keyed by issuer. Cloudflare Workers reuse the
// module scope across requests within the same isolate, so this amortizes
// the JWKS fetch without needing KV/Durable Objects.
const jwksCache = new Map<string, { keys: Jwk[]; fetchedAt: number }>();

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlDecodeJson(input: string): Record<string, unknown> | null {
  try {
    const bytes = base64UrlDecode(input);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

async function fetchJwks(issuer: string): Promise<Jwk[]> {
  const cached = jwksCache.get(issuer);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) {
    return cached.keys;
  }

  const res = await fetch(`${issuer.replace(/\/$/, "")}/.well-known/jwks.json`);
  if (!res.ok) return cached?.keys ?? [];

  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = body.keys ?? [];
  jwksCache.set(issuer, { keys, fetchedAt: Date.now() });
  return keys;
}

/**
 * Verifies a Clerk session JWT (RS256) from a raw `Authorization: Bearer`
 * token value. Fetches the issuer's JWKS (cached in module scope) and
 * checks the RS256 signature plus exp/nbf with a small clock-skew
 * allowance. Returns the decoded payload on success, or `null` on any
 * failure (malformed token, wrong issuer, bad signature, expired, etc).
 */
export async function verifyClerkToken(
  token: string,
  env: Env
): Promise<ClerkPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;

  const header = base64UrlDecodeJson(headerPart);
  const payload = base64UrlDecodeJson(payloadPart);
  if (!header || !payload) return null;
  if (header.alg !== "RS256") return null;

  const iss = typeof payload.iss === "string" ? payload.iss : null;
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (!iss || !sub || exp === null) return null;

  if (env.CLERK_ISSUER && iss !== env.CLERK_ISSUER) return null;

  const now = Math.floor(Date.now() / 1000);
  if (exp + CLOCK_SKEW_SECONDS < now) return null;
  if (typeof payload.nbf === "number" && payload.nbf - CLOCK_SKEW_SECONDS > now) {
    return null;
  }

  const keys = await fetchJwks(iss);
  const kid = typeof header.kid === "string" ? header.kid : undefined;
  const candidates = kid ? keys.filter((k) => k.kid === kid) : keys;

  const signature = base64UrlDecode(signaturePart);
  const signedData = new TextEncoder().encode(`${headerPart}.${payloadPart}`);

  for (const jwk of candidates) {
    if (jwk.kty !== "RSA") continue;
    try {
      const key = await crypto.subtle.importKey(
        "jwk",
        { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const valid = await crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        key,
        signature as BufferSource,
        signedData as BufferSource
      );
      if (valid) return payload as ClerkPayload;
    } catch {
      // try next candidate key
    }
  }

  return null;
}

/**
 * Extracts a role claim from any of Clerk's common session-token claim
 * shapes for public metadata: `metadata.role`, `publicMetadata.role`, or
 * the shortened `o.rol` claim used by Clerk's default session token.
 */
function claimRole(payload: ClerkPayload): unknown {
  const metadata = payload.metadata as { role?: unknown } | undefined;
  if (metadata?.role !== undefined) return metadata.role;

  const publicMetadata = payload.publicMetadata as
    | { role?: unknown }
    | undefined;
  if (publicMetadata?.role !== undefined) return publicMetadata.role;

  const org = payload.o as { rol?: unknown } | undefined;
  if (org?.rol !== undefined) return org.rol;

  return undefined;
}

/**
 * Admin decision for a verified Clerk payload: true when the subject's
 * user id is in the comma-separated `env.NEWS_ADMIN_USER_IDS` allowlist, or
 * when a recognized role claim equals "admin".
 */
export function isClerkAdmin(payload: ClerkPayload, env: Env): boolean {
  const allowlist = (env.NEWS_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (allowlist.includes(payload.sub)) return true;

  return claimRole(payload) === "admin";
}
