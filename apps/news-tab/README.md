# apps/news-tab

Chrome MV3 new-tab page for [news.duyet.net](https://news.duyet.net). It fetches the public digest and shows today's AI TL;DR (Vietnamese bullets when they look like Vietnamese, otherwise English) plus a few top stories.

This folder is an **unpacked extension scaffold**, not a Cloudflare app. It is not deployed.

## Public API

- **URL:** `https://news.duyet.net/api/public`
- **Auth:** none
- **Local Worker:** `http://localhost:3014/api/public` (`apps/news` `pnpm run dev`)

JSON shape:

```json
{
  "tldr": {
    "date": "2026-08-27",
    "bullets_en": [{ "text": "...", "item_ids": ["..."] }],
    "bullets_vi": [{ "text": "...", "item_ids": ["..."] }]
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

`tldr` may be `null` if there is no snapshot yet. `published_at` is epoch **seconds**. Payload is a few KB (not `/api/feed`).

## Load unpacked

1. Chrome → `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select this folder (`apps/news-tab`).
3. Open a new tab.

The page talks to production by default (`config.js`). CORS on `/api/public` allows `chrome-extension://` origins and `http://localhost` / `http://127.0.0.1`.

## Point at a local API

In `config.js`:

```js
export const NEWS_API_URL = "http://localhost:3014/api/public";
```

Then from the repo root:

```bash
pnpm --filter news dev
```

Reload the extension on `chrome://extensions` after editing `config.js`.
