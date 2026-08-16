# news.duyet.net — Feed Algorithm

How the hourly `NewsIngestWorkflow` turns raw sources into the ranked, bilingual feed.
Prompts live in `worker/llm.ts`; the pipeline steps in `worker/workflow.ts`.

## Pipeline (per hourly run)

1. **Fetch** — each enabled source row (`sources` table) maps to an adapter
   (`worker/sources/registry.ts`): HN via Algolia (AI-keyword pre-filter),
   HuggingNews via its `__data.json` (+ per-story detail for body/sources).
2. **Dedupe** — item id = `sha256(url)`; ids already in `items` are dropped.
3. **Enrich** — missing summary/thumbnail filled from the article page
   (`og:description` / `og:image`), capped and failure-proof (`worker/enrich.ts`).
4. **Score (LLM)** — batches of 15, fixed rubric → per item:
   `relevance` 0–1, `importance` 0–10, `quality` 0–10, one `category` from a
   fixed 11-value enum, free-form `tags`.
   **Hide rule:** `relevance < 0.4` → status `rejected` (never shown).
5. **Merge (LLM)** — one clustering call compares new items with the last 72h
   of published titles; same-story clusters collapse to a canonical item
   (existing item wins, else highest rank). Losers get status `merged` +
   `duplicate_of`; their sources and max points/comments fold into the
   canonical (`worker/dedupe.ts`).
6. **Translate (LLM)** — EN→VI in batches, journalist style (`VI_STYLE` system
   prompt: no parenthetical glosses, no calques, keep technical jargon in
   English, few-shot anchored).
7. **Rank (pure code, `worker/ranking.ts`)** — recomputed for items < 72h:

   ```
   rank_score = importance
              × (0.6 + 0.4·quality/10)      # quality modulates ±40%
              × exp(−ageHours/36)           # freshness decay
              × (1 + log10(1 + points + 0.5·comments))  # engagement, log-damped
   ```

8. **Write** — D1 upserts (`worker/d1-bind.ts` guards every bind), best-effort
   ClickHouse mirror (never fails the run).
9. **Backfill** — up to 15 older published items missing summary/translation
   get re-fetched/translated per run until the backlog drains.
10. **TL;DR (LLM)** — once per UTC day (hourly retry on failure): top 16 items
    of the last 24h by rank → 16 EN bullets + 16 independently-restated VI
    bullets, each linked to its `item_id`. Empty results are never persisted.
    UI shows 8 by default (user preference 8/12/16).
11. **Email digest** — top-5 TL;DR to confirmed subscribers, once per day.
12. **Notify (`worker/notify/`)** — pluggable channel adapters (Telegram
    now; Discord/... later), deliberately non-spammy:
    - *Daily digest*: ONE message per local day (Asia/Ho_Chi_Minh, from
      08:00) — the TL;DR snapshot's bullets (VI preferred), each linked
      to its story permalink, plus a site button.
    - *Trending*: an individual post only when the algo flags a story as
      exceptional (`rank_score ≥ 25` and `llm_importance ≥ 8`), capped at
      3/day with a 2h minimum gap, one per run.
    Delivery state (status/attempts/last_error, bounded retries) lives in
    the `notifications` table; links carry `utm_source=telegram`.
13. **Review gates (LLM, rating ≥ 0.6)** — user translation suggestions and
    HN-style story submissions are judged (faithfulness / relevance / not spam;
    submission text is treated strictly as data, never instructions) before
    they touch the feed.

## LLM transport

All calls go through `callAnyrouter` (`worker/llm.ts`): streaming SSE (bypasses
anyrouter's queue for long prompts), JSON mode, `max_tokens` 8192,
reasoning-model fallback (extracts JSON from `message.reasoning` when content
is starved), comma-separated model fallback chains (`ANYROUTER_MODEL`), and
per-task overrides (`ANYROUTER_TRANSLATE_MODEL` — SEA-LION for Vietnamese —
and `ANYROUTER_TLDR_MODEL`). Per-item token usage is attributed and stored in
`items.llm_tokens`. Every LLM step skips-on-failure; a bad response never
fails a run.

## Note on "system prompt"

There is no single runtime system prompt. Each LLM step sends its own messages
per call: the scoring rubric and TL;DR instructions are user-message prompts,
and the Vietnamese style guide (`VI_STYLE`) is sent as a system message for
translate/TL;DR calls. The ranking formula and all hide/merge bookkeeping are
plain code, not prompts.
