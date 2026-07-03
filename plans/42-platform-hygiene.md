# 42 — Platform hygiene: env validation, dead code, WASM, authoring CLI

**Area:** Platform · **Effort:** M · **Impact:** Med · **Conflict group:** packages/* + crates/* · **Depends on:** rebase after `41` if it's mid-flight.

## Problem

Env is read raw (no zod); `.env.example` drifted (`NEXT_PUBLIC_*` vs runtime `VITE_*`), missing ~10 vars; `scripts/audit-env.ts` is a stale static array. Dead code: `crates/diff` (0 consumers — `internal-knowledge.md:110` admits it), `crates/placeholder`, exports `parseModelParams`/`clearUrl`. Three hand-written slugify copies must stay byte-identical to the Rust `crates/utils::slugify` (drift risk). The agent-assistant build relies on fragile `scratch/` string-patching. `duyet-cli` exists but only does data-pipeline subcommands — no content authoring.

## Outcome / acceptance criteria

- [ ] A `@duyet/env` package: zod schemas (client vs server), fail-fast validation, and `.env.example` regenerated from the schema. Raw `import.meta.env`/`process.env` access replaced at call sites.
- [ ] Next→Vite env drift resolved (standardize on `VITE_*`); the stale `scripts/audit-env.ts` replaced by the schema.
- [ ] Dead code removed: `crates/diff`, `crates/placeholder`, `parseModelParams`, `clearUrl`, `navigation-menu.tsx` (if not already in `41`) — after confirming zero non-test refs.
- [ ] Slugify consolidated onto `crates/utils` (via WASM/`@duyet/wasm`), removing the 3 JS copies' drift risk.
- [ ] agent-assistant build cleaned: replace `scratch/inject.ts`+`deploy.ts` string-patching with proper DO wiring; reconcile `wrangler.toml main`; gitignore `.vercel/`; fix the "Next.js" README.
- [ ] `duyet-cli` gains `new-post`/`new-note` scaffolders matching the `getPost` frontmatter contract.

## Scope

**In:** env validation, dead-code, WASM slugify, agent-assistant build cleanup, authoring CLI. **Out:** design-system (`41`), secrets (`00`).

## Key files

- new `packages/env/**`, `scripts/audit-env.ts`, `.env.example`, app env call sites
- `crates/{diff,placeholder}/`, `benchmarks/wasm/modules/diff.bench.ts`, `packages/libs/{parseModelParams,clearUrl,date,extractHeadings,string}.ts`, `wasm/stub.ts`, `crates/utils`
- `apps/agent-assistant/{vite.config.ts,wrangler.toml,scratch/*,.gitignore,README.md}`
- `crates/cli/src/`

## Approach

1. `@duyet/env`: define zod schemas; add a validation entry that fails fast; regenerate `.env.example`; migrate call sites app-by-app. Fix VITE/NEXT drift.
2. Confirm zero non-test refs, then delete dead crates + exports (`rg` per CLAUDE.md dead-code recipe); drop the diff bench.
3. Route the 3 JS slugify copies through `crates/utils::slugify` via `@duyet/wasm`; test byte-parity.
4. Replace agent-assistant `scratch/` string-patching with `@cloudflare/vite-plugin` DO wiring; reconcile paths; gitignore `.vercel/`; fix README.
5. Add `duyet-cli new-post/new-note`. Build/typecheck/test; deploy affected apps; QA.

## Verification

```
rg -n "parseModelParams|clearUrl" apps packages --glob '!**/*.test.*'   # expect 0 before deletion
pnpm run check-types && pnpm run test && pnpm run wasm:test
pnpm run rust:build && echo '{"input":"Hello World"}' | ./target/release/duyet-cli   # slugify parity spot-check
```

## Risks

- Slugify parity is load-bearing (URLs) — test exhaustively before switching.
- agent-assistant build change is the riskiest bit — validate a real deploy before removing `scratch/`.
- Env migration touches every app — do it incrementally, typecheck each.

## Kickoff Prompt

> You are running plan `plans/42-platform-hygiene.md` with **full autonomy including deploy**. Read `CLAUDE.md` (dead-code + WASM recipes), `docs/ai/internal-knowledge.md`, then the plan. If `plans/41` is mid-flight on `packages/*`, coordinate/rebase.
>
> Deliver: (1) a `@duyet/env` package with zod client/server schemas + fail-fast validation, regenerate `.env.example` from it, replace the stale `scripts/audit-env.ts`, and resolve the Next→Vite drift (standardize `VITE_*`). (2) Delete dead code after confirming zero non-test refs: `crates/diff`, `crates/placeholder`, exports `parseModelParams`/`clearUrl` (and the diff bench). (3) Consolidate the 3 hand-written slugify copies onto `crates/utils::slugify` via `@duyet/wasm` with byte-parity tests. (4) Clean the agent-assistant build: replace the `scratch/inject.ts`+`deploy.ts` string-patching with proper `@cloudflare/vite-plugin` Durable Object wiring, reconcile `wrangler.toml main`, gitignore `.vercel/`, fix the "Next.js" README. (5) Add `duyet-cli new-post`/`new-note` scaffolders matching the `getPost` frontmatter contract.
>
> Verify with the plan's commands (dead-ref checks, `check-types`, `test`, `wasm:test`, slugify parity). **Validate a real agent-assistant deploy before removing `scratch/`.** Semantic commits (`refactor`, `feat(lib)`, `rust`, `chore`). Update the plan Status + `docs/ai/core-memory.md`.
