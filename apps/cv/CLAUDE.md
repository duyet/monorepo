# CLAUDE.md - CV App

This file provides guidance to Claude Code when working with the CV application.

## Overview

Personal CV / resume hosting with TanStack Start and static pre-rendering. Displays structured resume content and serves a PDF download.

- **Live**: https://cv.duyet.net | https://duyet-cv.pages.dev
- **Port**: 3002 (development)
- **Output**: `dist/client/` (prerendered HTML + assets)

## Development Commands

```bash
bun run dev          # Start dev server on port 3002
bun run build        # Build static site to 'dist/client/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: TanStack Start (SSR + static pre-rendering), TanStack Router
- **Styling**: Tailwind CSS + Radix UI Separator
- **Icons**: `@icons-pack/react-simple-icons` for tech stack icons
- **Package Manager**: Bun

### Project Structure

```
apps/cv/
├── src/
│   ├── entry-client.tsx    # Client hydration entry point
│   ├── entry-server.tsx    # Server-side rendering entry
│   ├── router.tsx          # TanStack Router setup (getRouter())
│   ├── routeTree.gen.ts    # Auto-generated route tree (do not edit)
│   └── routes/
│       ├── __root.tsx      # Root layout with full HTML document
│       ├── index.tsx       # Main CV page
│       └── pdf.tsx         # PDF viewer/download route
├── components/
│   ├── profile.tsx         # Personal profile section
│   ├── experience.tsx      # Work experience section
│   ├── education.tsx       # Education section
│   ├── skills-section.tsx  # Skills section
│   ├── skill.tsx           # Individual skill badge
│   ├── skill-details.tsx   # Detailed skill info
│   ├── section.tsx         # Reusable section wrapper
│   ├── hover-links.tsx     # Link components with hover effects
│   ├── inline-link.tsx     # Inline link component
│   ├── contact-links.tsx   # Contact links
│   └── resume-link.tsx     # Resume download link
├── config/
│   ├── cv.data.tsx         # All CV content (experiences, education, skills)
│   └── cv.types.ts         # TypeScript types for CV data
├── app/
│   └── globals.css         # Global styles and Tailwind config
└── public/
    └── duyet.cv.pdf        # PDF version of the CV
```

## Key Patterns

### Content Updates

All CV content is defined in `config/cv.data.tsx`. To update:

- **Experience**: Edit the `experience` array in `cv.data.tsx`
- **Education**: Edit the `education` array in `cv.data.tsx`
- **Skills**: Edit the `skills` data and `components/skills-section.tsx`
- **Overview/Summary**: Edit the `personal.overview` field in `cv.data.tsx`

### PDF Update

Replace `public/duyet.cv.pdf` with the new PDF file. The `/pdf` route serves the PDF viewer.

### Adding Icons

Use `@icons-pack/react-simple-icons` for technology icons:

```tsx
import { SiRust, SiClickhouse } from '@icons-pack/react-simple-icons'

<SiRust className="h-4 w-4" />
```

### Static Pre-rendering

The build prerendered both pages (`/` and `/pdf`) to static HTML at build time.
No server runtime is required — Cloudflare Pages serves the static output from `dist/client/`.

## Environment Variables

```bash
# Cross-app navigation
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
```

## Common Tasks

### Update Work Experience

Edit the `experience` array in `config/cv.data.tsx` — add or modify entries with company, role, dates, and responsibilities.

### Add a Tech Skill

Edit `components/skills-section.tsx` and related skill data in `config/cv.data.tsx`.

## Build Notes

- TanStack Start prerendering outputs to `dist/client/`
- `wrangler.toml` sets `pages_build_output_dir = "dist/client"`
- LD+JSON structured data for the Person schema is serialized once at module level in `__root.tsx`
