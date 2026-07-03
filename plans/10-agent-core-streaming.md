# 10 — Agent core + real streaming + conversation history

**Area:** Agents · **Effort:** L · **Impact:** High · **Conflict group:** agent stack + packages · **Depends on:** `00` (secrets) ideally first.

## Problem

Three agent apps diverge with no shared core. `agent-ui` fakes streaming: `agent-api-transport.ts` calls the non-streaming JSON endpoint and wraps the full response in one synthetic chunk, and pairs `@ai-sdk/react@^4` with `ai@^7` (an incompatible split). There is no server-backed history, no thread list, and no tool/approval UI even though agent-api returns `pendingInteractions`.

## Outcome / acceptance criteria

- [ ] New `packages/agent-core` exports the shared system prompt, `DUYET_CONTEXT`, model config, and tool schemas; consumed by `agent-api` (and later `agent-assistant`), removing the duplicated prompt in `agent-api/src/prompt.ts`.
- [ ] `agent-ui` `@ai-sdk/react` upgraded to the `ai@7`-compatible line; types reconcile.
- [ ] agent-ui streams real tokens from agent-api's native streaming route (`/agents/chat-agent/:sessionId` or a new streaming `/api/v1/chat`); the synthetic `textToUiMessageStream` is removed.
- [ ] Thread list + server-backed history: agent-api exposes list/get session endpoints; agent-ui renders a thread sidebar and can resume a conversation cross-device.
- [ ] Tool-call + approval UI renders `pendingInteractions` and tool outputs in the shadcn ai-elements UI.

## Scope

**In:** agent-core extraction, SDK fix, real streaming, history UI + endpoints, tool/approval UI. **Out:** RAG (`11`), MCP server (`12`), evals/cost tracking (`13`). Consolidation (retiring a redundant app) is the **big bet** below — do the core first; propose consolidation in a follow-up.

## Key files

- new `packages/agent-core/**`
- `apps/agent-api/src/{agent.ts,prompt.ts,index.ts,routing.ts}`
- `apps/agent-ui/src/{App.tsx,agent-api-transport.ts}`, `apps/agent-ui/package.json`, `apps/agent-ui/functions/api/v1/chat.ts`

## Approach

1. Create `packages/agent-core` (framework-agnostic exports). Move prompt/context/model/tool schemas there; re-export from agent-api.
2. Upgrade `@ai-sdk/react` in agent-ui to match `ai@7`; fix `useChat`/transport types.
3. Switch the transport to consume agent-api's real UI-message stream; delete the synthetic stream. Keep the same-origin Pages Function proxy.
4. Add `GET /api/v1/sessions` + `GET /api/v1/sessions/:id` to agent-api (reads the SQLite DO); render a thread sidebar in agent-ui; persist selected session id.
5. Render `pendingInteractions`/approvals + tool parts in the UI.
6. Deploy agent-api then agent-ui; browser-QA true streaming, history resume, tool approval, light/dark, mobile.

## Verification

```
pnpm --filter @duyet/agent-api run check-types && pnpm --filter @duyet/agent-api run test
pnpm exec biome lint apps/agent-ui/src apps/agent-api/src packages/agent-core
# Manual/browser: observe token-by-token streaming (not one blocking chunk); resume a thread in a new browser.
```

## Risks

- `useChat` breaking changes across the SDK upgrade — budget time to reconcile the message model.
- DO session read shapes — verify the persisted message schema before building list/get.

## Kickoff Prompt

> You are running plan `plans/10-agent-core-streaming.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md` (App-Specific Command Notes for agent-ui/agent-api), then `plans/10-agent-core-streaming.md`.
>
> Deliver: (1) a new `packages/agent-core` holding the shared system prompt, DUYET_CONTEXT, model config, and tool schemas, consumed by `apps/agent-api` (remove the duplication in `src/prompt.ts`). (2) Upgrade `@ai-sdk/react` in `apps/agent-ui` to the `ai@7`-compatible version and reconcile `useChat`/transport types. (3) Replace the synthetic single-chunk stream in `apps/agent-ui/src/agent-api-transport.ts` with real token streaming from agent-api's native streaming route. (4) Add session list/get endpoints to agent-api and a thread sidebar + resume to agent-ui. (5) Render `pendingInteractions`/approvals and tool outputs in the shadcn ai-elements UI.
>
> Keep it shadcn-only. Verify narrow (`biome lint`, agent-api `check-types`+`test`) then deploy agent-api and agent-ui and browser-QA real streaming + history resume + tool approval in light/dark at desktop and ~390px. Semantic commits (`feat(agents)`). Update the plan Status. If you conclude the three-agent split should be consolidated, write a short recommendation to `plans/10-agent-core-streaming.md` under "Consolidation" rather than deleting an app unattended.
