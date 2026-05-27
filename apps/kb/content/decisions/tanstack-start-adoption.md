---
title: "Decision: TanStack Start Adoption"
category: "decisions"
tags: ["tanstack", "ssg", "architecture", "vite"]
links: ["tanstack-start-ssg-migration", "cloudflare-rocket-loader", "agents-app"]
summary: "Migrated from Vite SPA to TanStack Start SSG to survive Cloudflare Rocket Loader; agents deferred due to Pages Functions complexity."
updated: "2026-03-24"
---

# Decision: TanStack Start Adoption

**Date:** 2026-03-23 to 2026-03-24  
**Status:** Complete for 8 apps; deferred for `agents`

## Problem

Cloudflare Rocket Loader rewrites `type="module"` script attributes, preventing Vite SPA initialization. Users saw blank pages. The fix required either disabling Rocket Loader per domain (a dashboard setting with no code path) or pre-rendering HTML at build time so the page had content before JS executed.

## Decision

Migrate all apps to TanStack Start with `prerender: { enabled: true, crawlLinks: true }`.

TanStack Start was chosen over alternatives (Remix, Next.js) because:
- The monorepo already used TanStack Router for client-side navigation
- Start is the natural server-side complement — same router, same file conventions
- Lower migration cost vs. switching frameworks entirely
- Works on Cloudflare Pages without a Worker runtime requirement for most apps

## Tradeoffs

| Aspect | Before (Vite SPA) | After (TanStack Start SSG) |
|--------|-------------------|---------------------------|
| Rocket Loader | Broken | Works (HTML pre-rendered) |
| Build complexity | Simple | Added entry-client/server files |
| WASM dependency (blog) | None | Must build WASM before blog |
| Local file fetches | Fetch works | Needs isomorphic handling |
| agents app | Works | Deferred — D1 Pages Functions block |

## agents exception

`apps/agents` uses Cloudflare Pages Functions to query a D1 database. Pages Functions run at the edge, not at build time, so routes depending on D1 can't be pre-rendered. Migrating agents would require extracting D1 access into a separate Worker with a REST API — a larger architectural change that was deferred.

## Outcome

All apps except agents are SSG. ~3700+ pages pre-rendered for llm-timeline alone, 393 for blog. Rocket Loader no longer a risk on those surfaces.
