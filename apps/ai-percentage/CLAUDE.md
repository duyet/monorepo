# CLAUDE.md - AI Percentage App

This file provides guidance to Claude Code when working with the AI code percentage tracking application.

## Overview

Dashboard showing the percentage of code written by AI across all repositories, detected via co-author signatures and email patterns. Data is fetched from an external API (`api.duyet.net`).

- **Port**: 3002 (development)
- **Output**: Static export (`output: 'export'` via wrangler deployment)

## Development Commands

```bash
bun run dev          # Start dev server on port 3002 (Turbopack)
bun run build        # Build for production
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check
bun run fmt          # Format code with Biome

# Deploy to Cloudflare Pages
bun run deploy       # Build + deploy with Wrangler
```

## Architecture

### Tech Stack

- **Framework**: Next.js with App Router
- **Data Source**: External REST API at `api.duyet.net`
- **Styling**: Tailwind CSS
- **Package Manager**: Bun

### Project Structure

```
apps/ai-percentage/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main dashboard page
│   └── globals.css
├── components/
│   ├── AIPercentageHero.tsx    # Hero card with current AI %
│   ├── AIPercentageChart.tsx   # Historical chart of AI usage
│   ├── AIPercentageTrend.tsx   # Trend visualization
│   ├── Card.tsx                # Reusable card component
│   └── Skeleton.tsx            # Loading skeleton
└── lib/
    ├── index.ts                # Module exports
    ├── queries.ts              # API fetching functions
    ├── types.ts                # TypeScript interfaces
    └── utils.ts                # Date range helpers (DATE_RANGES)
```

## Key Patterns

### API Data Fetching

All data fetched from `api.duyet.net` at build time or on-demand:

```typescript
// lib/queries.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.duyet.net'

// Available endpoints:
// GET /ai/percentage/current   — current AI code percentage
// GET /ai/percentage/history?days=N — historical data (N days or 'all')
// GET /ai/percentage/available  — check if data is available
```

### Data Types

```typescript
// lib/types.ts
interface AICodePercentageData {
  date: string
  ai_percentage: number
  total_lines_added: number
  human_lines_added: number
  ai_lines_added: number
  total_commits: number
  human_commits: number
  ai_commits: number
}

interface CurrentAICodePercentage {
  ai_percentage: number
  total_lines_added: number
  human_lines_added: number
  ai_lines_added: number
}
```

### Date Range Filtering

Date ranges are defined in `lib/utils.ts` as `DATE_RANGES`. The page component uses a `TimeRange` selector to filter the historical chart.

## Environment Variables

```bash
# API endpoint (defaults to https://api.duyet.net)
NEXT_PUBLIC_API_BASE_URL=https://api.duyet.net
```

## Common Tasks

### Add a New Chart

1. Create component in `components/MyChart.tsx`
2. Fetch data using functions from `lib/queries.ts`
3. Import in `app/page.tsx`

### Add a New API Query

Add a new function to `lib/queries.ts` using the `fetchFromAPI` helper:

```typescript
export async function getMyData(): Promise<MyData | null> {
  return await fetchFromAPI<MyData>('/ai/my-endpoint')
}
```

## Notes

- The page is a client component (`'use client'`) due to date range state
- The API at `api.duyet.net` is the data source — the sync that populates it lives in `apps/data-sync` (the `ai-code-percentage` syncer)
- Data detection is based on git co-author signatures and email patterns in commits
