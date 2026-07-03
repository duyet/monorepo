# 11 — RAG over blog + kb (make the agents actually know things)

**Area:** Agents · **Effort:** L · **Impact:** High · **Conflict group:** agent-api + content build · **Depends on:** `10` (agent-core) helpful; can run parallel.

## Problem

Every agent's "grounding" today is a static paragraph of bio text. The prompt advertises answering about "blog, CV, GitHub activity, analytics," but no agent can retrieve any of it. Duyet has ~314 posts + a kb — the ideal corpus.

## Outcome / acceptance criteria

- [ ] A build/index pipeline embeds `apps/blog` posts + `apps/kb` articles into Cloudflare Vectorize (or an equivalent vector store bound to the Worker).
- [ ] agent-api gains a `searchKnowledge(query)` tool returning top-k chunks with source URLs; the model cites them in answers.
- [ ] First-party tools: `searchPosts`, `getCv`, `recentGitHubActivity`, `getAnalytics` (thin wrappers over existing data — blog posts-data.json, cv config, `apps/api`).
- [ ] Answers to "what has Duyet written about X" return real posts with links, not a generic bio.
- [ ] Re-index runs in CI when blog/kb content changes.

## Scope

**In:** embedding pipeline, Vectorize binding, `searchKnowledge` + first-party tools, citations. **Out:** MCP transport (`12` — this plan wires tools directly into agent-api; `12` re-exposes them over MCP), agent-assistant graph tools (`12`).

## Key files

- new `apps/agent-api/src/tools/{searchKnowledge,searchPosts,getCv,github,analytics}.ts`, `apps/agent-api/src/agent.ts` (register tools, raise `stepCountIs`), `apps/agent-api/wrangler.toml` (Vectorize + embeddings binding)
- new indexing script (reuse blog `public/posts-data.json` + per-post `.md`, kb `public/k/*.md`)
- `.github/workflows/*` (re-index step)

## Approach

1. Choose embeddings: Workers AI `@cf/baai/bge-*` (no extra key, already in the Workers AI account) → Vectorize.
2. Write an indexer that chunks the already-generated markdown (`apps/blog/public/**/*.md`, `apps/kb/public/k/*.md`), embeds, and upserts to Vectorize with `{url,title,chunk}` metadata. Idempotent by content hash.
3. Add `searchKnowledge` tool: embed the query, query Vectorize top-k, return chunks + URLs. Add the thin first-party tools over existing JSON/config/`apps/api`.
4. Register tools in agent-api; raise `stepCountIs(5)`→~10; update the system prompt (in `packages/agent-core`) to instruct citing sources.
5. Add a CI re-index step gated on content changes. Deploy; browser-QA grounded answers with links.

## Verification

```
pnpm --filter @duyet/agent-api run check-types && pnpm --filter @duyet/agent-api run test
# Manual: ask the deployed agent "what has Duyet written about ClickHouse?" → returns real post links.
```

## Risks

- Vectorize index size/cost — chunk sensibly; start with blog+kb only.
- Embedding drift vs the byte-identical-slug concern — unrelated; safe.
- Keep the indexer build-time/CI, not per-request.

## Kickoff Prompt

> You are running plan `plans/11-rag-content.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then `plans/11-rag-content.md`. Note the agent-api already supports tool-calling and MCP clients (`apps/agent-api/src/agent.ts:199-220`).
>
> Build: (1) an idempotent indexer that chunks and embeds the already-generated markdown from `apps/blog/public/**/*.md` and `apps/kb/public/k/*.md` into Cloudflare Vectorize using a Workers AI embedding model; add the Vectorize + embedding bindings to `apps/agent-api/wrangler.toml`. (2) A `searchKnowledge(query)` tool returning top-k chunks with source URLs, plus thin first-party tools `searchPosts`/`getCv`/`recentGitHubActivity`/`getAnalytics` over existing data (`posts-data.json`, cv config, `apps/api`). (3) Register the tools in agent-api, raise `stopWhen: stepCountIs(5)` to ~10, and update the system prompt (prefer `packages/agent-core` if it exists from plan 10) to cite sources. (4) A CI re-index step gated on blog/kb content changes.
>
> Verify agent-api `check-types`+`test`, deploy, and browser-QA that asking the live agent about a real topic (e.g. ClickHouse) returns actual post links. Semantic commits (`feat(agents)`). Keep indexing build-time/CI, never per-request. Update the plan Status and note the Vectorize index name in `docs/ai/core-memory.md`.
