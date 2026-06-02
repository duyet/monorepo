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
cd apps/blog && pnpm run cf:deploy:prod  # run in background
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

The `commit-msg` hook runs `pnpm exec commitlint` with two enforced rules:

- **body-max-line-length: 100** — body lines must be ≤100 characters
- **subject-case: lowercase** — description must be lowercase

## Pre-commit hook

`pnpm run test` runs the workspace test suite before every commit.

**If you want an early failure signal, run the suite manually before committing:**

```bash
pnpm run test
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
pnpm run lint         # Biome lint
pnpm run check-types  # TypeScript
pnpm run test         # all packages
```

For single-file changes:

```bash
pnpm exec biome lint <path>
```
