---
title: "About This Knowledge Base"
category: "meta"
tags: ["kb", "meta", "llms"]
links: ["kb-content-conventions", "duyetbot-scope"]
summary: "apps/kb stores durable monorepo knowledge as markdown articles with frontmatter; generated from agent memory, maintained by duyetbot."
updated: "2026-05-26"
---

# About This Knowledge Base

`apps/kb` is the knowledge base for the duyet.net monorepo. It stores durable architectural knowledge, design decisions, and workflow patterns as static markdown articles.

## Purpose

Unlike `docs/ai/core-memory.md` (raw agent memory dumps) or `memory/*.md` (session notes), the KB articles are:

- **Synthesized:** each article covers one topic end-to-end, merging multiple memory sources where relevant
- **Structured:** consistent frontmatter with categories, tags, links, and a one-sentence summary
- **Graph-connected:** `links` in frontmatter form a graph; the build pipeline computes incoming links from outgoing

## Structure

```
apps/kb/content/
  infrastructure/    # Cloudflare, deploy, WASM, CI
  design-system/     # tokens, dark mode, shadcn, icons
  apps/              # per-app overviews
  agents/            # duyetbot scope, autonomous workflows
  data-pipeline/     # data sync, ClickHouse, CCUsage
  workflows/         # commit/push/deploy, dead code, tests
  decisions/         # architectural decisions
  meta/              # about the KB itself
```

## llms.txt

Each article's `summary` field (≤140 chars) feeds the `/llms.txt` endpoint — a machine-readable index of the KB for LLM context injection. The summary must be a single sentence.

## Seeding history

The initial KB content was seeded on 2026-05-26 by synthesizing all `.md` files in the agent memory directory (`~/.claude/projects/-Users-duet-project-monorepo/memory/`). Memory files are point-in-time snapshots; KB articles are the distilled, durable form.

## Who maintains it

duyetbot adds and updates articles as part of its normal workflow. When a significant architectural decision is made or a new pattern is established, it should be captured here — not just in a commit message or memory file. Blog post content and LLM Timeline curated data remain out of scope.
