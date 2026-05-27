---
title: "Cloudflare Rocket Loader"
category: "infrastructure"
tags: ["cloudflare", "spa", "ssg", "vite"]
links: ["tanstack-start-ssg-migration", "blog-wasm-prerender-ci", "deploy-workflow"]
summary: "Rocket Loader rewrites type=module scripts, breaking Vite SPA initialization — the only fix is SSG or disabling it in the CF dashboard."
updated: "2026-05-26"
---

# Cloudflare Rocket Loader

Rocket Loader is a Cloudflare optimization that defers JavaScript loading by rewriting `type="module"` script tags. That deferral breaks Vite SPA initialization: the app bundle never bootstraps, and users see a blank page.

## What it does

Cloudflare intercepts the HTML response and rewrites `<script type="module" src="...">` to a deferred non-module script. The Vite SPA entry point never executes, leaving the `<div id="root">` empty.

## The two fixes

**Option 1 — SSG (preferred):** pre-render HTML at build time so the page has real content before any JS executes. Rocket Loader can't break what's already in the HTML. This is the path the monorepo took in March 2026 — every app except `agents` was migrated to TanStack Start with `prerender: { enabled: true }`.

**Option 2 — Disable Rocket Loader:** turn it off in the Cloudflare dashboard per domain. This is still recommended as a belt-and-suspenders measure even after SSG migration, since Rocket Loader may affect other third-party scripts.

## Status in this repo

| App | Fix applied |
|-----|-------------|
| blog | SSG (393 pages) |
| insights | SSG (22 pages) |
| llm-timeline | SSG (3700+ pages) |
| home, cv, photos, homelab, ai-percentage | SSG |
| agents | Still on Vite SPA — Rocket Loader still a risk |

Dashboard disablement across all domains was flagged as a remaining Cycle 10 task but not confirmed done.

## Why agents is special

`apps/agents` uses Cloudflare Pages Functions for D1 database access. The function integration complicates static pre-rendering because route handlers run at the edge, not at build time. Until that's resolved, agents remains a Vite SPA.
