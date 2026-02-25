# CLAUDE.md - LLM Timeline App

This file provides guidance to Claude Code when working with code in this application.

## Overview

Interactive timeline of Large Language Model releases from 2017 to present.

- **Live**: https://llm-timeline.duyet.net | https://duyet-llm-timeline.pages.dev
- **Port**: 3005 (development)
- **Output**: Static export (`output: 'export'`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3005 (Turbopack)
bun run build        # Build static export to 'out/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router, static export
- **Styling**: Tailwind CSS
- **Components**: `@duyet/components` (ThemeProvider, Analytics, Head)
- **Package Manager**: Bun

### Project Structure

```
apps/llm-timeline/
├── app/
│   ├── layout.tsx          # Root layout with fonts, providers
│   ├── page.tsx            # Main timeline page (client component)
│   └── globals.css         # Tailwind imports + CSS vars
├── components/
│   ├── filters.tsx         # Search and filter controls
│   ├── model-card.tsx      # Individual model card
│   ├── stats-header.tsx    # Statistics header
│   └── timeline.tsx        # Timeline visualization
├── lib/
│   ├── data.ts             # Model data + types (LLM-updatable)
│   └── utils.ts            # Filtering, grouping utilities
└── next.config.js
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
