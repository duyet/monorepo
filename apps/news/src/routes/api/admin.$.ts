import { createFileRoute } from "@tanstack/react-router";
import { checkAdminAuth, isRequestAdmin } from "../../../worker/admin/auth.js";
import {
  deleteSource,
  getLlmCalls,
  getStatus,
  isHandlerError,
  listItems,
  listSources,
  pushItems,
  regenerateTldr,
  reprocessToday,
  triggerIngest,
  updateItem,
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

  const segments = splat.split("/").filter(Boolean);

  // Anonymous-safe: reports whether the caller's bearer resolves to an
  // admin. Must run BEFORE the auth gate below — it always returns 200,
  // never 401, so unauthenticated callers can use it to detect signed-out
  // state.
  if (method === "GET" && segments.length === 1 && segments[0] === "me") {
    const admin = await isRequestAdmin(request, env);
    return Response.json({ admin });
  }

  const authResponse = await checkAdminAuth(request, env);
  if (authResponse) return authResponse;

  if (method === "POST" && segments.length === 1 && segments[0] === "items") {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    // Moderation updates ({id, action}) share this route with item pushes
    // (which have no `action` field) — dispatch on body shape.
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "action" in body
    ) {
      const result = await updateItem(
        env,
        body as Parameters<typeof updateItem>[1]
      );
      if (isHandlerError(result)) {
        return Response.json(
          { error: result.error },
          { status: result.status ?? 400 }
        );
      }
      return Response.json(result);
    }
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

  if (
    method === "POST" &&
    segments.length === 1 &&
    segments[0] === "reprocess"
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await reprocessToday(
      env,
      (body ?? {}) as Parameters<typeof reprocessToday>[1]
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
    method === "POST" &&
    segments.length === 2 &&
    segments[0] === "tldr" &&
    segments[1] === "regenerate"
  ) {
    const result = await regenerateTldr(env);
    return Response.json(result);
  }

  if (
    method === "GET" &&
    segments.length === 1 &&
    segments[0] === "llm-calls"
  ) {
    const url = new URL(request.url);
    const result = await getLlmCalls(env, url.searchParams.get("limit"));
    return Response.json(result);
  }

  if (method === "GET" && segments.length === 1 && segments[0] === "items") {
    const url = new URL(request.url);
    const result = await listItems(env, url.searchParams.get("limit"));
    return Response.json(result);
  }

  return notFound();
}

type HandlerArgs = { request: Request; params: any; context: any };

// Bearer-token-gated admin API — never cached at the edge or by browsers.
function noStore(res: Response): Response {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const Route = createFileRoute("/api/admin/$")({
  server: {
    handlers: {
      GET: async ({ request, params, context }: HandlerArgs) =>
        noStore(await handle("GET", params?._splat ?? "", request, context)),
      POST: async ({ request, params, context }: HandlerArgs) =>
        noStore(await handle("POST", params?._splat ?? "", request, context)),
      PUT: async ({ request, params, context }: HandlerArgs) =>
        noStore(await handle("PUT", params?._splat ?? "", request, context)),
      DELETE: async ({ request, params, context }: HandlerArgs) =>
        noStore(await handle("DELETE", params?._splat ?? "", request, context)),
    },
  },
});
