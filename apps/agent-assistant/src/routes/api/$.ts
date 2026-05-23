import { getCompiledGraph } from "../../../backend/agent";
import { DurableObjectSaver } from "../../lib/DurableObjectSaver";

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

async function handleRequest(
  request: Request,
  method: string,
  splat: string,
  context: any
) {
  // Extract Cloudflare environment/bindings from global context or request context
  const cfEnv =
    (globalThis as any).CF_ENV ||
    (typeof process !== "undefined" ? process.env : null) ||
    context?.cloudflare?.env ||
    context?.env ||
    context ||
    {};
  const THREAD_STORE = cfEnv.THREAD_STORE;

  if (!THREAD_STORE) {
    return new Response(
      JSON.stringify({
        error: "THREAD_STORE Durable Object binding not configured.",
        debug: {
          contextKeys: Object.keys(context || {}),
          cfEnvKeys: Object.keys(cfEnv || {}),
        },
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // 1. POST /threads -> Create thread
    if (method === "POST" && splat === "threads") {
      const threadId = crypto.randomUUID();

      return new Response(
        JSON.stringify({
          thread_id: threadId,
          created_at: new Date().toISOString(),
          status: "idle",
          metadata: {},
        }),
        {
          headers: {
            ...getCorsHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 2. GET /threads/:id/state -> Get state
    const stateMatch = splat.match(/^threads\/([^/]+)\/state$/);
    if (method === "GET" && stateMatch) {
      const threadId = stateMatch[1];
      const stub = THREAD_STORE.get(THREAD_STORE.idFromName(threadId));
      const checkpointer = new DurableObjectSaver(stub);

      const graph = getCompiledGraph(checkpointer, cfEnv);
      const state = await graph.getState({
        configurable: { thread_id: threadId },
      });

      return new Response(
        JSON.stringify({
          values: state.values || {},
          next: state.next || [],
          checkpoint: state.config?.configurable || {},
          metadata: state.metadata || {},
          created_at: state.createdAt || new Date().toISOString(),
          parent_checkpoint: state.parentConfig?.configurable || null,
          tasks: state.tasks || [],
        }),
        {
          headers: {
            ...getCorsHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 3. POST /threads/:id/runs/stream -> Create streaming run
    const streamMatch = splat.match(/^threads\/([^/]+)\/runs\/stream$/);
    if (method === "POST" && streamMatch) {
      const threadId = streamMatch[1];
      const body = (await request.json()) as any;
      const input = body.input || {};

      const stub = THREAD_STORE.get(THREAD_STORE.idFromName(threadId));
      const checkpointer = new DurableObjectSaver(stub);

      const graph = getCompiledGraph(checkpointer, cfEnv);

      // Create a readable stream that yields SSE
      const { readable, writable } = new globalThis.TransformStream();
      const writer = writable.getWriter();
      const encoder = new globalThis.TextEncoder();

      // Launch execution in the background and pipe to stream
      (async () => {
        try {
          // Write metadata event at the start
          const runId = crypto.randomUUID();
          await writer.write(
            encoder.encode(
              `event: metadata\ndata: ${JSON.stringify({ run_id: runId })}\n\n`
            )
          );

          // Standard graph.stream call with multiple modes
          const stream = await graph.stream(input, {
            configurable: { thread_id: threadId },
            streamMode: ["messages", "updates"],
          });

          for await (const [mode, data] of stream) {
            if (mode === "messages") {
              const [messageChunk, _metadata] = data as any;
              const msgJson = {
                type: messageChunk._getType ? messageChunk._getType() : "ai",
                content: messageChunk.content,
                id: messageChunk.id,
                additional_kwargs: messageChunk.additional_kwargs,
                response_metadata: messageChunk.response_metadata,
                tool_calls: messageChunk.tool_calls,
              };
              await writer.write(
                encoder.encode(
                  `event: messages/partial\ndata: ${JSON.stringify([msgJson])}\n\n`
                )
              );
            } else if (mode === "updates") {
              await writer.write(
                encoder.encode(
                  `event: updates\ndata: ${JSON.stringify(data)}\n\n`
                )
              );
            }
          }

          // Terminating event (end of run)
          await writer.write(encoder.encode(`event: end\ndata: {}\n\n`));
        } catch (err: any) {
          console.error("Graph stream execution error:", err);
          await writer.write(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`
            )
          );
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...getCorsHeaders(),
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response(
      JSON.stringify({ error: `Endpoint ${method} /api/${splat} not found.` }),
      {
        status: 404,
        headers: {
          ...getCorsHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("API handler error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(),
          "Content-Type": "application/json",
        },
      }
    );
  }
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: any;
        context: any;
      }) => {
        const splat = (params as any)._splat || "";
        return handleRequest(request, "GET", splat, context);
      },
      POST: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: any;
        context: any;
      }) => {
        const splat = (params as any)._splat || "";
        return handleRequest(request, "POST", splat, context);
      },
      PUT: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: any;
        context: any;
      }) => {
        const splat = (params as any)._splat || "";
        return handleRequest(request, "PUT", splat, context);
      },
      PATCH: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: any;
        context: any;
      }) => {
        const splat = (params as any)._splat || "";
        return handleRequest(request, "PATCH", splat, context);
      },
      DELETE: async ({
        request,
        params,
        context,
      }: {
        request: Request;
        params: any;
        context: any;
      }) => {
        const splat = (params as any)._splat || "";
        return handleRequest(request, "DELETE", splat, context);
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: getCorsHeaders(),
        });
      },
    },
  },
} as any);
