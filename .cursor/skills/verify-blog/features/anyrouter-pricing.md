# AnyRouter pricing copy

The AnyRouter post must show why Go is $2/mo, Polar's $2.63 charge, $4 monthly credits, the Free-plan 403, and the setup.sh CLI — in the published HTML, not only in markdown.

## Sub-features

- `pricing-heading` shows `Why Go is $2/mo`.
- `pricing-charge` mentions Polar charging `$2.63` and `$4 monthly credits`.
- `pricing-free` says `anyrouter/free` on Free returns 403 until Go or a donated key.
- `pricing-not-starter` does not show `Why Starter at $1/mo` or `Why Go at $2/mo`.
- `cli-setup` uses `curl -fsSL https://anyrouter.dev/setup.sh | bash` and `anyr claude --model z-ai/glm-5.2`, not `npx @anyr/cli claude`.

## How to get to it (user POV)

- Open `https://blog.duyet.net/2026/07/anyrouter/`.
- Open the same path on a Pages preview hostname after a green blog build.
- After a local production build, open `/2026/07/anyrouter/` on the preview server.

## Driving it with verify-blog

Preconditions:

- Source file `apps/blog/_posts/2026/07/anyrouter.md` has the Go-is-$2 copy and setup.sh CLI. Do not revert the Clerk `@clerk/shared` 3.47.8 pin to make a build pass.
- Production build has succeeded in this run (`verify-blog build`).

- **Build if needed.** Run `.cursor/skills/verify-blog/bin/verify-blog prove --feature anyrouter-pricing`. Combined JSON `"ok": true`.
- **HTML.** Run `.cursor/skills/verify-blog/bin/verify-blog drive anyrouter-pricing` when `dist/client` already exists. `"mustContain"` is true for `Why Go is $2/mo`, `$4 monthly credits`, `$2.63`, `anyrouter/free`, `https://anyrouter.dev/setup.sh`, and `anyr claude --model z-ai/glm-5.2`. `"mustNotContain"` is true for `Why Starter at $1/mo`, `Why Go at $2/mo`, and `npx @anyr/cli claude`.
- **Artifact.** `evidenceDir/anyrouter.html` is a copy of the prerendered post.
- **Optional preview.** Run `verify-blog preview-start` and open `http://127.0.0.1:4173/2026/07/anyrouter/`. The article heading visible on the page matches `Why Go is $2/mo`. Screenshot the article body, not only the site header.

## Gotchas

- Live `blog.duyet.net` can still show Starter $1 or the older `Why Go at $2/mo` heading while this branch has the new copy, if Pages has not published this commit. Always assert `dist/client` (or a new preview deploy), not the stale production URL.
- Searching `_posts/2026/07/anyrouter.md` alone does not prove the reader-facing page.
- Do not drop the `@clerk/shared` 3.47.8 override. A v4 pin fails the production build before this copy can ship.
