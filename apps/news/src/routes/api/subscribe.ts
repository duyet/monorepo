import { createFileRoute } from "@tanstack/react-router";
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

type HandlerArgs = { request: Request; context: any };

export const Route = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      POST: async ({ request, context }: HandlerArgs) => {
        const env = await resolveEnv(context);
        if (!env?.DB) {
          return Response.json(
            { error: "D1 binding DB not configured" },
            { status: 500 }
          );
        }
        let body: any;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid JSON body" }, { status: 400 });
        }
        const result = await subscribe(env, body?.email, body?.lang);
        if (isSubscribeError(result)) {
          return Response.json(
            { error: result.error },
            { status: result.status }
          );
        }
        return Response.json(result);
      },
      DELETE: async ({ request, context }: HandlerArgs) => {
        const env = await resolveEnv(context);
        if (!env?.DB) {
          return Response.json(
            { error: "D1 binding DB not configured" },
            { status: 500 }
          );
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        const result = await unsubscribe(env, token);
        if (isSubscribeError(result)) {
          return Response.json(
            { error: result.error },
            { status: result.status }
          );
        }
        return Response.json(result);
      },
    },
  },
});
