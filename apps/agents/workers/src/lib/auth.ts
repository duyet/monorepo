export interface AuthUser {
  userId: string;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_TTL_MS = 60 * 60 * 1000;

async function getClerkJwks(issuerUrl?: string): Promise<JsonWebKey[]> {
  if (!issuerUrl) return [];
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }

  const url = issuerUrl.endsWith("/")
    ? `${issuerUrl}.well-known/jwks.json`
    : `${issuerUrl}/.well-known/jwks.json`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const json = (await res.json()) as { keys?: JsonWebKey[] };
  const keys = json.keys ?? [];
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

async function verifyJwt(
  token: string,
  issuerUrl?: string
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const header = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(parts[0]))
    );
    if (
      !header.alg ||
      typeof header.alg !== "string" ||
      !header.alg.startsWith("RS")
    ) {
      return null;
    }

    const keys = await getClerkJwks(issuerUrl);
    if (keys.length === 0) return null;

    const jwk = header.kid
      ? keys.find((k) => (k as Record<string, unknown>).kid === header.kid)
      : keys[0];
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: `SHA-${header.alg.slice(2)}` },
      },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64UrlDecode(parts[2]).buffer as ArrayBuffer,
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );

    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(parts[1]))
    );
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    if (payload.nbf && payload.nbf * 1000 > Date.now() + 30_000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(
  request: Request,
  issuerUrl?: string
): Promise<AuthUser | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const payload = await verifyJwt(auth.slice(7), issuerUrl);
  if (!payload || typeof payload.sub !== "string") return null;

  return { userId: payload.sub };
}
