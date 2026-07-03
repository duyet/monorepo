# 90 — Quick-wins sweep (<2h each)

**Area:** All · **Effort:** S (each) · **Impact:** High (cumulative) · **Conflict group:** touches many apps + CI — run as ONE owner, sequentially · **Depends on:** none.

A batch of independent, low-risk fixes surfaced by the audit. One agent can sweep the whole list in a night. Each is small; commit them individually with the right scope. Skip any that another in-flight plan already claimed (cross-referenced).

## The list

| # | Fix | Files | Also in |
|---|-----|-------|---------|
| 1 | Fix client PostHog key so analytics initializes (`VITE_POSTHOG_KEY` vs provisioned name) | `packages/components/Analytics.tsx` | 00 |
| 2 | Add `concurrency: cancel-in-progress` to test/lint/cf-deploy* | `.github/workflows/*` | 40 |
| 3 | Gate `cf-worker-deploy.yml` with typecheck/test/lint | `.github/workflows/cf-worker-deploy.yml` | 00 |
| 4 | Delete dead crates `diff` + `placeholder` + bench; dead exports `parseModelParams`/`clearUrl` (verify 0 refs) | `crates/{diff,placeholder}`, `benchmarks/wasm/modules/diff.bench.ts`, `packages/libs/{parseModelParams,clearUrl}.ts` | 42 |
| 5 | Fix dev-port collision (blog & agent-assistant both :3000) | `apps/blog/vite.config.ts` or `apps/agent-assistant/*` | — |
| 6 | Remove dead `fmt: pnpm run fix` scripts (undefined) | per-app `package.json` | — |
| 7 | Fix `apps/api/README.md` endpoint drift (`/api/ai-description` → real endpoints) | `apps/api/README.md` | 30 |
| 8 | Add `errors[]` metadata to `/api/insights/overview` | `apps/api/src/routes/insights.ts` | 30 |
| 9 | Fix ai-percentage TimeRange filter (thread `days`) | `apps/ai-percentage/components/*`, `src/routes/index.tsx`, `lib/queries.ts` | 31 |
| 10 | Remove unused `formatPercentage` + fix stale `globals.css` path in `apps/ai-percentage/CLAUDE.md` | `apps/ai-percentage/lib/utils.ts`, `CLAUDE.md` | — |
| 11 | Rename misordered migration `20250109_github_commits_raw.sql` (verify not applied in prod first) | `apps/data-sync/migrations/` | 31 |
| 12 | Add build-time assertion: kb article count > 0 (guards silent empty-submodule deploys) | `apps/kb/scripts/generate-static-files.ts` | — |
| 13 | Remove unused `mermaid` dep (blog); unmounted `KnowledgeGraph.tsx` + copied `viz.html` (kb) | `apps/blog/package.json`, `apps/kb/**` | — |
| 14 | Root `og:image`+`twitter:card`+`canonical` on home + photos `__root.tsx` | `apps/home/src/routes/__root.tsx`, `apps/photos/src/routes/__root.tsx` | 20 |
| 15 | Add `robots.txt` to photos (currently none) | `apps/photos/**` | 22 |
| 16 | Refresh stale docs: blog `CLAUDE.md` + `internal-knowledge.md` blog line (no Auth0/comments; `dist/client`) | `apps/blog/CLAUDE.md`, `docs/ai/internal-knowledge.md` | — |
| 17 | Pin floating CI actions in `lint.yml`/`test.yml` | `.github/workflows/{lint,test}.yml` | — |
| 18 | Fix legacy reading-time outliers (e.g. 161-min post) | `apps/blog/scripts/generate-posts-data.ts` or data | — |
| 19 | Speed up pre-commit (affected-only `turbo test --filter=…[HEAD]` or activate the dead lint-staged config) | `.husky/pre-commit`, `package.json` | — |
| 20 | Add `CONTRIBUTING.md` + a human "Getting Started" quickstart | repo root | — |

## Verification

```
pnpm run lint && pnpm run check-types && pnpm run test
rg -n "parseModelParams|clearUrl|mermaid" apps packages --glob '!**/*.test.*'   # expect 0 after #4/#13
```

## Kickoff Prompt

> You are running plan `plans/90-quick-wins.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan. You are the SINGLE owner of CI-workflow edits this session — if plans `00`/`40`/`31` are running, coordinate so you don't collide on `.github/workflows/*`.
>
> Work through the table top to bottom. For each: make the surgical fix, verify narrowly (`pnpm exec biome lint <path>`), and commit individually with the correct semantic scope. For deletions (#4, #13) confirm zero non-test references first with the repo's `rg` dead-code recipe. For #11, verify the migration hasn't already been applied in prod before renaming. Skip any item another in-flight plan has already landed (check `git log`).
>
> After the batch: `pnpm run lint && pnpm run check-types && pnpm run test`, deploy the affected apps, and browser-QA home + photos meta tags and the ai-percentage range switch. Update the plan Status with which items shipped and note any skipped-as-already-done.
