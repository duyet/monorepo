# 23 — Cross-app content graph + embeddings-based related content

**Area:** Content · **Effort:** L · **Impact:** Med · **Conflict group:** blog/content build · **Depends on:** `11` embeddings infra reusable; can share the indexer.

## Problem

Blog "related posts" is a tag/category heuristic (`apps/blog/lib/posts.ts:283`). There's no semantic relatedness and no graph linking blog ↔ kb ↔ llm-timeline ↔ photos. `home` reads blog artifacts but there's no true cross-app content graph. kb already renders a graph but only over kb.

## Outcome / acceptance criteria

- [ ] A build-time `content-index.json` cataloguing blog posts, kb articles, llm-timeline entries, and photos with embeddings.
- [ ] Embeddings-based "related" on blog posts (cosine similarity) replacing/augmenting the tag heuristic.
- [ ] Cross-app "explore related across duyet.net" surface (home + article footers).
- [ ] The kb graph optionally consumes the shared index for cross-app edges.

## Scope

**In:** shared content index + embeddings related + cross-app suggestions. **Out:** lexical search (`21`), agent RAG (`11` — but reuse its embedding pipeline/store).

## Key files

- new shared generator (e.g. `packages/libs` or `scripts/generate-content-index.ts`), consumed by `apps/home`, `apps/blog` (`lib/posts.ts` related), `apps/kb` graph
- reuse `11`'s embedding approach (Workers AI / local model) to keep one pipeline

## Approach

1. Build `content-index.json`: for each content item store `{app,url,title,tags,summary,embedding}`. Embed at build (reuse `11`'s model; keep deterministic-ish).
2. Compute related via cosine similarity; expose top-k per item. Replace/augment blog's tag-only `getRelatedPosts`.
3. Add a cross-app "related across duyet.net" component (article footers + a home section).
4. Optionally feed cross-app edges into the kb graph.
5. Deploy; QA related quality + cross-app links, light/dark, mobile.

## Verification

```
pnpm --filter @duyet/blog run build   # content-index.json emitted; related links present in dist
# Manual: open a post, confirm related items are topically sensible and cross-app suggestions resolve.
```

## Risks

- Build cost/time for embeddings — cache by content hash; only re-embed changed items.
- Keep vectors in a committed JSON (like `posts-data.json`) or the shared store — avoid runtime cost.

## Kickoff Prompt

> You are running plan `plans/23-content-graph.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan and `plans/11-rag-content.md` (reuse its embedding pipeline — one implementation).
>
> Deliver: (1) a build-time `content-index.json` cataloguing blog posts, kb articles, llm-timeline entries, and photos with `{app,url,title,tags,summary,embedding}`, cached by content hash. (2) Embeddings-based related content on blog posts (cosine similarity) replacing/augmenting the tag heuristic in `apps/blog/lib/posts.ts:283`. (3) A shared "related across duyet.net" component on article footers + a `home` section. (4) Optionally feed cross-app edges into the kb graph.
>
> Keep embedding build-time and cached (no runtime cost); store vectors in a committed JSON or the shared store. Verify the index + related links land in `dist`, deploy, and browser-QA related quality + cross-app links in light/dark at desktop and ~390px. shadcn-only. Semantic commits (`feat(blog)`, `feat(home)`). Update the plan Status.
