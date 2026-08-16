import type { Env } from "../types.js";
import { checkAuth } from "./auth.js";
import {
  deleteSource,
  getStatus,
  isHandlerError,
  listSources,
  pushItems,
  triggerIngest,
  upsertSource,
} from "./handlers.js";

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
}

const ITEM_SCHEMA = {
  type: "object",
  properties: {
    url: { type: "string" },
    title: { type: "string" },
    summary: { type: "string" },
    source_id: { type: "string" },
    published_at: {
      type: "number",
      description: "Epoch milliseconds. Defaults to now if omitted.",
    },
    points: { type: "number" },
    comments: { type: "number" },
    category: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    title_vi: { type: "string" },
    summary_vi: { type: "string" },
    relevance: { type: "number" },
    importance: { type: "number" },
    quality: { type: "number" },
  },
  required: ["url", "title"],
};

const TOOLS = [
  {
    name: "push_items",
    description:
      "Push one or more news items into the feed. Accepts a single item or an array of items.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          anyOf: [ITEM_SCHEMA, { type: "array", items: ITEM_SCHEMA }],
        },
      },
      required: ["items"],
    },
  },
  {
    name: "list_sources",
    description: "List all configured news sources.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "upsert_source",
    description:
      "Create or update a news source. type must be a registered adapter type or 'push'.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { type: "string" },
        config: { type: "object" },
        enabled: { type: "boolean" },
      },
      required: ["id", "name", "type"],
    },
  },
  {
    name: "delete_source",
    description: "Delete a news source by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "trigger_ingest",
    description: "Trigger a new news ingestion workflow run.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_status",
    description:
      "Get the last 10 workflow runs and item counts grouped by status.",
    inputSchema: { type: "object", properties: {} },
  },
];

function rpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

function rpcError(id: unknown, code: number, message: string) {
  return Response.json({ jsonrpc: "2.0", id, error: { code, message } });
}

async function callTool(env: Env, name: string, args: Record<string, unknown>) {
  switch (name) {
    case "push_items":
      return pushItems(env, args.items as Parameters<typeof pushItems>[1]);
    case "list_sources":
      return listSources(env);
    case "upsert_source":
      return upsertSource(
        env,
        args.id as string,
        args as unknown as Parameters<typeof upsertSource>[2]
      );
    case "delete_source":
      return deleteSource(env, args.id as string);
    case "trigger_ingest":
      return triggerIngest(env);
    case "get_status":
      return getStatus(env);
    default:
      return { error: `unknown tool "${name}"`, status: 404 };
  }
}

/**
 * Hand-rolled MCP server over stateless JSON-RPC 2.0 / HTTP (no session,
 * every request re-authenticates). Auth failure returns checkAuth's plain
 * HTTP 401/500 Response directly (not a JSON-RPC error object) — chosen
 * for consistency with the REST admin routes, which share the same
 * checkAuth gate.
 */
export async function handleMcpRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const authResponse = checkAuth(request, env);
  if (authResponse) return authResponse;

  let body: JsonRpcRequest;
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id = null, method, params } = body ?? {};

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "duyet-news", version: "0.1.0" },
    });
  }

  if (method === "notifications/initialized") {
    return new Response(null, { status: 202 });
  }

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const name = params?.name ?? "";
    const args = params?.arguments ?? {};
    const result = await callTool(env, name, args);
    if (isHandlerError(result)) {
      return rpcResult(id, {
        content: [
          { type: "text", text: JSON.stringify({ error: result.error }) },
        ],
        isError: true,
      });
    }
    return rpcResult(id, {
      content: [{ type: "text", text: JSON.stringify(result) }],
    });
  }

  return rpcError(id, -32601, "Method not found");
}
