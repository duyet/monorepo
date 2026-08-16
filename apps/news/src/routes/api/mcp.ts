import { createFileRoute } from "@tanstack/react-router";
import { handleMcpRequest } from "../../../worker/admin/mcp.js";
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

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      POST: async ({
        request,
        context,
      }: {
        request: Request;
        context: any;
      }) => {
        const env = await resolveEnv(context);
        if (!env?.DB) {
          return Response.json(
            { error: "D1 binding DB not configured" },
            { status: 500 }
          );
        }
        return handleMcpRequest(request, env);
      },
      GET: async () =>
        Response.json({ error: "method not allowed" }, { status: 405 }),
    },
  },
});
