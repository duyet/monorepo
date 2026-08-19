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

export const SUBSCRIBE_PATH = "/api/subscribe";

export function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (
      url.protocol === "https:" &&
      (host === "duyet.net" || host.endsWith(".duyet.net"))
    ) {
      return true;
    }
    return (
      url.protocol === "https:" &&
      host.endsWith(".pages.dev") &&
      (host.startsWith("duyet-blog") ||
        host.startsWith("duyet-home") ||
        host.startsWith("duyet-news"))
    );
  } catch {
    return false;
  }
}

export function isSubscribePath(request: Request): boolean {
  try {
    return new URL(request.url).pathname === SUBSCRIBE_PATH;
  } catch {
    return false;
  }
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const requested = request.headers.get("Access-Control-Request-Headers");
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      requested && requested.length > 0 ? requested : "Content-Type, Accept";
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

/**
 * TanStack Start + Pages `not_found_handling = "single-page-application"`
 * serves index.html for OPTIONS, so the file-route OPTIONS handler never
 * runs. Intercept `/api/subscribe` in the Worker fetch entry instead.
 */
export async function handleSubscribeCors(
  request: Request,
  next: () => Promise<Response>
): Promise<Response> {
  if (!isSubscribePath(request)) return next();
  if (request.method === "OPTIONS") return preflight(request);
  return withCors(request, await next());
}
