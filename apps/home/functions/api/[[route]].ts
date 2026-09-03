interface PagesContext {
  request: Request;
}

const UPSTREAM = "https://api.duyet.net";

/**
 * Allowlisted incoming path + method pairs. The key is the path after the
 * leading `/api/`; the upstream URL is `${UPSTREAM}/<key>`.
 */
const ALLOWLIST: Record<string, string[]> = {
  health: ["GET"],
  "api/ai/percentage/current": ["GET"],
  "api/ai/percentage/history": ["GET"],
  "api/ai/percentage/available": ["GET"],
  "api/insights/overview": ["GET"],
  "api/llm/generate": ["POST"],
  "api/contact": ["POST"],
  "api/jd": ["POST"],
  "api/comments": ["POST"],
};

function json(
  body: unknown,
  status: number,
  extraHeaders?: HeadersInit
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

export const onRequest = async ({
  request,
}: PagesContext): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  const url = new URL(request.url);
  // Strip the leading "/api/" and use the remainder as the upstream suffix.
  const suffix = url.pathname.replace(/^\/api\//, "");
  const allowedMethods = ALLOWLIST[suffix];
  if (!allowedMethods?.includes(request.method)) {
    return json({ error: "not found" }, 404, {
      "Access-Control-Allow-Origin": "*",
    });
  }

  const headers = new Headers();
  const auth = request.headers.get("Authorization");
  if (auth) headers.set("Authorization", auth);
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);

  try {
    const upstream = await fetch(`${UPSTREAM}/${suffix}${url.search}`, {
      method: request.method,
      headers,
      body: request.method === "POST" ? await request.text() : undefined,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: new Headers({
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
        "Access-Control-Allow-Origin": "*",
      }),
    });
  } catch {
    return json({ error: "upstream unavailable" }, 502, {
      "Access-Control-Allow-Origin": "*",
    });
  }
};
