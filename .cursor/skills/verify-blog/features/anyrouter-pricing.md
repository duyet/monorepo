# AnyRouter pricing copy

The AnyRouter post must show the Go plan at $2/mo with $4 credits in the published HTML. Markdown on `master` is not what a reader sees until the production build publishes.

## Sub-features

- `pricing-heading` shows `Why Go at $2/mo`.
- `pricing-credits` mentions `$4 credits`.
- `pricing-not-starter` does not show the retired `Why Starter at $1/mo` heading.

## How to get to it (user POV)

- Open `https://blog.duyet.net/2026/07/anyrouter/`.
- Open the same path on a Pages preview hostname after a green blog build.
- After a local production build, open `/2026/07/anyrouter/` on the preview server.

## Driving it with verify-blog

Preconditions:

- Source file `apps/blog/_posts/2026/07/anyrouter.md` already contains the Go $2 copy (merged in #1427). Do not edit that file to make the check pass.
- Production build has succeeded in this run (`verify-blog build`).

- **Build if needed.** Run `.cursor/skills/verify-blog/bin/verify-blog prove --feature anyrouter-pricing`. Combined JSON `"ok": true`.
- **HTML.** Run `.cursor/skills/verify-blog/bin/verify-blog drive anyrouter-pricing` when `dist/client` already exists. `"mustContain"` is true for `Why Go at $2/mo` and `$4 credits`. `"mustNotContain"` is true for `Why Starter at $1/mo`.
- **Artifact.** `evidenceDir/anyrouter.html` is a copy of the prerendered post.
- **Optional preview.** Run `verify-blog preview-start` and open `http://127.0.0.1:4173/2026/07/anyrouter/`. The article heading visible on the page matches `Why Go at $2/mo`. Screenshot the article body, not only the site header.

## Gotchas

- Live `blog.duyet.net` can still show Starter $1 while `master` has Go $2, if the Pages job failed. Always assert `dist/client` (or a new preview deploy), not the stale production URL.
- Do not "fix" a failed HTML assertion by changing the post. The copy leftover is already merged.
- Searching `_posts/2026/07/anyrouter.md` alone does not prove the reader-facing page.
