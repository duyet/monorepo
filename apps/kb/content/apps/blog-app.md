---
title: "Blog App"
category: "apps"
tags: ["blog", "ssg", "wasm", "tanstack"]
links: ["tanstack-start-ssg-migration", "blog-wasm-prerender-ci", "blog-design-dark-mode", "rust-wasm-migration"]
summary: "apps/blog — TanStack Start SSG, 393 static pages, WASM markdown rendering, isomorphic data loading via readPublicJson."
updated: "2026-05-26"
---

# Blog App

`apps/blog` is a TanStack Start application deployed to Cloudflare Pages. It pre-renders 393 static pages at build time.

## Isomorphic data loading

The blog uses `readPublicJson()` in `apps/blog/lib/posts.ts` for loading post data:

- **During SSR / prerender:** reads directly from the filesystem (`fs.readFile`)
- **During client navigation:** uses `fetch()` against the deployed URL

This is unique to the blog. Other apps use absolute external API URLs, which work in both SSR and client contexts without special handling.

## Markdown rendering

Markdown is converted to HTML by the Rust-backed WASM crate at `packages/wasm/`. The exported `markdownToHtml` function from `@duyet/libs` delegates to the WASM binary. This gives an 79x speedup (6.3 ms → 0.08 ms) over the pure-TypeScript unified/remark pipeline it replaced.

The WASM binary is gitignored and must be built in CI before the blog build step. Absence of the binary causes silent prerender failures.

## Slug normalization

Post frontmatter slugs historically had a `.html` suffix (Jekyll legacy). These are stripped at data generation time. `getPostBySlug()` includes defensive normalization to handle both formats.

## Test coverage

50 tests as of last count — covers post loading, slug normalization, and rendering utilities.

## Design

White `#ffffff` background (distinct from the warm cream `#fbf7f0` used by other apps). Dark mode uses 20% opacity card tints. See blog design article for full conventions.

## Copy dropdown

Post pages have a copy dropdown offering:
- Copy (clipboard)
- View as Markdown
- Open in ChatGPT
- Open in Claude

## Series support

`SeriesBox` is rendered on post pages to show series context. It was removed briefly in the March 2026 cleanup but restored on 2026-03-28 after the user confirmed series context is useful.

## Plain-text access

Individual `.md` files are generated alongside each post's HTML for plain-text access (useful for LLM ingestion and `llms.txt` pipelines).
