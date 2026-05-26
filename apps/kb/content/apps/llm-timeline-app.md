---
title: "LLM Timeline App"
category: "apps"
tags: ["llm-timeline", "ssg", "shadcn", "data"]
links: ["tanstack-start-ssg-migration", "shadcn-migration", "rust-wasm-migration"]
summary: "apps/llm-timeline — 3700+ SSG pages, shadcn UI, semantic tokens, warm cream palette, Epoch AI + curated Google Sheets data."
updated: "2026-05-26"
---

# LLM Timeline App

`apps/llm-timeline` is a TanStack Start app that renders a timeline of LLM models from 1950 to 2026. It pre-renders 3700+ static pages.

## Data sources

- **Curated:** 785 models from Google Sheets (manually maintained by Duyet)
- **Epoch AI:** 3156 models from the Epoch AI dataset
- **Deduplication:** 4 duplicates removed, giving 3937 unique models as of the March 2026 sync

The curated data in `apps/llm-timeline/lib/data.ts` is out of scope for duyetbot — it contains research facts, paper authors, and citations that only Duyet should edit.

## Design

The app uses the warm cream palette (`#fbf7f0 / #1f1f1f`) with a full semantic token system. The PR #1003 refactor (2026-03-25) migrated all 15 component files to semantic tokens — zero hardcoded `neutral-*` or `dark:` classes remain.

Stat cards are vertical grids (icon → value → label), matching a dashboard reference. No drop shadows. Badge variants replace color-lookup functions.

## Normalizers

`apps/llm-timeline/lib/normalizers.ts` calls the WASM normalizer crate via `initSync`. This is one of the few places where WASM is used even though it's not faster than TypeScript — the architecture decision was to keep all WASM crates consistent, and future batch APIs may help.

## Virtual scroll

The timeline uses `useWindowVirtualizer` from `@tanstack/react-virtual`. A bug was fixed in PR #1003 where `scrollMargin` was counted twice, creating a ~400 px gap. The fix subtracts `scrollMargin` from `translateY`.

## Filter UX

- **Desktop:** license filter pills rendered inline
- **Mobile:** `<select>` fallback
- `SearchAutocomplete` wired into the filter bar (was a plain `<input>` before the refactor)

## Year navigation

Sticky year headers use `backdrop-blur-sm` to remain readable over the scrolling list.

## Test coverage

42 tests as of last count.
