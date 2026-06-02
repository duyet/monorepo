---
title: "Test Coverage by App"
category: "workflows"
tags: ["tests", "coverage", "pnpm", "quality"]
links: ["commit-push-deploy", "dead-code-cleanup"]
summary: "Test counts per package; run the workspace suite from the repo root with pnpm."
updated: "2026-05-26"
---

# Test Coverage by App

Tests run via `pnpm run test` at the monorepo root.

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

The pre-commit hook runs `pnpm run test`.

If you want to validate before committing, run `pnpm run test` manually first.

## Adding tests

Tests should encode WHY behavior matters, not just WHAT it does. A test that doesn't fail when business logic changes is wrong.

Priorities by risk:
1. Security-adjacent logic (auth, credential handling)
2. Data transformation (normalizers, slug handling, markdown conversion)
3. Component rendering correctness
4. Edge cases in post loading / slug normalization

## Test growth history

Cycle 9 added 104 new tests, primarily in llm-timeline (42), home (24 added from 0), and homelab (31 added from 0). These came alongside the design system unification pass.
