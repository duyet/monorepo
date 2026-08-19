import { createFileRoute } from "@tanstack/react-router";
import { preflight, withCors } from "../../../worker/subscribe/cors.js";
import {
  isSubscribeError,
  subscribe,
  unsubscribe,
} from "../../../worker/subscribe/handlers.js";
import type { Env } from "../../../worker/types.js";

async function resolveEnv(context: any): Promise<Env | undefined> {
  let env: any =
    context?.cloudflare?.env || context?.env || (globalThis as any).CF_ENV;
  if (!env?.DB) {
    try {
      env = (await import("cloudflare:workers")).env;
    } catch {
      // not running in a workers runtime
    }
  }
  return env as Env | undefined;
}

function clientIp(request: Request): string | null {
  return request.headers.get("CF-Connecting-IP");
}

function isOneClickBody(request: Request, raw: string): boolean {
  const type = request.headers.get("Content-Type") ?? "";
  return (
    raw.trim() === "List-Unsubscribe=One-Click" ||
    type.includes("application/x-www-form-urlencoded")
  );
}

type HandlerArgs = { request: Request; context: any };

export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: HandlerArgs) => preflight(request),
      POST: async ({ request, context }: HandlerArgs) => {
        const env = await resolveEnv(context);
        if (!env?.DB) {
          return withCors(
            request,
            Response.json(
              { error: "D1 binding DB not configured" },
              { status: 500 }
            )
          );
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const raw = await request.text();
        if (token && (raw.length === 0 || isOneClickBody(request, raw))) {
          const result = await unsubscribe(env, token);
          if (isSubscribeError(result)) {
            return withCors(
              request,
              Response.json({ error: result.error }, { status: result.status })
            );
          }
          return withCors(request, Response.json(result));
        }
        let body: any;
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          return withCors(
            request,
            Response.json({ error: "invalid JSON body" }, { status: 400 })
          );
        }
        const result = await subscribe(
          env,
          body?.email,
          body?.lang,
          body?.timezone,
          body?.source,
          clientIp(request)
        );
        if (isSubscribeError(result)) {
          return withCors(
            request,
            Response.json({ error: result.error }, { status: result.status })
          );
        }
        return withCors(request, Response.json(result));
      },
      DELETE: async ({ request, context }: HandlerArgs) => {
        const env = await resolveEnv(context);
        if (!env?.DB) {
          return withCors(
            request,
            Response.json(
              { error: "D1 binding DB not configured" },
              { status: 500 }
            )
          );
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const result = await unsubscribe(env, token);
        if (isSubscribeError(result)) {
          return withCors(
            request,
            Response.json({ error: result.error }, { status: result.status })
          );
        }
        return withCors(request, Response.json(result));
      },
    },
  },
});
