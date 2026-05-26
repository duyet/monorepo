---
title: "Rust/WASM Migration"
category: "infrastructure"
tags: ["rust", "wasm", "performance", "benchmark"]
links: ["blog-wasm-prerender-ci", "blog-app", "deploy-workflow"]
summary: "7 Rust crates compiled to WASM; markdown 79x faster, others parity or slower due to JS↔WASM marshaling cost."
updated: "2026-05-01"
---

# Rust/WASM Migration

Phase 1 and 2 of the Rust/WASM migration completed 2026-05-01. Seven Rust crates were built as `cdylib` targets and compiled to WASM, replacing TypeScript implementations in `@duyet/libs`.

## Benchmark results

| Module | TS mean | WASM mean | Speedup | Verdict |
|--------|---------|-----------|---------|---------|
| markdown-to-html | 6.3 ms | 0.08 ms | **79x** | Use WASM |
| diff-text | 0.11 ms | 0.11 ms | ~1x | Parity |
| string-utils | 0.14 ms | 0.14 ms | ~1x | Parity |
| exif-parse | 0.001 ms | 0.001 ms | ~1x | Parity |
| csv-parse | 0.08 ms | 0.16 ms | 0.5x | WASM slower |
| normalizers | 0.01 ms | 0.04 ms | 0.23x | WASM slower |
| dedup | 0.01 ms | 0.04 ms | 0.29x | WASM slower |

## Why some modules are slower

For sub-100 µs operations, JS↔WASM string marshaling (30–40 µs per call) exceeds the actual computation time. The boundary cost dominates. Only `markdown-to-html` — which takes ~6 ms in pure TypeScript — has enough computation to justify the marshal cost.

**Rule of thumb:** don't migrate a TypeScript function to WASM unless its TS mean exceeds ~1 ms.

## Completed work units

- WU-01: Rust/WASM toolchain foundation
- WU-02–08: All 7 modules (markdown, csv, normalizers, exif, diff, utils, dedup)
- WU-09: Benchmark harness with real WASM imports (not mocked)

## Remaining work units

- WU-10: CI benchmark workflow (not yet wired)
- WU-19: Remove superseded TS dependencies (unified/remark/rehype, exifreader, diff-match-patch)

## Important notes

- All `pkg/` directories are gitignored — WASM must be built from source in CI
- `scripts/wasm-build.ts` filters crates by `crate-type = ["cdylib"]` — keep this filter
- Normalizers in `apps/llm-timeline/lib/normalizers.ts` already call WASM via `initSync`
- Cloudflare Workers WASM boundary cost may differ from Bun runtime — benchmark separately if Workers usage is added
- Keep slower WASM crates: batch APIs may benefit future use cases

## Integration

WASM artifacts land in `packages/wasm/pkg/`. The `@duyet/libs` package re-exports the bindings. Apps import via `@duyet/libs/markdownToHtml` (and similar) — they don't import WASM directly.
