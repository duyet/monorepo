# Homepage

The blog index is static HTML that identifies the site as blog.duyet.net / Tôi là Duyệt and lists recent posts.

## Sub-features

- `home-html` writes `apps/blog/dist/client/index.html`.
- `home-identity` includes the blog name or hostname in that file.
- `home-preview` serves `/` from `vite preview` after a production build.

## How to get to it (user POV)

- Open `https://blog.duyet.net/`.
- Open `/` on a Pages preview or local `vite preview`.

## Driving it with verify-blog

Preconditions:

- Production build completed in this run.

- **Index file.** Run `.cursor/skills/verify-blog/bin/verify-blog drive homepage`. `"hasBlogIdentity": true` and `index.html` is copied to `evidenceDir`.
- **Optional preview.** `verify-blog preview-start` then `GET http://127.0.0.1:4173/` returns 200 with the same identity strings.

## Gotchas

- The index is prerendered. Driving `vite dev` does not prove the Pages artifact.
- Do not treat a header-only screenshot as proof that posts rendered; identity strings must be in `index.html`.
