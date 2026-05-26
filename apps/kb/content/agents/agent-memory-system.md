---
title: "Agent Memory System"
category: "agents"
tags: ["memory", "agents", "context", "compaction"]
links: ["autonomous-workflow", "duyetbot-scope", "about-this-kb"]
summary: "Agent memory lives in ~/.claude/projects/.../memory/ as point-in-time .md snapshots; the KB is the synthesized durable form."
updated: "2026-05-26"
---

# Agent Memory System

The Claude Code agent maintains cross-session memory via markdown files in `~/.claude/projects/-Users-duet-project-monorepo/memory/`. These files are point-in-time snapshots — not live state.

## Memory file types

| File | Purpose |
|------|---------|
| `MEMORY.md` | Master index of active context |
| `tanstack-start-migration.md` | SSG migration pattern reference |
| `blog-wasm-prerender.md` | WASM CI dependency warning |
| `wasm-benchmark-results.md` | WASM vs TS benchmark numbers |
| `plan_blog_design_refresh.md` | Blog design decisions |
| `llm-timeline-shadcn-refactor.md` | LLM Timeline PR #1003 details |
| `project_duyetbot_scope.md` | Editorial boundary definition |
| `roadmap-cycle-10.md` | Cycle 10 work tracking |
| `improvement-history.md` | Cycles 1–9 summary |
| `feedback_*.md` | User-stated behavioral rules |

## Memory vs KB

**Memory files** are raw, timestamped observations. They may be stale — "memories are point-in-time observations, not live state — claims about code behavior or file:line citations may be outdated."

**KB articles** (this directory) are synthesized, curated, and maintained as the durable source of truth. When memory and KB conflict, verify against the current codebase.

## Feedback files

`feedback_*.md` files capture specific behavioral rules stated by the user during sessions:

- `feedback_design_no_box_shadow.md` — flat hairline borders only
- `feedback_deploy_in_background.md` — never block on cf:deploy
- `feedback_icons_lucide.md` — standardize on lucide-react
- `feedback_compact_when_needed.md` — auto-compact when context grows

These rules are incorporated into KB articles in the `design-system` and `workflows` categories.

## Context compaction

The user explicitly welcomes auto-compaction during long sessions. Before compaction, save anything future turns will need into memory files or commit bodies. The goal hook re-surfaces task context on every stop — don't repeat it verbatim.

## Durable storage hierarchy

1. Commit messages — most durable, tied to code changes
2. KB articles (`apps/kb/content/`) — synthesized knowledge
3. `docs/ai/core-memory.md` — raw durable findings
4. Memory files — session context, may be stale
5. Conversation transcript — compacted, not durable
