---
title: "Decision: Flat Design Adoption"
category: "decisions"
tags: ["design", "architecture", "xai", "shadows"]
links: ["flat-design-rules", "minimal-token-layer", "shadcn-migration"]
summary: "Hairline borders replace shadows across all surfaces; no chunky rounded boxes; xAI interface language is the reference."
updated: "2026-05-25"
---

# Decision: Flat Design Adoption

**Date:** 2026-05-25  
**Status:** Applied to home, agents, blog, insights; propagating to remaining surfaces

## Problem

The monorepo had inconsistent elevation treatment — some components used `shadow-md`, `shadow-xs`, `rounded-2xl`, and hover shadow lifts. The visual result was heavy and inconsistent across surfaces.

## Decision

Remove all drop shadows, glow effects, and chunky rounded boxes. Use hairline 1px borders as the sole elevation cue. Hover states change background tint, not shadow.

The reference design is xAI's interface language: flat planes, 1px dividers, no visual weight beyond the content itself.

## What changed

- All `shadow-*` Tailwind utilities removed from card and list components
- `rounded-2xl` replaced with `rounded-md` or `rounded-none`
- Hover state: `var(--faint)` background tint instead of `box-shadow` lift
- Card borders: `border border-[var(--hairline)]` (1px)
- Grid patterns: `gap-px bg-[var(--hairline)]` container, `bg-[var(--background)]` cells

## The LLM Timeline as reference

PR #1003 (March 2026) already applied these rules to llm-timeline: all `shadow-*` classes removed, stat cards redesigned as vertical grids, semantic token colors throughout. That app is the reference implementation for flat cards.

## Concurrent decisions

This decision was made alongside:
- Standardizing on `lucide-react` over `@phosphor-icons/react`
- Adopting the minimal token layer (`--minimal-*` tokens + utility classes)
- Enabling background deploys per turn

All four were confirmed on 2026-05-25.
