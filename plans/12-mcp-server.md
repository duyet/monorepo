# 12 — Reactivate apps/mcp as the duyet.net MCP server

**Area:** Agents · **Effort:** L · **Impact:** High · **Conflict group:** apps/mcp (isolated) + agent registration · **Depends on:** `11` (tools/index) strongly.

## Problem

`apps/mcp` is an empty placeholder. agent-api is already an MCP *client* (`addMcpServer`) and agent-assistant's assistant-ui already renders MCP tool parts — but there is no MCP *server* exposing Duyet's content/tools. Building it turns the stub into the missing shared tool layer both agent apps can consume, and makes Duyet's content addressable by any MCP client (Claude Desktop, Cowork, etc.).

## Outcome / acceptance criteria

- [ ] `apps/mcp` is a real Cloudflare Workers MCP server at a stable URL (e.g. `mcp.duyet.net`).
- [ ] Exposes tools: `search_knowledge` (RAG from `11`), `search_posts`, `get_post`, `get_cv`, `recent_github_activity`, `get_analytics`.
- [ ] agent-api registers it via its existing `addMcpServer`; the LangGraph graph in agent-assistant binds the same tools (kills the dead tool UI).
- [ ] Authenticated (bearer/OAuth) and rate-limited; documented in a README + a kb article.

## Scope

**In:** the MCP server + wiring both agents + docs. **Out:** the underlying index (owned by `11`); consolidation of agent apps (`10`).

## Key files

- new `apps/mcp/**` (package.json, wrangler.toml, src/), reusing `packages/agent-core` tool schemas + `11`'s Vectorize index
- `apps/agent-api/src/agent.ts` (register server), `apps/agent-assistant/backend/agent.ts` (bind tools into the graph)
- new `apps/kb/kb/**` article documenting the MCP endpoint

## Approach

1. Scaffold a Workers MCP server (Streamable HTTP transport). Import tool implementations from `packages/agent-core` / reuse `11`'s tool code so there's one implementation.
2. Add auth (bearer token; optionally the Workers OAuth provider) + KV rate limiting.
3. Point agent-api at it via `addMcpServer`; bind the same tools into agent-assistant's graph so its assistant-ui tool rendering becomes live.
4. Add DNS/route for `mcp.duyet.net`, deploy, and verify with an MCP client (list tools + call `search_knowledge`).
5. Document in README + a kb article; add to `packages/config` app registry.

## Verification

```
pnpm --filter @duyet/mcp run check-types
# Manual: connect an MCP client to the deployed URL; list tools; call search_knowledge and get real results.
```

## Risks

- Workers MCP transport/auth maturity — follow current Cloudflare Agents/MCP docs (use the Context7/Cloudflare docs tools).
- Don't duplicate tool logic — import from the same module `11` created.

## Kickoff Prompt

> You are running plan `plans/12-mcp-server.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then `plans/12-mcp-server.md` and `plans/11-rag-content.md`. Use the Cloudflare docs / Context7 tools for current Workers MCP-server patterns.
>
> Build `apps/mcp` as a real Cloudflare Workers MCP server (Streamable HTTP) exposing `search_knowledge` (reusing plan 11's Vectorize index + tool code — do not reimplement), `search_posts`, `get_post`, `get_cv`, `recent_github_activity`, `get_analytics`. Add bearer auth + KV rate limiting. Register it in `apps/agent-api` via the existing `addMcpServer`, and bind the same tools into the `apps/agent-assistant` LangGraph graph (`backend/agent.ts`) so its assistant-ui tool UI is no longer dead. Add the `mcp.duyet.net` route, deploy, and verify by connecting an MCP client and calling `search_knowledge`. Document the endpoint in a new `apps/kb` article and add it to `packages/config`. Semantic commits (`feat(agents)` / `feat(mcp)` — add a scope if needed). Update the plan Status.
