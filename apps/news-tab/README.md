# apps/news-tab

Chrome Manifest V3 new-tab page for [news.duyet.net](https://news.duyet.net).
It paints today's AI;DR + top stories (small thumbs, compact cream/terracotta
layout) from the public digest. No account. Not a Cloudflare Worker or Pages
app — do not add `wrangler.toml`.

Load this folder **unpacked**. `manifest.json` is the extension root.

```bash
pnpm --filter news-tab lint
pnpm --filter news-tab test
pnpm --filter news-tab build
```

`build` validates the unpacked tree (it does not emit a Worker bundle).
Load unpacked from this folder, not `dist/`.

## Load unpacked

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** and pick `apps/news-tab` (the directory that contains
   `manifest.json`)
4. Open a new tab

To point at a local news Worker (`pnpm --filter news dev` on port 3014), set
**API base URL** in the extension settings to `http://localhost:3014` and
grant the optional host permission when Chrome asks. Production default is
`https://news.duyet.net`.

## Public API

- **URL:** `GET https://news.duyet.net/api/public` (shipped in the news Worker)
- **Auth:** none
- **CORS:** `chrome-extension://`, localhost, `*.duyet.net`
- **Fallback:** `GET /api/feed` if `/api/public` fails, then last-good cache in
  `chrome.storage.local`

See [apps/news/README.md](../news/README.md) for the JSON shape.

## Permissions

- `storage` — settings (`sync`, with `local` fallback) and feed cache
- `host_permissions`: `https://news.duyet.net/*`
- `optional_host_permissions`: `https://*/*` for a custom HTTPS API base;
  `http://localhost/*` and `http://127.0.0.1/*` for a local news Worker
  (`http://localhost:3014`)

No identity, tabs scrape, webRequest, history, or analytics.
