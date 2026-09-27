---
name: sync-gha-secrets
description: Sync secrets from .env files to GitHub Actions repository secrets. Use when setting up CI secrets, rotating keys, or onboarding a new app to GitHub Actions.
---

# Sync GitHub Actions Secrets

Sync secrets from local `.env` files to GitHub Actions repository secrets via `gh secret set`.

## Usage

```bash
.cursor/skills/sync-gha-secrets/bin/sync-gha-secrets <app-name> [--dry-run] [--repo owner/repo]
```

## What it does

1. Loads env vars from root `.env`, `.env.local`, `.env.production`, `.env.production.local`
2. Loads app-specific overrides from `apps/<name>/.env*`
3. Filters to only the secrets defined for that app in `scripts/sync-app-secrets.ts`
4. Syncs each secret via `gh secret set <name> --repo <repo>`

## Examples

```bash
# Sync blog secrets to duyet/monorepo
.cursor/skills/sync-gha-secrets/bin/sync-gha-secrets duyet-blog --dry-run

# Sync insights secrets
.cursor/skills/sync-gha-secrets/bin/sync-gha-secrets duyet-insights

# Sync to a different repo
.cursor/skills/sync-gha-secrets/bin/sync-gha-secrets duyet-blog --repo duyet/github-actions
```

## Supported apps

`duyet-api`, `duyet-blog`, `duyet-insights`, `duyet-photos`, `duyet-home`, `duyet-cv`, `duyet-homelab`, `duyet-llm-timeline`, `duyet-agent-api`, `duyet-ai`, `duyet-burns`, `duyet-ai-percentage`

## Requirements

- `gh` CLI authenticated with `repo` scope
- Run from the monorepo root
- `.env.production.local` or `.env.local` must contain the secret values
