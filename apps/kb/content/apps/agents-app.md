---
title: "Agents App"
category: "apps"
tags: ["agents", "vite", "d1", "ai"]
links: ["cloudflare-rocket-loader", "duyetbot-scope", "tanstack-start-ssg-migration"]
summary: "apps/agents — Vite SPA blocked from SSG by D1 Pages Functions; refactor underway covering sidebar, artifacts, and streaming."
updated: "2026-05-26"
---

# Agents App

`apps/agents` is the only app still on a Vite SPA — it has not been migrated to TanStack Start SSG. It uses Cloudflare Pages Functions for D1 database access, which complicates static pre-rendering.

## Why not SSG

Cloudflare Pages Functions run at the edge at request time. They can't run at build time, so routes that depend on D1 queries can't be pre-rendered. Migrating agents to TanStack Start would require either:

- Switching D1 access to a Worker with a REST API (so the frontend can fetch at runtime)
- Or accepting that D1-dependent routes won't be pre-rendered and handling the SPA fallback explicitly

This decision was deferred in Cycle 10.

## Refactor status (as of March 2026)

A major refactor is in progress:

- **Sidebar:** PR #1007 (new navigation structure)
- **Artifacts:** CodeMirror editor, ProseMirror rich-text, react-data-grid
- **State management:** reworked
- **ai-elements:** integrated
- **Streaming API:** updated
- **Design tokens:** being applied

The minimal token layer (added 2026-05-25) was applied to the agents shell as part of the full rebuild.

## Rocket Loader risk

Because agents is still a Vite SPA, Cloudflare Rocket Loader can break it. This is an active risk. The mitigation is to disable Rocket Loader in the CF dashboard for the agents domain.

## Test coverage

142 tests — the highest test count of any app in the monorepo.

## Security history

Cycle 3–5 improvement sweeps addressed:
- SSRF credential bypass
- `listAnonymousConversations` privacy leak (removed)
- Rate limiting gaps
