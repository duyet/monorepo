const ALLOWED_ORIGINS = new Set([
  "https://blog.duyet.net",
  "https://duyet.net",
  "https://www.duyet.net",
  "https://news.duyet.net",
  "http://localhost:3000",
  "http://localhost:3010",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3010",
]);

export function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return (
      host.endsWith(".pages.dev") &&
      (host.startsWith("duyet-blog") ||
        host.startsWith("duyet-home") ||
        host.startsWith("duyet-news"))
    );
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

export function withCors(request: Request, response: Response): Response {
  const next = new Response(response.body, response);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    next.headers.set(key, value);
  }
  return next;
}

export function preflight(request: Request): Response {
  return withCors(request, new Response(null, { status: 204 }));
}
