# Post page

A published post is a year/month/slug URL that prerenders the title, date, and article body into static HTML.

## Sub-features

- `post-route` serves `/2026/07/anyrouter/` from prerendered files.
- `post-body` includes article content from the markdown source.
- `post-chrome` includes the shared site header shell in the HTML.

## How to get to it (user POV)

- From the homepage, follow the AnyRouter post link.
- Open `/2026/07/anyrouter/` directly.
- Open an archive or tag listing and follow the same slug.

## Driving it with verify-blog

Preconditions:

- `apps/blog/dist/client` comes from this run's production build.

- **Locate HTML.** Run `.cursor/skills/verify-blog/bin/verify-blog drive post-page`. The JSON `htmlPath` points at `apps/blog/dist/client/2026/07/anyrouter/index.html` (or `anyrouter.html`).
- **Body.** The copied HTML contains the post heading and is larger than an empty shell (`bytes` well above a layout-only page).
- **Optional preview.** `verify-blog preview-start` then open `/2026/07/anyrouter/`. The document title or `h1` matches the post title.

## Gotchas

- TanStack prerender may write either `.../anyrouter/index.html` or `.../anyrouter.html`. The lever checks both.
- A 200 from production is not proof of this commit if the latest Pages deploy failed.
