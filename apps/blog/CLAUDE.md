# CLAUDE.md - Blog App

This file provides guidance to Claude Code when working with the blog application.

## Overview

Personal blog with MDX posts, KaTeX math rendering, and comment system.

- **Live**: https://blog.duyet.net | https://duyet-blog.pages.dev
- **Port**: 3000 (development)
- **Output**: Static export (`output: 'export'`)

## Development Commands

```bash
# From apps/blog or monorepo root
bun run dev          # Start dev server on port 3000 (Turbopack)
bun run build        # Build static export to 'out/'
bun run lint         # Run Biome linter
bun run check-types  # TypeScript type check
bun run test         # Run tests

# Deploy to Cloudflare Pages
bun run cf:deploy        # Preview deployment
bun run cf:deploy:prod   # Production deployment
```

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router, static export
- **Content**: MDX posts with `next-mdx-remote-client`
- **Math**: KaTeX via `rehype-katex` + `remark-math`
- **Code**: `rehype-highlight` for syntax highlighting
- **Styling**: Tailwind CSS
- **Package Manager**: Bun

### Project Structure

```
apps/blog/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage (latest posts)
│   ├── [year]/             # Year archive pages
│   ├── category/           # Category pages
│   ├── tag/                # Tag pages
│   ├── series/             # Series pages
│   ├── archives/           # Full archive
│   ├── about/              # About page
│   ├── ai/                 # AI-related posts section
│   ├── feed/               # RSS feed
│   └── sitemap.ts          # XML sitemap
├── _posts/                 # Markdown/MDX blog posts
├── components/
│   ├── blog/               # Blog-specific components
│   ├── post/               # Post rendering components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── ui/                 # Generic UI components
│   └── MdxComponents.tsx   # MDX component overrides
├── lib/
│   ├── mdx.ts              # MDX parsing and processing
│   ├── metadata/           # SEO metadata helpers
│   ├── hooks/              # Custom React hooks
│   ├── category-metadata.ts
│   └── tag-metadata.ts
└── next.config.js          # Next.js config with env loading
```

## Key Patterns

### Static Export

All pages are statically generated. No server-side rendering or API routes.

```typescript
// Posts are read from _posts/ at build time
// No dynamic routes that require server
```

### MDX Posts

Posts live in `_posts/` as `.md` or `.mdx` files with frontmatter:

```markdown
---
title: "Post Title"
date: "2025-01-15"
category: "Data Engineering"
tags: ["rust", "clickhouse"]
series: "series-name"
---
```

### Adding a New Post

1. Create file in `_posts/YYYY-MM-DD-slug.md`
2. Add required frontmatter fields
3. Write content in Markdown/MDX
4. Math: use `$inline$` or `$$block$$` KaTeX syntax
5. Code blocks get syntax highlighting automatically

### Environment Variables

```bash
# Cross-app navigation
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_INSIGHTS_URL=https://insights.duyet.net

# Analytics
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXX
```

## Content Guidelines

- Posts in `_posts/` use kebab-case filenames: `2025-01-15-my-post.md`
- Categories and tags are defined per-post in frontmatter
- Series groups related posts together
- The `ai/` route shows AI-related posts filtered from the main feed

## Common Tasks

### Add a New Category

Edit `lib/category-metadata.ts` to add metadata for new category.

### Add a New Tag

Edit `lib/tag-metadata.ts` to add metadata for new tag.

### Customize MDX Components

Edit `components/MdxComponents.tsx` to override how MDX elements render.

### RSS Feed

Auto-generated at `/feed` from all posts. No manual updates needed.

## Build Notes

- `output: 'export'` generates static HTML in `out/` directory
- Images are `unoptimized: true` for static export compatibility
- Env vars loaded from monorepo root and app directory via `@next/env`
- `serverExternalPackages: ['sanitize-html', 'postcss']` avoids bundling issues

## Troubleshooting

### Build fails with MDX error

Check frontmatter is valid YAML and MDX syntax is correct in the post file.

### KaTeX not rendering

Ensure `remark-math` and `rehype-katex` are in the MDX processor chain (see `lib/mdx.ts`).

### Missing posts in build

Verify file is in `_posts/` with correct `.md` or `.mdx` extension and required frontmatter.
