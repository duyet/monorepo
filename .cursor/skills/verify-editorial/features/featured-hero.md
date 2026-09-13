# Featured hero

The blog index shows a two-column featured post under the “Notes, mostly on data & agents” heading: cover image on the left, title and excerpt on the right, “Read the post”.

## Sub-features

- `hero-heading` is the display title on `/`.
- `featured-card` is a grid card with `object-cover` media.
- `featured-cta` includes “Read the post”.

## How to get to it (user POV)

- Open `https://blog.duyet.net/` or local `http://127.0.0.1:3000/`.
- Tailscale Serve blog HTTPS port if using the tailnet.

## Driving it with verify-editorial

Preconditions:

- Blog Vite is answering `BLOG_URL` (default `http://127.0.0.1:3000`).

- **HTML.** `.cursor/skills/verify-editorial/bin/verify-editorial drive featured-hero`. JSON `ok: true`, `status: 200`, `hasHeading` and `hasCta` true.
- **Cover.** Source of `apps/blog/components/home/FeaturedPost.tsx` contains `object-cover`.

## Gotchas

- `components/post/FeaturedPost.tsx` is a different overlay card. The index uses `components/home/FeaturedPost.tsx`.
- Production identity still needs `verify-blog drive homepage` after a Pages build.
