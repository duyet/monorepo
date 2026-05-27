---
title: "Commit, Push, and Deploy Convention"
category: "workflows"
tags: ["git", "commitlint", "deploy", "workflow"]
links: ["deploy-workflow", "duyetbot-scope", "autonomous-workflow"]
summary: "After every task: semantic commit, push to master, then background-deploy the changed app to Cloudflare Pages."
updated: "2026-05-26"
---

# Commit, Push, and Deploy Convention

Every completed task ends with three steps: commit, push, deploy.

```bash
git commit -m "feat(blog): add copy dropdown"
git push origin master
cd apps/blog && bun run cf:deploy:prod  # run in background
```

## Commit format

Semantic commits with a scope matching the changed app or package:

```
<type>(<scope>): <description in lowercase>
```

- `type`: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
- `scope`: app name (`blog`, `home`, `agents`) or package (`components`, `config`, `libs`)
- `description`: lowercase, imperative mood, ≤72 chars

## commitlint constraints

The `commit-msg` hook runs `bun commitlint` with two enforced rules:

- **body-max-line-length: 100** — body lines must be ≤100 characters
- **subject-case: lowercase** — description must be lowercase

## Pre-commit hook

`bun run test` runs across all 14 packages before every commit. Cached runs take ~100 ms; uncached runs can cause a pipe buffer overflow that returns exit code 1 even when tests pass.

**Always warm the cache before committing:**

```bash
bun run test  # warm cache
git commit ...
```

## Co-authors

Every commit must include:

```
Co-Authored-By: duyet <me@duyet.net>
Co-Authored-By: duyetbot <duyetbot@users.noreply.github.com>
```

## Verification commands

```bash
# After deploy notification, verify production
curl -s -o /dev/null -w "%{http_code}" https://<app>.duyet.net/

# Check CI on master
gh run list --branch master --event push --limit 5 \
  --json databaseId,status,conclusion,name,updatedAt
```

## Root quality checks

Run these before marking a multi-file task complete:

```bash
bun run lint         # Biome lint
bun run check-types  # TypeScript
bun run test         # all packages
```

For single-file changes:

```bash
bunx biome lint <path>
```
