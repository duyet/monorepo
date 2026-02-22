# CLAUDE.md - CV App

This file provides guidance to Claude Code when working with the CV application.

## Overview

Personal CV / resume hosting as a static Next.js site. Displays structured resume content and serves a PDF download.

- **Live**: https://cv.duyet.net | https://duyet-cv.pages.dev
- **Port**: 3002 (development)
- **Output**: Static export (`output: 'export'`)

## Development Commands

```bash
bun run dev          # Start dev server on port 3002 (Turbopack)
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
- **Styling**: Tailwind CSS + Radix UI Separator
- **Icons**: `@icons-pack/react-simple-icons` for tech stack icons
- **Package Manager**: Bun

### Project Structure

```
apps/cv/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main CV page
│   ├── pdf/            # PDF viewer/download route
│   └── globals.css     # Global styles
├── components/
│   ├── overview.tsx    # Personal summary section
│   ├── experience.tsx  # Work experience section
│   ├── education.tsx   # Education section
│   ├── skill.tsx       # Skills section
│   ├── skill-details.tsx
│   ├── section.tsx     # Reusable section wrapper
│   ├── hover-links.tsx # Link components with hover effects
│   └── inline-link.tsx
└── public/
    └── duyet.cv.pdf    # PDF version of the CV
```

## Key Patterns

### Content Updates

All CV content is defined directly in the components. To update:

- **Experience**: Edit `components/experience.tsx`
- **Education**: Edit `components/education.tsx`
- **Skills**: Edit `components/skill.tsx` and `components/skill-details.tsx`
- **Overview/Summary**: Edit `components/overview.tsx`

### PDF Update

Replace `public/duyet.cv.pdf` with the new PDF file. The `/pdf` route serves the PDF viewer.

### Adding Icons

Use `@icons-pack/react-simple-icons` for technology icons:

```tsx
import { SiRust, SiClickhouse } from '@icons-pack/react-simple-icons'

<SiRust className="h-4 w-4" />
```

## Environment Variables

```bash
# Cross-app navigation
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
```

## Common Tasks

### Update Work Experience

Edit `components/experience.tsx` — add or modify experience entries with company, role, dates, and description.

### Add a Tech Skill

Edit `components/skill.tsx` to add a skill badge, and `components/skill-details.tsx` for detailed skill info.

## Build Notes

- `output: 'export'` generates static HTML in `out/` directory
- `unoptimized: true` for images (static export compatibility)
- No API routes — fully static site
- Env vars loaded from monorepo root via `@next/env`
