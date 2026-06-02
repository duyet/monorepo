# CLAUDE.md - KB App

This file provides guidance to Claude Code when working with the knowledge base application.

## Overview

Static knowledge base. Markdown content under `content/` is bundled at build
time via Vite and served as prerendered HTML on Cloudflare Pages.

- **Live**: https://kb.duyet.net | https://duyet-kb.pages.dev
- **Port**: 3009 (development)
- **Output**: Static SPA (`dist/client/`)

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
- **Content**: `content/**/*.md` parsed with `gray-matter`
- **Runtime loader** (`lib/content.ts`): uses `import.meta.glob` to bundle
  every .md at build time. Runs in both prerender (Node) and after
  hydration (browser).
- **Prebuild** (`scripts/generate-static-files.ts`): self-contained script.
  Walks `content/` itself, emits:
  - `public/robots.txt`
  - `public/sitemap.xml`
  - `public/llms.txt` and `public/llms-full.txt`
  - `public/k/<slug>.md` — raw markdown per article (LLM/agent friendly)
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

1. Drop a markdown file under `content/<category>/<slug>.md`
2. Frontmatter:
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
3. `pnpm run build` regenerates sitemap, llms.txt, and raw .md endpoints.
