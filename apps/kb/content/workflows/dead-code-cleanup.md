---
title: "Dead Code Cleanup Workflow"
category: "workflows"
tags: ["dead-code", "rg", "biome", "refactor"]
links: ["commit-push-deploy", "test-coverage"]
summary: "Before removing a symbol, verify zero non-test references with rg; use git log --since to scope reviews to recent changes."
updated: "2026-05-26"
---

# Dead Code Cleanup Workflow

Removing dead code safely requires verifying that no live references exist before deletion. These are the standard commands.

## Verify zero references

```bash
rg -n "<symbol>" apps packages \
  --glob '!**/*.test.*' \
  --glob '!**/*.spec.*'
```

If the output is empty, the symbol has no non-test references and is safe to remove.

## Scoped review after a time window

To review changes since a specific timestamp:

```bash
# List commits since a date
git log --since='2026-05-15 21:01:30 +0000' \
  --no-merges --name-only \
  --pretty=format:'%H%n%s%n%b'

# List touched files only
git log --since='2026-05-15 21:01:30 +0000' \
  --no-merges --name-only --pretty=format: \
  | sed '/^$/d' | sort -u
```

Pass an explicit UTC offset when the timestamp is in UTC (`...Z`) to avoid local-time drift.

## Inspect a specific commit

```bash
git show --unified=3 <commit_sha>
```

## Verify dependency overrides

```bash
bun pm why <package>
```

## Common scoped searches

```bash
# Catch duplicate branches in parser-style switch/if chains
rg -n "if (field ===" packages/libs --glob '*.ts'

# Verify action pins in CI workflows
rg -n "setup-bun@" .github/workflows -g'*.yml'
rg -n "dtolnay/rust-toolchain@|jetli/wasm-pack-action@" .github/workflows -g'*.yml'
```

## Notable dead code removed in improvement cycles

| Cycle | Item |
|-------|------|
| 4 | `getLicenseColor()`, `getTypeColor()`, `getSourceColor()` (llm-timeline) |
| 4 | `getLicenseAccent()` (llm-timeline, left-border accent) |
| 4 | Lucide wildcard import → ~200 KB reduction (blog) |
| 5 | `listAnonymousConversations` (agents, privacy) |
| 9 | Custom `line-clamp` CSS (built into Tailwind v4) |

## Where to record findings

Keep durable findings in `docs/ai/core-memory.md`. Do NOT create dated review files like `docs/reviews/code-smell-<DATE>.md`.
