# Core Maintenance Memory

This file stores durable outcomes from code-smell and dead-code automation runs.

## Rules

- Keep findings concise and evidence-backed (commit SHA, file path, command output).
- Only mark dead code as confident when repo-wide non-test references are zero.
- Do not create dated `docs/reviews/code-smell-dead-code-<DATE>.md` files.

## Durable Findings

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
