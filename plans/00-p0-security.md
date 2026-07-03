# 00 — P0 Security: secrets, API auth, deploy gate

**Area:** Platform / All · **Effort:** M · **Impact:** Critical · **Conflict group:** CI/workflows + apps/api · **Depends on:** none — run this FIRST.

## Problem

The audit surfaced four issues that are actively dangerous:

1. **Leaked secrets in git.** `apps/agent-assistant/backend/agent.ts` embeds real key prefixes (`sk-proj-epynv…`, `AIzaSyBfJXU8rnLS1btLv…`) as "placeholder detection"; `apps/agent-assistant/scratch/test-anyrouter.ts` embeds a full `sk-ar-v1-…` key; `.env.local` on disk has the matching full keys.
2. **`apps/api` is unauthenticated** — paid OpenRouter calls and raw ClickHouse queries are publicly reachable; `/api/insights/overview` is gated only by a bypassable CORS check.
3. **Deceptive offline fallback** in agent-assistant serves canned answers that claim to be the working assistant.
4. **`cf-worker-deploy.yml`** deploys `api` + `agent-api` with no test/lint/typecheck gate.

## Outcome / acceptance criteria

- [ ] No secret material (keys, prefixes, tokens) anywhere in tracked files. `rg -n "sk-proj-|sk-ar-v1-|AIzaSy" apps packages scripts` returns 0.
- [ ] agent-assistant reads config from env only; an `isConfigured` boolean drives behavior. When unconfigured it shows an explicit "AI unavailable — configure keys" state (no fake answers).
- [ ] `apps/api` requires auth on all non-health endpoints: bearer `API_TOKEN` (timing-safe) **or** Clerk, mirroring `apps/agent-api/src/auth.ts`. Per-IP/token rate limiting via a KV counter. Existing callers (insights build, ai-percentage client) updated to send the token.
- [ ] `cf-worker-deploy.yml` runs typecheck + unit tests + lint before deploy (`needs:` gate).
- [ ] Client PostHog key aligned so analytics initializes.
- [ ] A short `SECURITY.md` documents the secret-rotation runbook.

## Scope

**In:** the four items above + PostHog key fix. **Out:** full observability (`40`), full metrics-API build-out (`30` — this plan only lands auth+rate-limit as the foundation).

## Key files

- `apps/agent-assistant/backend/agent.ts` (offline fallback + key checks), `apps/agent-assistant/scratch/test-anyrouter.ts`, `apps/agent-assistant/.gitignore`
- `apps/api/src/index.ts`, `apps/api/src/routes/*`, `apps/api/wrangler.toml` (add KV), reuse `apps/agent-api/src/auth.ts`
- `.github/workflows/cf-worker-deploy.yml`
- `packages/components/Analytics.tsx` (PostHog key)
- new `SECURITY.md`

## Approach

1. **Secrets:** delete the hardcoded prefixes/keys; replace with `const isConfigured = !!env.OPENAI_API_KEY` style checks. Add `scratch/` and `.env*.local` to gitignore if not already. **Tell the user to rotate** OpenAI/Gemini/AnyRouter keys (agent cannot rotate third-party keys). Optionally scrub history with `git filter-repo` — flag as a follow-up requiring force-push approval.
2. **Honest fallback:** replace `getOfflineFallbackResponse()` canned copy with a real degraded UI state.
3. **api auth:** extract/port the timing-safe token compare + Clerk verify from `agent-api`. Add middleware; exempt `/` and `/health`. Add a KV namespace + a simple fixed-window rate limiter. Update the insights build fetch + ai-percentage client to pass `Authorization`.
4. **Worker gate:** add `needs: [typecheck, unittest, lint]` (or a reusable gate job) to `cf-worker-deploy.yml`.
5. **PostHog:** align the client key name in `Analytics.tsx` with the provisioned env var.
6. Deploy `api` + `agent-api` + `agent-assistant`; browser-QA that endpoints 401 without a token and 200 with one, and the assistant shows the honest state when unconfigured.

## Verification

```
rg -n "sk-proj-|sk-ar-v1-|AIzaSy" apps packages scripts        # expect 0
pnpm exec biome lint apps/api/src apps/agent-assistant/backend
pnpm --filter @duyet/api run check-types && pnpm --filter @duyet/api run test
curl -s -o /dev/null -w "%{http_code}" https://api.duyet.net/api/insights/overview   # expect 401
```

## Risks

- **Breaking existing api callers** — update insights + ai-percentage in the same PR; deploy api last, after callers are ready to send tokens, or ship auth in "warn-only" mode for one deploy then enforce.
- History scrub requires force-push — do not do it unattended; leave as a documented follow-up.

## Kickoff Prompt

> You are running plan `plans/00-p0-security.md` in the duyet.net monorepo with **full autonomy including production deploy**. Read `CLAUDE.md` and `docs/ai/internal-knowledge.md` first, then `plans/00-p0-security.md` and `plans/AUDIT.md` (Critical issues section).
>
> Do all of: (1) remove every hardcoded key/prefix from `apps/agent-assistant/backend/agent.ts` and `scratch/test-anyrouter.ts`, replacing placeholder-prefix checks with env-driven `isConfigured` flags; ensure `.env*.local` and `scratch/` are gitignored. (2) Replace the deceptive `getOfflineFallbackResponse` with an explicit "AI unavailable — configure keys" state. (3) Add auth to `apps/api`: port the timing-safe bearer + Clerk pattern from `apps/agent-api/src/auth.ts`, exempt `/` and `/health`, add a KV-backed fixed-window rate limiter (add the KV binding to `wrangler.toml`), and update the insights build fetch + ai-percentage client to send `Authorization`. (4) Add a `needs: [typecheck, unittest, lint]` gate to `.github/workflows/cf-worker-deploy.yml`. (5) Fix the client PostHog key in `packages/components/Analytics.tsx`. (6) Add `SECURITY.md` with a rotation runbook.
>
> Verify with the commands in the plan. Use semantic commits (`fix(agents)`, `feat(api)`, `ci`). Deploy affected apps, then browser-QA that `api.duyet.net` endpoints return 401 without a token and 200 with one, and the assistant shows the honest state. **Do not force-push or rewrite git history** — instead, end your run by printing a clear message to the user: "Rotate these now-exposed keys: OpenAI, Gemini, AnyRouter," plus the optional `git filter-repo` follow-up. Update the Status section of the plan and add a durable note to `docs/ai/core-memory.md`.
