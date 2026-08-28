# Internal Knowledge

This repository is the pnpm/Turborepo monorepo for duyet.net public apps, shared packages, data sync jobs, and Cloudflare Pages/Workers deploys.

GitHub repo metadata (description + topics) must match the current stack. When migrating frameworks, update both in the same change: description should name TanStack Start, Cloudflare Workers/Pages, and Rust/WASM; topics should include `tanstack-start`, `cloudflare-workers`, `cloudflare-pages`, `vite`, `wasm`, `rust`, `blog`, `duyet`, `monorepo` (and drop stale ones such as `nextjs`). `gh repo edit` / the GitHub settings UI is required — topics are not stored in-repo.

## Working Rules

- Read `CLAUDE.md` and this file before making non-trivial changes.
- Use semantic commit messages. Prefer a scope from `.commitlintrc.js` when one exists.
- Keep changes surgical. Do not reformat or refactor unrelated code.
- Preserve existing UX and public routes unless the request explicitly changes them.
- Use pnpm commands from the relevant package or app directory. Check the local `package.json` before assuming a script exists.
- Verify with the narrowest useful command first, then broaden only when needed.
- If a linked worktree reports `Operation not permitted` under `.git/worktrees/...`, use the canonical checkout after `git status --short --branch`; stage only touched paths so unrelated local edits stay out of commits.
- Public marketing/content routes stay **fully static**: HTML is produced at build/prerender time. Do not add runtime-required data fetches to those routes. Chat widgets may hydrate, but they must not turn the host page into a client-only shell.
- Shared chrome lives in `packages/components/site-header/` as small units (`AppSwitcher`, `GlobalNav`, `LocalNav`, `MobileNav`, `ThemeButton`) composed by `SiteHeader`. Do not grow `SiteHeader.tsx` back into a 800-line file.
- UI primitives come from **latest shadcn/ui** under `packages/components/ui/` (registry style `new-york-v4`). Chat conversations use the official June 2026 set: `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker`. Compose them via `ChatTranscript` / `ChatMessageList` in `packages/components/chat/`. Do not invent a parallel chat kit.
- Ignore generated Next dumps: `.next/`, `out/`, `next-env.d.ts`. Do not commit `apps/agents/` scratch or leftover agent worktrees.
- Secret scanning: `.gitleaks.toml` (custom AnyRouter `sk-ar-v1-` prefix). CI workflow `gitleaks.yml` scans the working tree with `--no-git` so historical leaks do not fail the gate. Do not rewrite git history for leaked keys; rotate the live credentials instead. Distinct from `.deepsec/` (SAST).

## Herdr (isolated coding agents)

When this session has `HERDR_ENV=1` and the user asks for a Herdr worktree / parallel agent:

1. Do **not** run bare `herdr` (that attaches the TUI). Use `herdr worktree`, `herdr agent`, or `herdr --skill`.
2. `herdr worktree create` only creates a git worktree + **shell** pane. It does **not** start a coding agent.
3. Required follow-up — parse `.result.root_pane.pane_id`, then start and prompt:

```bash
CREATE=$(herdr worktree create --cwd "$PWD" --branch feat/<name> --base origin/master --no-focus)
PANE=$(printf '%s' "$CREATE" | jq -r '.result.root_pane.pane_id')
herdr agent start feat-<short> --kind cursor --pane "$PANE"
herdr agent prompt feat-<short> "<full task spec>" --wait --timeout 600000
```

4. Agent names: `[a-z][a-z0-9_-]{0,31}`, unique among live agents. Prefer `--kind` matching the user’s agent (Cursor → `cursor`, Grok → `grok`, etc.).
5. Herdr 0.8 `agent start` works (`agent_started` / `interactive_ready`). Stopping after `worktree create` is the idle-shell failure mode, not a Herdr regression.

## Static rendering

- `apps/blog`, `apps/home`, `apps/cv`, `apps/insights`, `apps/photos`, `apps/kb`, `apps/llm-timeline`, `apps/ai-percentage`, `apps/burns`, `apps/homelab`, `apps/x-algo`, `apps/tip` emit static HTML for public pages at build time (Vite/TanStack prerender or Pages output).
- `apps/agent-ui` is a signed-in chat surface at `https://agents.duyet.net`. Its `index.html` must still contain a prerendered chat shell (`Ask Duyet anything.`). Conversation rows use shared shadcn chat primitives; Clerk/auth and streaming stay client-only.
- `apps/insights` is static HTML plus calls to `apps/api`. Do not use TanStack Start server functions for runtime data loading.

## Root Commands

- `pnpm run build` builds all apps and packages through Turbo.
- `pnpm run dev` starts workspace development servers through Turbo.
- `pnpm run lint` runs Biome linting.
- `pnpm run fmt` formats TypeScript, TSX, and Markdown through Biome.
- `pnpm run test` runs Turbo tests.
- `pnpm run config` runs workspace config tasks, including app secret syncs where defined.
- `pnpm run deploy` builds deployable apps, then runs workspace config.
- `pnpm run cf:deploy` deploys changed Cloudflare Pages apps (same discovery as CI).
- `pnpm run cf:deploy:prod` runs production Cloudflare deploy tasks through Turbo.
- `pnpm run cf:deploy -- --force` bypasses git-based change detection and rebuilds all requested Cloudflare Pages apps.
- `pnpm run wasm:build` builds all Rust crates to WASM via `wasm-pack`.
- `pnpm run wasm:build:release` builds WASM with optimizations.
- `pnpm run wasm:test` runs `cargo test` across the Rust workspace.
- `pnpm run wasm:clippy` lints Rust code.
- `pnpm run bench:wasm` benchmarks TS vs WASM for all modules.

## Apps

- `apps/home`: homepage for `https://duyet.net`, deployed to Cloudflare Pages.
- `apps/blog`: statically prerendered Vite blog for `https://blog.duyet.net`, Auth0 auth, Vercel KV comments, Markdown posts with KaTeX.
- `apps/cv`: CV host for `https://cv.duyet.net`.
- `apps/insights`: analytics dashboard for `https://insights.duyet.net`, using Cloudflare Analytics, GitHub, PostHog, WakaTime, ClickHouse, and TanStack Start prerendering.
- `apps/photos`: photo gallery for `https://photos.duyet.net`, Unsplash and Cloudinary-related workflows.
- `apps/homelab`: homelab docs and resources for `https://homelab.duyet.net`.
- `apps/llm-timeline`: LLM release timeline for `https://llm-timeline.duyet.net`, with sync, RSS, sitemap, and llms.txt generation.
- `apps/agent-ui`: Cloudflare Pages chat UI for `https://agents.duyet.net`. Clerk auth, AI SDK `useChat`, `@duyet/components` `ChatTranscript` (MessageScroller / Message / Bubble / Attachment / Marker) against `apps/agent-api`.
- `apps/agent-api`: API-only Cloudflare Agents Worker. REST chat is `POST /api/v1/chat` with Clerk bearer auth or `AGENT_API_TOKEN`. The production hostname `agents-api.duyet.net` is bound in the Cloudflare dashboard; the `routes` block in `apps/agent-api/wrangler.toml` stays commented so `wrangler deploy` does not require Zone DNS edit permission.
- `apps/api`: Hono API on Cloudflare Workers for `https://api.duyet.net`.
- `apps/ai-percentage`: AI-written-code dashboard for `https://ai-percentage.duyet.net`; data comes from `apps/data-sync`.
- `apps/data-sync`: operational CLI for ClickHouse analytics/activity syncs and migrations.
- `apps/agent-assistant`: Vite-powered TanStack Start application with assistant-ui + LangGraph serving as a local agent interface. Deployed directly serverless on Cloudflare Workers/Pages (`duyet-agent-assistant`) for `https://agent-assistant.duyet.net` utilizing a native Cloudflare Durable Object (`ThreadStateDO`) backed by SQLite for checkpoint persistence.
- `apps/kb`: static TanStack Start knowledge base for `https://kb.duyet.net`, bundling `content/**/*.md` at build time and generating `llms.txt`, `llms-full.txt`, `sitemap.xml`, `robots.txt`, and raw `public/k/*.md` article endpoints.
- `apps/burns`: Vite/Cloudflare Pages dashboard (`duyet-burns`) that prerenders Claude Code usage stats. `build` runs `scripts/fetch-burns-data.ts`, which pulls `ccusage` data from MotherDuck (`MOTHERDUCK_TOKEN`); a daily cron refreshes it. Preview CI uses the GitHub `staging` environment secret (synced from local `.env.production.local`). If the token is missing, preview/local builds keep committed `public/token-data.json`; master/cron/manual deploys still require the token.
- `apps/x-algo`: static TanStack Start explainer for the open-sourced X For You ranking weights at `https://x-algo.duyet.net`. Numbers live in `src/lib/scoring.ts` and must match `xai-org/x-algorithm` `home-mixer/params/param.rs`.
- `apps/tip`: Ko-fi tip page on Cloudflare Pages for `https://tip.duyet.net` (Pages project `duyet-tip`). A single centered section embeds the official Ko-fi widget; widget URL lives in `src/lib/site.ts`. Keep the shared `SiteHeader`/`SiteFooter` chrome and the prerendered static HTML.
- `apps/paid-api`: standalone x402 USDC-gated chat Worker for `https://paid.duyet.net` (`duyet-paid-api`). Payment replaces auth; see `apps/paid-api/README.md`.
- `apps/news-tab`: Chrome MV3 unpacked new-tab extension for `https://news.duyet.net`. Load the folder that contains `manifest.json`. Not a Worker/Pages app — no `wrangler.toml`. Fetches `GET /api/public`. Own release-please component (`news-tab-v0.1.x`, `apps/news-tab/CHANGELOG.md`); do not fold into the root `duyet` release. Humans merge release-please PRs; never auto-merge them. `manifest.json` `version` tracks that component via extra-files (monorepo series starts at 0.1.0, not the old standalone 1.0.1).

## Shared Packages

- `packages/components`: shared React chrome (`site-header/`), shadcn `ui/` primitives, and official chat components (`chat/`).
- `packages/libs`: shared utility functions.
- `packages/interfaces`: shared TypeScript interfaces.
- `packages/config`: shared app, API, and UI config.
- `packages/tailwind-config`: shared Tailwind config.
- `packages/tsconfig`: shared TypeScript config.
- `packages/profile` and `packages/urls`: shared profile and URL metadata.

## Deployment Notes

- Cloudflare Pages production deploys happen on pushes to `master` or `main`; PRs receive preview deploys.
- Pages CI (`cf-deploy.yml`, `cf-deploy-preview.yml`) discovers deployable apps at runtime via `scripts/cf-pages-apps.ts`: any `apps/*` with `pages_build_output_dir` in `wrangler.toml` and a `cf:deploy:prod` script is included. Do not hardcode the app list in the workflow. New Pages apps (for example `kb`) deploy automatically when their tree or `packages/**` changes.
- A scheduled daily job (cron `0 0 * * *` in `.github/workflows/cf-deploy.yml`) rebuilds and redeploys the `burns` app to refresh its prerendered stats from MotherDuck.
- Pages vs Worker topology, lockfile-based rebuilds, and the agent-ui ↔ agent-api race: [`docs/ai/deploy-topology.md`](deploy-topology.md).
- Deploy workflows run type checks, tests, and lint before deploy jobs.
- App-level `cf:deploy:prod` scripts are authoritative when present.
- `apps/agent-ui` deploys `dist/client` to the `duyet-agents` Pages project for `https://agents.duyet.net`.
- `apps/insights` deploys `dist/client` to the `duyet-insights` Pages project.
- `apps/api` uses Wrangler as a Worker, not a Pages app.
- `apps/agent-api` uses Wrangler as a Worker, not a Pages app.
- `apps/agent-assistant` compiles via Vite/TanStack Start into a unified Worker + Assets bundle and deploys to the `duyet-agent-assistant` project. Features an automated deployment processor (`deploy.ts`) that injects `ThreadStateDO` SQLite schemas and patches browser-incompatible `createRequire` and `import.meta.url` hooks in compiled server chunks.
- **Cloudflare Workers Cache** (`[cache] enabled = true`) is a **Workers-only** wrangler key — it is not valid in a Pages config (`pages_build_output_dir`). It is set on the three real Workers (`api`, `agent-api`, `agent-assistant`) as a safe no-op: they only cache responses with an explicit `Cache-Control: public`. The static **Pages** apps (`agent-ui`, `blog`, `cv`, `home`, `photos`, `insights`, `ai-percentage`, `homelab`, `burns`, `kb`, `llm-timeline`, `x-algo`, `tip`) do **not** get `[cache]`; their public cache policy lives in each app's `public/_headers` (zone cache + deploy purge). See [`docs/ai/workers-cache.md`](workers-cache.md) for the per-app matrix, TTL rationale, and how to extend.

## App-Specific Command Notes

- `apps/agent-ui`: `pnpm run dev` uses Vite on port 3008; local chat expects `apps/agent-api` on port 8788 unless `VITE_DUYET_AGENTS_API_URL` or `VITE_AGENT_API_URL` is set. Production chat uses the same-origin `/api/v1/chat` Pages Function proxy so browsers do not need to resolve `agents-api.duyet.net`.
- `apps/agent-api`: `pnpm run dev` uses Wrangler on port 8788; `pnpm run deploy` type-checks then deploys the Worker; `pnpm run cf:deploy:prod` loads production env files before deploy; `pnpm run config` syncs `AGENT_API_TOKEN` plus Clerk verification secrets.
- `apps/api`: `pnpm run dev` uses Wrangler; `pnpm run deploy` builds then deploys the Worker.
- `apps/cv`: `pnpm run preview` validates production output locally.
- `apps/data-sync`: use `pnpm run sync <name>`, `pnpm run sync:all`, `pnpm run migrate:*`, and `pnpm run cleanup:dry-run`.
- `apps/kb`: `pnpm run build` runs the content prebuild and must preserve article `links` frontmatter in `public/k/*.md` for knowledge-graph and LLM consumers.
- `apps/llm-timeline`: use `pnpm run sync`, `pnpm run sync:dry`, `pnpm run rss`, `pnpm run llms-txt`, and `pnpm run sitemap` for content generation.
- `apps/ai-percentage`: refresh data through `apps/data-sync` with `pnpm run sync ai-code-percentage`.

## Rust/WASM Modules

Rust crates in `crates/` serve two purposes:
- **Build-time**: Native CLI binary (`duyet-cli`) for data sync and prerender
- **Runtime**: WASM modules for browser/CF Workers (diff, exif, utils, markdown)

### Build & Test

- `pnpm run rust:build` — build native CLI binary (`target/release/duyet-cli`)
- `pnpm run wasm:build` — build runtime crates to WASM
- `pnpm run wasm:test` — `cargo test` across workspace
- `pnpm run wasm:clippy` — lint Rust code
- `pnpm run bench:wasm` — run TS vs WASM benchmarks

### Crates

| Crate | Mode | Function | Consumer |
|-------|------|----------|----------|
| `crates/cli/` | Build | Unified CLI: `csv`, `normalize`, `dedup`, `markdown` subcommands | JS wrappers via `callCli()` |
| `crates/markdown/` | Both | `markdown_to_html(input) -> String` | WASM for per-page, CLI for batch |
| `crates/csv-parser/` | Build | `parse_csv(input) -> String` | `apps/llm-timeline/lib/csv.ts` |
| `crates/normalizers/` | Build | 8 normalize functions | `apps/llm-timeline/lib/normalizers.ts` |
| `crates/dedup/` | Build | `merge_all_sources(input) -> String` | `apps/llm-timeline/lib/deduplicator.ts` |
| `crates/exif/` | Runtime | `extract_exif(data: &[u8]) -> String` | `apps/photos/lib/exifExtractor.ts` |
| `crates/diff/` | Runtime | `diff_text`, `align_blocks` | currently no app consumer after the agents UI removal |
| `crates/utils/` | Runtime | `escape_reg_exp`, `slugify` | `packages/libs/string.ts` |

### Native CLI Protocol

The `duyet-cli` binary reads JSON from stdin, writes JSON to stdout:

```bash
echo '{"input":"a,b\\n1,2"}' | duyet-cli csv
# {"ok":true,"data":[["a","b"],["1","2"]]}

echo '{"input":[{"fn":"normalize_date","args":["Q1 2024"]}]}' | duyet-cli normalize
# {"ok":true,"data":["2024-01-01"]}
```

JS wrapper: `import { callCli } from "@duyet/libs/native-cli"`

### WASM Initialization Pattern (runtime modules)

WASM modules require `initSync()` before use. In Node/Bun:

```ts
import { initSync, extract_exif } from "@duyet/wasm/pkg/exif/exif.js"
import { readFileSync } from "node:fs"

const wasmPath = new URL("exif_bg.wasm", import.meta.url)
initSync({ module: readFileSync(new URL(wasmPath).pathname) })
```

In browser/CF Workers, use the default async export instead of `initSync`.

Type declarations for WASM modules are in `packages/wasm/types.d.ts` (committed to git, since `pkg/` is gitignored).

### WASM Initialization Pattern

WASM modules require `initSync()` before use. In Node/Bun:

```ts
import { initSync, normalize_date } from "@duyet/wasm/pkg/normalizers/normalizers.js"
import { readFileSync } from "node:fs"

const wasmPath = new URL("normalizers_bg.wasm", import.meta.url)
initSync({ module: readFileSync(new URL(wasmPath).pathname) })
```

In browser/CF Workers, use the default async export instead of `initSync`.

### Benchmark Results (2026-05-01)

| Module | TS mean | WASM mean | Speedup | Verdict |
|--------|---------|-----------|---------|---------|
| markdown-to-html | 6.3ms | 0.08ms | **79x** | WASM wins — heavy compute |
| diff-text (line-level) | 0.11ms | 0.11ms | ~1x | Parity |
| string-utils | 0.14ms | 0.14ms | ~1x | Parity |
| exif-parse | 0.001ms | 0.001ms | ~1x | Parity |
| csv-parse | 0.08ms | 0.16ms | 0.5x | WASM slower → now uses native CLI |
| normalizers | 0.01ms | 0.04ms | 0.23x | WASM slower → now uses native CLI batch |
| dedup | 0.01ms | 0.04ms | 0.29x | WASM slower → now uses native CLI |

### Architecture Decision

**Rule**: WASM only outperforms TS when compute > JS↔WASM boundary cost (~30-40μs).

- **Native CLI** (build-time): csv, normalizers, dedup. No boundary cost. Batch mode for normalizers.
- **WASM** (runtime): markdown (79x win), diff, exif, utils. Used in browser/CF Workers.
- **Native binary markdown**: CLI provides batch mode for pre-generation, but per-page prerender keeps WASM (3900 spawns would be slower).

## Commit Scopes

`commitlint.config.js` extends `@commitlint/config-conventional` only. There is **no** `scope-enum` rule, so any scope (or none) is accepted as long as the type and subject follow Conventional Commits.

Prefer a scope from this informal list when one fits: `deps`, `post`, `blog`, `cv`, `home`, `insights`, `photos`, `travel`, `auth`, `ci`, `ui`, `rust`, `docs`, `lib`, `agents`, `llm-timeline`, `kb`, `burns`, `api`. Use no scope when none of those fit. This list is documentation, not an enforced allowlist.

## Documentation Direction

This file is the root internal knowledge base for AI agents. Keep `AGENTS.md` and root `CLAUDE.md` as short entrypoints. Move durable duplicated workflow details here as docs are rewritten.

For Claude Cowork / desktop-agent sessions (non-terminal use), see [`docs/ai/cowork-instructions.md`](cowork-instructions.md). For writing blog posts and notes in Duyet's voice, see [`docs/ai/writing-style.md`](writing-style.md).

## Public App UI Direction

This section is the source of truth for public-app UI. Root [`DESIGN.md`](../../DESIGN.md) is a shorter companion note for the same direction; if the two disagree, follow this section.

The current public-app visual direction is a Websmith-inspired Duyet system, not a literal clone. Keep Duyet content, routes, data loading, auth, keyboard behavior, and app-specific workflows intact. Copy the design language only: quiet editorial layout, warm surfaces, compact cards, restrained borders, and mobile-safe wrapping.

### Design Tokens

- Use a white or warm off-white page background. Preferred warm base: `#f8f8f2`; white is acceptable for dense data or photo-heavy apps where the user explicitly prefers it.
- Use near-black foreground text, usually `#1a1a1a` or `#1f1f1f`, never low-contrast gray for primary content.
- Use Inter-first typography for refreshed apps: `Inter, ui-sans-serif, system-ui, sans-serif`. If an app already has a deliberate serif/display pairing, keep it only when it serves that app.
- Keep headings tight but not oversized. Desktop heroes should feel confident, not billboard-sized. Use around `text-4xl` to `text-5xl` for primary app heroes, smaller for utility dashboards.
- Keep body text relaxed and readable: mostly `text-sm` and `text-base`; avoid giant feature-card copy.
- Use a compact radius system: `8px` to `12px` for buttons, panels, cards, inputs, and screenshots. Avoid pill-shaped cards unless the existing control is a badge or status chip.
- Primary controls should usually be black or near-black rounded rectangles with white text. Secondary controls are white/warm panels with a single thin border.
- Accent/status orange can use `oklch(70.5% .213 47.604)` or a close orange. Use it sparingly for status dots, highlights, or active marks, not as a full-page theme.
- Pastel panels should be soft and varied, not a one-hue palette: light blue, emerald, red/coral, stone, and pale orange panels are preferred. Avoid purple-blue gradients as the main theme.

### Layout Pattern

- Prefer sticky, minimal headers with identity, a small route group, and a status indicator.
- Use left-aligned editorial heroes. The first viewport should clearly identify the app or topic without a marketing splash page.
- On laptop and larger screens, use 3+ columns where content naturally supports it. Keep the cards smaller and more relaxed than the original bento refresh.
- Use two-column grids only for large screenshots, long-form editorial sections, or when card content needs width.
- Keep section rhythm simple: full-width bands or unframed constrained sections. Do not nest cards inside cards.
- Cards should be compact: small title, short supporting text, one metadata/status row, and modest padding (`p-4` or `p-5`; rarely `p-6`).
- Use simple borders (`border-black/10`, `border-stone-200`, or tokenized equivalents), very light shadows if any, and no decorative gradient blobs/orbs.
- For visual app showcases, use existing local screenshots/assets. Do not copy Websmith logo, copy, or imagery.

### Mobile Rules

- Test at a real mobile width around 390px and at tablet/laptop widths before finishing visual work.
- No horizontal overflow. Check `document.documentElement.scrollWidth - document.documentElement.clientWidth`.
- Clamp drawers, sheets, and side panels with `w-[min(360px,calc(100vw-2rem))]` or an equivalent max-width pattern.
- Long titles, locations, URLs, and metric labels need `min-w-0`, `break-words`, `truncate`, or hidden decorative dividers on small screens.
- Composer or sticky bottom controls must reserve matching scroll padding so content does not sit underneath them.
- Responsive grids should usually be `grid-cols-1`, then `sm:grid-cols-2` or `md:grid-cols-2`, then `lg:grid-cols-3` or more when the content is compact.

### App-Specific Notes

- `apps/home`: editorial homepage with sticky minimal header, oversized but not huge left-aligned hero, relaxed 3+ column project grid on laptop, pastel service tiles, compact black CTAs, and large footer/contact rhythm.
- `apps/agent-ui`: keep this a small signed-in chat surface for `agents.duyet.net`; it should call `apps/agent-api` and not duplicate agent logic.
- `apps/agent-api`: keep this surface API-only for `agents-api.duyet.net`. Preserve `/api/v1/chat`, `/agents/ChatAgent/:sessionId`, Clerk bearer auth, and `AGENT_API_TOKEN` support.
- `apps/blog`: keep white background preference. Use compact home cards and mobile-safe archive rows; avoid the old large shared-card padding in 3-column contexts. Newsletter capture hydrates as a small Subscribe button in the post hero plus an inline `Get updates` column in the post footer grid (series / related / changelog). Hide that footer column when the row already has 3 cells. It POSTs to `https://news.duyet.net/api/subscribe` and must not turn the host page into a client-only shell.
- `apps/news`: mailing list lives in D1 `subscribers`. Daily digest stays automated. Custom notes are composed at `/mail` (Clerk admin) with templates + AI wrap; HTML is Cursor-like (520px, Inter, black CTA). Do not add a third-party ESP. Cross-origin `POST /api/subscribe` CORS must be handled in `src/server.ts` (`handleSubscribeCors`) before TanStack Start; the SPA fallback swallows OPTIONS. Public third-party digest is `GET /api/public` (slim TL;DR + top stories, no auth); `handlePublicCors` in the same Worker entry allows `chrome-extension://` and localhost Origins so the in-repo extension can fetch it. Do not send `/api/feed` to those clients as the primary path — it is ~360KB and has no CORS. The Chrome new-tab client is `apps/news-tab` (unpacked MV3, not deployed). Hourly ingest is the `NewsIngestScheduler` Durable Object alarm plus a GitHub Actions watchdog (`.github/workflows/news-ingest.yml`); do not add a Worker `[triggers]` cron (Free 5-cron cap) or Workflow `schedules` (paid). GitHub scheduled workflows on this repo skip for hours; do not treat Actions SUCCESS as "ingest finished" — `POST /api/admin/ingest` only creates a Cloudflare Workflow instance.
- `apps/insights`: keep dashboard density. Use the shared warm/near-black tokens and compact operational panels rather than a landing-page composition.
- `apps/insights`: architecture is static HTML frontend plus backend Worker API calls. Do not use TanStack Start server functions for runtime data loading; client-side data refreshes should call `apps/api` Worker endpoints.
- `apps/photos`: keep the photo-first white background. Text metadata such as location must truncate or wrap safely.

## Agent Discovery and AI Readiness

The project implements several standards to enable AI agent discovery and capabilities natively:

### Discovery Endpoints (apps/home/public)
- `/auth.md`: Serves human-readable and machine-readable agent authentication instructions.
- `/.well-known/api-catalog`: Lists standard machine-readable links for APIs (status, description, and docs) conforming to RFC 9727.
- `/.well-known/oauth-protected-resource`: Configures resource server metadata (RFC 9728).
- `/.well-known/oauth-authorization-server` & `/.well-known/openid-configuration`: Serves authorization server metadata including the `agent_auth` block for auth.md onboarding.
- `/.well-known/mcp/server-card.json`: Exposes the MCP Server Card configuration for Model Context Protocol integration.
- `/.well-known/agent-skills/index.json`: Publishes the skills discovery index conforming to Agent Skills Discovery RFC v0.2.0.

### Features
- **Link Response Headers**: Served on the homepage (`/` and `/*.html`) pointing to `/.well-known/api-catalog` (rel="api-catalog") and `/auth.md` (rel="describedby").
- **Markdown Content Negotiation**: Served via Cloudflare Pages middleware (`apps/home/functions/_middleware.ts`) which intercepts requests with `Accept: text/markdown` and serves `/llms.txt` with correct MIME types and token estimates.
- **WebMCP**: Exposes browser-level actions to agents by registering `search_projects` and `navigate_to` via `navigator.modelContext.provideContext()` / `registerTool()` inside the React root layout (`apps/home/src/routes/__root.tsx`).

### Recommended DNS-AID Records
Add the following `HTTPS` / `SVCB` DNS records to Cloudflare DNS for DNS-based agent discovery:
- `_index._agents.duyet.net. 3600 IN HTTPS 1 . alpn="index" port=443 mandatory=alpn,port`
- `_a2a._agents.duyet.net. 3600 IN HTTPS 1 agents-api.duyet.net. alpn="a2a" port=443 mandatory=alpn,port`

