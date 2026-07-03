# 22 — Photos enrichment: feeds, sitemap, map, albums

**Area:** Content · **Effort:** M · **Impact:** Med · **Conflict group:** apps/photos (isolated) · **Depends on:** none. Coordinate JSON-LD/og:image with `20`.

## Problem

Photos captures rich EXIF **and GPS** per image but under-uses it. It has **no sitemap, no robots.txt**, and its `/feed` route declares an `application/rss+xml` alternate that points at the HTML page, not an XML feed (misleads readers/aggregators). `Lightbox.tsx` + keyboard-nav hook are defined but unwired. The gallery is flat + year-only despite tags being available.

## Outcome / acceptance criteria

- [ ] Real photo `feed.xml` (RSS/Atom) at `/feed`; the misleading alternate link now resolves to it.
- [ ] `sitemap.xml` including `image:image` entries + `robots.txt` emitted at build.
- [ ] `/map` route plotting photos by their existing GPS `location.position` (MapLibre/Leaflet), clustered.
- [ ] `/album/$slug` grouping by Cloudinary tags/collections (beyond flat + year).
- [ ] Lightbox + keyboard navigation wired (a11y win).

## Scope

**In:** feeds, sitemap, robots, map, albums, lightbox. **Out:** photos JSON-LD + og:image (owned by `20`). Search (`21`).

## Key files

- `apps/photos/scripts/generate-photos-data.ts` (+ new generators for feed/sitemap/robots), `apps/photos/src/routes/{feed,$year,__root}.tsx`, new `map.tsx` + `album.$slug.tsx`
- `apps/photos/components/{PhotoFeed,Lightbox}.tsx`, `apps/photos/hooks/UseKeyboardNavigation.ts`, `apps/photos/lib/*-provider.ts`

## Approach

1. Emit `feed.xml` (reuse the blog `rss` dep pattern), `sitemap.xml` with `image:image`, and `robots.txt` at build; fix the `/feed` alternate link.
2. Add `/map`: client-only MapLibre/Leaflet plotting `location.position`, marker-clustered; guard photos lacking GPS.
3. Add `/album/$slug` from provider tags; add an albums index.
4. Wire `Lightbox` + `UseKeyboardNavigation` into the grid (arrow keys, Esc, focus trap).
5. Deploy; browser-QA feed validity, map render, albums, lightbox keyboard nav, light/dark, mobile.

## Verification

```
pnpm --filter @duyet/photos run build && rg -n "rss|image:image|Sitemap" apps/photos/dist -l
# Manual: validate /feed.xml in a feed validator; open /map and confirm markers; tab through the lightbox.
```

## Risks

- Map lib is client-only — lazy-load; keep it off the critical path.
- Some photos have no GPS — filter gracefully.

## Kickoff Prompt

> You are running plan `plans/22-photos-enrichment.md` with **full autonomy including deploy**. Read `CLAUDE.md`, `docs/ai/internal-knowledge.md`, then the plan.
>
> Deliver in `apps/photos`: (1) a real `feed.xml` (RSS/Atom) and fix the misleading `/feed` alternate link; (2) build-time `sitemap.xml` with `image:image` entries + `robots.txt`; (3) a `/map` route plotting photos by their existing `location.position` GPS with marker clustering (MapLibre or Leaflet, lazy-loaded, guard missing GPS); (4) `/album/$slug` grouping by Cloudinary tags + an albums index; (5) wire the existing `Lightbox.tsx` + `UseKeyboardNavigation.ts` into the grid (arrow keys, Esc, focus trap).
>
> Do NOT add JSON-LD/og:image here (plan 20 owns that). Keep chrome shadcn-only. Verify the feed/sitemap/robots land in `dist`, deploy, and browser-QA the feed, map, albums, and lightbox keyboard nav in light/dark at desktop and ~390px (no horizontal overflow). Semantic commits (`feat(photos)`). Update the plan Status.
