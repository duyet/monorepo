import { createFileRoute } from "@tanstack/react-router";
import {
  checkAdminAuth,
  checkAdminAuthRateLimit,
  isRequestAdmin,
} from "../../../worker/admin/auth.js";
import {
  deleteSource,
  decideSubmission,
  decideSuggestion,
  getLlmCalls,
  getStatus,
  isHandlerError,
  listAudit,
  listNotifications,
  listItems,
  listPendingSubmissions,
  listPendingSuggestions,
  listSources,
  pushItems,
  regenerateTldr,
  reprocessToday,
  retryTelegramDigest,
  triggerIngest,
  updateItem,
  upsertSource,
} from "../../../worker/admin/handlers.js";
import {
  getCampaign,
  isMailError,
  listCampaigns,
  listSubscribers,
  listTemplates,
  previewCampaign,
  saveCampaign,
  sendCampaign,
  upsertTemplate,
  wrapCampaign,
} from "../../../worker/mail/campaigns.js";
import { listMailContent } from "../../../worker/mail/content.js";
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
    const rateLimited = await checkAdminAuthRateLimit(request, env);
    if (rateLimited) return rateLimited;
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
    const force = new URL(request.url).searchParams.get("force") === "1";
    const result = await triggerIngest(env, { force });
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

  if (method === "GET" && segments[0] === "mail") {
    return handleMail("GET", segments.slice(1), request, env);
  }
  if (method === "POST" && segments[0] === "mail") {
    return handleMail("POST", segments.slice(1), request, env);
  }
  if (method === "PUT" && segments[0] === "mail") {
    return handleMail("PUT", segments.slice(1), request, env);
  }

  if (
    method === "GET" &&
    segments.length === 1 &&
    segments[0] === "notifications"
  ) {
    return Response.json(await listNotifications(env));
  }

  if (method === "GET" && segments.length === 1 && segments[0] === "audit") {
    return Response.json(await listAudit(env));
  }

  if (
    method === "GET" &&
    segments.length === 1 &&
    segments[0] === "suggestions"
  ) {
    const url = new URL(request.url);
    return Response.json(
      await listPendingSuggestions(env, url.searchParams.get("limit"))
    );
  }

  if (
    method === "GET" &&
    segments.length === 1 &&
    segments[0] === "submissions"
  ) {
    const url = new URL(request.url);
    return Response.json(
      await listPendingSubmissions(env, url.searchParams.get("limit"))
    );
  }

  if (
    method === "POST" &&
    segments.length === 2 &&
    segments[0] === "suggestions" &&
    segments[1] === "decide"
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await decideSuggestion(
      env,
      (body ?? {}) as Parameters<typeof decideSuggestion>[1]
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
    segments[0] === "submissions" &&
    segments[1] === "decide"
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await decideSubmission(
      env,
      (body ?? {}) as Parameters<typeof decideSubmission>[1]
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
    segments[0] === "notify" &&
    segments[1] === "digest"
  ) {
    return Response.json(await retryTelegramDigest(env));
  }

  return notFound();
}

async function handleMail(
  method: string,
  segments: string[],
  request: Request,
  env: Env
): Promise<Response> {
  if (
    method === "GET" &&
    segments[0] === "subscribers" &&
    segments.length === 1
  ) {
    return Response.json(await listSubscribers(env));
  }
  if (
    method === "GET" &&
    segments[0] === "templates" &&
    segments.length === 1
  ) {
    return Response.json(await listTemplates(env));
  }
  if (
    method === "PUT" &&
    segments[0] === "templates" &&
    segments.length === 2
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await upsertTemplate(
      env,
      segments[1],
      (body ?? {}) as Record<string, unknown>
    );
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }
  if (method === "GET" && segments[0] === "content" && segments.length === 1) {
    return Response.json(await listMailContent(env));
  }
  if (method === "POST" && segments[0] === "preview" && segments.length === 1) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const draft = (body ?? {}) as {
      subject?: string;
      preheader?: string;
      body_md?: string;
      cta_label?: string;
      cta_url?: string;
    };
    if (!draft.subject || !draft.body_md) {
      return Response.json(
        { error: "subject and body_md required" },
        { status: 400 }
      );
    }
    return Response.json(
      previewCampaign({
        subject: draft.subject,
        preheader: draft.preheader ?? "",
        body_md: draft.body_md,
        cta_label: draft.cta_label ?? "",
        cta_url: draft.cta_url ?? "",
      })
    );
  }
  if (
    method === "GET" &&
    segments[0] === "campaigns" &&
    segments.length === 1
  ) {
    return Response.json(await listCampaigns(env));
  }
  if (
    method === "GET" &&
    segments[0] === "campaigns" &&
    segments.length === 2
  ) {
    const result = await getCampaign(env, segments[1]);
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 404 }
      );
    }
    return Response.json(result);
  }
  if (
    method === "GET" &&
    segments[0] === "campaigns" &&
    segments[1] &&
    segments[2] === "preview"
  ) {
    const campaign = await getCampaign(env, segments[1]);
    if (isMailError(campaign)) {
      return Response.json(
        { error: campaign.error },
        { status: campaign.status ?? 404 }
      );
    }
    return Response.json(previewCampaign(campaign));
  }
  if (
    method === "POST" &&
    segments[0] === "campaigns" &&
    segments.length === 1
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await saveCampaign(
      env,
      (body ?? {}) as Parameters<typeof saveCampaign>[1]
    );
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }
  if (method === "POST" && segments[0] === "wrap" && segments.length === 1) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await wrapCampaign(
      env,
      (body ?? {}) as Parameters<typeof wrapCampaign>[1]
    );
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }
  if (
    method === "POST" &&
    segments[0] === "campaigns" &&
    segments.length === 3 &&
    segments[2] === "wrap"
  ) {
    const { body, error } = await parseJsonBody(request);
    if (error) return Response.json({ error }, { status: 400 });
    const result = await wrapCampaign(env, {
      ...((body ?? {}) as object),
      campaignId: segments[1],
    });
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
    return Response.json(result);
  }
  if (
    method === "POST" &&
    segments[0] === "campaigns" &&
    segments.length === 3 &&
    segments[2] === "send"
  ) {
    const url = new URL(request.url);
    const hasTest = url.searchParams.has("test");
    const testEmail = url.searchParams.get("test")?.trim() || undefined;
    if (hasTest && !testEmail) {
      return Response.json({ error: "test email required" }, { status: 400 });
    }
    const result = await sendCampaign(
      env,
      segments[1],
      hasTest ? { testEmail } : {}
    );
    if (isMailError(result)) {
      return Response.json(
        { error: result.error },
        { status: result.status ?? 400 }
      );
    }
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
