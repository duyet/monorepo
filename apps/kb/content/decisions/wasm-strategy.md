---
title: "Decision: WASM Strategy"
category: "decisions"
tags: ["wasm", "rust", "performance", "architecture"]
links: ["rust-wasm-migration", "blog-wasm-prerender-ci", "blog-app"]
summary: "Only operations >1ms benefit from WASM; markdown-to-html (79x) justifies it; slower modules kept for future batch APIs."
updated: "2026-05-01"
---

# Decision: WASM Strategy

**Date:** 2026-05-01  
**Status:** Phase 1–2 complete; remaining work units pending

## What was decided

Seven Rust crates were compiled to WASM and replace TypeScript implementations in `@duyet/libs`. All seven are kept even where WASM is slower than TypeScript.

## Benchmark-driven migration rule

Don't migrate a TypeScript function to WASM unless its TypeScript mean exceeds ~1 ms.

For sub-100 µs operations, JS↔WASM string marshaling costs 30–40 µs per call — exceeding the computation time itself. The WASM boundary is only beneficial when compute dominates marshaling.

Only `markdown-to-html` cleared this bar: 6.3 ms → 0.08 ms (79x speedup). All other modules are at parity or slower.

## Why keep slower WASM modules

- Consistency: all modules are already Rust — removing some would split the maintenance surface
- Future batch APIs: processing N items in a single WASM call amortizes the marshal cost; slower single-call modules may become winners under batch workloads
- Cloudflare Workers: WASM boundary cost in a Worker runtime may differ from Bun; benchmarking there is pending

## Gitignore consequence

`**/pkg/` is gitignored at the root. WASM artifacts must be built from source in CI. The blog's CI job now has the Rust toolchain and `wasm-pack` steps gated on `matrix.app == 'blog'`. If other apps start using `markdownToHtml` at build time, extend the gate.

## Architecture

```
crates/<name>/         # Rust source, crate-type = ["cdylib"]
packages/wasm/pkg/     # compiled WASM + JS bindings (gitignored)
packages/libs/         # re-exports WASM bindings as @duyet/libs
apps/*/                # import from @duyet/libs, not WASM directly
```

`scripts/wasm-build.ts` inspects each crate's `Cargo.toml` and skips non-cdylib targets.

## Remaining concerns

- `unified`/`remark`/`rehype`, `exifreader`, and `diff-match-patch` are superseded but not yet removed (WU-19)
- TanStack Query was added as a dependency (WU-14) but SWR hasn't been removed from agents and ai-percentage yet
