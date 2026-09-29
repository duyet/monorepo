# Core Maintenance Memory

This file stores durable outcomes from code-smell and dead-code automation runs.

## Rules

- Keep findings concise and evidence-backed (commit SHA, file path, command output).
- Only mark dead code as confident when repo-wide non-test references are zero.
- Do not create dated `docs/reviews/code-smell-dead-code-<DATE>.md` files.

## Durable Findings

### 2026-09-29

- OG card generation (feature, previously uncommitted work landed): nine apps pointed `og:image` at a hand-made PNG, a missing file, or nothing. The blog was the worst case — 319 posts and a card must exist before any crawler asks, so most post cards 404'd on share.
  - `packages/config/og-card` renders a deterministic 1200x630 card; small apps ship a checked-in PNG via a one-line `scripts/generate-og.ts`.
  - `apps/blog/scripts/generate-og.ts` writes one card per post / child post / quick note plus a site-wide default, behind a content-hash cache that keeps ~224 remote thumbnail fetches off every build but the first. Verified: 331 targets, 243 dithered, 88 type-only fallback.
  - `apps/blog/lib/og.ts` is the single source of truth for the filename mapping and is imported by BOTH the writer and every route `head()`, so the two cannot drift into a silent 404. Keep it that way: any new card surface must go through it.
- Brittle source-text test replaced with a real one (warning -> fixed): `apps/blog/src/routes/$year/$month/$slug/canonical.test.ts` asserted the route *source* contained `rel: "canonical"`, so it broke when canonical moved into `ogHeadLinks` even though the rendered page was unchanged. Deleted, and replaced by `apps/blog/lib/head.test.ts` asserting emitted arrays.
  - This is now a known repo-wide pattern to watch for: `rg -l "readFileSync" apps packages --glob '**/*.test.ts' --glob '**/*.test.tsx' | xargs rg -l "toContain|toMatch"` lists every candidate. A source-text test asserts the *shape of the code*, not the behavior, so any correct refactor looks like a regression.
- Duplicate article `head()` collapsed (info -> fixed): the post, child-chapter and quick-note routes each hand-rolled the same six-part `head()` and had already drifted (title suffix, markdown alternate, X widget script). Now one `buildArticleHead()` in `apps/blog/lib/head.ts`, covered by 9 tests.
  - Side effect worth knowing: `datePublished` is normalized to an ISO string. `Post["date"]` is a `Date`, and `JSON.stringify` emits ISO for a valid Date but *silently drops the key* for an Invalid Date — so the two failure modes were previously indistinguishable, and a null key would have failed Google's rich-result validator.
- Turbo cache-correctness gap (warning -> fixed): `pnpm run lint` reported 4 `noUndeclaredEnvVars` warnings in the two Cloudflare deploy orchestrators. `CF_PAGES_PRODUCTION_BRANCH` and `CLOUDFLARE_EMAIL` are now in `globalEnv`.
  - `GITHUB_EVENT_NAME` / `GITHUB_OUTPUT` stay out **on purpose**: `scripts/cf-deploy-matrix.ts` is a GitHub Actions step, never a turbo task, and `GITHUB_OUTPUT` holds a per-run file path, so declaring it would bust the build cache on every CI run to protect a task that never reads it. The inline `biome-ignore` records this.
- Local commit hook OOM (warning -> fixed): `.husky/pre-commit` ran `pnpm run test` uncapped, and turbo defaults to 10 parallel tasks, so a commit in this 29-package monorepo starts 10 vitest processes at once. On a memory-limited machine the run is OOM-killed and every task exits 143 (SIGTERM) — the hook then prints a wall of output containing no actual failure, so it reads as a broken test when nothing is broken. Capped at `--concurrency=4`, keeping the `dotenv --` prefix from the root `test` script so env files stay identical.
  - Diagnostic signature to recognise: many tasks reporting exit 143 and no real assertion failure. Not a test problem.
- CI supply chain (info -> fixed): the last four floating third-party action refs are now pinned to SHAs — `tailscale/github-action` (2x), `peter-evans/find-comment`, `peter-evans/create-or-update-comment`, `github/codeql-action/upload-sarif`. `actions/*` and `pnpm/action-setup` stay on major tags (first-party); `duyet/claude-anyrouter-action@main` stays on the moving ref because pinning a first-party action means shipping a bump for every feature of the action itself.
- Dead-code review (confident): removed `absoluteOgUrl` from `packages/config/src/og.ts`.
  - Evidence: `rg -n "absoluteOgUrl" . --glob '!node_modules'` returned only the declaration. It also duplicated `ogAbsolute` in `apps/blog/lib/og.ts`, which is the version actually used (it hardcodes the blog origin), so the 23 `og.test.ts` cases never covered the dead one.
- Performance audit: no grounded runtime regression claim from this window. The one measured signal was the pre-commit OOM above, which is a throughput problem, not a code regression.

### 2026-09-29 (refactor wave)

Ten parallel lanes, one per app/package group, disjoint file ownership. Net effect: **~11,000 lines deleted, tests 63 -> 76 in insights alone and repo-wide counts up nearly everywhere**, with `pnpm run lint` going from 15 warnings to zero.

- **The `readFileSync().toContain()` pattern was repo-wide, not one file.** Every lane found instances: blog (`canonical.test.ts`, `-content.test.ts`, `x-embed.test.ts`, `root.hydrate.test.ts`), home (`og-meta.test.ts`), cv (`dark-mode.test.tsx`), burns (`sources.test.ts`), agent-ui (`main.boot.test.ts`, `App.error.test.ts`), scripts (`patch-html-for-cloudflare.test.ts`). All replaced with behavior assertions, several mutation-tested to prove the new test is *stricter* than the string match it replaced.
  - Two are legitimately source-reading and were deliberately kept: `apps/blog/src/router.test.ts` and `entry-client.test.ts` assert a **cross-app** contract over other apps' `src/router.tsx` / `client.tsx`, and `d1-deploy-plan.test.ts` reads `wrangler.toml`, which is genuinely the input.
- **Two packages were not type-checking their own source.** `packages/components/tsconfig.json` listed `"src"` in `include`, a directory that does not exist — 11.8k lines of component source were excluded, and the package has no `check-types` script, so nothing noticed. `packages/urls` excluded `**/*.test.ts`, hiding three real errors including a test whose assertion was **tautological** (`DEFAULT_AUTHORIZED_PARTIES` was compared against the value it is literally defined as). `packages/wasm` listed a nonexistent `types.d.ts` and had no `check-types` script at all. All three fixed; `packages/components` now checks clean for the first time.
- **`scripts/` tests had never run in CI.** The directory is not a pnpm workspace package, so `turbo test` skipped it and no workflow referenced its vitest config. Root `test` now chains `vitest run --root scripts` — 66 tests that were dead weight before. This is the single highest-leverage fix in the wave: an unrun test suite gives false confidence.
- **Six data-sync tests asserted nothing.** They set `process.env.X = undefined` (which assigns the truthy *string* `"undefined"`) and wrapped the call in a try/catch — but `BaseSyncer.sync()` never rejects, it reports through `SyncResult.errors`, so the assertion body was unreachable. Fixed with `vi.stubEnv` plus `expect(mockClient.insert).not.toHaveBeenCalled()`.
- **One dead function fabricated data.** `getWakaTimeActivity` in insights used `Math.random()` — zero references, but actively misleading to anyone reading the file.
- **Two configs were committed in a style that contradicts `biome.json`**: `packages/dither-kit` is no-semicolon, and `pnpm run fmt` reformats 334 files across the repo. The repo only ever runs `biome lint`. **Do not run `biome format` on dither-kit**, and treat repo-wide `pnpm run fmt` as a separate, deliberate migration — not a side effect of a refactor.
- **A stale `continue-on-error: ${{ matrix.app == 'ai' }}`** in `cf-deploy.yml` never fired: there is no `apps/ai`, the app is `ai-percentage`. The health check has been strict for every app. Removed as a runtime no-op; deliberately **not** retargeted to `ai-percentage`, since that would newly exempt a real app and is a product call. Same for `VITE_DUYET_AI_URL`, set in three workflows and read by nothing.
- **Deliberately preserved, with a comment saying why**, rather than "fixed" during a refactor: `getPost.ts`'s `countBy` keeps a truthiness accumulator so a category named `"constructor"` still yields the legacy `NaN`; `byNewest` returns 1 on ties so it is not a stable sort; `parseEnvContent` still strips a lone unbalanced quote. All three are pre-existing wrong-but-shipped behavior with no test pinning the right answer.
- **Owner decisions left open, not done unilaterally:** `apps/llm-timeline/lib/data.ts` is a 56,614-line tracked `@ts-nocheck` generated file — see the correction below, it is **not** the cause of the `check-types` failures; `apps/insights/components/dither-kit/*` is a ~4,000-line vendored copy of the workspace package that no import can reach; `apps/insights/app/ai/index.ts` is a documented public API keeping ~600 lines alive; `apps/photos/lib/GridUtilities.ts` has ~200 lines of production code that exists only to be tested. Each is a real finding, each is a decision rather than a refactor.

### 2026-09-29 (wave 2: depth, plus real data bugs)

Second wave, four lanes: the `getPost` field chain, `GraphViewer`, and the data-sync schema/code mismatch.

- **Four confirmed data bugs in `apps/data-sync`, all the same root cause.** ClickHouse honours `input_format_skip_unknown_fields` (1 by default), so a field a record carries but a table does not declare is **dropped without an error** — a sync can look successful while writing none of the data it computed.
  1. `github_commits_raw` was a plain `MergeTree` with no `sync_version`/`is_deleted`/`synced_at`, so `BaseSyncer.insert`'s metadata was silently dropped and **every re-run appended a duplicate copy of every commit**. It was the only sync target in the app not on ReplacingMergeTree, which `CLAUDE.md` requires of all of them. Fixed by migration `20260929`.
  2. `monorepo_posthog` declares `bounce_rate` but the syncer emits `sessions` — `sessions` has never existed as a column. Fixed by migration `20260930` (metadata-only ADD COLUMN). The **schema** was changed rather than the syncer: `sessions` is the one value derivable from `$pageview`, whereas bounce rate would have to be invented.
  3. PostHog paths containing `:` were corrupted. The aggregation key was `${date}:${path}`, later recovered with `key.split(":")`, so `/a:b` came back as `/a` and two paths sharing a prefix collapsed onto one row. Replaced with nested maps — **no separator is safe when any `pchar` is legal in a path, and splitting was the bug.**
  4. `web_url` was missing the repo name: `fetchAllCommits` computed it correctly, but `fetchFromApi` re-shaped commits into a synthetic envelope that omitted it, so `transform` recomputed it from an owner-only URL. The ~110-line round-trip is gone, and the last `any` with it.
  - New `src/lib/__tests__/sync-schema.test.ts` **replays the migration files the way the runner does** to reconstruct each table's column set, then asserts tables declare what their syncer writes. Proved non-vacuous: with the new files removed, 5 assertions fail with exactly the reported symptoms.
  - Still open for the owner: the 20260929 backfill copies rows one-for-one and does **not** collapse historical duplicates, so `POPULATE` still over-counts if production already has them. The fix is written into the SQL comment, not applied. Also `apps/api` reads `monorepo_ai_code_percentage_v2`, a 005-era view that 20250109 orphaned.
- **`getPost.ts`'s 21-branch `if (field === …)` chain is gone** — the last item `plans/41-design-system.md` named. The test had **5 cases, all about `thumbnail`**, covering 1 of 21 branches; it now has 85, written and passing against the unmodified code *before* the refactor. Equivalence proven by throwaway harnesses: 3,240 synthetic comparisons (36 frontmatters × 5 bodies × `.md`/`.mdx` × 9 field orders, comparing thrown error name/message/context) and 1,914 over all **319 real `_posts`**.
  - The map is built on `Object.create(null)`, not a plain literal: `FIELD_HANDLERS["constructor"]` would otherwise run `Object.prototype.constructor`, and `["__proto__"]` is a non-function that `?.()` still tries to call. The old chain compared against literals, so those names did nothing.
  - **Ten pre-existing parsing bugs reported, not fixed** — the sharpest being that `tags` does not filter empty strings while `parts` does, so an empty tag silently pollutes `getAllTags()` counts; and `tags_slug` is unreachable as a field name, having no handler of its own.
- **`GraphViewer.tsx` 1200 -> 647 lines**, the mount effect 450 -> 254, tests 31 -> 82. The seam that made the reducers extractable at all is the `visualCtx` snapshot: everything they touch is in it, so they can be typed by a 5-method structural `ReducerGraph` instead of Sigma's own types.
  - **Proof method matters here.** The first `diff -r` of `public/` was misleading: the checked-in output is stale against the `kb/` submodule (committed `llms.txt` claims 116 memory notes; the tree holds 174), so it showed 5 changed files that were not this change's doing. The controlled A/B — HEAD's generator and the new one against the same `kb/` tree into two temp dirs — shows everything byte-identical except `graph-data.json`'s `generated` timestamp. The **prerendered homepage markup is also byte-identical** (1680 bytes via `renderToStaticMarkup`), which is the HTML Cloudflare actually serves.
- **Four more packages were not type-checking themselves.** `@duyet/components` and `@duyet/libs` were the only two with no `check-types` script, so turbo skipped them entirely. `libs/__mocks__/` (348 lines) deleted: zero references, and written for Jest (`jest.fn`, `jest.Mock`) in a repo with no Jest dependency — it could not have run, and it was the source of 2 of the 4 `libs` type errors. The other 2 were `mockResponse as Response` on objects missing 11 of `Response`'s properties. **Both packages now check clean, for the first time.**
- **The pre-commit hook was skipping the scripts suite** it had just been changed to include, and `--concurrency=4` was still OOMing intermittently. The signature is worth remembering: **a different task reports exit 143 on each run, with no assertion failure anywhere, and always passes alone.** Measured: 4 failed twice (on `@duyet/libs`, then `@duyet/components`); 2 ran 24/24 twice. `@duyet/components` peaks at 385 MB resident alone, so 2 concurrent suites is ~800 MB against the ~4 GB actually free. Capped at 2 via a named `test:turbo` script.
- **CORRECTION — the exit-143s are the host, not the code, and the "fix" was making it worse.** The root cause above was diagnosed as turbo concurrency, and several agents were then told to work around it with `NODE_OPTIONS="--max-old-space-size=…"`. Measured on `apps/llm-timeline`:
  - `tsc --noEmit` at the **default** heap: 7.2 s, **755 MB peak RSS, exit 0, clean**.
  - `NODE_OPTIONS="--max-old-space-size=512"`: **SIGABRT**. A heap cap *causes* the failure it was prescribed to prevent.
  - `pgrep -af earlyoom` → `earlyoom -r 15 -m 15,8 -s 40,20 --prefer (…|node|…|tsc|…) --avoid (…|claude|…)`. It SIGTERMs node/tsc under host memory pressure **in preference to the agent processes**.
  - `lib/data.ts` contribution: 755,584 KB with it, 731,936 KB without — **3.1%**, 2.1 MB of 755 MB. It is not a memory problem at all.
  **Rules that follow.** (1) A 143/SIGTERM from `tsc`, `vite` or `vitest` means host pressure — re-run it before investigating; do not "fix" it with a heap cap. (2) `overcommit_memory=1` with swap fully consumed makes the "this file is too big" story easy to believe and wrong. (3) Measure with `/usr/bin/time -v` (peak RSS) before blaming a file. The 56k-line `data.ts` is still a real design problem — a 2 MB generated module and a 2,078 kB client chunk shipped to every visitor — but the argument for fixing it is size and runtime, **not** type-check memory.
  - **The cleanest reproduction of the whole class**, and the one to reach for first: `turbo check-types` failed at `--concurrency=1`, `2` and `10`, naming a **different** app each time (`cv`, `data-sync`, `homelab`, `insights`) — and then passed **27/27 in 2m35s uncached** with no change at all. Every one of those apps also passes `tsc --noEmit` individually, exit 0. A failure that names a different victim on each run, and vanishes on re-run, is the host.
  - The concurrency cap in `.husky/pre-commit` is still worth keeping — 2 concurrent suites is ~800 MB against the ~4 GB this box actually has — but it reduces exposure, it is not the fix, and it should not be described as one.
- **`packages/dither-kit` and `packages/wasm` had no `test` script at all**, so `turbo test` ran nothing for them; `wasm`'s was a `echo` that always passed. `dither-kit` is a shared chart library with 3,938 lines and zero tests, including the four helpers extracted earlier the same day. Now 107 + 11 tests, pinning real invariants (band clamping, `sliceAtAngle` half-open boundaries, `emphasisOf`'s null-selection rule, `partitionByLayer`) rather than constants. `wasm/stub.ts` turned out not to be a dead placeholder: it is the alias target in three vitest configs, so its output is what most of the repo's test runs actually observe.
  - **Do not run `biome format` on `packages/dither-kit`.** It is committed no-semicolon against `biome.json`'s `"semicolons": "always"`; the repo only ever runs `biome lint` there, and repo-wide `pnpm run fmt` rewrites 334 files. The new tests match the local style deliberately. I tried excluding the package from `biome.json` and reverted it: that would have silently dropped its *lint* coverage too, which is the half that matters.
- **A whole CLI was broken by one import, and the test suite reported green.** `00f6520b` read `wakatimeConfig` from the `@duyet/config` barrel. Every test passed. `tsx src/index.ts` threw `SyntaxError: The requested module '@duyet/config' does not provide an export named 'wakatimeConfig'` — i.e. **every `pnpm run sync <source>`, all seven `data-sync-*.yml` workflows, were dead.**
  - Cause: `@duyet/config` has no `"type": "module"`, so `tsx` loads it as CJS; Node's `cjs-module-lexer` enumerates a single CJS module's exports but not those behind `export * from`, and its barrel is five of those.
  - Four separate things hid it, and each is worth remembering as a thing that can hide the next one: **Vite** resolves the barrel fine (so insights and homelab, 5 files, are unaffected); **`require()`** works fine (all 53 names present); a **namespace import** fails *silently* (`config.wakatimeConfig` is `undefined`, no throw); and **`tsx -e`** resolves it correctly, so probing with `-e` looks healthy.
  - Fixed via the `@duyet/config/api` subpath, which the package's `exports` map already provided. `config-imports.test.ts` now runs the real graph through `tsx` — the only way to catch this — and asserts the trap still exists, so if `@duyet/config` ever becomes ESM the test fails and the subpath imports can be reverted.
  - **The general lesson: a suite that only exercises the graph its own runner builds will happily report green on a program that cannot start.** For any CLI, worker entrypoint, or script, there should be a test that executes the entrypoint.
- **Silent data loss from a last-write-wins pivot.** `insights`' `getCCUsageActivityByModel` built `pivoted[date][model] = tokens` while `normalizeModelName` *deliberately* maps distinct model names onto one chart series. Four real pairs collide (`claude-haiku-4-5` / `-20251001`, `claude-opus-4-5` / `-20251101`, `claude-3-5-sonnet` / `-20241022`, `glm-5` / `glm-5:cloud`), so one of each pair's totals was discarded — and *which* one depended on database row order, which DuckDB's parallel GROUP BY does not fix. Same data, two different charts, two consecutive builds. Now sums, which is both the intended aggregation and order-independent.
- **Guards that are not real fields.** `MigrationRunner`'s re-entrancy check was `(this as any)._running` — undeclared, so nothing type-checked it and a typo would have silently disabled the guard. A two-line diff of `any` to a `private` field, plus a test asserting the field exists on the instance and not the prototype.
- **`CLAUDE.md` claimed `LOG_LEVEL` controls verbosity; nothing read it.** `createLogger` printed every level unconditionally, so the documented flag was a no-op. Fixed with the default deliberately at `debug`, so honoring the variable can only ever *remove* output — defaulting to `info` would have silently changed what every existing run prints. An unrecognized value warns **once per distinct value** and falls back to `debug`: a typo must not swallow every log line, because that failure mode makes a broken pipeline look healthy.
- **A curated list of hardcoded names resolved against data, with nothing checking the join.** `apps/home` builds its two project sections from `FEATURED`/`MORE_NAMES` via `new Map(apps.map(a => [a.name, a]))`, so renaming a project in the data file removes it from the page with no error and a green build. Now tested; proved by mutation (renaming `OMA` fails it).

### 2026-06-05

- Blog prebuild regression (warning -> fixed): `packages/libs/getPost.ts` had reverted from the earlier `process.getBuiltinModule(...)` Node 24-safe loader back to `createRequire(import.meta.url)`, reintroducing the same browser-bundle/ESM ambiguity path that `3caa801620d5e1d4216c8afb41ef49bb583d52df` had already fixed.
  - Fixed `packages/libs/getPost.ts` by restoring the lazy `process.getBuiltinModule("node:fs" | "node:path")` access pattern.
  - Evidence: `git show 3caa801620d5e1d4216c8afb41ef49bb583d52df -- packages/libs/getPost.ts`, `git show a581c86db4e0d0e0174b4cc07f34c9f8ac736382 -- packages/libs/getPost.ts`, and current `HEAD` file contents showed the regression.
- Workflow/docs drift cleanup (info -> fixed): `scripts/cf-deploy.ts` supports `--force`, but its usage block and the repo automation docs did not mention it; `apps/llm-timeline/scripts/sync-data.ts` still advertised Bun commands after the repo moved to pnpm/tsx.
  - Fixed the `cf-deploy` usage comments plus `CLAUDE.md`/`docs/ai/internal-knowledge.md`, and updated the `llm-timeline` sync script docstring/help text to match current pnpm/tsx usage.
  - Evidence: `rg -n -- '--force|cf-deploy\\.ts \\[app-name\\]' scripts/cf-deploy.ts CLAUDE.md docs/ai/internal-knowledge.md` and `sed -n '1,120p' apps/llm-timeline/scripts/sync-data.ts`.
- Dead-code review (confident): no new zero-reference dead-code candidates were justified in non-test files modified since the last run.
  - Evidence: repo-wide non-test searches on the removal candidates from `091150f` showed live replacements for `SeriesNav` and zero remaining imports for removed `YearList`; no additional touched symbols collapsed to declaration-only references.
- Performance audit: no measured runtime or CI-duration regression signal was available in this scan window, so no grounded performance fix was proposed.

### 2026-06-03

- Pnpm migration follow-up (warning -> fixed): Husky hooks still invoked Bun after the repo switched to pnpm, which would break local commits on machines without Bun.
  - Fixed `.husky/commit-msg` to use `pnpm exec commitlint --edit "$1"` and `.husky/pre-commit` to use `pnpm run test`.
  - Evidence: `.husky/commit-msg` contained `bun commitlint --edit $1`; `.husky/pre-commit` contained `bun run test`.
- Workflow/doc drift cleanup (warning -> fixed): user-facing command/help surfaces still told contributors to use Bun in current pnpm-only paths.
  - Fixed current instructions in `CLAUDE.md`, `apps/data-sync/src/{index.ts,commands/migrate.ts}`, `packages/{libs/native-cli.ts,wasm/index.ts,wasm/package.json}`, app READMEs/CLAUDE entrypoints, and KB workflow articles under `apps/kb/content/**`.
  - Evidence: repo-wide scoped search over touched docs/code returned stale `bun run`, `bun install`, `bun build`, `bun pm why`, and `bunx biome` references before the patch; post-patch search on the edited surfaces left only the intentional `setup-bun` cleanup command in `CLAUDE.md`.
- Dead-code review (confident): no new zero-reference code removal was justified in the scanned recent-change window.
  - Evidence: migration-era `apps/photos/bun-test-setup.ts` is already gone on disk, and targeted non-test searches did not surface additional orphaned symbols in the touched code files.
- Performance audit: no measured runtime or CI regression signal was available in this window, so no grounded performance fix was proposed.

### 2026-06-01

- Deploy orchestrator fix (warning -> fixed): `scripts/cf-deploy.ts` now treats `bun.lock` as the repo's core dependency lockfile when deciding whether to rebuild all apps; the previous `bun.lockb` checks missed lockfile-only dependency updates in this Bun text-lockfile repo.
  - Evidence: `rg -n "bun\\.lock|bun\\.lockb" scripts/cf-deploy.ts`, plus `git show 2587eaad7780d87d75c6e45d2b77377735486aa6 -- package.json` confirmed recent dependency-only changes in the same scan window.
- Deploy orchestrator hardening (warning -> fixed): the "no deployable apps discovered" path in `scripts/cf-deploy.ts` referenced undefined `rawOutput`, which would raise `ReferenceError` and hide the real discovery failure.
  - Evidence: `rg -n "rawOutput|No deployable apps discovered" scripts/cf-deploy.ts`.
- Dead-code review (confident): no zero-reference removals were justified in the scanned non-test files after targeted repo-wide checks on the newly extracted blog/home components and recent deploy surfaces.
  - Evidence: targeted import/reference scans across `apps/blog`, `apps/home`, `apps/burns`, and `scripts/cf-deploy.ts` found live consumers or pure file moves rather than orphaned code.
- Performance audit: no grounded runtime regression claim from this window; no measurements or traces changed in the reviewed commits.

### 2026-05-12

- Removed redundant boolean cast in `apps/blog/scripts/generate-posts-data.ts` (`!Boolean(p.isMDX)` -> `!p.isMDX`).
- Removed dead components with zero non-test references:
  - `apps/home/src/components/BuildDate.tsx`
  - `apps/home/src/components/FooterInteractive.tsx`

### 2026-05-13

- CI action pin fix: replaced invalid `oven-sh/setup-bun@0c507e51419868618aeaa5fe8019c62421857d6` with valid `0c5077e51419868618aeaa5fe8019c62421857d6` in:
  - `.github/workflows/claude-ci-fix.yml`
  - `.github/workflows/cf-worker-deploy.yml`
  - `.github/workflows/data-sync-backfill.yml`
- CI trigger coverage fix: `cf-deploy.yml` and `cf-deploy-preview.yml` now trigger when `.npmrc` or `bunfig.toml` changes.
- Bun pin consistency fix: replaced remaining floating `oven-sh/setup-bun@v2` references with `0c5077e51419868618aeaa5fe8019c62421857d6` in:
  - `.github/workflows/lint.yml`
  - `.github/workflows/test.yml`
  - `.github/workflows/data-sync-template.yml`
  - `.github/workflows/data-sync-llm-timeline.yml`

### 2026-05-14

- Dead-code cleanup (confident): removed `apps/home/src/components/HomeAgentsChat.tsx` after repo-wide non-test search returned only the declaration.
  - Evidence: `rg -n "HomeAgentsChat|components/HomeAgentsChat" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*' --glob '!**/__tests__/**'`.
- Dead-export cleanup (confident): `SearchParams` in `apps/blog/src/routes/search.tsx` is now file-local because no cross-file non-test references exist.
  - Evidence: `rg -n "\bSearchParams\b" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*' --glob '!**/__tests__/**'`.
- Performance audit: no measured regressions found in commits since `2026-05-13T10:13:12Z`; latest `master` push workflows for `ff0f95cb` (`Lint`, `Test`, `Deploy to Cloudflare Pages`) are `success`.

### 2026-05-15

- CI hardening (warning -> fixed): deploy workflow added floating third-party action refs for blog WASM build. Pinned both refs to immutable SHAs:
  - `.github/workflows/cf-deploy.yml`: `dtolnay/rust-toolchain@29eef336d9b2848a0b548edc03f92a220660cdb8` (stable)
  - `.github/workflows/cf-deploy.yml`: `jetli/wasm-pack-action@0d096b08b4e5a7de8c28de67e11e945404e9eefa` (v0.4.0)
  - Evidence: `git ls-remote https://github.com/dtolnay/rust-toolchain refs/heads/stable`, `git ls-remote https://github.com/jetli/wasm-pack-action refs/tags/v0.4.0`
- Dead-code review (confident): no new dead code candidates in non-test files modified since `2026-05-13T21:00:54Z`; only content files plus `cf-deploy.yml`, `scripts/wasm-build.ts`, and blog static headers/redirects changed.
  - Evidence: `git log --since='2026-05-13T21:00:54Z' --name-only --pretty=format: | sed '/^$/d' | sort -u`, plus repo-wide non-test symbol checks for touched symbols.
- Performance audit: no measured regressions available in this commit window; recommend relying on post-merge `master` workflow durations for the first signal on added blog WASM build cost.
### 2026-05-16

- CI hardening (warning -> fixed): replaced floating `wasm-pack` installer version in blog deploy workflow.
  - `.github/workflows/cf-deploy.yml`: `version: latest` -> `version: v0.15.0`
  - Evidence: `rg -n "jetli/wasm-pack-action@|version: latest|version: v0.15.0" .github/workflows/cf-deploy.yml` plus `gh api repos/rustwasm/wasm-pack/releases/latest --jq '.tag_name'`.
- Dead-code review (confident): no new dead code in non-test files changed in the fallback 24-hour window.
  - Evidence: `git log --since='24 hours ago' --name-only --pretty=format: | sed '/^$/d' | sort -u` and repo-wide non-test symbol checks in touched code files.
- Performance audit: no measured regression signal in this window; latest `master` push workflows remained `success` for `Lint`, `Test`, and `Deploy to Cloudflare Pages`.

### 2026-05-17

- Commit window scan since `2026-05-15 21:01:30 +0000` found only CI/docs maintenance commits: `4fbc8f676000056a9affb2018c3fd7a874c858dd`, `3491ef35d6ac64e9a006ebffa09a6027db6c96b3`, and `857e45529dfc1a9158504037e8b36d326c585f72`.
- Code smell review (info): no functional anti-patterns or bug signals in changed files (`.github/workflows/cf-deploy.yml`, `CLAUDE.md`, `docs/ai/core-memory.md`).
- Dead-code review (confident): no new dead code candidates from this commit window because changes are workflow/docs-only; no new app/package symbols were introduced.
- CI audit: push workflows on `master` for `3491ef35` and `857e4552` are `success` for both `Lint` and `Test`.
- Performance audit: no measurements or traces changed in this window, so no grounded regression claim; continue tracking workflow-duration deltas for CI-cost signals.

### 2026-05-18

- Commit window scan since `2026-05-16 21:00:13 +0000` included agent-api/ui/home/CI changes; reviewed non-merge commits for actionable code smell and dead code.
- Code smell review (info): no proven runtime bug in current `HEAD` from this window. Targeted lint passed for touched source files:
  - `apps/agent-api/src/{index.ts,agent.ts,public-messages.ts,routing.ts}`
  - `apps/agent-ui/src/{App.tsx,agent-api-transport.ts}`
  - `apps/home/src/components/SiteChrome.tsx`
  - `packages/components/{AppCommandPalette.tsx,header/index.tsx,header/AuthButtons.tsx}`
  - Evidence: `bunx biome lint <paths>` returned `Checked 10 files ... No fixes applied.`
- Dead-code review (confident): no new zero-reference symbols in current touched surfaces.
  - Evidence: repo-wide non-test reference checks for `toPublicMessageMetadata`, `hasReasoningParts`, `stripReasoningParts`, `AppCommandPalette`, and `SiteChrome` returned active references outside declarations.
- CI audit: latest `master` push workflows for `fea49fec` and `76c213b1` are `success` for `Lint`, `Test`, and deploy jobs.
  - Evidence: `gh run list --branch master --event push --limit 20 --json databaseId,headSha,status,conclusion,name,updatedAt`.
- Workflow docs update: added `git log --since='<LAST_RUN_ISO>' --no-merges ...` to `CLAUDE.md` to reduce false positives from merge-only metadata during maintenance scans.

### 2026-05-19

- Commit window scan since `2026-05-17 21:01:50 +0000` covered: `2ec7fbee94832378699541a8b7b321e100b6c77e`, `5354427407973bab8a2d6837812db75810b1412b`, and `ea4fd318b419ea263caa4d23bf1f33db34aed351`.
- Code smell review (info): no grounded functional bug/regression in current `HEAD` from this window; targeted lint passed on touched app/package files.
  - Evidence: `bunx biome lint <touched paths>` returned `Checked 22 files in 40ms. No fixes applied.`
- Dead-code review (confident): no zero-reference symbols in touched non-test files; removed-file fallout from `apps/homelab/components/ThemeProvider.tsx` is clean after import-path scans.
  - Evidence: `rg -n "homelab/components/ThemeProvider|from \"@/components/ThemeProvider\"|useTheme\\(" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*' --glob '!**/__tests__/**'`.
- CI audit: push workflows on `master` for the scanned commits are green for `Lint`, `Test`, and `Deploy to Cloudflare Pages`.
  - Evidence: `gh run list --branch master --event push --limit 12 --json databaseId,headSha,status,conclusion,name,updatedAt`.
- Workflow docs update: added detached-HEAD preflight and touched-file inventory commands to `CLAUDE.md` for safer automation loops.

### 2026-05-21

- Commit window scan after the previous durable entry covered `c7a5a04bb3111fb2e65938d26cf5b6ba7f66e07e`, `2130ac8947e05dfa6ec9e12148bb2e045e2248f9`, and `3ee2c9fd27dde339dbcbd9b62eb021c325b14350`.
- Code smell review (info): no grounded runtime bugs found. The deploy-preview author filter now excludes `COLLABORATOR`, and the Clerk override resolves all consumers to `@clerk/shared@3.47.5`.
  - Evidence: `bun pm why @clerk/shared` returned only `@clerk/shared@3.47.5`; `rg -n "@clerk/shared@3\.47\.[0-4]|@clerk/shared@3\.47\.5|@clerk/shared\"" package.json bun.lock` found no vulnerable `3.47.0` through `3.47.4` lock entries.
- Dead-code review (confident): no new dead-code candidates because the scanned changes are docs, workflow config, and dependency metadata only.
  - Evidence: `git show --name-only --pretty=format: c7a5a04b 2130ac89 3ee2c9fd | sed '/^$/d' | sort -u` returned `.github/workflows/cf-deploy-preview.yml`, `CLAUDE.md`, `docs/ai/core-memory.md`, `bun.lock`, `bunfig.toml`, and `package.json`.
- CI audit: latest `master` push workflows for `3ee2c9fd27dde339dbcbd9b62eb021c325b14350` are green for `Lint`, `Test`, and `Deploy to Cloudflare Pages`.
  - Evidence: `gh run list --branch master --event push --limit 15 --json databaseId,headSha,status,conclusion,name,updatedAt,url`.
- Workflow docs update: added `bun pm why <package>` to `CLAUDE.md` so future dependency-security scans verify override resolution before trusting `package.json` alone.

### 2026-05-22

- Commit window scan since `2026-05-20 21:00:37 +0000` covered `a16873c0e35b50f179da1a30d49d0a33853fcd3b` and `64ffdb43eeaef62b4e3bb031d576b0f0e41a774b`.
- Code smell review (warning -> fixed): the blog redesign changed shared `HOME` and `Header` defaults to `/`, which made default headers on subdomain apps link their Home/brand affordances to the current app root instead of `https://duyet.net`. Restored shared defaults to `urls.apps.home`; kept blog and home app roots explicit with `homeUrl="/"` for local SPA behavior.
  - Evidence: `rg -n "\bHOME\b|homeUrl|createDefaultNavigation" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*' --glob '!**/__tests__/**'` showed default `Header` consumers in apps without explicit `navigationItems`, plus CV importing shared `HOME`.
- Dead-code review (confident): no zero-reference removal was justified; `HOME`, `homeUrl`, and `createDefaultNavigation` remain referenced by shared headers and app roots.
- CI audit: latest `master` push workflows for `64ffdb43eeaef62b4e3bb031d576b0f0e41a774b` are green for `Lint`, `Test`, and `Deploy to Cloudflare Pages`.
  - Evidence: `gh run list --branch master --event push --limit 10 --json databaseId,headSha,status,conclusion,name,updatedAt,url`.
- Workflow docs update: recorded the linked-worktree `.git/worktrees/...` permission fallback in `docs/ai/internal-knowledge.md`; `AGENTS.md` is a symlink to `CLAUDE.md`, and `CLAUDE.md` is the canonical instruction entrypoint.

### 2026-05-23

- Commit window scan since `2026-05-22T04:06:53.367Z` covered `0e13171a838913654bf8c6a2acb60e20fe453fc2` and `3ba05edab633262e86581e8eccec575c18b211d4`.
- Code smell review (warning -> fixed): found duplicated `thumbnail` handling branch in `packages/libs/getPost.ts` during review of `3ba05e...`. `getPostByPath` was assigning `post.thumbnail` twice for the same field; the earlier assignment was removed so only the trim-aware branch remains.
  - Evidence: `git show 3ba05edab633262e86581e8eccec575c18b211d4 -- packages/libs/getPost.ts`
- Dead-code review (confident): no zero-reference dead-code candidates were identified in the touched app/package files after this fix (`Menu.tsx`, `Header`, `getPost.ts`, updated tests, docs); symbols still resolve in non-test surfaces.
  - Evidence: `rg -n "HOME|createDefaultNavigation|getPostByPath" packages apps --glob '!**/*.test.*' --glob '!**/__tests__/**'`
- CI audit: latest `master` runs for `3ba05edab633262e86581e8eccec575c18b211d4` are green (`Lint`, `Test`, `Deploy to Cloudflare Pages`).
  - Evidence: `gh run list --branch master --event push --limit 10 --json databaseId,headSha,status,conclusion,name,updatedAt,url`.
- Documentation update status: scan findings and commands continue to be logged in durable docs, and index references remain in `docs/INDEX.md`.

### 2026-05-24

- Commit window scan since `2026-05-22T04:06:53.367Z` found additional CI-critical findings in `apps/agent-assistant` from recent migration work (`0d34cc641d868b66434744a757b373644d9d385c`, `93cc490c2d8645bb17a859126c9f1da0aa1ebdc0`, `a0e21e6de8a317a7313844bd783b7d6736ef39ac`, `3ba05edab633262e86581e8eccec575c18b211d4`).
- Code smell review (warning -> fixed): PR checks showed `agent-assistant` TS failures from incorrect dependency/runtime imports and one unsafe typed index path. Root causes were:
  - Missing/invalid imports from `radix-ui` root package (`components/ui/{avatar,button,collapsible,dialog,tooltip}.*` and `assistant-ui/tooltip-icon-button.tsx`)
  - Missing dependencies in `apps/agent-assistant/package.json` (`@langchain/langgraph-sdk`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` components)
  - `components/assistant-ui/tool-fallback.tsx` used map indexing with inferred `any` on `ToolCallMessagePartStatus`-derived key
  - Evidence: `gh run view 26311816108 --job 77462100842 --log-failed` and `gh run view 26311816097 --job 77462100742 --log-failed` plus local `bun run check-types` pre-merge validation.
- Fixes applied (commit in this cycle):
  - Replaced `radix-ui` imports with package-specific namespaces
    - `@radix-ui/react-avatar`
    - `@radix-ui/react-slot`
    - `@radix-ui/react-collapsible`
    - `@radix-ui/react-dialog`
    - `@radix-ui/react-tooltip`
  - Consolidated and expanded `apps/agent-assistant/package.json` dependencies to include missing runtime packages.
  - Replaced `tool-fallback` status icon lookup with explicit mapping function returning `React.ComponentType<React.ComponentProps<"svg">>`.
  - Evidence: `bun run check-types` (agent-assistant workspace) now exits 0 after fix.
- Follow-up fix in the same cycle: changed `apps/agent-assistant/package.json` `@langchain/langgraph-sdk` from `^0.3.9` (invalid/non-existent) to `^1.9.4` (valid, present in Bun lock and registry).
  - Evidence: `bunx bun pm view @langchain/langgraph-sdk versions --json | tail -n 20` plus CI reinstall logs after re-trigger.
- Dead-code review (needs-review): no dead code candidates were added by this follow-up; these files are now referenced by app UI runtime paths.
  - Evidence: `rg -n "from \"@radix-ui/(react-avatar|react-slot|react-collapsible|react-dialog|react-tooltip)\"|tool-fallback.tsx" apps/agent-assistant`.

### 2026-05-29

- Commit window scan since the last automation timestamp found no new non-merge commits after `2026-05-28T06:13:19Z`, so the review widened to the repo-approved `7 days ago` fallback.
- Code smell review (warning -> fixed): `apps/kb/scripts/generate-static-files.ts` rebuilt `public/k/*.md` without carrying article `links` frontmatter even though KB source files and graph consumers rely on it.
  - Evidence: source markdown under `apps/kb/content/**/*.md` includes `links: [...]`, while `generate-static-files.ts` only serialized `title`, `category`, `tags`, `summary`, and `updated` before this fix.
- Fixes applied:
  - added `links` parsing + serialization in `apps/kb/scripts/generate-static-files.ts` so generated raw markdown stays graph-complete.
  - removed stale unused imports from `apps/kb/lib/content.ts` left by the isomorphic loader refactor.
- CI follow-up (warning -> fixed): PR validation exposed a pre-existing `apps/agent-api` type drift where `saveMessages()` can return `"error"` but `SubmitApiMessageResult["status"]` did not allow it.
  - Evidence: GitHub Actions run `26602389118`, job `78389062594`, `src/agent.ts(273,7): error TS2322 ... Type '"error"' is not assignable`.
- Dead-code review (confident): no zero-reference code removal was justified in the recent-change window.
  - Evidence: the touched KB generator and loader files are directly referenced by `apps/kb/package.json` and KB routes; no additional non-test zero-reference symbols were confirmed.
- Performance audit: no measurements or traces changed in this window, so no grounded performance regression claim was made.
