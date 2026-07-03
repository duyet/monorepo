# 40 — Production readiness: error tracking + e2e + CI gates

**Area:** Platform · **Effort:** L · **Impact:** High · **Conflict group:** CI/workflows + all apps · **Depends on:** `00` (worker gate lands there); coordinate CI edits.

## Problem

**No error tracking** anywhere — prod failures are invisible; ErrorBoundaries swallow client errors; Axiom env is set but unwired. **No e2e** (zero Playwright). Coverage tooling wired but no thresholds/enforcement. CI lacks a Lighthouse/perf budget, bundle-size gate, a11y gate, and **`concurrency:` cancel** (wasted minutes). A few floating action pins remain.

## Outcome / acceptance criteria

- [ ] Error tracking (Sentry or Cloudflare-native) in the apps + wired to the shared `ErrorBoundary`; source maps uploaded; a real DSN secret in the sync flow.
- [ ] Playwright e2e smoke suite (home/blog/agent-ui load, agent-api `/health`, auth flow, dark-mode toggle, no console errors) running against preview URLs as a **required pre-deploy gate**.
- [ ] `concurrency: cancel-in-progress` on test/lint/cf-deploy*.
- [ ] Bundle-size gate (size-limit budgets) + Lighthouse CI (perf budget) against preview URLs.
- [ ] axe a11y checks in the e2e suite; re-enable a11y Biome rules incrementally.
- [ ] CodeQL SAST + make `pnpm audit` blocking on high-sev.

## Scope

**In:** observability + e2e + CI gates. **Out:** design-system/playground (`41`), env validation (`42`). `cf-worker-deploy.yml` gate is owned by `00` — don't double-edit; add the other gates here.

## Key files

- `packages/components/ErrorBoundary.tsx`, all `apps/*` entry points, `turbo.json` globalEnv
- new `e2e/**`, `playwright.config.ts`, `lighthouserc.json`, per-app `size-limit` config
- `.github/workflows/{test,lint,cf-deploy,cf-deploy-preview}.yml`, new `lighthouse.yml`, `codeql.yml`
- `biome.json` (a11y rules)

## Approach

1. Add Sentry (Workers + browser SDK): init in each app, report from the shared ErrorBoundary, upload source maps in CI. Remove dead Axiom config or wire it.
2. Add Playwright + a smoke suite; run it against the preview URLs the deploy-preview workflow already emits; make it a required gate before prod deploy.
3. Add `concurrency:` groups; add size-limit + Lighthouse CI gates against preview URLs; add axe assertions to the smoke suite.
4. Add CodeQL; gate `pnpm audit` on high-sev.
5. Verify the gates fire on a scratch PR; deploy nothing risky; document in a CI section of `docs/ai/internal-knowledge.md`.

## Verification

```
pnpm exec playwright test        # smoke suite green locally against a preview/build
# CI: open a draft PR and confirm e2e/lighthouse/size gates run and block on failure.
```

## Risks

- e2e flakiness — keep the smoke suite tiny + deterministic; retry once.
- Lighthouse/size baselines — tune budgets to current values to avoid false fails on day one.
- CI-minute cost — `concurrency:` offsets much of it.

## Kickoff Prompt

> You are running plan `plans/40-production-readiness.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. Note `plans/00` owns the `cf-worker-deploy.yml` gate — don't double-edit that file's deploy gate; add the other CI gates here. Renovate already exists — don't re-add it.
>
> Deliver: (1) error tracking (Sentry or Cloudflare-native) initialized in the apps and wired to `packages/components/ErrorBoundary.tsx`, with source-map upload in CI and the DSN in the secret-sync flow (remove or wire the dead Axiom config). (2) A Playwright e2e smoke suite (home/blog/agent-ui load, agent-api `/health`, dark-mode toggle, no console errors, an auth flow) running against the preview URLs the deploy-preview workflow emits, as a required pre-deploy gate. (3) `concurrency: cancel-in-progress` on test/lint/cf-deploy*. (4) A size-limit bundle gate + Lighthouse CI perf budget against preview URLs (baseline the budgets to current values). (5) axe assertions in the smoke suite + re-enable a11y Biome rules incrementally. (6) CodeQL SAST + make `pnpm audit` blocking on high-sev.
>
> Verify the gates run and block on a draft PR. Keep the smoke suite tiny and deterministic. Semantic commits (`ci`, `feat`, `test`). Update the plan Status and add a CI section to `docs/ai/internal-knowledge.md`.
