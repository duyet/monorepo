import { createFileRoute } from "@tanstack/react-router";
import { checkAuth } from "../../../worker/admin/auth.js";
import {
  deleteSource,
  getStatus,
  isHandlerError,
  listSources,
  pushItems,
  triggerIngest,
  upsertSource,
} from "../../../worker/admin/handlers.js";
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

function notFound() {
  return Response.json({ error: "not found" }, { status: 404 });
}

async function parseJsonBody(request: Request) {
  try {
    return { body: await request.json(), error: null as null };
  } catch {
    return { body: null, error: "invalid JSON body" };
  }
}

async function handle(
  method: string,
  splat: string,
  request: Request,
  context: any
): Promise<Response> {
  const env = await resolveEnv(context);
  if (!env?.DB) {
    return Response.json(
      { error: "D1 binding DB not configured" },
      { status: 500 }
    );
  }

  const authResponse = checkAuth(request, env);
  if (authResponse) return authResponse;

  const segments = splat.split("/").filter(Boolean);

  if (method === "POST" && segments.length === 1 && segments[0] === "items") {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await pushItems(
      env,
      body as Parameters<typeof pushItems>[1]
    );
    if (isHandlerError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }

  if (method === "GET" && segments.length === 1 && segments[0] === "sources") {
    const result = await listSources(env);
    return Response.json(result);
  }

  if (method === "PUT" && segments.length === 2 && segments[0] === "sources") {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await upsertSource(
      env,
      segments[1],
      body as Parameters<typeof upsertSource>[2]
    );
    if (isHandlerError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }

  if (
    method === "DELETE" &&
    segments.length === 2 &&
    segments[0] === "sources"
  ) {
    const result = await deleteSource(env, segments[1]);
    if (isHandlerError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }

  if (method === "POST" && segments.length === 1 && segments[0] === "ingest") {
    const result = await triggerIngest(env);
    return Response.json(result);
  }

  if (method === "GET" && segments.length === 1 && segments[0] === "status") {
    const result = await getStatus(env);
    return Response.json(result);
  }

  return notFound();
}

type HandlerArgs = { request: Request; params: any; context: any };

export const Route = createFileRoute("/api/admin/$")({
  server: {
    handlers: {
      GET: async ({ request, params, context }: HandlerArgs) =>
        handle("GET", params?._splat ?? "", request, context),
      POST: async ({ request, params, context }: HandlerArgs) =>
        handle("POST", params?._splat ?? "", request, context),
      PUT: async ({ request, params, context }: HandlerArgs) =>
        handle("PUT", params?._splat ?? "", request, context),
      DELETE: async ({ request, params, context }: HandlerArgs) =>
        handle("DELETE", params?._splat ?? "", request, context),
    },
  },
});
