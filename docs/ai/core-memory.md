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
