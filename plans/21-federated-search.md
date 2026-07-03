# 21 — Federated static full-text search

**Area:** Content · **Effort:** M · **Impact:** High · **Conflict group:** blog/content routes · **Depends on:** none.

## Problem

Blog + llm-timeline search is client-only and loads *all* records to filter; **kb and photos have no search at all**. There's no way to search across duyet.net. A static prebuilt index (Pagefind or FlexSearch) gives real full-text search with zero backend, matching the static-first principle.

## Outcome / acceptance criteria

- [ ] A build-time index (Pagefind recommended — indexes prerendered HTML directly) covering blog posts + notes, kb articles/memory, and photo captions/metadata.
- [ ] A shared search UI (shadcn Command/Dialog) reused by blog, kb, and photos; keyboard-accessible (`/` or ⌘K).
- [ ] Optional federated mode: one search box that returns results across all content apps (via a shared index host).
- [ ] Blog's existing load-all client filter replaced by the index; result relevance is sane.

## Scope

**In:** static index + shared search component + integration in blog/kb/photos. **Out:** embeddings/semantic search (`23` — this is lexical), agent RAG (`11`).

## Key files

- `apps/blog/{scripts,src/routes/search.tsx}`, `components/blog/search-filters.tsx`
- `apps/kb/**` (new search route/component), `apps/photos/**`
- new shared `packages/components/Search*.tsx` (shadcn Command palette)
- build config to run Pagefind post-prerender per app

## Approach

1. Add Pagefind as a post-build step over each app's prerendered `dist` (it crawls the static HTML). Or FlexSearch with a generated JSON index if more control is needed.
2. Build a shared shadcn Command-palette search component; wire ⌘K/`/`.
3. Replace blog's load-all filter with the index; add search to kb + photos (currently none).
4. For federation, host a combined index (or query per-app indexes and merge) behind one palette on `home`.
5. Deploy; browser-QA search on each app + federated palette, light/dark, mobile.

## Verification

```
pnpm --filter @duyet/blog run build   # confirm pagefind/ index emitted into dist
# Manual: search a known term on blog/kb/photos; verify relevant hits and keyboard nav.
```

## Risks

- Pagefind runs after prerender — order the build step correctly.
- Index size for photos (captions only) is small; blog ~314 posts is fine.

## Kickoff Prompt

> You are running plan `plans/21-federated-search.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan.
>
> Deliver a static full-text search: (1) add Pagefind as a post-prerender build step for `apps/blog`, `apps/kb`, and `apps/photos` (it indexes the emitted HTML). (2) Build a shared shadcn Command-palette search component in `packages/components`, keyboard-accessible via ⌘K and `/`. (3) Replace blog's load-all client filter (`components/blog/search-filters.tsx`, `src/routes/search.tsx`) with the index, and add search to kb and photos (which have none today). (4) Add a federated palette on `home` that searches across apps.
>
> Keep it shadcn-only and static (no search backend). Verify the pagefind index is emitted into each `dist`, deploy, and browser-QA search + keyboard nav on blog/kb/photos and the federated palette, light/dark at desktop and ~390px. Semantic commits (`feat(blog)`, `feat(kb)`, `feat(ui)`). Update the plan Status.
