---
title: "Test Coverage by App"
category: "workflows"
tags: ["tests", "coverage", "bun", "quality"]
links: ["commit-push-deploy", "dead-code-cleanup"]
summary: "Test counts per package; agents leads at 142, libs at 117; total ~14 packages run in ~100ms cached via bun run test."
updated: "2026-05-26"
---

# Test Coverage by App

Tests run via `bun run test` at the monorepo root, covering all 14 packages. Cached runs take ~100 ms.

## Current test counts

| Package | Tests |
|---------|-------|
| agents | 142 |
| libs | 117 |
| insights | 60 |
| blog | 50 |
| ai | 45 |
| llm-timeline | 42 |
| photos | 40 |
| homelab | 31 |
| urls | 29 |
| home | 24 |
| components | 24 |
| config | 15 |
| data-sync | 13 |
| api | 8 |
| cv | 3 |

## Pre-commit behavior

The pre-commit hook runs `bun run test`. An uncached run can cause a pipe buffer overflow that returns exit code 1 despite all tests passing.

**Mitigation:** run `bun run test` manually before committing to warm the Bun cache. Then commit. The hook's cached run will complete cleanly.

## Adding tests

Tests should encode WHY behavior matters, not just WHAT it does. A test that doesn't fail when business logic changes is wrong.

Priorities by risk:
1. Security-adjacent logic (auth, credential handling)
2. Data transformation (normalizers, slug handling, markdown conversion)
3. Component rendering correctness
4. Edge cases in post loading / slug normalization

## Test growth history

Cycle 9 added 104 new tests, primarily in llm-timeline (42), home (24 added from 0), and homelab (31 added from 0). These came alongside the design system unification pass.
