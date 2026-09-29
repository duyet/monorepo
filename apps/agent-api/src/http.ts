/**
 * Response shaping for the Worker: CORS, JSON/text bodies, preflight and
 * rate-limit headers. Bound to one (request, env) pair so route handlers never
 * thread them through by hand.
 * @module http
 */

import { getAuthorizedParties } from "./auth";
import type { Env } from "./agent";

export interface Http {
  /** Attach the CORS + security headers to an existing response. */
  withCors(response: Response): Response;
  json(data: unknown, status?: number): Response;
  text(body: string, status?: number): Response;
  /** OPTIONS reply: 403 for a disallowed Origin, otherwise 204. */
  preflight(): Response;
  /** Copy RateLimit-* headers onto an already CORS-decorated response. */
  withRateLimitHeaders(response: Response, rateLimitHeaders: Headers): Response;
}

function getCorsOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  return getAuthorizedParties(env).includes(origin) ? origin : null;
}

function withCors(request: Request, env: Env, response: Response): Response {
  if (response.status === 101) return response;

  const origin = getCorsOrigin(request, env);
  const headers = new Headers(response.headers);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,X-Requested-With"
  );
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export function createHttp(request: Request, env: Env): Http {
  const cors = (response: Response): Response =>
    withCors(request, env, response);

  return {
    json(data: unknown, status = 200): Response {
      return cors(
        Response.json(data, {
          status,
          headers: { "Content-Type": "application/json" },
        })
      );
    },
    preflight(): Response {
      if (request.headers.get("Origin") && !getCorsOrigin(request, env)) {
        return new Response(null, { status: 403 });
      }

      return cors(new Response(null, { status: 204 }));
    },
    text(body: string, status = 200): Response {
      return cors(
        new Response(body, {
          status,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    },
    withCors: cors,
    withRateLimitHeaders(
      response: Response,
      rateLimitHeaders: Headers
    ): Response {
      const corsed = cors(response);
      const headers = new Headers(corsed.headers);
      for (const [key, value] of rateLimitHeaders) {
        headers.set(key, value);
      }
      return new Response(corsed.body, {
        headers,
        status: corsed.status,
        statusText: corsed.statusText,
      });
    },
  };
}
