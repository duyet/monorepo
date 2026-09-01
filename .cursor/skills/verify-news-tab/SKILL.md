---
name: verify-news-tab
description: Verify the Chrome new-tab extension (apps/news-tab) against live news.duyet.net homepage AI;DR.
---

# Verify news-tab vs news.duyet.net

Prove the unpacked new-tab UI matches the live homepage AI;DR (layout A), not that tests passed.

## CLI lever

```bash
pnpm --filter news-tab verify
# or
node apps/news-tab/scripts/verify-newtab.mjs --out /tmp/verify-news-tab
```

The script:

1. Fetches `GET https://news.duyet.net/api/public` and `GET /api/feed?days=3`
2. Serves `apps/news-tab` with that digest injected (`window.__NEWS_TAB_DIGEST__`)
3. Headless-Chrome screenshots + dump-dom of new-tab vs `https://news.duyet.net/`
4. Writes `report.json`, `expected.json`, `newtab.png`, `site.png`

Exit 0 only when every Feature Map check is true.

## Feature Map

| Feature | Site (layout A) | New-tab proof |
| --- | --- | --- |
| Header title | Vietnamese “Hôm nay AI có gì mới?” | `#brand` text |
| Search | placeholder “Tìm kiếm...” | `#search[placeholder]` |
| Tab Chrome / + Gửi bài / Aa / EN·VI / profile | header actions, VI selected | `#chrome-tab`, `#submit-label`, `#open-settings`, `#lang-toggle [aria-pressed=true]`, `#profile` |
| Category chips | “Tất cả” selected + counts | `.chip` row, first chip Tất cả |
| Trending | “Xu hướng” + colored bordered pills + counts | `.trend-chip.topic-colored` |
| AI;DR heading + date | `AI;DR` + snapshot date | `h1` + `#tldr-meta` |
| Two-column numbered list | layout A, `list-decimal` | two `.tldr-list`, `data-aidr-layout=a` |
| Topic tag + keyword highlights | uppercase tag + `topic-colored` spans | `.topic-tag` + `.hl.topic-colored` |
| Thumb 40–48px right | `StoryThumb` 2lh | `.thumb` after copy |

Do not invent a parallel cream/terracotta digest. Tokens come from `apps/news/src/styles.css` (`--editorial-*`, `.topic-colored`). Highlight/color ports: `js/highlight.js`, `js/topic-color.js`.

## Proven drive

2026-09-01 — `node apps/news-tab/scripts/verify-newtab.mjs --out /tmp/verify-news-tab`

Verdict: **VERIFIED** (header, Tất cả, trending pills, AI;DR date, layout A, two numbered columns, topic tags, `topic-colored` highlights, thumbs). Screenshots: `newtab.png` vs live `site.png`.

```bash
pnpm --filter news-tab test
pnpm --filter news-tab build
pnpm --filter news-tab verify
```
