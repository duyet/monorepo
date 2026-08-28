# apps/news

Feed pipeline and ranking design: see [ALGORITHM.md](./ALGORITHM.md).

## Public read API

Unauthenticated digest for third-party clients (Chrome extension first).
The in-repo unpacked extension lives at [`apps/news-tab`](../news-tab)
(load that folder in `chrome://extensions`). `GET /api/feed` is the full
homepage payload (~360KB) and does not send CORS for `chrome-extension://`
origins. Use this instead:

- **URL:** `https://news.duyet.net/api/public`
- **Auth:** none. Failures return `{ "error": "unavailable" }` (no D1/admin detail).
- **CORS:** Worker fetch intercepts OPTIONS/GET before TanStack Start (SPA
  fallback would otherwise serve HTML). Allows `chrome-extension://…`,
  `http://localhost` / `http://127.0.0.1`, and `https://*.duyet.net`.
- **Cache:** `public, max-age=120, s-maxage=300, stale-while-revalidate=600`.
  Not rate-limited (same as `GET /api/feed`).

```json
{
  "tldr": {
    "date": "2026-08-27",
    "bullets_en": [{ "text": "...", "item_ids": ["..."], "image_url": "https://..." }],
    "bullets_vi": [{ "text": "...", "item_ids": ["..."], "image_url": "https://..." }]
  },
  "stories": [
    {
      "id": "...",
      "url": "https://...",
      "title": "...",
      "title_vi": "...",
      "category": "Industry",
      "image_url": "https://...",
      "published_at": 1787793175
    }
  ],
  "updatedAt": 1756300000000
}
```

Up to 16 bullets per language and 8 top stories by `rank_score`. Typical
payload is well under 50KB. `image_url` on a bullet is additive and only
present when the linked story has an og/thumbnail. `published_at` is epoch
**seconds**; `updatedAt` is epoch milliseconds.

Hourly ingest is triggered by the `NewsIngestScheduler` Durable Object
alarm (not a Worker cron) plus GitHub Actions
(`.github/workflows/news-ingest.yml`, crons at :05/:20/:35/:50) via
`POST /api/admin/ingest`. Do not add Worker `[triggers] crons` or
Workflow `schedules` — both break Free-plan deploys. GitHub POSTs
coalesce if a run started in the last 45 minutes. Manual
`workflow_dispatch` sends `?force=1` so a hung coalesce window cannot
skip. Actions SUCCESS is only the POST; poll `GET /api/system` (no admin
token, `Cache-Control: no-store`) until `lastRun.id` is no longer the
previous id and `runsToday > 0`. The POST JSON `id` is chosen before
`NEWS_INGEST.create({ id })` and is written (then SELECT-verified) to
`workflow_runs` before the POST returns — not after ingest finishes.
Do not invent a scheduled `:05/:20/:35/:50` fire.

## Admin API / MCP

Push news items and manage sources remotely via a token-authenticated REST
API or a hand-rolled MCP server exposing the same operations as tools.

Set the `NEWS_ADMIN_TOKEN` Worker secret first:

```bash
wrangler secret put NEWS_ADMIN_TOKEN
```

### REST API

All routes live under `/api/admin/*` and require
`Authorization: Bearer <token>`.

Push an item:

```bash
curl -X POST https://news.duyet.net/api/admin/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/post","title":"New AI model released"}'
```

Trigger an ingest run:

```bash
curl -X POST https://news.duyet.net/api/admin/ingest \
  -H "Authorization: Bearer <token>"
```

Other routes: `GET /api/admin/sources`, `PUT /api/admin/sources/:id`,
`DELETE /api/admin/sources/:id`, `GET /api/admin/status`.

Item fields: `url`, `title` (required), `summary`, `source_id` (defaults to
`push`), `published_at` (**epoch milliseconds**, defaults to now),
`points`, `comments`, `category`, `tags`, `title_vi`, `summary_vi`,
`relevance`/`importance`/`quality` (supplying any of these marks the item
`published` immediately instead of `new`).

### MCP server

`POST /api/mcp` speaks JSON-RPC 2.0 and exposes `push_items`,
`list_sources`, `upsert_source`, `delete_source`, `trigger_ingest`, and
`get_status` as tools. Every request is authenticated with the same bearer
token (no session state).

MCP client config:

```json
{
  "url": "https://news.duyet.net/api/mcp",
  "headers": { "Authorization": "Bearer <token>" }
}
```

Call a tool directly:

```bash
curl -X POST https://news.duyet.net/api/mcp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "push_items",
      "arguments": {
        "items": { "url": "https://example.com/post", "title": "New AI model released" }
      }
    }
  }'
```

A bilingual human-readable version of this section is also published at
`/mcp`.

## Email digest

Visitors can subscribe to a daily TL;DR email (top 5 stories, EN or VI) at
`/subscribe`. `POST /api/subscribe` with `{"email", "lang"}` adds a
subscriber (table `subscribers`, migration `0004_subscribers.sql`);
`DELETE /api/subscribe?token=<unsubscribe_token>` removes one. The hourly
`NewsIngestWorkflow` sends the digest once per UTC day, right after the
`tldr` step, via the `email-digest` step in `worker/workflow.ts`
(`worker/subscribe/send.ts`). Sending is gated on that day's
`tldr_snapshots` row having bullets and not already being marked
`sent_at`.

Email delivery uses the Cloudflare Email Sending Workers binding
(`[[send_email]] name = "EMAIL"` in `wrangler.toml`, sender
`news@duyet.net`). **This requires the `duyet.net` domain to be onboarded
onto Cloudflare Email Sending** (`wrangler email sending enable
duyet.net`, or via the Cloudflare dashboard) before digests can actually
be delivered — `sendDailyTldr` no-ops (logs and skips) if `env.EMAIL` is
missing, so the ingest workflow is never broken by this being
unconfigured.

## Newsletter composer

The same `subscribers` D1 table is the mailing list. Blog and home capture
via `SubscribeCapture` (`packages/components/subscribe/`) posting CORS
`POST /api/subscribe` with `{email, lang, timezone, source}`. `source` is
`blog` | `news` | `home` (table `subscriber_sources`, migration
`0015_mail.sql`). IP rate limit: 8/day (`subscribe_attempts`). CORS is
applied in `src/server.ts` (`handleSubscribeCors`) before TanStack Start:
Pages `not_found_handling = "single-page-application"` otherwise serves
`index.html` for `OPTIONS`, which browsers treat as a CORS failure.

Custom sends (not the daily digest) are composed at **`/mail`** (Clerk
admin, same gate as `/system`). Pick a template (Note / New post /
Digest), pick blog RSS + news stories, optionally paste notes, then **AI
wrap** fills subject/preheader/body markdown. Preview is a Cursor-like
HTML email (520px, Inter, near-black on white, 8px CTA). Send from
`notes@duyet.net`. One-click `List-Unsubscribe` is set on digest and
campaign mail.

Apply the migration when deploying:

```bash
pnpm exec wrangler d1 migrations apply news --config apps/news/wrangler.toml --remote
```

`ensureMailSchema` also creates the 0015 tables on first mail/subscribe
use, so the composer works before that command if D1 create-table is
allowed.
