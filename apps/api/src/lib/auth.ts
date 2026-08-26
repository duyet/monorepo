import {
  getBearerToken,
  timingSafeEqualStrings as timingSafeEqual,
} from "@duyet/libs/workers-auth";

export interface ApiAuthEnv {
  AGENT_API_TOKEN?: string;
  API_TOKEN?: string;
}

export { getBearerToken, timingSafeEqual };

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
