---
name: verify-blog
description: Drive and prove blog.duyet.net locally — Vite/TanStack production build, prerendered HTML, and preview. Use when verifying apps/blog Pages deploys, post copy, or Clerk-related production-build failures.
---

# Verify blog (apps/blog)

Agent-facing skill for the static Vite + TanStack Start blog at `apps/blog` (live: `https://blog.duyet.net`). Public pages are prerendered HTML. The production Pages command is `pnpm --filter blog build` (output `apps/blog/dist/client`). Do not treat `tsc` or unit tests as proof that Pages can publish.

Harness binary (the lever): `.cursor/skills/verify-blog/bin/verify-blog`. Always invoke it by that path from the repo root. It prints JSON. Evidence survives cleanup under `$VERIFY_BLOG_EVIDENCE` (default `/tmp/verify-blog/<run-id>/`).

Feature map: [`features/README.md`](features/README.md). Drive the mapped feature you are claiming, not a convenient substitute.

## Launch

From the monorepo root, with pnpm 10 and workspace `node_modules` installed. WASM pkg files are gitignored; CI runs `pnpm run wasm:build:release` before the blog Pages job. Locally, if `packages/wasm/pkg/markdown/markdown.js` is missing:

```bash
# rustc 1.85+ (edition 2024), wasm32-unknown-unknown, wasm-pack
wasm-pack build --target web --out-dir packages/wasm/pkg/markdown --out-name markdown crates/markdown
# or: pnpm run wasm:build
```

Then:

```bash
pnpm --filter blog build
```

Ready when the command exits 0 and `apps/blog/dist/client/index.html` exists. This is the same graph CI uses for the `duyet-blog` Pages job (`apps/blog` `build` / `cf:deploy:prod`). A failing production build is a failed launch — do not fall back to `vite dev`. Prebuild failing with `Cannot find module .../packages/wasm/pkg/markdown/markdown.js` means WASM was skipped, not a Clerk miss.

Optional preview of that output (separate from launch):

```bash
.cursor/skills/verify-blog/bin/verify-blog preview-start
```

Ready when `preview.url` in the JSON is answering HTTP 200. Default port 4173 (vite preview). Teardown with `preview-stop` or `cleanup`.

For a short-lived check there is no long-running server: `prove` builds once, inspects HTML, and exits.

## Doctor

Read-only. Run first whenever anything looks off:

```bash
.cursor/skills/verify-blog/bin/verify-blog doctor
```

Pass requires:

- Root `pnpm.overrides["@clerk/shared"]` is `3.x` (currently `3.47.8`). `@clerk/clerk-react` 5.x imports `ClientContext` / `OrganizationProvider` / `SessionContext` / `UserContext` from `@clerk/shared/react`. Shared v4 dropped those exports and fails the rolldown production build with `MISSING_EXPORT`.
- If `node_modules` is present, the resolved `@clerk/shared` package version is also `3.x`.
- `apps/blog/package.json` `build` script still invokes Vite via `scripts/force-workspace-react.mjs`.
- Doctor also reports `wasmMarkdown` (whether `packages/wasm/pkg/markdown/markdown.js` exists). Missing WASM fails prebuild, not Clerk; CI builds WASM before Pages.

Do not drive an instance whose doctor reports `clerkAligned: false`.

## Drive

Prefer the lever over ad-hoc grep. Recipes live in `features/`. Stable handles:

- Post URL path: `/2026/07/anyrouter/` (file `apps/blog/_posts/2026/07/anyrouter.md`, prerender `apps/blog/dist/client/2026/07/anyrouter/index.html`).
- Pricing copy that must appear after #1427: `Why Go at $2/mo` and `$4 credits`.
- Pricing copy that must not appear: `Why Starter at $1/mo`.
- Clerk failure token: `MISSING_EXPORT` plus those four export names.

```bash
.cursor/skills/verify-blog/bin/verify-blog prove --feature anyrouter-pricing
```

That is the proven-drive command: doctor, production build, HTML assertions, JSON report. For HTML-only after a successful build:

```bash
.cursor/skills/verify-blog/bin/verify-blog drive anyrouter-pricing
```

Preview (optional, after `preview-start`): open `http://127.0.0.1:<port>/2026/07/anyrouter/`. Assert the visible heading contains `Why Go at $2/mo`. Screenshot the article, not only the chrome.

## Evidence

Named location: `/tmp/verify-blog/<run-id>/` (printed as `evidenceDir` in every command's JSON). Capture:

- `report.json` — lever output (exit, clerk versions, assertion results).
- `build.log` — full `pnpm --filter blog build` stdout+stderr.
- `anyrouter.html` — copy of the prerendered post (or an excerpt file if the full HTML is huge).
- Screenshots: `anyrouter.png` when a preview session was driven. Video optional.

Proof standards:

- Exercise the real Pages artifact (`dist/client` HTML), not the markdown source alone. Source can be merged while production stays on the previous deploy.
- Capture the action (build command + exit) and the resulting state (file exists + strings present/absent).
- A green TypeScript check is not proof. The outage was a rolldown `MISSING_EXPORT` during `vite build`.
- Cleanup must not delete this directory.

## Cleanup

```bash
.cursor/skills/verify-blog/bin/verify-blog cleanup
```

Stops only the preview PID this lever started (recorded in `/tmp/verify-blog/state.json`). Never `pkill vite` / `pkill node`. Never delete `evidenceDir`.

## Helpers

```bash
.cursor/skills/verify-blog/bin/verify-blog doctor
.cursor/skills/verify-blog/bin/verify-blog build
.cursor/skills/verify-blog/bin/verify-blog drive anyrouter-pricing
.cursor/skills/verify-blog/bin/verify-blog prove --feature anyrouter-pricing
.cursor/skills/verify-blog/bin/verify-blog preview-start
.cursor/skills/verify-blog/bin/verify-blog preview-stop
.cursor/skills/verify-blog/bin/verify-blog cleanup
```

`--help` prints the same list. All commands emit one JSON object on stdout. Non-zero exit means the claim is not verified.
