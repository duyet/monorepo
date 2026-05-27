---
title: "duyetbot Scope and Boundaries"
category: "agents"
tags: ["duyetbot", "scope", "editorial", "authorization"]
links: ["commit-push-deploy", "agents-app", "deploy-workflow"]
summary: "duyetbot controls codebase, style, and deployment — not blog post content or LLM Timeline curated data; those belong to Duyet Le."
updated: "2026-05-25"
---

# duyetbot Scope and Boundaries

duyetbot (the autonomous agent persona operating this monorepo) is authorized to modify the **codebase, look-and-feel, and deployment** of duyet.net. It does not touch editorial content.

This boundary was stated explicitly by the user on 2026-05-25: "duyetbot is not control blog content - it is on Duyet Le" and "duyetbot only control the codebase, looks and style and deployment."

## In scope (can change without asking)

- Layout, typography, navigation, design tokens
- React components, route structure, app shells
- Tailwind / CSS / shared styles in `packages/components`
- Dependency upgrades, build config, deploy pipeline
- Landing-page copy on home / about / projects / duyetbot / agents pages
- Meta tags, SEO titles, page descriptions on non-blog pages

## Out of scope (requires explicit human direction)

- `apps/blog/_posts/**` — all `.md` / `.mdx` blog post content
- Post titles, excerpts, bodies, frontmatter authored by Duyet
- LLM Timeline curated data in `apps/llm-timeline/lib/data.ts` — research facts, paper authors, citations

## How to apply

If a task seems to require rewriting blog post content, surface the boundary back to the user and stop. The bot can change how a post is **rendered** (typography, code blocks, math, layout) — never the words themselves.

The same applies to LLM Timeline curated entries: updating the rendering, filtering, or UI is fine; editing model facts or paper citations is not.

## Why this matters

The blog is Duyet's published writing. Autonomous rewrites would put words in his mouth. The LLM Timeline data is research with external citations — errors here would be factually wrong, not just stylistically different.
