# apps/news-tab

Chrome Manifest V3 new-tab page for [news.duyet.net](https://news.duyet.net).
It paints today's AI;DR + top stories (small thumbs, compact cream/terracotta
layout) from the public digest. No account. Not a Cloudflare Worker or Pages
app — do not add `wrangler.toml`.

Load this folder **unpacked**. `manifest.json` is the extension root.
Public download (same tree, zipped) is
[`https://news.duyet.net/news-tab.zip`](https://news.duyet.net/news-tab.zip)
with steps at [`https://news.duyet.net/extension`](https://news.duyet.net/extension).
The news Worker build packs that zip; it is not a GitHub Release asset.

```bash
pnpm --filter news-tab lint
pnpm --filter news-tab test
pnpm --filter news-tab build
```

`build` validates the unpacked tree (it does not emit a Worker bundle).
Load unpacked from this folder, not `dist/`.

## Versioning

news-tab is its **own** [release-please](https://github.com/googleapis/release-please)
component (`apps/news-tab` in `.github/release-please-config.json`), not part of
the root `duyet` `v0.1.x` line (GitHub tags like `v0.1.8`).

| Surface | Value |
| --- | --- |
| Series | `0.1.x` (pre-1.0; `feat` → patch, same as the monorepo) |
| Manifest / npm | `manifest.json` `version` and `package.json` `version` stay equal |
| Changelog | [`CHANGELOG.md`](./CHANGELOG.md) |
| Git tag / GitHub Release | `news-tab-v0.1.x` (component prefix; `tag-separator` `-`) |

The standalone extension shipped as `1.0.1`. The monorepo series **resets** to
`0.1.0` as the last recorded version in `.github/.release-please-manifest.json`.
The next `release-please` run on `master` should open a separate news-tab
release PR (likely `0.1.1`, absorbing `feat(news-tab)` from the in-repo import).
Humans merge those PRs; they are never auto-merged.

## Load unpacked

1. Download [`news-tab.zip`](https://news.duyet.net/news-tab.zip) (or use this folder from a git checkout)
2. **Unzip first.** Do not Load unpacked the `.zip` — Chrome will say the manifest is missing. Pick the extracted `news-tab` directory (the one that contains `manifest.json`)
3. Open [`chrome://extensions`](chrome://extensions)
4. Enable **Developer mode**
5. **Load unpacked** and pick that folder
6. Open a new tab

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
