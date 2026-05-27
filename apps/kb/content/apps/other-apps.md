---
title: "Other Apps Overview"
category: "apps"
tags: ["home", "cv", "photos", "homelab"]
links: ["tanstack-start-ssg-migration", "minimal-token-layer", "icon-standardization"]
summary: "home, cv, photos, homelab, and ai-percentage — all TanStack Start SSG on Cloudflare Pages; home uses minimal token layer and warm palette."
updated: "2026-05-26"
---

# Other Apps Overview

Five smaller apps round out the monorepo alongside blog, insights, llm-timeline, and agents.

## home

`apps/home` — 4 pre-rendered pages. The landing page for duyet.net. Uses the warm palette (`#fbf7f0`) with the minimal token layer (hero, projects grid). The 2026-05-25 redesign applied pill-outline tags, eyebrow-mono labels, and the display-tight heading style.

Still uses `@phosphor-icons/react` in `SiteChrome` and `index.tsx` — migrate to lucide-react when next touching those files.

Test count: 24.

## cv

`apps/cv` — 2 pre-rendered pages. Résumé / curriculum vitae. Refreshed in Cycle 9 alongside the LLM Timeline redesign.

Test count: 3.

## photos

`apps/photos` — 2 pre-rendered pages. Photo gallery. EXIF parsing uses the WASM exif crate (parity speed with TypeScript, no regression).

Test count: 40.

## homelab

`apps/homelab` — 1 pre-rendered page. Infrastructure overview / status page.

Test count: 31 (added in Cycle 9 with the design system unification pass).

## ai-percentage

`apps/ai-percentage` — 1 pre-rendered page. Shows the percentage of commits in this repo attributed to AI tooling.

## kb (this app)

`apps/kb` — the knowledge base you're reading. Content lives in `apps/kb/content/` as markdown files with frontmatter. Currently being seeded with synthesized memory content.

## Palette summary

| App | Background |
|-----|-----------|
| blog | white `#ffffff` |
| llm-timeline | warm cream `#fbf7f0` |
| home | warm cream `#fbf7f0` |
| insights | different palette (refresh pending) |
| photos | different palette |
| homelab | different palette |
