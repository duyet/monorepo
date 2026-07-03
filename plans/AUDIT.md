# Consolidated Audit — 2026-07-03

Read-only audit across four clusters. Evidence cited by path (line numbers approximate; verify before acting). Some `CLAUDE.md`/`internal-knowledge.md` lines are stale — noted inline.

## Critical issues (fix first — see plan `00`)

1. **Leaked secrets in git (agent-assistant).** `apps/agent-assistant/backend/agent.ts` hardcodes real API-key prefixes as "placeholder detection" (`startsWith("sk-proj-epynv")`, `startsWith("AIzaSyBfJXU8rnLS1btLv")`); `apps/agent-assistant/scratch/test-anyrouter.ts` hardcodes a full `sk-ar-v1-…` AnyRouter key; on-disk `.env.local` holds matching full keys. **Treat these keys as compromised — rotate.**
2. **`apps/api` is fully unauthenticated.** `POST /api/llm/generate` calls paid OpenRouter with no auth/rate-limit (cost-abuse/DoS, `routes/card-description-streaming.ts`); `/api/ai/percentage/*` runs unauthenticated ClickHouse queries; `/api/insights/overview` is gated only by a trivially-bypassable CORS check. `wrangler.toml` declares no KV/D1/R2 bindings. Contrast the exemplar `apps/agent-api/src/auth.ts` (timing-safe compare + Clerk).
3. **Deceptive offline fallback.** When keys are invalid, `agent-assistant` `getOfflineFallbackResponse()` returns canned copy claiming the assistant is working normally. With the committed placeholder prefixes matching the only keys, the **default deployed state serves fake answers**.
4. **Ungated Worker deploys.** `.github/workflows/cf-worker-deploy.yml` ships `api` + `agent-api` on push to `master` with no typecheck/test/lint gate.

## Cluster A — AI agents (`agent-api`, `agent-ui`, `agent-assistant`, `mcp`)

Three agent apps, **no shared core**, three model backends, three persistence stories.

- **agent-api** (best-engineered, 17 tests): native streaming, tool-calling with approval, **MCP client support** (`agent.ts:199-220`), scheduling tools, dual auth, SQLite DO persistence. Single hardcoded model `@cf/moonshotai/kimi-k2.6` (`agent.ts:299`). No RAG, no multi-model routing, no rate limit, no cost tracking. `stopWhen: stepCountIs(5)` truncates tool loops.
- **agent-ui** (fake streaming): `agent-api-transport.ts` calls the **non-streaming** JSON endpoint and wraps it in a synthetic single chunk — UI claims streaming but blocks. **AI SDK version split**: `@ai-sdk/react@^4` paired with `ai@^7` (`package.json`). No history, no tool/approval UI, no model selector, **0 tests**.
- **agent-assistant** (WIP/fragile): LangGraph graph is a **single node with NO tools bound** (`backend/agent.ts:246-250`) so all the assistant-ui tool UI is dead. Build relies on `scratch/inject.ts`+`deploy.ts` string-patching the compiled bundle; `wrangler.toml main` path is inconsistent. Thread history is localStorage-only. `.vercel/` committed. README says "Next.js" (it's TanStack Start). Plus the leaked secrets + deceptive fallback above.
- **apps/mcp**: empty placeholder — prime candidate to become the shared tool server both agent apps lack.
- **No `@duyet/agent-core`** — prompt/model/tool defs duplicated and divergent.

→ Plans `10` (core+streaming+history), `11` (RAG), `12` (MCP server), `13` (observability+evals). Consolidation flagged as a big bet in `10`.

## Cluster B — content (`blog`, `kb`, `llm-timeline`, `photos`, `cv`, `home`)

- **JSON-LD is absent** everywhere except `cv` (`Person`) and `home/about` (`ProfilePage`). Blog, kb, llm-timeline, photos have none (photos has partial microdata). Biggest shared SEO gap.
- **No app generates OG images** — but a proven build-time satori+`@resvg/resvg-js` recipe already shipped in chmonitor and is documented at `apps/kb/kb/memory/topics/web/tech-og-images-static-prerender.md`. De-risks the win.
- **Search:** blog + llm-timeline are client-only load-all; **kb & photos have no search**. No federated search.
- **blog**: TanStack Start SSG (~314 posts), RSS/llms.txt/sitemap/per-post `.md` all present. Missing canonical, twitter cards, per-tag/series RSS, Atom. Unused `mermaid` dep. `CLAUDE.md` stale (claims Auth0/comments — removed).
- **kb**: strong llms.txt + graph; missing RSS/JSON-LD/og:image/search. Two graph impls (one unmounted). **Submodule can silently yield zero pages** — no build-time count assertion.
- **llm-timeline**: large RSS fan-out; missing `Dataset`/`ItemList` JSON-LD + og:image. Daily sync **commits data but does not redeploy** — updates invisible until manual build.
- **photos**: rich EXIF + **GPS captured but unused**; **no sitemap/robots**, `/feed` alternate link misleadingly points at HTML not XML; unwired `Lightbox`/keyboard-nav.
- **cv**: `Person` JSON-LD present; **PDF is a manually-committed file that can drift** from the live data. Serif kept by design.
- **home**: root `__root.tsx` has **no og:image/twitter/canonical/root JSON-LD**; some hardcoded stats.

→ Plans `20` (JSON-LD+OG), `21` (search), `22` (photos), `23` (graph/embeddings), `24` (syndication/newsletter), `25` (CV PDF), `26` (hero shader). Quick wins in `90`.

## Cluster C — data & insights (`insights`, `ai-percentage`, `data-sync`, `burns`, `api`)

- **Stale-by-design** frontends (insights, burns fetch only at build time) vs **live-but-fragile** ai-percentage. **No freshness/"updated X ago" anywhere.**
- **`apps/api`**: unauthenticated (see Critical); no KV caching (recomputes every call); `/api/insights/overview` uses `allSettled` with silent partial failures; README documents a drifted `/api/ai-description` endpoint. Good HTTP cache headers, good ClickHouse client (retry/backoff).
- **ai-percentage**: **TimeRange selector is wired to nothing** — charts hardcode `days=365` (`AIPercentageTrend.tsx`, `AIPercentageChart.tsx`). Single-point dependency on api.duyet.net. Dead `formatPercentage`.
- **data-sync**: solid `withRetry` + idempotent `ReplacingMergeTree` upserts. **`ai-code-percentage` has no scheduled workflow** → ai-percentage silently goes stale. Empty catches hide errors; hardcoded pagination ceilings truncate silently; no backfill watermark/resume; raw tables grow unbounded (retention covers only 4 aggregates); one misordered migration (`20250109_github_commits_raw.sql`).
- **insights**: rich charts but only fixed period switches — no free date range, no drill-down, no export, no YoY. One-way DuckDB cache fallback; `failOnError:false` deploys broken routes silently.
- **burns**: daily MotherDuck cron OK; hard-fails if `token-data.json` missing; fixed 60-day window.

→ Plans `30` (metrics API), `31` (observability/freshness/alerts/quality + schedule ai-code-percentage + fix TimeRange), `32` (date-range/drill-down).

## Cluster D — platform & DX (`packages/*`, `crates/*`, `scripts/`, CI)

- **No error tracking** anywhere (no Sentry). ErrorBoundaries render fallback UI but report nowhere. Axiom env set but not wired (dead config).
- **No e2e** (zero Playwright/Cypress). Coverage tooling wired but **no thresholds, not enforced**. 66 JS test files + 8 tested Rust crates; agent-ui/agent-assistant/ai-percentage/burns/kb have ~0 tests.
- **CI:** Renovate **already present** (`.github/renovate.json`, automerge). Gaps: no e2e gate, no Lighthouse/bundle-size/a11y, `cf-worker-deploy.yml` ungated, **no `concurrency:` cancel** on test/lint/cf-deploy (wasted minutes), a few floating action pins in `lint.yml`/`test.yml`.
- **Design system trapped** inside app-specific `@duyet/components` (18 shadcn primitives mixed with `SiteHeader.tsx` at **798 LOC**). Orphaned `components/components/ui/navigation-menu.tsx`. `packages/libs/getPost.ts` is a 407-LOC `if (field===)` chain.
- **Dead code:** `crates/diff` (0 consumers, confirmed — `internal-knowledge.md:110` admits it), `crates/placeholder`, dead exports `parseModelParams`, `clearUrl`. Three hand-written slugify copies that must stay byte-identical to Rust (drift risk).
- **Env:** not validated (no zod); `.env.example` drifted (`NEXT_PUBLIC_*` vs runtime `VITE_*`), missing ~10 vars; `scripts/audit-env.ts` is a stale static array. **Client PostHog misconfigured** (`VITE_POSTHOG_KEY` vs provisioned `POSTHOG_API_KEY`) → client capture likely never initializes. blog & agent-assistant both dev on port 3000.
- **Biome permissive:** ~20 rules off including 7 a11y rules, `noExplicitAny` off.

→ Plans `40` (Sentry+e2e+CI gates), `41` (design system + playground + decompose God-components), `42` (env validation + dead-code + WASM consolidation + authoring CLI), `90` (quick wins).

## Corrections to prior docs (fix during `90`/`42`)
- Renovate exists — don't "add" it, tune it.
- blog `CLAUDE.md` + `internal-knowledge.md` blog line: no Auth0/comments; output is `dist/client` not `out/`.
- `apps/api/README.md`: real endpoints are `/api/llm/generate`, `/api/ai/percentage/*`, `/api/insights/overview`.
