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
