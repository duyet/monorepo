# 13 — Agent observability + evals + tests

**Area:** Agents · **Effort:** M · **Impact:** Med · **Conflict group:** agent stack · **Depends on:** `10`/`11` land first (more to measure).

## Problem

Zero cost/latency/token visibility across the agents. Only agent-api has unit tests (17); agent-ui/agent-assistant have none. No evals — no way to know if a prompt change breaks grounding, refusals, or tool selection. `stopWhen: stepCountIs(5)` may truncate loops. Chat endpoints have no rate limiting (agent-assistant CORS is `*`).

## Outcome / acceptance criteria

- [ ] agent-api logs per-request `{model, promptTokens, completionTokens, latencyMs, estCostUsd, toolCalls}` via the AI SDK `onFinish` hook to Cloudflare Analytics Engine (or structured logs).
- [ ] An `insights` panel (or a widget) surfaces agent cost/latency/volume trends.
- [ ] A golden-prompt eval suite scores grounding accuracy, correct refusals, and tool-selection; runnable locally + in CI (non-blocking to start).
- [ ] Integration tests for the agent-ui transport and the agent-assistant graph.
- [ ] Rate limiting on chat endpoints; agent-assistant CORS tightened to an allowlist.
- [ ] Multi-model routing config in agent-api (default + per-request override + fallback).

## Scope

**In:** telemetry, eval harness, tests, rate limit, model routing. **Out:** RAG (`11`), MCP (`12`).

## Key files

- `apps/agent-api/src/agent.ts` (`_onFinish` at ~:277, `stepCountIs` at ~:411), new `src/models.ts`, `apps/agent-api/wrangler.toml` (Analytics Engine binding)
- new `apps/agent-api/evals/**`, `apps/agent-ui/src/*.test.ts`, `apps/agent-assistant/backend/*.test.ts`
- `apps/insights/**` (agent panel) or a Cowork artifact
- `.github/workflows/*` (eval job)

## Approach

1. Wire `onFinish` → Analytics Engine with usage + latency + est cost (per-model price table). Raise `stepCountIs` to ~10.
2. Add `src/models.ts`: config-driven model selection with fallback; expose an optional per-request override.
3. Build a small eval runner (golden prompts + assertions/LLM-judge) under `evals/`; add a CI job (non-blocking).
4. Add integration tests: agent-ui transport (mock stream), agent-assistant graph (invoke + assert).
5. Add KV/DO rate limiting to chat endpoints; set agent-assistant CORS to an allowlist.
6. Add an insights agent panel; deploy; QA.

## Verification

```
pnpm --filter @duyet/agent-api run test
pnpm --filter @duyet/agent-api run eval   # new script
# Manual: confirm Analytics Engine rows appear after a few live chats.
```

## Risks

- Eval determinism — use tolerant assertions / an LLM judge; keep CI non-blocking initially.
- Analytics Engine binding provisioning.

## Kickoff Prompt

> You are running plan `plans/13-agent-observability-evals.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. Assume plans `10`/`11` may have landed (shared core, tools).
>
> Deliver: (1) per-request telemetry in `apps/agent-api` via the AI SDK `onFinish` hook → Cloudflare Analytics Engine (`{model, tokens, latencyMs, estCostUsd, toolCalls}` with a per-model price table); add the binding to `wrangler.toml` and raise `stepCountIs` to ~10. (2) `src/models.ts` for config-driven multi-model routing with fallback + optional per-request override. (3) A golden-prompt eval harness under `apps/agent-api/evals/` (grounding, refusal, tool-selection) + a non-blocking CI job + an `eval` script. (4) Integration tests for the agent-ui transport and the agent-assistant graph. (5) KV/DO rate limiting on chat endpoints and an allowlist CORS for agent-assistant. (6) An agent cost/latency/volume panel in `apps/insights`.
>
> Verify tests + eval, deploy, run a few live chats and confirm Analytics Engine rows, then browser-QA the insights panel in light/dark. Semantic commits (`feat(agents)`, `test(agents)`). Update the plan Status.
