---
title: "Improvement Rotation Cycles"
category: "workflows"
tags: ["refactor", "quality", "cycles", "history"]
links: ["test-coverage", "dead-code-cleanup", "duyetbot-scope"]
summary: "Nine improvement cycles completed as of March 2026 — ~155 total fixes across security, dead code, design, and test coverage."
updated: "2026-03-16"
---

# Improvement Rotation Cycles

The monorepo runs periodic improvement cycles — focused sweeps targeting one category of technical debt. Nine cycles completed as of 2026-03-16 (~155 total fixes). Cycle 10 roadmap tracks ongoing work.

## Cycle summary

| Cycle | Focus | Notable items |
|-------|-------|---------------|
| 1–2 | Initial sweeps | bug fixes across agents, blog, insights, home, photos, llm-timeline |
| 3 | Security + a11y | SSRF credential bypass, SQL fixes, accessibility, timer leaks, dead code |
| 4 | Dedup + shadcn | ccusage-utils 674-line dedup, shadcn migration start, Lucide tree-shake (~200 KB reduction) |
| 5 | Privacy + cache | `context.waitUntil` fixes, privacy risks removed, cache bugs |
| 6 | Data sync | credential sanitize in data-sync, dead code cleanup |
| 7 | Database | SQL schema fixes, rate limiting gaps |
| 8 | Health check | 2 fixes, codebase declared clean |
| 9 | Design + tests | llm-timeline full redesign, cv refresh, turbo 2.8.17, 104 new tests |

## Cycle 9 test additions

104 tests added across three apps:
- `llm-timeline`: 42 tests (from ~0)
- `home`: 24 tests (from 0)
- `homelab`: 31 tests (from 0)

These came alongside the design system unification sweep.

## Cycle 10 status (as of 2026-03-31)

Key completions:
- TanStack Start SSG migration (all apps except agents)
- Blog design refresh + dark mode
- LLM Timeline shadcn refactor (PR #1003)
- TypeScript v6 upgrade (PR #1010)
- Biome formatting applied codebase-wide

Remaining:
- Agents app SSG migration
- Design system alignment (insights, photos, homelab palettes)
- Insights design refresh

## How to run a cycle

A cycle typically starts with a scoped sweep:

```bash
# Find all issues in a category
git log --since='<last-cycle-date>' --name-only --pretty=format:
  | sed '/^$/d' | sort -u

# Check each touched file for dead code / issues
rg -n "<symbol>" apps packages --glob '!**/*.test.*'
```

Run tests before and after each fix to confirm no regression. Commit each logical change separately with a semantic message.
