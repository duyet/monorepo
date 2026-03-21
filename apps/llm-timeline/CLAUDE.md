# CLAUDE.md - LLM Timeline App

This file provides guidance to Claude Code when working with code in this application.

## Overview

Interactive timeline of Large Language Model releases from 2017 to present.

- **Live**: https://llm-timeline.duyet.net | https://duyet-llm-timeline.pages.dev
- **Port**: 3005 (development)
- **Output**: Static SPA (`out/`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3005
bun run build        # Build static SPA to 'out/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Vite + TanStack Router (SPA, file-based routing)
- **Styling**: Tailwind CSS
- **Components**: `@duyet/components` (ThemeProvider, Analytics, Head)
- **Package Manager**: Bun

### Project Structure

```
apps/llm-timeline/
├── src/
│   ├── main.tsx            # SPA entry point
│   ├── router.tsx          # TanStack Router setup
│   ├── routeTree.gen.ts    # Auto-generated route tree (do not edit)
│   └── routes/
│       ├── __root.tsx      # Root layout with fonts, providers
│       ├── index.tsx       # Main timeline page
│       ├── license.$slug/  # License filter pages
│       ├── year.$year/     # Year filter pages
│       └── org.$slug/      # Organization filter pages
├── components/
│   ├── filters.tsx         # Search and filter controls
│   ├── model-card.tsx      # Individual model card
│   ├── stats-header.tsx    # Statistics header
│   └── timeline.tsx        # Timeline visualization
├── lib/
│   ├── data.ts             # Model data + types (LLM-updatable)
│   └── utils.ts            # Filtering, grouping utilities
├── app/
│   └── globals.css         # Tailwind imports + CSS vars
└── index.html              # SPA entry HTML
```

## Key Patterns

### LLM-Updatable Data

The model data in `lib/data.ts` is designed to be easily updated by LLMs:

```typescript
// Add a new model to the `models` array:
{
  name: 'Model Name',
  date: '2025-03-15',      // YYYY-MM-DD format
  org: 'Organization',
  params: '70B',           // or null for unknown
  type: 'model',           // 'model' | 'milestone'
  license: 'open',         // 'open' | 'closed' | 'partial'
  desc: 'Brief description of the model.'
}
```

### Static Generation

The app uses client-side rendering for interactivity (search, filters).

### Color Coding

- **Open license**: Sage green
- **Closed license**: Coral/terracotta
- **Partial license**: Lavender
- **Milestones**: Terracotta (highlighted)

## Common Tasks

### Add a New Model

Edit `lib/data.ts` and append to the `models` array following the type structure.

### Update Existing Model

Find the model by name in `lib/data.ts` and modify the fields.

### Add New Organization

Organizations are auto-extracted from model data. Just add models with the new org.

## Static Routes

The app generates static pages and feeds for various views:

| Route Type | URL Pattern | Route File | Description |
|-----------|-------------|-----------|-------------|
| Home | `/` | `src/routes/index.tsx` | Main timeline with all models |
| License | `/license/{slug}` | `src/routes/license.$slug/` | Filter by license type |
| Year | `/year/{year}` | `src/routes/year.$year/` | Filter by release year |
| Org | `/org/{slug}` | `src/routes/org.$slug/` | Filter by organization |

### URL Patterns

- **License pages**: `/license/open`, `/license/closed`, `/license/partial`
- **Year pages**: `/year/2017`, `/year/2018`, ..., `/year/2026`
- **Org pages**: `/org/openai`, `/org/google`, `/org/anthropic`, etc.

Organization slugs are generated using `slugify()`:
- `OpenAI` → `openai`
- `Google DeepMind` → `google-deepmind`
- `Meta AI` → `meta-ai`

### RSS Feeds

RSS feeds are generated for all routes at build time:

| Feed | URL | Description |
|------|-----|-------------|
| All models | `/rss.xml` | All 200+ models, newest 200 items |
| License feeds | `/license/{open,closed,partial}/rss.xml` | Models by license type |
| Year feeds | `/year/{year}/rss.xml` | Models released in specific year |
| Org feeds | `/org/{slug}/rss.xml` | Models from specific organization |

All feeds include:
- Model name and organization
- Release date and parameters
- License type and description
- Link to main timeline

### Sitemap

XML sitemap is generated at `/sitemap.xml` including:
- All static pages with priorities
- Last modification dates
- Change frequencies (weekly for licenses/orgs, monthly for years)

## Build-Time Scripts

The app runs several scripts during `prebuild`:

1. **generate-rss.ts** — Generates ~50 RSS feeds to `public/`
2. **generate-sitemap.ts** — Generates XML sitemap to `public/sitemap.xml`
3. **generate-llms-txt.ts** — Generates llms.txt for AI discovery

All outputs are included in the static export.
