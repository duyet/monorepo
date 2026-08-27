/**
 * CORS for the public read API (`GET /api/public`).
 *
 * TanStack Start + Pages `not_found_handling = "single-page-application"`
 * serves index.html for OPTIONS, so the file-route OPTIONS handler never
 * runs. Intercept this path in the Worker fetch entry — same pattern as
 * `/api/subscribe` — so Chrome extension new-tab pages can preflight.
 *
 * Allowed Origins: `chrome-extension://…`, http://localhost / 127.0.0.1
 * (unpacked-ext / local Worker), and https://*.duyet.net. Public GET
 * surfaces are not rate-limited (neither is `/api/feed`).
 */

export const PUBLIC_API_PATH = "/api/public";

export function isPublicApiPath(request: Request): boolean {
  try {
    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    return path === PUBLIC_API_PATH;
  } catch {
    return false;
  }
}

export function isPublicAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol === "chrome-extension:" && url.hostname) return true;
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (
      url.protocol === "https:" &&
      (host === "duyet.net" || host.endsWith(".duyet.net"))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function publicCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin");
  const requested = request.headers.get("Access-Control-Request-Headers");
  const headers: Record<string, string> = {
    Vary: "Origin",
  };
  if (isPublicAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS";
    headers["Access-Control-Allow-Headers"] =
      requested && requested.length > 0 ? requested : "Accept, Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

export function withPublicCors(request: Request, response: Response): Response {
  const next = new Response(response.body, response);
  for (const [key, value] of Object.entries(publicCorsHeaders(request))) {
    if (key === "Vary" && next.headers.has("Vary")) {
      const existing = next.headers.get("Vary") ?? "";
      if (!existing.toLowerCase().includes("origin")) {
        next.headers.set("Vary", `${existing}, Origin`);
      }
      continue;
    }
    next.headers.set(key, value);
  }
  return next;
}

export function publicPreflight(request: Request): Response {
  return withPublicCors(request, new Response(null, { status: 204 }));
}

export async function handlePublicCors(
  request: Request,
  next: () => Response | Promise<Response>
): Promise<Response> {
  if (!isPublicApiPath(request)) return await next();
  if (request.method === "OPTIONS") return publicPreflight(request);
  return withPublicCors(request, await next());
}
