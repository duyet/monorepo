# Internal Knowledge

This repository is the Bun/Turborepo monorepo for duyet.net public apps, shared packages, data sync jobs, and Cloudflare/Vercel deployment workflows.

## Working Rules

- Read `CLAUDE.md` and this file before making non-trivial changes.
- Use semantic commit messages. Prefer a scope from `.commitlintrc.js` when one exists.
- Keep changes surgical. Do not reformat or refactor unrelated code.
- Preserve existing UX and public routes unless the request explicitly changes them.
- Use Bun commands from the relevant package or app directory. Check the local `package.json` before assuming a script exists.
- Verify with the narrowest useful command first, then broaden only when needed.

## Root Commands

- `bun run build` builds all apps and packages through Turbo.
- `bun run dev` starts workspace development servers through Turbo.
- `bun run lint` runs Biome linting.
- `bun run fmt` formats TypeScript, TSX, and Markdown through Biome.
- `bun run test` runs Turbo tests.
- `bun run config` runs workspace config tasks, including app secret syncs where defined.
- `bun run deploy` builds deployable apps, then runs workspace config.
- `bun run cf:deploy` deploys changed Cloudflare Pages apps.
- `bun run cf:deploy:prod` runs production Cloudflare deploy tasks through Turbo.
- `bun run wasm:build` builds all Rust crates to WASM via `wasm-pack`.
- `bun run wasm:build:release` builds WASM with optimizations.
- `bun run wasm:test` runs `cargo test` across the Rust workspace.
- `bun run wasm:clippy` lints Rust code.
- `bun run bench:wasm` benchmarks TS vs WASM for all modules.

## Apps

- `apps/home`: homepage for `https://duyet.net`, deployed to Cloudflare Pages.
- `apps/blog`: Vite SPA blog for `https://blog.duyet.net`, Auth0 auth, Vercel KV comments, Markdown posts with KaTeX.
- `apps/cv`: CV host for `https://cv.duyet.net`.
- `apps/insights`: analytics dashboard for `https://insights.duyet.net`, using Cloudflare Analytics, GitHub, PostHog, WakaTime, ClickHouse, and TanStack Start prerendering.
- `apps/photos`: photo gallery for `https://photos.duyet.net`, Unsplash and Cloudinary-related workflows.
- `apps/homelab`: homelab docs and resources for `https://homelab.duyet.net`.
- `apps/llm-timeline`: LLM release timeline for `https://llm-timeline.duyet.net`, with sync, RSS, sitemap, and llms.txt generation.
- `apps/agents`: AI chat interface for `https://agents.duyet.net`, Cloudflare Pages Functions, Workers AI, and AI Gateway.
- `apps/api`: Hono API on Cloudflare Workers for `https://api.duyet.net`.
- `apps/ai-percentage`: AI-written-code dashboard for `https://ai-percentage.duyet.net`; data comes from `apps/data-sync`.
- `apps/data-sync`: operational CLI for ClickHouse analytics/activity syncs and migrations.

## Shared Packages

- `packages/components`: shared React components.
- `packages/libs`: shared utility functions.
- `packages/interfaces`: shared TypeScript interfaces.
- `packages/config`: shared app, API, and UI config.
- `packages/tailwind-config`: shared Tailwind config.
- `packages/tsconfig`: shared TypeScript config.
- `packages/profile` and `packages/urls`: shared profile and URL metadata.

## Deployment Notes

- Cloudflare Pages production deploys happen on pushes to `master` or `main`; PRs receive preview deploys.
- Deploy workflows run type checks, tests, and lint before deploy jobs.
- App-level `cf:deploy:prod` scripts are authoritative when present.
- `apps/insights` deploys `dist/client` to the `duyet-insights` Pages project.
- `apps/api` uses Wrangler as a Worker, not a Pages app.

## App-Specific Command Notes

- `apps/agents`: `bun run prebuild` builds skills; `bun run dev` uses `node dev.js`; `bun run dev:vite` is Vite-only; `bun run test:e2e` runs browser tests.
- `apps/api`: `bun run dev` uses Wrangler; `bun run deploy` builds then deploys the Worker.
- `apps/cv`: `bun run preview` validates production output locally.
- `apps/data-sync`: use `bun run sync <name>`, `bun run sync:all`, `bun run migrate:*`, and `bun run cleanup:dry-run`.
- `apps/llm-timeline`: use `bun run sync`, `bun run sync:dry`, `bun run rss`, `bun run llms-txt`, and `bun run sitemap` for content generation.
- `apps/ai-percentage`: refresh data through `apps/data-sync` with `bun run sync ai-code-percentage`.

## Rust/WASM Modules

Rust crates in `crates/` serve two purposes:
- **Build-time**: Native CLI binary (`duyet-cli`) for data sync and prerender
- **Runtime**: WASM modules for browser/CF Workers (diff, exif, utils, markdown)

### Build & Test

- `bun run rust:build` — build native CLI binary (`target/release/duyet-cli`)
- `bun run wasm:build` — build runtime crates to WASM
- `bun run wasm:test` — `cargo test` across workspace
- `bun run wasm:clippy` — lint Rust code
- `bun run bench:wasm` — run TS vs WASM benchmarks

### Crates

| Crate | Mode | Function | Consumer |
|-------|------|----------|----------|
| `crates/cli/` | Build | Unified CLI: `csv`, `normalize`, `dedup`, `markdown` subcommands | JS wrappers via `callCli()` |
| `crates/markdown/` | Both | `markdown_to_html(input) -> String` | WASM for per-page, CLI for batch |
| `crates/csv-parser/` | Build | `parse_csv(input) -> String` | `apps/llm-timeline/lib/csv.ts` |
| `crates/normalizers/` | Build | 8 normalize functions | `apps/llm-timeline/lib/normalizers.ts` |
| `crates/dedup/` | Build | `merge_all_sources(input) -> String` | `apps/llm-timeline/lib/deduplicator.ts` |
| `crates/exif/` | Runtime | `extract_exif(data: &[u8]) -> String` | `apps/photos/lib/exifExtractor.ts` |
| `crates/diff/` | Runtime | `diff_text`, `align_blocks` | `apps/agents/lib/editor/diff.ts` |
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

Commitlint scopes include `deps`, `post`, `blog`, `cv`, `home`, `insights`, `photos`, `travel`, `auth`, `ci`, `ui`, `rust`, `docs`, `lib`, `agents`, and `llm-timeline`.

Use no scope only when no listed scope fits.

## Documentation Direction

This file is the root internal knowledge base for AI agents. Keep `AGENTS.md` and root `CLAUDE.md` as short entrypoints. Move durable duplicated workflow details here as docs are rewritten.

## Public App UI Direction

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
- `apps/agents`: preserve the chat workspace. Restyle tokens, sidebars, top bar, empty state, messages, composer, tool approvals, and right rail. Keep mobile drawers reachable and clamped.
- `apps/blog`: keep white background preference. Use compact home cards and mobile-safe archive rows; avoid the old large shared-card padding in 3-column contexts.
- `apps/insights`: keep dashboard density. Use the shared warm/near-black tokens and compact operational panels rather than a landing-page composition.
- `apps/photos`: keep the photo-first white background. Text metadata such as location must truncate or wrap safely.
