# Cloudflare Workers Cache

Rollout notes for [Cloudflare Workers Cache](https://blog.cloudflare.com/workers-cache/)
(launched 2026-07-06) across this monorepo's Cloudflare apps.

## What it is

A tiered cache that sits **in front of a Worker**, enabled per-Worker in the
wrangler config and controlled with standard HTTP response headers:

```toml
# apps/<worker>/wrangler.toml
[cache]
enabled = true
```

Key safety facts:

- **Opt-in per response.** Only responses with an explicit
  `Cache-Control: public, max-age=...` are stored. No `public` directive → not
  cached. Enabling `[cache]` is therefore safe by default and never degrades a
  dynamic app.
- **Auth auto-bypass.** Requests carrying an `Authorization` header skip the
  cache entirely.
- **On a HIT the Worker does not run.** Static-asset and worker-to-worker
  requests bill at the standard request rate once enabled.
- **Header vocabulary:** `Cache-Control: public, max-age=<fresh>,
  stale-while-revalidate=<stale>` (SWR = serve stale instantly, refresh in the
  background), plus `Cache-Tag` and `Vary`. Purge with `ctx.cache.purge({...})`
  from the owning entrypoint.

## Workers vs Pages — `[cache]` is Workers-only

**Critical distinction.** `[cache]` is a **Workers** wrangler key. It is **not**
a valid key for a Cloudflare **Pages** project (`pages_build_output_dir`) — the
[Pages wrangler config](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#inheritable-keys)
recognizes only `name`, `pages_build_output_dir`, `compatibility_date`,
`compatibility_flags`, `send_metrics`, `limits`, `placement`,
`upload_source_maps`. Adding `[cache]` to a Pages config is meaningless at best
and can be rejected at deploy. Pages caching is the **zone cache + each app's
`public/_headers`** — a deploy purges the Pages cache, so edge content is never
stale after a publish.

Classify with: `grep -q pages_build_output_dir apps/<app>/wrangler.toml`.

| App | Kind | Cache surface |
|-----|------|---------------|
| `api` | **Worker** (`main`, `api.duyet.net`) | `[cache]` enabled |
| `agent-api` | **Worker** (`main`) | `[cache]` enabled |
| `agent-assistant` | **Worker** (`main`, Durable Objects) | `[cache]` enabled |
| `agent-ui` | Pages | `_headers` only (no `[cache]`) |
| `ai-percentage`, `blog`, `burns`, `cv`, `home`, `homelab`, `insights`, `kb`, `llm-timeline`, `photos` | Pages | `_headers` only (no `[cache]`) |

## Workers — `[cache] enabled = true`

Set on the three real Workers (`api`, `agent-api`, `agent-assistant`) as a
documented **safe no-op**: they are dynamic/authed, so their responses set no
`Cache-Control: public` and any `Authorization`-bearing request auto-bypasses.
The flag is left on so a genuinely public GET endpoint can opt in later purely
via response headers.

**Rule:** never add `Cache-Control: public` to authed/per-user/dynamic/mutating
responses. Enabling the `[cache]` flag on a Worker is fine; adding public cache
headers to its data is not.

## Pages — public content via `public/_headers`

The static Pages apps carry their `Cache-Control` in each app's `public/_headers`
(copied into the build output, applied by the Pages edge + zone cache). Most
apps already ship `_headers` that mark hashed `/assets/*` immutable; those were
left untouched (surgical). Two apps had **no `_headers` file** and generate
genuinely-public endpoints, so one was added:

| App | New `public/_headers` | TTLs |
|-----|-----------------------|------|
| `kb` | HTML; `/assets/*`; `/*.md`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml`; `/graph-data.json` | HTML `max-age=300 swr=86400`; assets 1y immutable; text `max-age=3600 swr=604800`; json `max-age=3600 swr=86400` |
| `llm-timeline` | HTML; `/assets/*`; `/data.json`, `/rss.xml`, `/sitemap.xml`, `/llms.txt`; `/favicon.svg` | HTML `max-age=300 swr=86400`; assets 1y immutable; feeds `max-age=3600 swr=86400`; favicon 7d |

TTL rationale:

- **HTML content pages**: `max-age=300, stale-while-revalidate=86400` — short
  freshness, day-long stale window so the edge serves instantly while revalidating.
- **Hashed `/assets/*`**: `max-age=31536000, immutable` — content-hashed filename.
- **Generated public data / feeds / LLM & SEO text** (`llms.txt`, `sitemap.xml`,
  `rss.xml`, `robots.txt`, raw `/*.md`, `data.json`, `graph-data.json`):
  `max-age=3600` with a long SWR — regenerated each build, stable in between.

## How to extend

- New public GET endpoint on a **Pages** app → add a rule to that app's
  `public/_headers` (`Cache-Control: public, max-age=..., stale-while-revalidate=...`).
  Do **not** add `[cache]` to a Pages `wrangler.toml`.
- New public GET endpoint on a **Worker** (`api`, `agent-*`) → set the same
  header on the `Response`; the already-enabled `[cache]` picks it up.
- Never cache anything gated by auth, cookies, or per-user/query state.
