---
title: "Icon Standardization (lucide-react)"
category: "design-system"
tags: ["icons", "lucide", "phosphor", "components"]
links: ["flat-design-rules", "minimal-token-layer"]
summary: "Use lucide-react for all icons; migrate @phosphor-icons/react imports when touching files that use them."
updated: "2026-05-25"
---

# Icon Standardization (lucide-react)

All icon usage should use `lucide-react`. When editing a file that imports from `@phosphor-icons/react`, migrate it in the same change.

This was decided on 2026-05-25 during the xAI-style redesign session. shadcn also defaults to lucide, so a single icon library across the full stack.

## Import pattern

```ts
import { Mail, Github, ExternalLink } from "lucide-react"
```

Not:

```ts
import { EnvelopeSimple, GithubLogo, ArrowSquareOut } from "@phosphor-icons/react"
```

## Migration mapping

| Phosphor | Lucide |
|----------|--------|
| `EnvelopeSimple` | `Mail` |
| `GithubLogo` | `Github` |
| `TwitterLogo` | `Twitter` |
| `LinkedinLogo` | `Linkedin` |
| `ArrowSquareOut` | `ExternalLink` |
| `MapPin` | `MapPin` |
| `User` | `User` |
| `Sun` | `Sun` |
| `Moon` | `Moon` |
| `DotsNine` | `Grid3x3` or `LayoutGrid` |
| `SquaresFour` | `LayoutGrid` |
| `List` | `Menu` |
| `Sparkle` | `Sparkles` |

## Prop differences

Lucide icons don't accept `weight="bold"`. Drop the prop — the default stroke weight is fine. If a heavier stroke is needed, use `strokeWidth={2.25}`.

The `size` prop works the same way: `<Mail size={20} />`.

## Status

- `apps/agents` and `apps/blog/-meta`: already on lucide
- `apps/home/SiteChrome` and `apps/home/index.tsx`: still on phosphor (migrate when touching)
