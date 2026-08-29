# news.duyet.net — Feed Algorithm

How the hourly `NewsIngestWorkflow` turns raw sources into the ranked, bilingual feed.
Prompts live in `worker/llm.ts`; the pipeline steps in `worker/workflow.ts`.
Hourly instances are started by the `NewsIngestScheduler` Durable Object
alarm (not a Worker `[triggers]` cron — Free 5-cron cap — and not Workflow
`schedules`, which are paid-plan). GitHub Actions (`.github/workflows/news-ingest.yml`,
four independent crons at :05/:20/:35/:50) POSTs `/api/admin/ingest` as a
watchdog because GitHub routinely delays or skips scheduled workflows.
Both paths coalesce: a new instance is skipped if one started in the last
45 minutes. `POST /api/admin/ingest?force=1` (workflow_dispatch) bypasses
the window. LLM-heavy Workflow steps use `retries: 0` and a 4-minute
timeout; a failed score/TL;DR call must not abort close-run. HTTP
`POST /api/admin/ingest` picks the instance uuid, **upserts `workflow_runs`
with `.run()` / `batch()` (D1 writes do not populate `.first()` / `.results`)
then lastRun-verifies** on the Worker D1 binding (`first-primary` session,
`ORDER BY started_at DESC, id DESC LIMIT 1` — same query `/api/system`
uses). A 2xx POST cannot happen unless that SELECT returns the POST id.
Then `NEWS_INGEST.create({ id })` from that isolate. The Durable Object
only gates the 45-minute coalesce and records last-started. #1413's
INSERT…RETURNING `.first()` 500'd the live force POST; #1411's WHERE-id
SELECT was 2xx for `5419a68e-…` while lastRun stayed `42d830a9-…`.
`run()` still upserts at start
**before** `pruneLlmCalls` / fetch / LLM. Do not wrap `open-run` in
`safeStep`. Score and
TL;DR hang-cap per model at 70s/90s (translate stays 25s). Do not treat
GitHub Actions SUCCESS as a finished ingest — poll `GET /api/system`
(no-store) until `lastRun.id` matches the POST `id` (or at least is no
longer the previous id) and `runsToday > 0`. Do not invent a
`:05/:20/:35/:50` schedule fire.

## Pipeline (per hourly run)

1. **Fetch** — each enabled source row (`sources` table) maps to an adapter
   (`worker/sources/registry.ts`): HN via Algolia (AI-keyword pre-filter),
   HuggingNews via its `__data.json` (+ per-story detail for body/sources).
2. **Dedupe** — item id = `sha256(url)`; ids already in `items` are dropped.
3. **Enrich** — missing summary/thumbnail filled from the article page
   (`og:description` / `og:image`), capped and failure-proof (`worker/enrich.ts`).
   4. **Score (LLM)** — batches of 5, fixed rubric → per item:
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
9. **Backfill** — up to 15 older published items missing summary or
   score/tags, and up to 45 missing Vietnamese titles, get
   re-fetched/scored/translated per run until the backlog drains.
   Translate already skips LLM when the source title is Vietnamese, retries
   leftover items one-at-a-time after a batch fail, and the VI UI hides
   the EN badge when the painted title is Vietnamese or `title_vi` exists.
10. **TL;DR (LLM)** — hourly: generate today's **local** snapshot
    (`Asia/Ho_Chi_Minh` date key — same identity the Telegram digest looks
    up for once-per-local-day send) if missing, thin, EN-only (`bullets_vi`
    empty), or **English-only `bullets_vi` while `title_vi` now exists**;
    otherwise refresh a useful bilingual snapshot when the last write is
    older than 3 hours. Content is always the top 16 items of the
    **rolling last 24h** by rank (not ICT calendar-day-so-far) → up to 16
    EN bullets + 16 independently-restated VI bullets, each linked to its
    `item_id`. Each bullet is a short digest (~2 sentences / 180–240
    characters), not a headline and not a paragraph; the homepage clamps
    overflow to 2 lines and sizes the thumbnail to that row. If the LLM returns no bullets or a thin digest (fewer than
    min(8, item count), at least 2 when there are 2+ stories), a
    title-fallback snapshot is persisted (EN from item titles; VI from
    `title_vi` or the English title if no translation — never invented
    prose). If the LLM digest is useful in count but `bullets_vi` has no
    Vietnamese diacritics and `title_vi` exists, keep the EN bullets and
    replace VI with the `title_vi` fallback — never persist raw English
    titles as `bullets_vi` once translations exist. Empty results are
    never persisted. The homepage also synthesizes a last-24h
    title-fallback at read time when the stored snapshot is thin *or*
    English-only in VI while `title_vi` exists, and persists it so the
    frozen EN copy cannot return. UI shows 8 by default (user preference
    8/12/16).
11. **Email digest** — top-5 TL;DR to confirmed subscribers, once per day.
12. **Notify (`worker/notify/`)** — pluggable channel adapters (Telegram
    plus optional JSON/Slack webhook via `NOTIFY_WEBHOOK_URL`),
    deliberately non-spammy. A normalized `AlertEvent` (severity, source,
    title, summary, metrics, links, optional health snapshot) is the
    internal shape; adapters in `worker/notify/adapters.ts` render
    Telegram HTML, Slack incoming-webhook JSON, or raw JSON.
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
`anyrouter/auto` first for score/TL;DR (AnyRouter's health-aware router
over top stable platform models), then Gemma 4 / GLM-4.7 / Ling-3.0;
translate leads with Gemma 4 / GLM-4.7 / Ling-3.0 / `anyrouter/auto`
(native ids that finish a 3-item batch), then Gemma 4 31B;
BYOK-only ids such as SEA-LION and Gemini 3.6/3.7 are omitted, and
stealth/ox-alpha was removed after AnyRouter delisted it). Translate
runs in batches of 3 (summaries clipped, title-only retry) and each
backfill slice is its own Workflow step so a finished batch is written
even if a later slice times out. Score batches of 5 with a 70s hang-cap;
TL;DR uses a 90s hang-cap so bilingual JSON can finish (a 25s cap made
every score/TL;DR model log 0 tokens). A hang, empty sanitize, timeout, or 402 advances the chain
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
