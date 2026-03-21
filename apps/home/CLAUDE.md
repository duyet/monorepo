# CLAUDE.md - Home App

This file provides guidance to Claude Code when working with the home (personal homepage) application.

## Overview

Personal homepage / landing page with links to all personal projects and apps.

- **Live**: https://duyet.net | https://duyet-home.pages.dev
- **Port**: 3001 (development)
- **Output**: Static SPA (`out/`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3001
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
- **Components**: `@duyet/components` (ContentCard, LinkCard, AiContentCard)
- **Package Manager**: Bun

### Project Structure

```
apps/home/
├── src/
│   ├── main.tsx            # SPA entry point
│   ├── router.tsx          # TanStack Router setup
│   ├── routeTree.gen.ts    # Auto-generated route tree (do not edit)
│   └── routes/
│       ├── __root.tsx      # Root layout (nav, theme, analytics)
│       ├── index.tsx       # Main homepage
│       └── about/          # About page
├── components/
│   └── icons/              # Custom icon components
├── lib/
│   ├── utm.ts              # UTM parameter helpers
│   └── config/
│       └── urls.ts         # External URL configuration
├── app/
│   └── globals.css
└── index.html              # SPA entry HTML
```

## Key Patterns

### Content Cards

The page uses `@duyet/components` cards to link to other apps:

```tsx
import { ContentCard, LinkCard, AiContentCard } from '@duyet/components'

// Link to external project
<LinkCard href="https://blog.duyet.net" title="Blog" description="..." />

// Card with rich content
<ContentCard title="Homelab" items={homelabNodes} />
```

### UTM Tracking

All external links include UTM parameters via the `addUtmParams()` helper in `app/page.tsx`.

### Homelab Integration

The homepage imports node data from the `homelab` app directly:

```typescript
import { nodes } from '../../homelab/lib/data/nodes'
```

## Environment Variables

```bash
# Cross-app URLs
NEXT_PUBLIC_DUYET_HOME_URL=https://duyet.net
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_INSIGHTS_URL=https://insights.duyet.net
```

## Common Tasks

### Add a New Link Card

Edit `app/page.tsx` and add a `<LinkCard>` or `<ContentCard>` component with the desired URL and content.

### Update Config URLs

Edit `app/config/urls.ts` to update external URLs referenced across the page.

## Build Notes

- Vite builds a static SPA to `out/` directory
- No server-side features — fully static
- Imports from sibling app (`homelab`) at build time are valid since Turborepo manages the build graph
