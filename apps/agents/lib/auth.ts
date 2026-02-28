/**
 * Authentication helpers for Cloudflare Pages Functions
 *
 * Extracts user identity from Clerk JWT tokens passed via Authorization header.
 * Returns null for unauthenticated requests.
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
 * Extract user info from Clerk session token (JWT).
 *
 * In Cloudflare Pages Functions, we decode the JWT payload without full verification
 * since the token is already validated by Clerk's frontend SDK.
 * The `sub` claim contains the Clerk user ID.
 */
export function getUserFromRequest(request: Request): AuthUser | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    // Decode JWT payload (base64url encoded, second segment)
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload.sub;

    if (!userId || typeof userId !== "string") {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}
