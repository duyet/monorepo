# 20 — Structured data (JSON-LD) + auto OG images + canonical/Twitter

**Area:** Content · **Effort:** M–L · **Impact:** High · **Conflict group:** blog/content routes · **Depends on:** none. Highest-leverage content win.

## Problem

No JSON-LD anywhere except `cv` (`Person`) and `home/about` (`ProfilePage`). No app generates per-page OG images (blog only sets `og:image` if a thumbnail exists; home/photos set none at root). No canonical or Twitter card tags. This suppresses rich results and social unfurls across ~314 posts + kb + the LLM dataset. A proven build-time satori + `@resvg/resvg-js` OG recipe already exists in-repo (`apps/kb/kb/memory/topics/web/tech-og-images-static-prerender.md`).

## Outcome / acceptance criteria

- [ ] JSON-LD rendered in prerendered HTML: `BlogPosting` + `BreadcrumbList` (blog posts), `TechArticle` (kb), `Dataset` + `ItemList` (llm-timeline), `ImageGallery`/`ImageObject` (photos), `WebSite` + `Person` (home root).
- [ ] Auto-generated OG image per post/article/model page from a single registry, emitted to `public/og/*.png`; `og:image` + `twitter:card=summary_large_image` wired in each route `head()`.
- [ ] `rel=canonical` + Twitter tags on all content routes.
- [ ] Validated: Google Rich Results test passes for a sample post; OG images resolve and render.

## Scope

**In:** JSON-LD + OG images + canonical/twitter across blog, kb, llm-timeline, photos, home. **Out:** search (`21`), feeds (`24`), embeddings (`23`). Photos feeds/robots also touched in `22` — coordinate (this plan owns JSON-LD + og:image; `22` owns sitemap/RSS/robots).

## Key files

- `apps/blog/src/routes/$year/$month/$slug/index.tsx` (meta ~:25-52), `apps/kb/src/routes/k/$slug.tsx`, `apps/llm-timeline/src/routes/__root.tsx` + filter routes, `apps/photos/components/PhotoFeed.tsx`, `apps/home/src/routes/__root.tsx`
- new `scripts/generate-og-images.ts` per app (or a shared generator in `packages/libs`), `public/og/*`
- reference: `apps/kb/kb/memory/topics/web/tech-og-images-static-prerender.md`

## Approach

1. Add a shared JSON-LD helper (typed) in `packages/libs`; render `<script type="application/ld+json">` in each route head from existing frontmatter/data.
2. Port the satori+resvg recipe into a build-time OG generator: one template, driven by a page registry (title, subtitle, tag/date). Emit deterministic PNGs to `public/og/<slug>.png`. Vendor the TTF fonts (hermetic).
3. Wire `og:image`/`twitter:card`/canonical into each route `head()`.
4. Build each app; confirm meta appears in the prerendered HTML (not just client). Validate with Rich Results + a card validator.

## Verification

```
pnpm --filter @duyet/blog run build && rg -n "application/ld\+json|og:image|canonical" apps/blog/dist/**/index.html | head
# Validate a sample URL in Google Rich Results after deploy; confirm og/<slug>.png resolves.
```

## Risks

- OG generation must be build-time + byte-deterministic (the kb memo has the working recipe) — do not generate per-request.
- JSON-LD must be in prerendered HTML for crawlers — verify in `dist`.

## Kickoff Prompt

> You are running plan `plans/20-structured-data-og.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan and the OG recipe at `apps/kb/kb/memory/topics/web/tech-og-images-static-prerender.md`.
>
> Deliver, rendered into prerendered HTML: (1) JSON-LD across content apps — `BlogPosting`+`BreadcrumbList` (blog), `TechArticle` (kb), `Dataset`+`ItemList` (llm-timeline), `ImageGallery`/`ImageObject` (photos), `WebSite`+`Person` (home root) — via a shared typed helper in `packages/libs`. (2) A build-time OG-image generator porting the satori+`@resvg/resvg-js` recipe: one template, page registry, deterministic `public/og/<slug>.png`, vendored TTF fonts. (3) `og:image` + `twitter:card=summary_large_image` + `rel=canonical` in every content route `head()`.
>
> Do NOT touch photos sitemap/RSS/robots (that's plan 22) — only its JSON-LD + og:image here. Verify meta appears in `dist` HTML (`rg` for `ld+json`/`og:image`), build each app, deploy, then validate a sample post in Google Rich Results and confirm OG images unfurl. shadcn-only. Semantic commits (`feat(blog)`, `feat(post)`, etc.). Keep OG generation build-time only. Update the plan Status.
