# news.duyet.net — Feed Algorithm

How the hourly `NewsIngestWorkflow` turns raw sources into the ranked, bilingual feed.
Prompts live in `worker/llm.ts`; the pipeline steps in `worker/workflow.ts`.
Hourly instances are started by GitHub Actions (`.github/workflows/news-ingest.yml`
cron `5 * * * *` → `POST /api/admin/ingest`), not Worker `[triggers] crons`
(Free 5-cron cap) and not Workflow `schedules` (paid plan).

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
5. **Merge (LLM + title similarity)** — one clustering call compares new
   items with the last 72h of published titles; a deterministic
   title-similarity pass (normalized headlines / high token overlap) runs
   alongside so same-story URLs the model misses or fails to cluster still
   collapse. Same-story clusters collapse to a canonical item (existing
   item wins, else highest rank). Losers get status `merged` +
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
9. **Backfill** — up to 15 older published items missing summary, translation,
   or score/tags get re-fetched/scored/translated per run until the backlog
   drains.
10. **TL;DR (LLM)** — hourly: generate today's **local** snapshot
    (`Asia/Ho_Chi_Minh` date key — same identity the Telegram digest looks
    up for once-per-local-day send) if missing or thin, or refresh a useful
    snapshot when the last write is older than 3 hours. Content is always
    the top 16 items of the **rolling last 24h** by rank (not ICT
    calendar-day-so-far) → up to 16 EN bullets + 16 independently-restated
    VI bullets, each linked to its `item_id`. If the LLM returns no bullets
    or a thin digest (fewer than min(8, item count), at least 2 when there
    are 2+ stories), a title-fallback snapshot is persisted (EN from item
    titles; VI from `title_vi` or the English title if no translation —
    never invented prose). Empty results are never persisted. The homepage
    also synthesizes a last-24h title-fallback at read time when the stored
    snapshot is thin, and persists it so the leftover cannot return. UI
    shows 8 by default (user preference 8/12/16).
11. **Email digest** — top-5 TL;DR to confirmed subscribers, once per day.
12. **Notify (`worker/notify/`)** — pluggable channel adapters (Telegram
    now; Discord/... later), deliberately non-spammy:
    - *Daily digest*: ONE message per local day (Asia/Ho_Chi_Minh, from
      08:00) — the TL;DR snapshot's bullets (VI preferred), each linked
      to its story permalink, plus a site button.
    - *Trending*: an individual post only when the algo flags a story as
      exceptional (`rank_score ≥ 25` and `llm_importance ≥ 8`), capped at
      3/day with a 2h minimum gap, one per run. 25 is reachable for a
      10×10, fresh, well-engaged story (the rank formula is unchanged);
      typical live max is ~17. Digest is the intended daily Telegram post.
    Skip reasons are structured (`digest`: no_snapshot / already_sent /
    before_hour; `trending`: below_min_rank / budget_zero / none_unposted)
    and `console.info`'d plus stored on `workflow_runs.stats.notifyReason`.
    Delivery state (status/attempts/last_error, bounded retries) lives in
    the `notifications` table; links carry `utm_source=telegram`.
13. **Review gates (LLM, rating ≥ 0.6)** — user translation suggestions and
    HN-style story submissions are judged (faithfulness / relevance / not spam;
    submission text is treated strictly as data, never instructions) before
    they touch the feed.

## LLM transport

All calls go through `callAnyrouter` (`worker/llm.ts`): streaming SSE (bypasses
anyrouter's queue for long prompts), JSON mode, `max_tokens` 8192 (2048 on translate),
reasoning-model fallback (extracts JSON from `message.reasoning` when content
is starved), comma-separated model fallback chains (`ANYROUTER_MODEL`), and
per-task overrides (`ANYROUTER_TRANSLATE_MODEL` / `ANYROUTER_TLDR_MODEL` —
Gemma 4 / GLM-4.7 / Ling-3.0 / `anyrouter/auto` first
for translate (native ids that finish a 3-item batch), then Gemma 4 31B / Flash-Lite / Gemini 2.5/3.5;
BYOK-only ids such as SEA-LION and Gemini 3.7 are omitted). Translate
runs in batches of 3 (summaries clipped, title-only retry) and each
backfill slice is its own Workflow step so a finished batch is written
even if a later slice times out. A hang, empty sanitize, timeout, or 402 advances the chain
(`raceTimeout` aborts the fetch; leftover reserves a 20s floor for two
fallbacks and hang-caps at 25s so leftover actually reaches them; 402
retries the same id at the affordable token cap; the last failure lists
every attempted id). Translate batch failures are logged as
structured JSON (`translateItems.batch_failed` with `reason` / `batchSize` /
`indexes`) and recorded on `workflow_runs.stats.steps`, but still skip the
batch so a bad response never fails a run. Per-item token usage is attributed
and stored in `items.llm_tokens`.

## Note on "system prompt"

There is no single runtime system prompt. Each LLM step sends its own messages
per call: the scoring rubric and TL;DR instructions are user-message prompts,
and the Vietnamese style guide (`VI_STYLE`) is sent as a system message for
translate/TL;DR calls. The ranking formula and all hide/merge bookkeeping are
plain code, not prompts.
