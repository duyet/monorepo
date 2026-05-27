---
title: "Data Sync Overview"
category: "data-pipeline"
tags: ["data-sync", "ccusage", "wakatime", "pipeline"]
links: ["insights-app", "llm-timeline-app", "blog-app"]
summary: "data-sync ingests external data; CCUsage feeds insights, LLM models sync via bun run sync, blog posts are local markdown files."
updated: "2026-05-26"
---

# Data Sync Overview

The monorepo has a `packages/data-sync` package (13 tests) responsible for pulling external data into the build pipeline. Different apps have different data sources.

## LLM Timeline data sync

```bash
bun run sync
```

Pulls from two sources:
- **Curated:** 785 models from a Google Sheets source (maintained by Duyet)
- **Epoch AI:** 3156 models from the Epoch AI dataset

The last sync ran 2026-03-25, producing 3937 unique models after deduplication (4 duplicates removed). Year range expanded to 1950–2026.

Data lands in `apps/llm-timeline/lib/data.ts`. That file is out of scope for duyetbot — it contains research facts.

## CCUsage (insights)

The insights app shows Claude API usage statistics sourced from CCUsage. Data is synced to a static JSON or API that the insights app reads at build time.

In Cycle 4, `ccusage-utils` was a 674-line file with extensive duplication. It was deduplicated as part of the improvement sweep.

## Blog posts

Blog posts are not synced — they live as local `.md` files in `apps/blog/_posts/`. The `packages/libs` post-loading utilities (`readPublicJson()`, `getPostBySlug()`) process them at build time.

## Wakatime

Wakatime coding activity data is referenced in the monorepo but specific sync details are not captured in current memory. It likely feeds `apps/insights` or `apps/ai-percentage`.

## Test coverage

`packages/data-sync` has 13 tests. The `packages/api` package (8 tests) handles external API calls used by some data sync flows.
