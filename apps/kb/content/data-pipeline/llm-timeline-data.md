---
title: "LLM Timeline Data Sources"
category: "data-pipeline"
tags: ["llm-timeline", "data", "epoch-ai", "sync"]
links: ["data-sync-overview", "llm-timeline-app", "duyetbot-scope"]
summary: "LLM Timeline sources 785 curated models from Google Sheets and 3156 from Epoch AI; total 3937 unique models covering 1950–2026."
updated: "2026-03-25"
---

# LLM Timeline Data Sources

`apps/llm-timeline` aggregates LLM model data from two sources into a single dataset covering 1950–2026.

## Sources

### Curated (Google Sheets)

785 models manually curated and maintained by Duyet Le. These entries have higher fidelity — paper authors, release dates, and organizational attribution are verified against primary sources.

This data lives in `apps/llm-timeline/lib/data.ts`. It is **out of scope for duyetbot** — research facts and citations belong to the human author.

### Epoch AI

3156 models from the Epoch AI dataset, covering a broader historical range. The Epoch AI data extended the timeline back to 1950 (was 2017–2026 before).

## Sync

```bash
pnpm run sync
```

The last sync: 2026-03-25. Result: 3937 unique models (4 duplicates removed from the union of both sources).

## Deduplication

The `packages/libs` dedup crate handles cross-source deduplication. The WASM benchmark showed dedup runs at 0.01 ms in TypeScript and 0.04 ms in WASM — WASM is slower due to JSON marshaling overhead. The WASM version is kept for consistency.

## Build-time usage

During `pnpm run build`, the LLM Timeline app reads the data from `lib/data.ts` (compiled-in) rather than fetching at runtime. There's no runtime API call for model data — it's baked into the pre-rendered pages.

## Badge classification

Models are classified into badge variants by license, type, and source — done in the normalizer layer (`apps/llm-timeline/lib/normalizers.ts`), which calls the WASM normalizer crate via `initSync`.
