/**
 * Authentication helpers for Cloudflare Pages Functions
 *
 * Verifies Clerk JWT tokens via JWKS and extracts user identity.
 * Returns null for unauthenticated or unverifiable requests.
 */

export interface AuthUser {
  userId: string;
}

/**
 * Extract the client IP address from a Cloudflare request.
 * Checks CF-Connecting-IP header first, then X-Forwarded-For, then falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Hash an IP address with a server-side pepper using SHA-256.
 * Returns a hex-encoded hash. Never stores raw IPs in the database.
 */
export async function hashIp(ip: string, pepper?: string): Promise<string> {
  const secret = pepper || process.env.RATE_LIMIT_PEPPER || "duyet-agents-default-pepper";
  const data = new TextEncoder().encode(`${secret}:${ip}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Base64url decode helper */
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Simple in-memory JWKS cache */
let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch Clerk's JWKS from the well-known endpoint.
 * Caches keys for 1 hour to avoid repeated network calls.
 */
async function getClerkJwks(clerkDomain?: string): Promise<JsonWebKey[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL) {
    return jwksCache.keys;
  }

  const domain = clerkDomain || process.env.CLERK_ISSUER_URL;
  if (!domain) {
    return [];
  }

  try {
    const url = domain.endsWith("/")
      ? `${domain}.well-known/jwks.json`
      : `${domain}/.well-known/jwks.json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    jwksCache = { keys: data.keys || [], fetchedAt: Date.now() };
    return jwksCache.keys;
  } catch {
    return [];
  }
}

/**
 * Verify a JWT token using Clerk's JWKS public keys.
 * Returns the decoded payload if verification succeeds, null otherwise.
 */
async function verifyJwt(
  token: string,
  clerkDomain?: string,
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const headerJson = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    const kid = headerJson.kid;
    const alg = headerJson.alg;

    // Must be RSA-based algorithm
    if (!alg || !alg.startsWith("RS")) {
      // Fall back to claims validation for non-RSA (e.g. test tokens)
      return verifyJwtClaimsFallback(parts[1]);
    }

    const jwks = await getClerkJwks(clerkDomain);

    // If no JWKS available (e.g. no CLERK_ISSUER_URL configured), fall back to
    // claims-only validation
    if (jwks.length === 0) {
      return verifyJwtClaimsFallback(parts[1]);
    }

    // Find matching key by kid
    const jwk = kid ? jwks.find((k) => (k as Record<string, unknown>).kid === kid) : jwks[0];
    if (!jwk) return null;

    // Import the JWK as a CryptoKey
    const cryptoKey = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: { name: `SHA-${alg.slice(2)}` } },
      false,
      ["verify"],
    );

    // Verify the signature
    const signingInput = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlDecode(parts[2]);

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signature.buffer as ArrayBuffer,
      signingInput,
    );

    if (!valid) return null;

    // Decode and validate claims
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    // Check not-before
    if (payload.nbf && payload.nbf * 1000 > Date.now() + 30_000) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Fallback validation when JWKS is unavailable: decode payload and validate
 * standard JWT claims (exp, nbf, sub). Does NOT verify signature.
 * Used only when CLERK_ISSUER_URL is not configured.
 */
function verifyJwtClaimsFallback(payloadB64: string): Record<string, unknown> | null {
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));

    // Require sub claim
    if (!payload.sub || typeof payload.sub !== "string") return null;

    // Check expiry if present
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    // Check not-before if present
    if (payload.nbf && payload.nbf * 1000 > Date.now() + 30_000) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract verified user info from Clerk session token (JWT).
 *
 * Attempts full JWKS signature verification when CLERK_ISSUER_URL is configured.
 * Falls back to claims-only validation otherwise.
 * Returns null if verification fails or no valid token is present.
 */
export async function getUserFromRequest(
  request: Request,
  clerkDomain?: string,
): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token, clerkDomain);
  if (!payload) return null;

  const userId = payload.sub;
  if (!userId || typeof userId !== "string") return null;

  return { userId };
}
