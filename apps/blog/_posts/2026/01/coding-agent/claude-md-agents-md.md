---
title: CLAUDE.md, AGENTS.md
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/claude-md-agents-md
parent: /2026/01/coding-agent
description: Keep your coding agent's project instructions consistent across sessions
---

First thing Claude does when starting a session is read your `CLAUDE.md` file. Most people ignore it, but it's actually really important. It keeps things consistent across sessions and saves time - Claude doesn't need to re-investigate your project setup every time.

A few tips:
- **Keep it short** - Claude reads this every session, don't make it a novel
- **Make it specific** - tell it your stack (`use bun, not npm`), your conventions (`use semantic commits`), your preferences
- **Update it constantly** - if you keep correcting Claude on the same thing, that's a signal it should be in CLAUDE.md. Just say `remember this to CLAUDE.md`
- **Subdirectory CLAUDE.md files** - this is useful for monorepos, lazy loaded when Claude is actively working in that part of the codebase (e.g. `apps/home/CLAUDE.md`, `apps/blog/CLAUDE.md`, etc).

[AGENTS.md](https://agents.md) serves a similar purpose. If you use both Claude Code and other coding agents (like Codex, Cursor), create a symlink so they share the same instructions:

```bash
ln -s CLAUDE.md AGENTS.md
```

or put instructions in `AGENTS.md` (an open standard) and reference it from `CLAUDE.md`:

```
@AGENTS.md
```

Claude Code reads `CLAUDE.md`, Codex reads `AGENTS.md` - you only maintain one.

Here's a snippet from my global `~/.claude/CLAUDE.md` that applies to every project:

```markdown
# Git Workflow

- follow semantic commit format with consistent scope
- use simple English-avoid words like "comprehensive", "elaborate", "extensive"

# Shortcuts

- `cm` → commit changes (`/commit:commit`)
- `cp` → commit and push (`/commit:and-push`)
- `ok`, `c`, `continue` → acknowledge and continue
- `p`, `parallel` → assign tasks to multiple agents in parallel

# Notes

- Early stage, no users. No backward compatibility concerns
- Do things RIGHT: clean, organized, modular, scalable, zero technical debt
- Never create compatibility shims or workarounds-always full implementations
- Build for 10,000+ users: sustainable, maintainable, no half-baked hacks
- Never remove, hide, or rename existing features/UI unless explicitly requested
- If something isn't wired yet, keep UX surface intact-stub or annotate instead
- Context window auto-compacts near limit; never stop tasks early
- Save progress to memory before context refresh
- Delegate to sub-agents proactively when context nears limit
- In PLAN mode: break down tasks for parallel agent execution
- Assign simple tasks to junior agents, complex tasks to senior agents
- Use sub-agents whenever possible to maximize parallelism
- Use Context7 for library docs, zread for GitHub repo exploration-verify before implementing
```
