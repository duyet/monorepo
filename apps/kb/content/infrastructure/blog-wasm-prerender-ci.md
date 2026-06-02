---
title: "Blog WASM Prerender CI Dependency"
category: "infrastructure"
tags: ["wasm", "ci", "blog", "cloudflare"]
links: ["rust-wasm-migration", "tanstack-start-ssg-migration", "cloudflare-rocket-loader", "deploy-workflow"]
summary: "WASM must be built before the blog step in CI — missing binary causes silent prerender failures; CF Pages serves homepage at every post URL."
updated: "2026-05-15"
---

# Blog WASM Prerender CI Dependency

The blog's markdown rendering pipeline uses a Rust-backed WASM crate (`packages/wasm/`). WASM artifacts are gitignored, so CI must build them before running `pnpm run build` for the blog — or the prerender step silently skips most post routes.

## The failure mode

TanStack Start's prerender runs with `failOnError: false`. When `markdownToHtml` throws (because the WASM binary isn't present), the prerender swallows the error and skips that route. No `index.html` gets written for the post. Cloudflare Pages then serves the SPA fallback — the homepage HTML — at every missing path.

The symptom looks like a routing bug (every post URL shows the homepage), not a build error. The deploy log reports green.

In the incident that surfaced this (before the fix), only 106 out of 720 pages were successfully prerendered.

## Why this happens

`packages/wasm/pkg/` is excluded by the root `.gitignore` at line 57 (`**/pkg/`). The Rust/WASM migration in May 2026 introduced the dependency but the CI workflow (`/.github/workflows/cf-deploy.yml`) had no Rust toolchain step.

## The fix in CI

The deploy job for `matrix.app == 'blog'` now runs three extra steps before `pnpm run build`:

1. `dtolnay/rust-toolchain@stable` — install Rust
2. `jetli/wasm-pack-action` — install wasm-pack
3. `pnpm run wasm:build:release` — compile all cdylib crates to `pkg/`

If a future app starts importing `@duyet/libs/markdownToHtml` at build time, extend the `matrix.app == 'blog'` guard to include it.

## Crate filtering

`scripts/wasm-build.ts` already inspects each crate's `Cargo.toml` and skips crates that are not `crate-type = ["cdylib"]`. Binary-only crates in `crates/` are automatically excluded — keep that filter in place.

## Diagnosing prerender failures

If a future deploy produces homepage-on-404 symptoms:
1. Check the build log for "Failed to convert" or `markdownToHtml` errors
2. Count `index.html` files in `dist/client/` — a healthy blog build produces 700+ files
3. Verify that `packages/wasm/pkg/*.wasm` exists before the blog build step runs
