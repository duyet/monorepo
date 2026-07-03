# duyet.net — Project Strategy

_2026-07-03. Synthesized from the four-cluster audit. See [AUDIT.md](AUDIT.md) for evidence._

## What this is

A personal platform — 16 live apps on one Cloudflare/Turborepo monorepo — that doubles as a public portfolio and a private engineering playground. It is unusually mature for a personal site: ~314 blog posts, a knowledge base, an LLM release dataset (~4,283 models), analytics pipelines over ClickHouse/MotherDuck, three AI agent surfaces, and a Rust/WASM build layer. 832 commits in the last 90 days.

## Positioning / north star

**"Notes from the workshop" — a fast, honest, self-instrumenting personal platform where the content, the data, and the agents all reference the same real source of truth.**

Three audiences, in priority order:
1. **Readers** who arrive from search/social for a specific post or the LLM timeline. They should land on fast, well-structured, richly-unfurled pages.
2. **Peers/recruiters** evaluating depth. The CV, insights dashboards, and OSS grid are the proof.
3. **Duyet** — the platform should reduce his own maintenance toil and surface his own data back to him.

### North-star metrics (instrument these; today most are unmeasured)
- **Reader:** organic impressions & CTR (rich results / OG unfurls), search-result coverage, p75 LCP across content apps.
- **Agent:** % of agent answers grounded in real content (RAG hit rate), tokens/cost per conversation, streaming TTFB.
- **Platform:** deploy success rate, mean time to detect a broken deploy (today: unbounded — no error tracking), CI minutes per merge.
- **Data:** freshness lag per source (today: invisible), sync success rate.

## Strategic themes (where to invest)

1. **Discovery & credibility (Content).** The single biggest under-invested surface. No JSON-LD anywhere, no generated OG images, no real search on kb/photos. These are compounding, low-risk wins. → `20`, `21`, `22`, `23`, `24`.
2. **Make the agents real (Agents).** Three divergent agent apps recite a static bio and can't touch Duyet's actual content. Consolidate on one core, ground them in the blog/kb via RAG, and expose real tools through a reactivated MCP server. → `10`, `11`, `12`, `13`.
3. **Trustworthy data (Data).** Dashboards are stale-by-design with a silent-failure culture and no freshness signal. Turn `apps/api` into a real cached, authenticated metrics service and make the pipeline self-monitoring. → `30`, `31`, `32`.
4. **Production readiness (Platform).** No error tracking, no e2e, ungated Worker deploys, an unauthenticated public API, leaked keys. Close the reliability/security gaps and extract the design system. → `00`, `40`, `41`, `42`.

## Principles (carried from goal.md + audit)

- **Honest over impressive.** Delete a fabricated stat rather than fake it (the home page already did this). Kill the deceptive "offline" agent fallback.
- **Static-first.** Prerender to HTML/MD served via ASSETS; hit Workers only for genuinely dynamic data. Keep runtime cost near zero.
- **shadcn-only chrome.** No custom CSS/colors/fonts in app chrome. Deliberate, scoped exceptions (e.g. the hero shader) are documented, not smuggled in.
- **Surgical changes, semantic commits, verify narrow first.**
- **Instrument what you ship.** Every new capability emits a metric or a log you can see in `insights`.

## Now / Next / Later

### Now (this overnight batch — highest leverage, lowest regret)
- **`00` P0 security** — rotate/purge leaked keys, authenticate `apps/api`, gate Worker deploys. Non-negotiable, first.
- **`20` structured data + OG images** — JSON-LD + auto OG across content apps. Compounding discovery win on a proven recipe.
- **`30` metrics API** — caching + auth + OpenAPI; the backbone every dashboard needs.
- **`40` production readiness** — Sentry + Playwright smoke gate + CI concurrency/gates.
- **`90` quick wins** — dead code, ports, README/env drift, ai-percentage TimeRange.

### Next (the capability step-change)
- **`10`+`11`+`12`** — one agent core, RAG over content, MCP server. This is the "make the agents real" arc.
- **`21` federated search**, **`31` data observability**, **`41` design-system extraction**.

### Later (depth & reach)
- **`23` content graph + embeddings**, **`32` insights date-range/drill-down**, **`13` evals**, **`22` photos map/albums**, **`24` newsletter**, **`25` CV PDF**, **`26` hero shader**, **`42` WASM consolidation**.

## Explicit non-goals (for now)
- No CMS migration — Markdown + build-time generation stays.
- No multi-tenant/auth product — Clerk only where an app truly needs sign-in.
- No i18n framework yet (tracked in BACKLOG, not scheduled).
- Don't add a fourth agent app — consolidate the three that exist.
