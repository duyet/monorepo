# Internal Knowledge

This repository is the Bun/Turborepo monorepo for duyet.net public apps, shared packages, data sync jobs, and Cloudflare/Vercel deployment workflows.

## Working Rules

- Read `CLAUDE.md` and this file before making non-trivial changes.
- Use semantic commit messages. Prefer a scope from `.commitlintrc.js` when one exists.
- Keep changes surgical. Do not reformat or refactor unrelated code.
- Preserve existing UX and public routes unless the request explicitly changes them.
- Use Bun commands from the relevant package or app directory. Check the local `package.json` before assuming a script exists.
- Verify with the narrowest useful command first, then broaden only when needed.

## Root Commands

- `bun run build` builds all apps and packages through Turbo.
- `bun run dev` starts workspace development servers through Turbo.
- `bun run lint` runs Biome linting.
- `bun run fmt` formats TypeScript, TSX, and Markdown through Biome.
- `bun run test` runs Turbo tests.
- `bun run config` runs workspace config tasks, including app secret syncs where defined.
- `bun run deploy` builds deployable apps, then runs workspace config.
- `bun run cf:deploy` deploys changed Cloudflare Pages apps.
- `bun run cf:deploy:prod` runs production Cloudflare deploy tasks through Turbo.

## Apps

- `apps/home`: homepage for `https://duyet.net`, deployed to Cloudflare Pages.
- `apps/blog`: Vite SPA blog for `https://blog.duyet.net`, Auth0 auth, Vercel KV comments, Markdown posts with KaTeX.
- `apps/cv`: CV host for `https://cv.duyet.net`.
- `apps/insights`: analytics dashboard for `https://insights.duyet.net`, using Cloudflare Analytics, GitHub, PostHog, WakaTime, ClickHouse, and TanStack Start prerendering.
- `apps/photos`: photo gallery for `https://photos.duyet.net`, Unsplash and Cloudinary-related workflows.
- `apps/homelab`: homelab docs and resources for `https://homelab.duyet.net`.
- `apps/llm-timeline`: LLM release timeline for `https://llm-timeline.duyet.net`, with sync, RSS, sitemap, and llms.txt generation.
- `apps/agents`: AI chat interface for `https://agents.duyet.net`, Cloudflare Pages Functions, Workers AI, and AI Gateway.
- `apps/api`: Hono API on Cloudflare Workers for `https://api.duyet.net`.
- `apps/ai-percentage`: AI-written-code dashboard for `https://ai-percentage.duyet.net`; data comes from `apps/data-sync`.
- `apps/data-sync`: operational CLI for ClickHouse analytics/activity syncs and migrations.

## Shared Packages

- `packages/components`: shared React components.
- `packages/libs`: shared utility functions.
- `packages/interfaces`: shared TypeScript interfaces.
- `packages/config`: shared app, API, and UI config.
- `packages/tailwind-config`: shared Tailwind config.
- `packages/tsconfig`: shared TypeScript config.
- `packages/profile` and `packages/urls`: shared profile and URL metadata.

## Deployment Notes

- Cloudflare Pages production deploys happen on pushes to `master` or `main`; PRs receive preview deploys.
- Deploy workflows run type checks, tests, and lint before deploy jobs.
- App-level `cf:deploy:prod` scripts are authoritative when present.
- `apps/insights` deploys `dist/client` to the `duyet-insights` Pages project.
- `apps/api` uses Wrangler as a Worker, not a Pages app.

## App-Specific Command Notes

- `apps/agents`: `bun run prebuild` builds skills; `bun run dev` uses `node dev.js`; `bun run dev:vite` is Vite-only; `bun run test:e2e` runs browser tests.
- `apps/api`: `bun run dev` uses Wrangler; `bun run deploy` builds then deploys the Worker.
- `apps/cv`: `bun run preview` validates production output locally.
- `apps/data-sync`: use `bun run sync <name>`, `bun run sync:all`, `bun run migrate:*`, and `bun run cleanup:dry-run`.
- `apps/llm-timeline`: use `bun run sync`, `bun run sync:dry`, `bun run rss`, `bun run llms-txt`, and `bun run sitemap` for content generation.
- `apps/ai-percentage`: refresh data through `apps/data-sync` with `bun run sync ai-code-percentage`.

## Commit Scopes

Commitlint scopes include `deps`, `post`, `blog`, `cv`, `home`, `insights`, `photos`, `travel`, `auth`, `ci`, `ui`, `rust`, `docs`, `lib`, `agents`, and `llm-timeline`.

Use no scope only when no listed scope fits.

## Documentation Direction

This file is the root internal knowledge base for AI agents. Keep `AGENTS.md` and root `CLAUDE.md` as short entrypoints. Move durable duplicated workflow details here as docs are rewritten.
