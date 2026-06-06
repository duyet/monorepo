# CLAUDE.md - KB App

This file provides guidance to Claude Code when working with the knowledge base application.

## Overview

Static knowledge base. Content comes from the **`~/kb` git submodule** mounted
at `apps/kb/kb/` (`git@github.com:duyet/kb.git`). Markdown is bundled at build
time via Vite and served as prerendered HTML on Cloudflare Pages.

- **Live**: https://kb.duyet.net | https://duyet-kb.pages.dev
- **Port**: 3009 (development)
- **Output**: Static SPA (`dist/client/`)

### Submodule

On a fresh clone, populate the submodule first:

```bash
git submodule update --init apps/kb/kb
```

CI must check out with `submodules: true` or `apps/kb/kb/` will be empty and the
build will produce zero pages. The `kb/` path lives inside `apps/kb/` so the
pnpm workspace globs (`apps/*`) don't match it as a package.

### Two content types

Both live in the submodule and render through `lib/content.ts`:

| Type | Source | Routes | Frontmatter |
|------|--------|--------|-------------|
| **Articles** | `kb/raw/kb-content/**/*.md` | `/k/<slug>`, `/c/<category>` | title, category, tags, links, summary, updated |
| **Memory notes** | `kb/memory/**/*.md` | `/m/<slug>`, `/m` | name, type, description, related (`[[wikilinks]]`), sources, aliases, created |

Files whose slug starts with `_` (e.g. `_TEMPLATE.md`) are skipped. The 3D
knowledge graph on the homepage spans both types; edges come from `links`/`related`
frontmatter (strong) plus shared tags (weak).

## Development Commands

```bash
pnpm run dev          # Start dev server on port 3009
pnpm run build        # Build static site to dist/client/
pnpm run check-types  # TypeScript type check
pnpm run lint         # Biome
pnpm run cf:deploy:prod   # Production deployment
```

## Architecture

- **Framework**: Vite + TanStack Start (prerendered SSG)
- **Content**: submodule `kb/raw/kb-content/**/*.md` (articles) and
  `kb/memory/**/*.md` (memory notes), parsed with `gray-matter`
- **Runtime loader** (`lib/content.ts`): two `import.meta.glob` calls bundle
  every .md at build time. Runs in both prerender (Node) and after
  hydration (browser).
- **Prebuild** (`scripts/generate-static-files.ts`): self-contained script.
  Walks both submodule dirs, emits:
  - `public/robots.txt`
  - `public/sitemap.xml`
  - `public/llms.txt` and `public/llms-full.txt`
  - `public/k/<slug>.md` — raw markdown per article (LLM/agent friendly)
  - `public/m/<slug>.md` — raw markdown per memory note
  - `public/graph-data.json` — nodes/edges for the homepage 3D graph
- **Build-time only**: content is loaded at build/prerender time; no
  runtime fs / `__dirname` access. Vite bundles all .md as raw strings
  through `import.meta.glob`.

### LLM/AI endpoints

- `GET /llms.txt` — index of articles
- `GET /llms-full.txt` — full body of every article concatenated
- `GET /k/<slug>.md` — raw markdown for a single article (with frontmatter)
- `GET /sitemap.xml` and `GET /robots.txt`

## First-time Cloudflare Pages setup

`pnpm run cf:deploy:prod` requires the Pages project to already exist on
Cloudflare. For a brand-new app:

```bash
# 1) Create the project (one-time)
set -a && source ../../.env.production.local && set +a
pnpm dlx wrangler pages project create duyet-kb --production-branch master

# 2) Deploy
pnpm run cf:deploy:prod

# 3) Attach the custom domain (one-time, when zone is in same CF account)
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/duyet-kb/domains" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"kb.duyet.net"}'
```

CF auto-provisions the DNS CNAME + ACME cert for same-account zones.

## Common Tasks

### Add a new article

Articles live in the `~/kb` repo, not in this app. To add one:

1. In `~/kb`, drop a markdown file under `raw/kb-content/<category>/<slug>.md`
   with frontmatter:
   ```markdown
   ---
   title: "Article Title"
   category: "category-name"
   tags: ["a", "b"]
   summary: "One-line description for llms.txt and OG"
   updated: "2026-05-27"
   links: ["related-slug"]
   ---
   ```
2. Commit & push in `~/kb`, then bump the submodule pointer here:
   ```bash
   cd apps/kb/kb && git pull origin main
   cd ../.. && git add apps/kb/kb && git commit -m "chore(kb): update content submodule"
   ```
3. `pnpm run build` regenerates sitemap, llms.txt, graph-data.json, and raw
   `.md` endpoints.
