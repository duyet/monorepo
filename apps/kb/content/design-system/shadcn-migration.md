---
title: "shadcn UI Migration"
category: "design-system"
tags: ["shadcn", "ui", "components", "cva"]
links: ["flat-design-rules", "minimal-token-layer", "llm-timeline-app"]
summary: "shadcn primitives (badge, button, input, card) added to llm-timeline in PR #1003; semantic CSS tokens replace all hardcoded color classes."
updated: "2026-03-25"
---

# shadcn UI Migration

The LLM Timeline app was the first to receive a full shadcn refactor (PR #1003, merged 2026-03-25). The pattern established there is the reference for future shadcn work.

## Components created

| Component | Variants |
|-----------|----------|
| `badge.tsx` | open / closed / partial / milestone / curated / epoch / outline |
| `button.tsx` | default / secondary / ghost / outline / icon |
| `input.tsx` | consistent input with semantic tokens |
| `card.tsx` | Card / CardHeader / CardTitle / CardContent |

All variants use `class-variance-authority` (CVA). Button uses `@radix-ui/react-slot` for the `asChild` pattern.

## Semantic token migration

Every component file and `__root.tsx` was migrated to semantic CSS tokens:

```css
/* before */
text-neutral-800 dark:text-neutral-200

/* after */
text-foreground
```

After the migration, zero hardcoded `neutral-*` or `dark:` color classes remain in LLM Timeline. All coloring flows through `bg-card`, `text-foreground`, `border-border`, etc.

## Dead code removed

| Removed | Replaced by |
|---------|-------------|
| `getLicenseColor()` | Badge variant |
| `getTypeColor()` | Badge variant |
| `getSourceColor()` | Badge variant |
| `getLicenseAccent()` | Removed (was for left-border accent, which flat design drops) |
| Custom `line-clamp` CSS | Built into Tailwind v4 |

## Dependencies added

```json
"class-variance-authority": "*",
"@radix-ui/react-slot": "*"
```

## Pending shadcn work

- WU-12: Consolidate agents shadcn components
- WU-13: Migrate insights tables to shadcn
- WU-15: TanStack Table for insights
- WU-16: TanStack Table for agents sheet editor

## Virtual scroll fix (bundled with this PR)

`useWindowVirtualizer`'s `scrollMargin` was included in `virtualRow.start` but not subtracted in the `translateY` transform, creating a ~400 px gap between the filter bar and the first year header.

Fix applied to `virtual-timeline.tsx` and `virtual-org-timeline.tsx`:

```ts
// before
style={{ transform: `translateY(${virtualRow.start}px)` }}

// after
style={{ transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)` }}
```
