---
title: "Blog Design & Dark Mode"
category: "design-system"
tags: ["blog", "dark-mode", "css", "design"]
links: ["flat-design-rules", "minimal-token-layer", "blog-app"]
summary: "Blog uses white #ffffff background; dark mode uses 20% opacity tints for cards and inverted shade pairs for badges."
updated: "2026-03-31"
---

# Blog Design & Dark Mode

The blog's visual design was refreshed in March 2026. Key decisions:

- **Background:** white `#ffffff` (changed from warm cream `#fbf7f0` on 2026-03-23)
- **Post pages:** no card wrapper, no Related Posts section (removed)
- **SeriesBox:** restored on post pages 2026-03-28 — series context is valuable
- **Metadata bar:** no border, clean layout
- **Copy dropdown:** Copy, View as Markdown, Open in ChatGPT, Open in Claude

## Dark mode conventions

### Card backgrounds

Use `dark:bg-{color}/20` — 20% opacity tint — for colored cards in dark mode. This prevents full-saturation color blocks on dark backgrounds.

### Badges

Invert the shade pair:

```
light:  bg-{color}-100 text-{color}-800
dark:   dark:bg-{color}-900 dark:text-{color}-200
```

### Labels on colored cards

```
bg-white/70 dark:bg-white/10
```

### Body and heading text

```
body:     text-neutral-700 dark:text-neutral-300
headings: text-neutral-900 dark:text-neutral-100
```

## Dark mode fix history

| Date | Change |
|------|--------|
| 2026-03-29 | PR #1012 (xuancanh) — fixed dimmed text across 13 files |
| 2026-03-31 | Fixed `AiFeaturedCard` colorClasses, `PostBadges`, `ContentCard` category label |

## Infrastructure

- Service worker replaced with a self-unregistering stub (old SW was caching stale builds)
- Cache headers: `HTML → must-revalidate`, `assets → immutable`
- Individual `.md` files generated alongside each post for plain-text access
- `.html` slug suffix stripped from all 297 posts (Jekyll legacy — see blog slug fix)
