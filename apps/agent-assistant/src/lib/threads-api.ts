import {
  type AssistantAuthEnv,
  authorizeAssistantRequest,
  getCorsHeaders,
} from "./api-auth";

export interface ThreadsEnv extends AssistantAuthEnv {
  THREAD_STORE?: {
    get: (id: unknown) => unknown;
    idFromName: (name: string) => unknown;
  };
}

function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    status,
  });
}

export async function handleThreadsRequest(
  request: Request,
  method: string,
  splat: string,
  env: ThreadsEnv
): Promise<Response> {
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: getCorsHeaders(request),
      status: 204,
    });
  }

  const unauthorized = authorizeAssistantRequest(request, env);
  if (unauthorized) return unauthorized;

  const THREAD_STORE = env.THREAD_STORE;
  if (!THREAD_STORE) {
    return jsonResponse(
      request,
      { error: "THREAD_STORE Durable Object binding not configured." },
      500
    );
  }

  try {
    if (method === "POST" && splat === "threads") {
      const threadId = crypto.randomUUID();
      return jsonResponse(request, {
        created_at: new Date().toISOString(),
        metadata: {},
        status: "idle",
        thread_id: threadId,
      });
    }

    const stateMatch = splat.match(/^threads\/([^/]+)\/state$/);
    if (method === "GET" && stateMatch) {
      const threadId = stateMatch[1];
      const { DurableObjectSaver } = await import("./DurableObjectSaver");
      const { getCompiledGraph } = await import("../../backend/agent");

      const stub = THREAD_STORE.get(THREAD_STORE.idFromName(threadId));
      const checkpointer = new DurableObjectSaver(stub as DurableObjectStub);
      const graph = getCompiledGraph(checkpointer, env);
      const state = await graph.getState({
        configurable: { thread_id: threadId },
      });

      return jsonResponse(request, {
        checkpoint: state.config?.configurable || {},
        created_at: state.createdAt || new Date().toISOString(),
        metadata: state.metadata || {},
        next: state.next || [],
        parent_checkpoint: state.parentConfig?.configurable || null,
        tasks: state.tasks || [],
        values: state.values || {},
      });
    }

    const streamMatch = splat.match(/^threads\/([^/]+)\/runs\/stream$/);
    if (method === "POST" && streamMatch) {
      const threadId = streamMatch[1];
      const body = (await request.json()) as { input?: unknown };
      const input = body.input || {};

      const { DurableObjectSaver } = await import("./DurableObjectSaver");
      const { getCompiledGraph } = await import("../../backend/agent");

      const stub = THREAD_STORE.get(THREAD_STORE.idFromName(threadId));
      const checkpointer = new DurableObjectSaver(stub as DurableObjectStub);
      const graph = getCompiledGraph(checkpointer, env);

      const { readable, writable } = new globalThis.TransformStream();
      const writer = writable.getWriter();
      const encoder = new globalThis.TextEncoder();

      (async () => {
        try {
          const runId = crypto.randomUUID();
          await writer.write(
            encoder.encode(
              `event: metadata\ndata: ${JSON.stringify({ run_id: runId })}\n\n`
            )
          );

          const stream = await graph.stream(input, {
            configurable: { thread_id: threadId },
            streamMode: ["messages", "updates"],
          });

          for await (const [mode, data] of stream) {
            if (mode === "messages") {
              const [messageChunk] = data as [
                {
                  _getType?: () => string;
                  additional_kwargs?: unknown;
                  content?: unknown;
                  id?: unknown;
                  response_metadata?: unknown;
                  tool_calls?: unknown;
                },
                unknown,
              ];
              const msgJson = {
                additional_kwargs: messageChunk.additional_kwargs,
                content: messageChunk.content,
                id: messageChunk.id,
                response_metadata: messageChunk.response_metadata,
                tool_calls: messageChunk.tool_calls,
                type: messageChunk._getType ? messageChunk._getType() : "ai",
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

          await writer.write(encoder.encode(`event: end\ndata: {}\n\n`));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Stream failed";
          console.error("Graph stream execution error:", err);
          await writer.write(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`
            )
          );
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...getCorsHeaders(request),
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Content-Type": "text/event-stream",
        },
      });
    }

    return jsonResponse(
      request,
      { error: `Endpoint ${method} /api/${splat} not found.` },
      404
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    console.error("API handler error:", err);
    return jsonResponse(request, { error: message }, 500);
  }
}
