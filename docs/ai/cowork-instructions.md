# Cowork Instructions

Guidance for working on this repository in Claude Cowork (the desktop agent), as opposed to a terminal Claude Code session. The rules in `CLAUDE.md` and [`internal-knowledge.md`](internal-knowledge.md) still apply; this file covers what is different when a folder is mounted and you have file tools, a sandboxed shell, and connectors instead of a developer's terminal.

## What this project is

A pnpm + Turborepo monorepo for `duyet.net` and its subdomains (home, blog, cv, insights, photos, homelab, llm-timeline, kb, burns, agent-ui, agent-api, agent-assistant, api, ai-percentage), plus shared `packages/*` and Rust/WASM `crates/*`. Most apps deploy to Cloudflare Pages; a few (`api`, `agent-api`) are Cloudflare Workers. See [`internal-knowledge.md`](internal-knowledge.md) for the full app and command map and [`../INDEX.md`](../INDEX.md) for the doc index.

## Orientation, every session

1. Read `CLAUDE.md`, then [`internal-knowledge.md`](internal-knowledge.md), before any non-trivial change. They are the source of truth for commands, scopes, and deploy behavior.
2. The mounted folder is the real working repo on the user's computer. Edits here are real; treat them with the same care as a terminal session.
3. Prefer the file tools (Read/Write/Edit) for editing. Use the shell for builds, tests, `git`, `rg`, and `pnpm` scripts.
4. Verify with the narrowest useful command first (`pnpm exec biome lint <path>`), then broaden (`pnpm run lint`, `pnpm run check-types`, `pnpm run test`) only when the change warrants it.

## Working rules (carry over from CLAUDE.md)

- Keep changes surgical. Do not reformat or refactor unrelated code. Preserve existing UX, public routes, auth, and data loading unless the request explicitly changes them.
- Use semantic commit messages with a scope from `.commitlintrc.js` (`deps`, `post`, `blog`, `cv`, `home`, `insights`, `photos`, `travel`, `auth`, `ci`, `ui`, `rust`, `docs`, `lib`, `agents`, `llm-timeline`). A scope is required; use none only when nothing fits.
- For dead-code cleanup, prove zero non-test references first: `rg -n "<symbol>" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*'`.
- Put durable repository knowledge in `internal-knowledge.md`, not in `CLAUDE.md`. Record code-smell / maintenance outcomes in [`core-memory.md`](core-memory.md). Do not create dated review files.
- Run scripts from the relevant app or package directory, and check that app's `package.json` before assuming a script exists.

## Use a task list and ask first

- Treat blog/doc/content edits and any multi-step refactor as real work: confirm scope (which app, what voice, where it ships) before starting when the request is open-ended.
- When writing posts or notes, follow [`writing-style.md`](writing-style.md) and put drafts in the correct source location (`apps/blog/_posts/<YYYY>/<MM>/<slug>.md` or `apps/blog/_shortforms/<title>.md`), not in scratch, unless the user only wants a preview.

## Deliverables and sharing

- Final outputs that belong in the repo go to their real path under the mounted folder (e.g. `apps/blog/_posts/...`, `docs/...`). Use the scratch/outputs area only for throwaway previews.
- After creating or changing a file the user should see, present it so they can open it directly.

## Connectors and external work

- This repo deploys to Cloudflare and reads from MotherDuck/ClickHouse/PostHog/GitHub/WakaTime. Prefer a dedicated connector (Cloudflare, GitHub, Slack, etc.) over browser automation when one is available.
- Never execute deploys, money movements, or destructive infra actions on the user's behalf without explicit confirmation. `pnpm run deploy`, `cf:deploy:prod`, and database migrations are high-impact — confirm first.

## Don't

- Don't expose internal sandbox paths to the user; refer to files by their repo-relative path or the mounted folder name.
- Don't touch `.env*`, secrets, or `wrangler.toml` tokens. Don't commit generated artifacts (`pkg/`, `dist/`, `out/`) — they are gitignored.
- Don't reformat the whole repo. `lint-staged` + Biome handle formatting on commit.
