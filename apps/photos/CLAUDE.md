# CLAUDE.md - Photos App

This file provides guidance to Claude Code when working with the photos gallery application.

## Overview

Photo gallery with masonry layout, lightbox viewer, and multiple photo provider integrations (Unsplash, Cloudinary, ClickHouse).

- **Live**: https://photos.duyet.net | https://duyet-photos.pages.dev
- **Port**: 3003 (development)
- **Output**: Static export (`output: 'export'`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3003 (Turbopack)
bun run build        # Build static export to 'out/'
bun run lint         # Run Biome linter
bun run test         # Run tests
bun run test:watch   # Run tests in watch mode

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router, static export
- **Layout**: `react-masonry-css` for masonry grid
- **Images**: Cloudinary + Unsplash + ClickHouse as photo providers
- **EXIF**: `exifreader` for photo metadata extraction
- **Styling**: Tailwind CSS
- **Package Manager**: Bun

### Project Structure

```
apps/photos/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main gallery page
│   ├── [year]/             # Year-based photo archives
│   └── feed/               # RSS feed
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
├── lib/
│   ├── photo-provider.ts   # Provider interface & factory
│   ├── unsplash-provider.ts  # Unsplash integration
│   ├── cloudinary-provider.ts # Cloudinary integration
│   ├── clickhouse-provider.ts # ClickHouse integration
│   ├── fallback-provider.ts  # Fallback/local photos
│   ├── unsplash.ts         # Unsplash API client
│   ├── cloudinary.ts       # Cloudinary client
│   ├── clickhouse.ts       # ClickHouse client
│   ├── localPhotos.ts      # Local photo data
│   ├── config.ts           # Provider configuration
│   ├── cache.ts            # Caching utilities
│   ├── types.ts            # TypeScript interfaces
│   ├── errors.ts           # Error types
│   ├── exifExtractor.ts    # EXIF data extraction
│   ├── MetadataFormatters.ts
│   ├── ImageOptimization.ts
│   └── GridUtilities.ts
├── hooks/
│   └── UseKeyboardNavigation.ts  # Keyboard nav for lightbox
└── cache-config/           # Caching configuration
```

## Key Patterns

### Photo Provider Architecture

Photos come from multiple sources via a provider interface:

```typescript
// lib/photo-provider.ts defines the interface
// Providers: unsplash, cloudinary, clickhouse, fallback
// Config in lib/config.ts selects which provider to use
```

The provider is selected at build time based on environment variables. The fallback provider uses local data when APIs are unavailable.

### Static Export with Photo Data

All photo data is fetched at build time:

```typescript
// app/page.tsx - fetch photos at build time
export const dynamic = 'force-static'
export const revalidate = 3600 // Rebuild every hour
```

### Lightbox Navigation

The lightbox supports keyboard navigation via `hooks/UseKeyboardNavigation.ts`:
- Arrow keys to navigate photos
- Escape to close
- Space to play/pause (if video)

### Adding a New Photo Provider

1. Create `lib/my-provider.ts` implementing the provider interface from `lib/photo-provider.ts`
2. Register it in `lib/config.ts`
3. Add required environment variables

## Environment Variables

```bash
# Unsplash
UNSPLASH_ACCESS_KEY=xxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# ClickHouse (for photo metadata storage)
CLICKHOUSE_HOST=your-host
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=username
CLICKHOUSE_PASSWORD=password
CLICKHOUSE_DATABASE=analytics_db

# Cross-app URLs
NEXT_PUBLIC_DUYET_PHOTOS_URL=https://photos.duyet.net
```

## Common Tasks

### Add Photos from Unsplash

Update the Unsplash collection ID or username in `lib/config.ts`.

### Change Photo Layout Columns

Modify `react-masonry-css` breakpoint config in `components/PhotoGrid.tsx`.

### Update EXIF Display Fields

Edit `components/PhotoMetadata.tsx` to add/remove EXIF fields shown in the lightbox.

## Build Notes

- `output: 'export'` with `staticPageGenerationTimeout: 180` (3 min) for slow API calls
- `unoptimized: true` for images (static export compatibility)
- Unsplash images served from `images.unsplash.com` and `plus.unsplash.com`

## Troubleshooting

### No photos appear

Check environment variables for the active photo provider. Verify API keys are valid.

### Build timeout

If Unsplash/Cloudinary API is slow, the 3-minute timeout may trigger. Check API rate limits.

### EXIF data missing

Not all photos have EXIF data. `exifreader` returns empty for photos without metadata.
