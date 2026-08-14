const MAX_TOKEN_BYTES = 4096;

export interface ApiAuthEnv {
  AGENT_API_TOKEN?: string;
  API_TOKEN?: string;
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export function timingSafeEqual(left?: string, right?: string): boolean {
  if (!left || !right) return false;

  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const leftBuffer = new Uint8Array(MAX_TOKEN_BYTES);
  const rightBuffer = new Uint8Array(MAX_TOKEN_BYTES);

  let mismatch = leftBytes.length ^ rightBytes.length;
  if (
    leftBytes.length > MAX_TOKEN_BYTES ||
    rightBytes.length > MAX_TOKEN_BYTES
  ) {
    mismatch = 1;
  }

  leftBuffer.set(leftBytes.slice(0, MAX_TOKEN_BYTES));
  rightBuffer.set(rightBytes.slice(0, MAX_TOKEN_BYTES));

  for (let index = 0; index < MAX_TOKEN_BYTES; index += 1) {
    mismatch |= leftBuffer[index] ^ rightBuffer[index];
  }

  return mismatch === 0;
}

export function getConfiguredApiTokens(env: ApiAuthEnv): string[] {
  return [env.API_TOKEN, env.AGENT_API_TOKEN].filter((token): token is string =>
    Boolean(token)
  );
}

export function isAuthorizedApiRequest(
  request: Request,
  env: ApiAuthEnv
): boolean {
  const configured = getConfiguredApiTokens(env);
  if (configured.length === 0) return false;

  const token = getBearerToken(request);
  if (!token) return false;

  return configured.some((expected) => timingSafeEqual(token, expected));
}
