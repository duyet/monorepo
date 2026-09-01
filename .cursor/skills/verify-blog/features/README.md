# Blog verification map

This directory is the maintained source for verifying user-facing behavior of `apps/blog` (`https://blog.duyet.net`). Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Work from the monorepo root with pnpm 10.
- `pnpm.overrides["@clerk/shared"]` is `3.47.8`. Shared v4 breaks the Vite/rolldown production build (`MISSING_EXPORT` of Clerk React contexts).
- `packages/wasm/pkg/markdown/markdown.js` exists (gitignored; build with wasm-pack or `pnpm run wasm:build` as CI does).
- Launch means `pnpm --filter blog build` (Pages output `apps/blog/dist/client`). `vite dev` is not a substitute for a production-build claim.
- Put `.cursor/skills/verify-blog/bin` on `PATH` or invoke the binary by repo-relative path.
- Run `verify-blog doctor` and require `clerkAligned: true`.
- Never drive a preview that this run did not start. Preview is optional; prerendered HTML is the source of truth for copy.

## Driving conventions

- Start every recipe from a fresh production build unless the feature says HTML is already present.
- Treat post paths as literal (`/2026/07/anyrouter/`).
- Run build/HTML actions through `verify-blog`.
- Run optional browser actions against `verify-blog preview-start` (`http://127.0.0.1:4173`).
- Cleanup stops only the preview PID in `/tmp/verify-blog/state.json`. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- Build proof includes the command, exit code, and `build.log` (must not contain `MISSING_EXPORT`).
- Copy proof includes the prerendered HTML file, not only `_posts/*.md`.
- UI proof (optional) includes a screenshot of the article with the heading visible.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-blog` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Production build](./production-build.md) covers the Clerk-safe Vite/rolldown Pages build.
- [AnyRouter pricing copy](./anyrouter-pricing.md) covers Why Go is $2/mo, Polar $2.63 / $4 monthly credits, Free 403, and setup.sh CLI.
- [Post page](./post-page.md) covers a published post URL rendering its title and body.
- [Homepage](./homepage.md) covers the blog index identity in `dist/client/index.html`.
