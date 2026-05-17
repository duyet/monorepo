interface Env {
  AGENT_API_PROXY_ORIGIN?: string;
}

interface PagesContext {
  env: Env;
  request: Request;
}

const DEFAULT_AGENT_API_ORIGIN = "https://agents-api.duyet.net";

function agentApiOrigin(env: Env): URL {
  const configured = env.AGENT_API_PROXY_ORIGIN?.trim();
  return new URL(configured || DEFAULT_AGENT_API_ORIGIN);
}

function upstreamUrl(request: Request, env: Env): string {
  const url = new URL(request.url);
  const origin = agentApiOrigin(env);
  url.protocol = origin.protocol;
  url.host = origin.host;
  return url.toString();
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const headers = new Headers(request.headers);
  headers.delete("host");

  return fetch(upstreamUrl(request, context.env), {
    body: request.body,
    headers,
    method: request.method,
    redirect: "manual",
  });
}
