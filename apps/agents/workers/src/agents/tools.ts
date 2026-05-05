import { tool } from "ai";
import { z } from "zod";

type ToolEnv = {
  AI_SEARCH_ENDPOINT?: string;
  AI_SEARCH_SEARCH_ENDPOINT?: string;
  AI_SEARCH_MCP_ENDPOINT?: string;
  AI_SEARCH_AUTH_TOKEN?: string;
};

async function callMcp(
  endpoint: string,
  method: string,
  params: Record<string, unknown>,
  authToken?: string
): Promise<any> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`MCP request failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const payload = (await res.json().catch(() => null)) as
    | { result?: unknown; error?: { message?: string } }
    | null;

  if (!payload) throw new Error("Invalid MCP response");
  if (payload.error) throw new Error(payload.error.message || "MCP error");
  return payload.result;
}

export function createTools(env: ToolEnv, mode: "fast" | "agent") {
  const tools = {
  getTime: tool({
    description: "Get current server time in ISO format.",
    inputSchema: z.object({}),
    execute: async () => ({ now: new Date().toISOString() }),
  }),
  fetchUrlText: tool({
    description: "Fetch a public URL and return plain text excerpt.",
    inputSchema: z.object({ url: z.string().url() }),
    execute: async ({ url }) => {
      const res = await fetch(url, { redirect: "follow" });
      const text = await res.text();
      return {
        status: res.status,
        url,
        excerpt: text.slice(0, 4000),
      };
    },
  }),
  fetchGitHubActivity: tool({
    description: "Fetch latest public GitHub events for an username. Requires approval.",
    inputSchema: z.object({ username: z.string().min(1) }),
    needsApproval: true,
    execute: async ({ username }) => {
      const res = await fetch(`https://api.github.com/users/${username}/events/public`);
      if (!res.ok) {
        return { error: `Failed with status ${res.status}` };
      }
      const events = (await res.json()) as Array<{ type?: string; repo?: { name?: string }; created_at?: string }>;
      return events.slice(0, 10).map((e) => ({
        type: e.type ?? "unknown",
        repo: e.repo?.name ?? "unknown",
        createdAt: e.created_at ?? "",
      }));
    },
  }),
  };

  const searchEndpoint = env.AI_SEARCH_SEARCH_ENDPOINT || env.AI_SEARCH_ENDPOINT;
  const mcpEndpoint = env.AI_SEARCH_MCP_ENDPOINT;

  if (mode === "agent" && searchEndpoint) {
    return {
      ...tools,
      searchKnowledgeBase: tool({
        description:
          "Search the Cloudflare AI Search knowledge base for relevant context before answering site/blog questions.",
        inputSchema: z.object({
          query: z.string().min(2),
          topK: z.number().int().min(1).max(10).optional(),
        }),
        execute: async ({ query, topK }) => {
          // Prefer AI Search MCP server, fallback to /search endpoint.
          if (mcpEndpoint) {
            try {
              const listResult = (await callMcp(
                mcpEndpoint,
                "tools/list",
                {},
                env.AI_SEARCH_AUTH_TOKEN
              )) as {
                tools?: Array<{ name?: string; description?: string }>;
              };

              const tools = listResult?.tools || [];
              const searchTool =
                tools.find((t) => /search/i.test(t.name || "")) ||
                tools.find((t) => /find/i.test(t.name || "")) ||
                tools[0];

              if (searchTool?.name) {
                const mcpResult = await callMcp(
                  mcpEndpoint,
                  "tools/call",
                  {
                    name: searchTool.name,
                    arguments: {
                      query,
                      q: query,
                      top_k: topK ?? 5,
                      limit: topK ?? 5,
                    },
                  },
                  env.AI_SEARCH_AUTH_TOKEN
                );

                return {
                  ok: true,
                  source: "mcp",
                  data: mcpResult,
                };
              }
            } catch (error) {
              // Fall through to direct HTTP search endpoint fallback.
              console.warn("[tools.searchKnowledgeBase] MCP fallback:", error);
            }
          }

          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };

          if (env.AI_SEARCH_AUTH_TOKEN) {
            headers.Authorization = `Bearer ${env.AI_SEARCH_AUTH_TOKEN}`;
          }

          const res = await fetch(searchEndpoint, {
            method: "POST",
            headers,
            body: JSON.stringify({
              query,
              top_k: topK ?? 5,
            }),
          });

          const raw = await res.text();
          if (!res.ok) {
            return {
              ok: false,
              status: res.status,
              error: `AI Search failed with status ${res.status}`,
              response: raw.slice(0, 2000),
            };
          }

          let data: unknown = null;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }

          return {
            ok: true,
            source: "search-endpoint",
            status: res.status,
            data,
          };
        },
      }),
    };
  }

  return tools;
}
