import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders } from "../../lib/api-auth";
import { handleThreadsRequest, type ThreadsEnv } from "../../lib/threads-api";

function getRequestEnv(
  context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv } | undefined
): ThreadsEnv {
  const bindings =
    (globalThis as { CF_ENV?: ThreadsEnv }).CF_ENV ||
    context?.cloudflare?.env ||
    context?.env ||
    {};
  const processEnv =
    typeof process !== "undefined" ? (process.env as ThreadsEnv) : {};

  return {
    ...processEnv,
    ...bindings,
  };
}

async function dispatch(
  request: Request,
  method: string,
  splat: string,
  context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv }
): Promise<Response> {
  return handleThreadsRequest(request, method, splat, getRequestEnv(context));
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: { _splat?: string };
        context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv };
      }) => {
        return dispatch(request, "GET", params._splat || "", context);
      },
      POST: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: { _splat?: string };
        context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv };
      }) => {
        return dispatch(request, "POST", params._splat || "", context);
      },
      PUT: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: { _splat?: string };
        context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv };
      }) => {
        return dispatch(request, "PUT", params._splat || "", context);
      },
      PATCH: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: { _splat?: string };
        context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv };
      }) => {
        return dispatch(request, "PATCH", params._splat || "", context);
      },
      DELETE: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: { _splat?: string };
        context: { cloudflare?: { env?: ThreadsEnv }; env?: ThreadsEnv };
      }) => {
        return dispatch(request, "DELETE", params._splat || "", context);
      },
      OPTIONS: async ({ request }: { request: Request }) => {
        return new Response(null, {
          headers: getCorsHeaders(request),
          status: 204,
        });
      },
    },
  },
} as never);
