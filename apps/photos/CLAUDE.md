# CLAUDE.md - Photos App

This file provides guidance to Claude Code when working with the photos gallery application.

## Overview

Photo gallery with masonry layout, lightbox viewer, and multiple photo provider integrations (Unsplash, Cloudinary, ClickHouse).

- **Live**: https://photos.duyet.net | https://duyet-photos.pages.dev
- **Port**: 3003 (development)
- **Output**: Static SPA (`out/`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3003
bun run build        # Fetch photo data + build to out/
bun run check-types  # TypeScript type check
bun run lint         # Run Biome linter
bun run test         # Run tests
bun run test:watch   # Run tests in watch mode

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Vite + TanStack Router (SPA, file-based routing)
- **Layout**: `react-masonry-css` for masonry grid
- **Images**: Cloudinary + Unsplash + ClickHouse as photo providers
- **EXIF**: `exifreader` for photo metadata extraction
- **Styling**: Tailwind CSS v4
- **Package Manager**: Bun

### Project Structure

```
apps/photos/
├── src/
│   ├── main.tsx            # SPA entry point
│   ├── router.tsx          # TanStack Router setup
│   ├── routeTree.gen.ts    # Auto-generated route tree (do not edit)
│   └── routes/
│       ├── __root.tsx      # Root layout (nav, theme, analytics)
│       ├── index.tsx       # Main gallery page (/)
│       ├── $year.tsx       # Year-filtered gallery (/:year)
│       └── feed.tsx        # Photo stream (/feed)
├── app/
│   └── globals.css         # Global CSS with design tokens
├── components/
│   ├── PhotoGrid.tsx       # Masonry grid layout
│   ├── PhotoCard.tsx       # Individual photo card
│   ├── PhotoFeed.tsx       # Photo feed wrapper
│   ├── Lightbox.tsx        # Full-screen lightbox viewer
│   ├── LightboxControls.tsx
│   ├── LazyImage.tsx       # Lazy-loaded image component
│   ├── PhotoMetadata.tsx   # EXIF/metadata display
│   ├── PhotoNav.tsx        # Navigation controls
│   ├── ErrorBoundary.tsx   # Error handling
│   ├── LoadingStates.tsx   # Loading skeletons
│   └── RetryButton.tsx     # Retry on error
├── hooks/
│   ├── UseKeyboardNavigation.ts  # Keyboard nav for lightbox
│   └── usePhotos.ts        # Photo data fetching hook
├── lib/
│   ├── photo-provider.ts   # Provider interface & factory (build-time only)
│   ├── unsplash-provider.ts
│   ├── cloudinary-provider.ts
│   ├── clickhouse-provider.ts
│   ├── fallback-provider.ts
│   └── ...                 # Other lib utilities
├── scripts/
│   └── generate-photos-data.ts  # Prebuild: fetch photos → public/photos-data.json
├── public/
│   └── photos-data.json    # Generated at build time (do not commit)
└── index.html              # SPA entry HTML
```

## Key Patterns

### Photo Data Flow

Photos are fetched at **build time** by `scripts/generate-photos-data.ts`, which:
1. Tries ClickHouse first (fast, no rate limits)
2. Falls back to Unsplash + Cloudinary APIs
3. Falls back to sample photos if all providers fail
4. Writes `public/photos-data.json`

At runtime, the SPA loads `photos-data.json` via `hooks/usePhotos.ts`.

### Routes

| URL | Route file | Description |
|-----|-----------|-------------|
| `/` | `src/routes/index.tsx` | Full photo gallery |
| `/:year` | `src/routes/$year.tsx` | Year-filtered gallery |
| `/feed` | `src/routes/feed.tsx` | Single-column photo stream |

### Environment Variables (build-time only)

```bash
# Unsplash (used during build for photo data generation)
UNSPLASH_ACCESS_KEY=xxxxxxxxxx

# Cloudinary (used during build)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# ClickHouse (used during build)
CLICKHOUSE_HOST=your-host
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=username
CLICKHOUSE_PASSWORD=password
CLICKHOUSE_DATABASE=analytics_db

# Cross-app URLs (runtime, VITE_ prefix)
VITE_DUYET_BLOG_URL=https://blog.duyet.net
VITE_DUYET_INSIGHTS_URL=https://insights.duyet.net
VITE_DUYET_CV_URL=https://cv.duyet.net
VITE_DUYET_HOME_URL=https://duyet.net
```

### Lightbox Navigation

The lightbox supports keyboard navigation via `hooks/UseKeyboardNavigation.ts`:
- Arrow keys to navigate photos
- Escape to close
- Space to play/pause slideshow

## Troubleshooting

### No photos appear

Check environment variables for the active photo provider. Verify API keys are valid.
The `public/photos-data.json` must exist and contain photos.

### EXIF data missing

Not all photos have EXIF data. `exifreader` returns empty for photos without metadata.

### Route tree out of date

Run `bun --bun vite build` or `bun run dev` to regenerate `src/routeTree.gen.ts`.
