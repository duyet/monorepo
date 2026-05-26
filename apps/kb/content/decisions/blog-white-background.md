---
title: "Decision: Blog White Background"
category: "decisions"
tags: ["blog", "design", "palette"]
links: ["blog-design-dark-mode", "flat-design-adoption", "blog-app"]
summary: "Blog background changed from warm cream #fbf7f0 to white #ffffff on 2026-03-23 to give it a distinct editorial identity from other apps."
updated: "2026-03-23"
---

# Decision: Blog White Background

**Date:** 2026-03-23  
**Status:** Active

## What changed

The blog's background color was changed from warm cream (`#fbf7f0`) to white (`#ffffff`) during the March 2026 design refresh.

## Why

Other apps in the monorepo (home, llm-timeline) use the warm cream palette. The blog is primarily a reading surface — a white background gives it a distinct, editorial feel closer to a publication than an app. It also improves code block contrast and reduces visual noise around long-form prose.

## Implications

The blog and other apps now use different base palettes:

| Surface | Background |
|---------|-----------|
| blog | `#ffffff` |
| home | `#fbf7f0` |
| llm-timeline | `#fbf7f0` |
| others | various (alignment pending) |

This is intentional divergence, not a mistake. The design system accommodates it — the warm token layer is the default, and the blog simply overrides the background token.

## Dark mode

In dark mode, the blog uses `#1f1f1f` (same as warm-palette apps). Card tints use `dark:bg-{color}/20` (20% opacity). See the blog design article for full dark mode conventions.
