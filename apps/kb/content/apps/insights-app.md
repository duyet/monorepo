---
title: "Insights App"
category: "apps"
tags: ["insights", "ssg", "analytics", "tanstack"]
links: ["tanstack-start-ssg-migration", "minimal-token-layer", "shadcn-migration"]
summary: "apps/insights — TanStack Start SSG, 22 pages, AI usage analytics, CCUsage data; design refresh deferred from Cycle 10."
updated: "2026-05-26"
---

# Insights App

`apps/insights` is a TanStack Start SSG app deployed to Cloudflare Pages. It pre-renders 22 pages covering AI usage analytics and other data views.

## Data

The app shows AI usage data sourced from CCUsage (Claude usage stats). Data syncing is handled by the data pipeline; the app itself reads pre-built JSON at build time.

In Cycle 4, a 674-line deduplication was applied to `ccusage-utils` — the original file had extensive duplication that was consolidated.

## Pages analytics

An agents analytics page was removed in PR #1008 (2026-03-29) — it was tracking an endpoint that no longer existed.

AI usage page data fetching was fixed on 2026-03-29 as well.

## Design status

The minimal token layer (2026-05-25) was applied to the insights shell. A full design refresh was a Cycle 10 goal but was deprioritized in favor of the SSG migration and agents refactor work.

The app currently has a different palette from the blog (white) and LLM Timeline (warm cream). Alignment is a future task.

## Pending shadcn work

- WU-13: Migrate insights tables to shadcn primitives
- WU-15: Implement TanStack Table for insights data grids

## Test coverage

60 tests as of last count.
