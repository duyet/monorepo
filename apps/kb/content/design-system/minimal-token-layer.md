---
title: "Minimal Token Layer"
category: "design-system"
tags: ["css", "tokens", "design-system", "components"]
links: ["flat-design-rules", "blog-design-dark-mode", "llm-timeline-app"]
summary: "Third additive CSS layer in packages/components/styles.css adds --minimal-* tokens and utility classes used across four surfaces."
updated: "2026-05-25"
---

# Minimal Token Layer

A third additive layer was added to `packages/components/styles.css` on 2026-05-25. It extends the base token system with a minimal editorial palette and three utility classes.

## Tokens

The `--minimal-*` namespace provides semantic editorial tokens:

- `--minimal-*` color and spacing tokens (see `packages/components/styles.css`)

These sit on top of the existing warm-token layer (`#fbf7f0 / #1f1f1f`) without replacing it.

## Utility classes

Three utility classes were added:

| Class | Use |
|-------|-----|
| `.pill-outline` | Small outlined pill badge, typically used for tags |
| `.eyebrow-mono` | Monospace uppercase eyebrow text above headings |
| `.display-tight` | Display-size heading with tighter letter-spacing |

## Applied across four surfaces

One CSS file, four deployment surfaces:

| App | Usage |
|-----|-------|
| `apps/home` | Hero section, projects grid |
| `apps/agents` | Full shell rebuild |
| `apps/blog` | Index page, post lede section |
| `apps/insights` | App shell |

## Design philosophy

The layer is additive — it doesn't modify existing tokens or break existing surfaces. Apps that haven't adopted it yet continue to work unchanged. When touching a component in a new surface, apply the minimal tokens alongside any other edits.

## Relationship to other layers

1. **Base layer** — Tailwind v4 CSS variables, `@theme` block
2. **Warm layer** — `#fbf7f0 / #1f1f1f` palette tokens for most apps
3. **Minimal layer** — editorial tokens + pill/eyebrow/display utilities (added 2026-05-25)

The blog uses white `#ffffff` instead of warm cream, so it effectively bypasses layer 2 for background colors while still using the shared component tokens.
