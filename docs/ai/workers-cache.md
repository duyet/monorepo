# Cloudflare Workers Cache

Rollout notes for [Cloudflare Workers Cache](https://blog.cloudflare.com/workers-cache/)
(launched 2026-07-06) across this monorepo's Cloudflare apps.

## What it is

A tiered cache that sits **in front of** a Worker / Pages project. You enable it
per-app in the wrangler config and then control it entirely with standard HTTP
response headers.

```toml
# apps/<name>/wrangler.toml
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

For our static Pages apps, the response headers come from each app's
`public/_headers` file (copied to the build output and read by Pages). A deploy
purges the Pages cache, so edge content is never stale after a publish.

## Where `[cache]` is enabled

`[cache] enabled = true` is set in every app's `wrangler.toml`.

### Public apps — cacheable public content

| App | Kind | What gets `Cache-Control: public` | TTLs |
|-----|------|-----------------------------------|------|
| `blog` | Static SPA (Pages) | Pre-existing `_headers`: HTML `s-maxage=86400`, hashed `/assets/*` immutable, `/media/*`, `/posts-content/*`, `/*.md` | unchanged |
| `home` | Static SPA (Pages) | Pre-existing `_headers`: `/*.html` revalidate, `/assets/*` + `/screenshots/*` immutable | unchanged |
| `cv` | Static (Pages) | `_headers`: hashed `/assets/*` immutable (HTML left as-is) | assets 1y immutable |
| `photos` | Static SPA (Pages) | `_headers`: hashed `/assets/*` immutable | assets 1y immutable |
| `insights` | Static SPA (Pages) | `_headers`: hashed `/assets/*` immutable | assets 1y immutable |
| `ai-percentage` | Static SPA (Pages) | `_headers`: hashed `/assets/*` immutable | assets 1y immutable |
| `homelab` | Static SPA (Pages) | `_headers`: hashed `/assets/*` immutable | assets 1y immutable |
| `burns` | Static (Pages) | `_headers` sets only security headers (no `public` cache) → assets rely on Pages defaults | — |
| `kb` | Static SSG (Pages) | **New `_headers`:** HTML `max-age=300 swr=86400`; `/assets/*` immutable; `/*.md`, `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` `max-age=3600 swr=604800`; `/graph-data.json` `max-age=3600 swr=86400` | see file |
| `llm-timeline` | Static SPA (Pages) | **New `_headers`:** HTML `max-age=300 swr=86400`; `/assets/*` immutable; `/data.json`, `/rss.xml`, `/sitemap.xml`, `/llms.txt` `max-age=3600 swr=86400`; `/favicon.svg` 7d | see file |

TTL rationale:

- **HTML content pages** (`kb`, `llm-timeline`): `max-age=300,
  stale-while-revalidate=86400` — short freshness, day-long stale window so the
  edge serves instantly while revalidating.
- **Hashed `/assets/*`**: `max-age=31536000, immutable` — the filename carries a
  content hash, so it can cache forever.
- **Generated public data / feeds / LLM & SEO text** (`llms.txt`, `sitemap.xml`,
  `rss.xml`, `robots.txt`, raw `/*.md`, `data.json`, `graph-data.json`):
  `max-age=3600` with a long SWR — regenerated each build, stable in between.

### Dynamic apps — flag enabled, no public cache headers

`[cache] enabled = true` is also set on the dynamic Workers as a documented
**safe no-op**: their responses set no `Cache-Control: public` and any
`Authorization`-bearing request auto-bypasses, so nothing user-specific is ever
cached. Only static SPA shell assets (hashed/immutable) are cacheable.

| App | Why left header-untouched |
|-----|---------------------------|
| `api` | Dynamic Hono API (`api.duyet.net`). Left enabled so a genuinely public GET endpoint can opt in later purely via response headers. |
| `agent-api` | Authed chat API (Clerk bearer / `AGENT_API_TOKEN`). |
| `agent-ui` | Signed-in chat surface (Clerk). |
| `agent-assistant` | SSR agent + Durable-Object `/api/*`; per-thread state. |

**Rule:** never add `Cache-Control: public` to authed/per-user/dynamic/mutating
responses. Enabling the `[cache]` flag on those apps is fine; adding public
cache headers to their data is not.

## How to extend

- New public GET endpoint on a static app → add a rule to that app's
  `public/_headers` with `Cache-Control: public, max-age=..., stale-while-revalidate=...`.
- New public GET endpoint on a Worker (`api`) → set the same header on the
  `Response`; the already-enabled `[cache]` will pick it up.
- Never cache anything gated by auth, cookies, or per-user/query state.
