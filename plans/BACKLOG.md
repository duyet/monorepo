# Full Feature Backlog — the complete menu

_2026-07-03. Every opportunity surfaced by the audit, ranked, mapped to a plan file. "Plan" column = where the detailed spec + kickoff prompt lives. Effort S<½day · M≈1 day · L>1 day. Impact = reach × durability._

## P0 — security & correctness (do first)

| Item | Effort | Impact | Plan |
|------|--------|--------|------|
| Rotate + purge leaked API keys (agent-assistant code + scratch) | S | Critical | 00 |
| Replace deceptive offline fallback with honest degraded state | S | High | 00 |
| Authenticate + rate-limit `apps/api` (port agent-api pattern) | M | Critical | 00 |
| Gate `cf-worker-deploy.yml` (typecheck/test/lint before deploy) | S | High | 00 |
| Fix client PostHog key misconfig (`VITE_POSTHOG_KEY`) | S | Med | 00/90 |

## AI agents

| Item | Effort | Impact | Plan |
|------|--------|--------|------|
| Extract shared `@duyet/agent-core` (prompt/model/tools) | M | High | 10 |
| Fix agent-ui AI SDK version split (`@ai-sdk/react`→v7) | S | High | 10 |
| Real token streaming in agent-ui (drop synthetic stream) | M | High | 10 |
| Server-backed conversation history + thread list UI | M | Med | 10 |
| Tool-call / approval UI in agent-ui | M | Med | 10 |
| RAG over blog + kb (Vectorize + `searchKnowledge` tool w/ citations) | L | High | 11 |
| First-party tools: search posts, CV, GitHub activity, analytics | M | High | 11 |
| Reactivate `apps/mcp` as the duyet.net MCP server | L | High | 12 |
| Bind real tools into the LangGraph graph (kill dead tool UI) | M | Med | 12 |
| Multi-model routing + fallback in agent-api | M | Med | 13 |
| Cost/latency/token observability (`onFinish` → Analytics Engine) | M | Med | 13 |
| Evals (golden prompts: grounding, refusal, tool-selection) + tests | M | Med | 13 |
| Rate limiting + abuse controls on chat endpoints | S | Med | 13 |
| Raise `stepCountIs(5)` once real tools land | S | Low | 13 |
| Clean agent-assistant build (drop scratch string-patching) | M | Med | 42 |
| Consolidate to one agent surface (retire redundant stack) | L | High | 10 (big bet) |

## Content & discovery

| Item | Effort | Impact | Plan |
|------|--------|--------|------|
| JSON-LD across content apps (BlogPosting/TechArticle/Dataset/ImageObject/WebSite) | M | High | 20 |
| Auto OG-image generation (port satori+resvg recipe) | M–L | High | 20 |
| Canonical + Twitter cards on all content routes | S | High | 20 |
| Root og:image/twitter/canonical/JSON-LD on home + photos | S | High | 20/90 |
| Blog full-text search (Pagefind/FlexSearch prebuilt index) | M | High | 21 |
| Federated search shared across blog/kb/photos | M | High | 21 |
| kb RSS/Atom + JSON Feed | S | Med | 24 |
| Blog per-tag/category/series RSS + Atom | S–M | Med | 24 |
| Photos: real RSS + sitemap (+image:image) + robots; fix /feed link | S–M | Med | 22 |
| Photos map view (use existing GPS) | M | Med | 22 |
| Photos albums/collections (Cloudinary tags) | M | Med | 22 |
| Wire photos Lightbox + keyboard nav (a11y) | S | Med | 22/90 |
| Embeddings-based related content (replace tag heuristic) | L | Med | 23 |
| Cross-app content graph (`content-index.json`) | L | Med | 23 |
| llm-timeline: auto-deploy after data sync + failure alert | S | Med | 24 |
| llm-timeline: `Dataset`/`ItemList` JSON-LD | S | Med | 20 |
| CV automated PDF export (headless print at build) | M | Med | 25 |
| Newsletter / subscribe capture (blog + home) | M | Med | 24 |
| Home hero: Paper Shaders animated background | M | Med | 26 |
| i18n (English/Vietnamese) | L | Low | — (BACKLOG only) |
| Webmentions / comments revival | M | Low | — (BACKLOG only) |
| Reading analytics surfaced to reader ("N reads") | M | Low | 31 (data) |
| Fix legacy reading-time outliers (161-min post) | S | Low | 90 |

## Data & insights

| Item | Effort | Impact | Plan |
|------|--------|--------|------|
| KV caching layer in `apps/api` (per-endpoint TTL + SWR) | M | High | 30 |
| OpenAPI spec + Swagger UI + fix README drift | M | Med | 30 |
| Export endpoints (`?format=csv|json`) + embeddable widgets | M | Med | 30 |
| Freshness / `generatedAt` + `data_sync_status` table + badges | M | High | 31 |
| Public status / uptime page (deep `/health`) | M | High | 31 |
| Schedule `ai-code-percentage` sync (daily workflow) | S | High | 31 |
| Fix ai-percentage TimeRange filter (thread `days`) | S | High | 31/90 |
| Anomaly alerts on sync data (spikes/drops/zero-row) | M | High | 31 |
| Data-quality checks in sync pipeline (fail loudly) | M | High | 31 |
| Backfill resume/watermark + retention for raw tables | M | Med | 31 |
| Rename misordered migration `20250109_…` | S | Low | 90 |
| Free date-range picker + drill-down across insights | L | High | 32 |
| YoY / historical trend comparisons | M | Med | 32 |
| `errors[]` metadata on `/api/insights/overview` | S | Med | 90 |
| "Life dashboard" unified insights home | L | Med | 32 (big bet) |

## Platform & DX

| Item | Effort | Impact | Plan |
|------|--------|--------|------|
| Error tracking (Sentry) wired to shared ErrorBoundary | M | High | 40 |
| Playwright e2e + smoke gate before deploy | L | High | 40 |
| CI `concurrency:` cancel-in-progress (test/lint/cf-deploy) | S | Med | 40/90 |
| Bundle-size CI gate (size-limit budgets) | S | Med | 40 |
| Lighthouse CI / perf budget on preview URLs | M | Med | 40 |
| a11y CI (axe) + re-enable a11y Biome rules incrementally | M | Med | 40 |
| Real SAST (CodeQL) + make `pnpm audit` blocking on high-sev | S | Med | 40 |
| Extract `@duyet/ui` design-system package | L | High | 41 |
| Component playground (Storybook/Ladle) + visual regression | M | Med | 41 |
| Decompose God-components (`SiteHeader` 798 LOC, `getPost` 407-LOC) | M | Med | 41 |
| zod env validation package (`@duyet/env`) + regen `.env.example` | M | High | 42 |
| Finish Next→Vite env drift cleanup | M | Med | 42 |
| Delete dead crates (`diff`, `placeholder`) + dead exports | S | Med | 42/90 |
| Consolidate 3 slugify copies onto `crates/utils` | M | Med | 42 |
| Content-authoring CLI (`duyet-cli new-post/new-note`) | M | Med | 42 |
| Independent versioning (changesets) for shared packages | M | Low | — (BACKLOG only) |
| Fix dev-port collision (blog & agent-assistant both :3000) | S | Med | 90 |
| Speed up pre-commit (affected-only tests / activate lint-staged) | S | Med | 90 |
| Pin floating CI actions in lint.yml/test.yml | S | Low | 90 |
| CONTRIBUTING.md + human quickstart | S | Low | 90 |

## Deferred (tracked, not scheduled this cycle)
i18n framework · webmentions/comments · changesets versioning · monorepo docs site beyond kb · Hyperdrive/D1 exploration.
