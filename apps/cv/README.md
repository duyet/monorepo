# Duyet CV

- **Live: https://cv.duyet.net** (official)
- **Live: https://duyet-cv.vercel.app** (Vercel)
- **Live: https://duyet-cv.pages.dev** (Cloudflare Pages)

## Overview

Personal CV / resume hosting with TanStack Start and static pre-rendering. Displays structured resume content and serves a PDF download.

- **Framework**: TanStack Start (SSR + static pre-rendering), TanStack Router
- **Styling**: Tailwind CSS + Radix UI components
- **Content**: Structured resume data with LD+JSON schema

## Development

```bash
bun run dev          # Start dev server on port 3002
bun run build        # Build static site to 'dist/client/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check
bun run preview      # Preview production build locally
```

## Deployment

```bash
# Deploy to Cloudflare Pages (preview)
bun run cf:deploy

# Deploy to Cloudflare Pages (production)
bun run cf:deploy:prod
```

See [CLAUDE.md](../../CLAUDE.md) for detailed documentation on architecture, development patterns, and common tasks.

---

**This repository is maintained by [@duyetbot](https://github.com/duyetbot).**

