# Code Smell + Dead Code Review (2026-05-12)

Window scanned:
- Since last run `2026-05-11T21:00:27Z`: no new commits in this worktree.
- Fallback window: last 7 days of commits (`2026-05-05` to `2026-05-10`).

## Critical

- None found with strong repo evidence.

## Warning

1. Redundant boolean cast in post prebuild path
- File: `apps/blog/scripts/generate-posts-data.ts:110`
- Why: `!Boolean(p.isMDX)` adds complexity without behavior change.
- Fix: replaced with `!p.isMDX`.

## Info

1. Dead code candidate (confident): `BuildDate`
- File: `apps/home/src/components/BuildDate.tsx:3`
- Evidence (zero references outside definition):
  - `rg -n "\\bBuildDate\\b|components/BuildDate" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*'`
  - Result: only `apps/home/src/components/BuildDate.tsx:3`.
- Action: removed file.

2. Dead code candidate (confident): `FooterInteractive`
- File: `apps/home/src/components/FooterInteractive.tsx:4`
- Evidence (zero references outside definition):
  - `rg -n "\\bFooterInteractive\\b|components/FooterInteractive" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*'`
  - Result: only `apps/home/src/components/FooterInteractive.tsx:4`.
- Action: removed file.

## Performance audit

- No measured runtime regression found in this window from available local evidence.
- No benchmark/test trace in this checkout was available to prove a new slowdown.
- Next measurement if needed: run app-level Lighthouse/Web Vitals or route timing for changed pages (`home`, `insights`, `blog`) before/after commit.
