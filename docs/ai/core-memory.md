# Core Maintenance Memory

This file stores durable outcomes from code-smell and dead-code automation runs.

## Rules

- Keep findings concise and evidence-backed (commit SHA, file path, command output).
- Only mark dead code as confident when repo-wide non-test references are zero.
- Do not create dated `docs/reviews/code-smell-dead-code-<DATE>.md` files.

## Durable Findings

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
- Code smell review (warning -> fixed): the blog redesign changed shared `HOME` and `Header` defaults to `/`, which made default headers on subdomain apps link their Home/brand affordances to the current app root instead of `https://duyet.net`. Restored shared defaults to `urls.apps.home` and kept the blog-local root explicit with `homeUrl="/"`.
  - Evidence: `rg -n "\bHOME\b|homeUrl|createDefaultNavigation" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*' --glob '!**/__tests__/**'` showed default `Header` consumers in apps without explicit `navigationItems`, plus CV importing shared `HOME`.
- Dead-code review (confident): no zero-reference removal was justified; `HOME`, `homeUrl`, and `createDefaultNavigation` remain referenced by shared headers and app roots.
- CI audit: latest `master` push workflows for `64ffdb43eeaef62b4e3bb031d576b0f0e41a774b` are green for `Lint`, `Test`, and `Deploy to Cloudflare Pages`.
  - Evidence: `gh run list --branch master --event push --limit 10 --json databaseId,headSha,status,conclusion,name,updatedAt,url`.
- Workflow docs update: recorded the linked-worktree `.git/worktrees/...` permission fallback in `CLAUDE.md`; `AGENTS.md` is a symlink to this file.
