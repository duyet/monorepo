---
title: "Flat Design Rules"
category: "design-system"
tags: ["design", "css", "tokens", "shadows"]
links: ["minimal-token-layer", "blog-design-dark-mode", "icon-standardization"]
summary: "Use hairline borders as the only elevation cue — no drop shadows, no chunky rounded boxes, no glow effects."
updated: "2026-05-25"
---

# Flat Design Rules

The visual language across duyet.net uses hairline borders as the sole elevation cue. No shadows, no glows, no `rounded-2xl` blobs.

This was established during the 2026-05-25 redesign session. The reference design is xAI's interface style: 1px dividers, flat planes, subtle background tints on hover.

## What to use

```css
/* borders */
border: 1px solid var(--hairline);
/* or */
border: 1px solid var(--em-hairline);

/* backgrounds */
background: var(--background);
/* or */
background: var(--em-background);

/* hover state */
background: var(--faint);   /* NOT shadow lift */
```

## What to avoid

- `shadow-xs`, `shadow-md`, `shadow-lg`, `drop-shadow-*`
- `rounded-2xl` (use `rounded-none` or `rounded-md` at most)
- animated backdrop blurs or glow halos

## Divider grid pattern

```html
<div class="gap-px bg-[var(--hairline)] border border-[var(--hairline)]">
  <div class="bg-[var(--background)]">cell</div>
  <div class="bg-[var(--background)]">cell</div>
</div>
```

This produces a hairline grid where the gaps between cells show the container's border color — a common pattern in the home page project grid and blog card lists.

## LLM Timeline exception

The LLM Timeline shadcn refactor (PR #1003) removed all `shadow-*` classes from that app's components. The stat cards are vertical grids (icon → value → label) with no shadow. Cards use `border-border` (semantic token) not a hardcoded color. This is the reference implementation.

## Rationale

Shadows imply depth and physicality. The preferred aesthetic is flat editorial — documents and data, not material surfaces. Consistent use of hairline borders makes the hierarchy legible without visual noise.
