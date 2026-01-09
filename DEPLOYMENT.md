# Cloudflare Pages Deployment Guide

This document describes the deployment process for all applications to Cloudflare Pages.

## Quick Start

Deploy all applications to Cloudflare Pages:

```bash
bun run cf:deploy
```

Deploy a single application:

```bash
bun run cf:deploy home
bun run cf:deploy cv
bun run cf:deploy blog
bun run cf:deploy photos
bun run cf:deploy insights
bun run cf:deploy homelab
```

Test deployment without making changes (dry run):

```bash
bun run cf:deploy --dry-run
bun run cf:deploy home --dry-run
```

## Deployment Architecture

### Applications and Deployment Targets

| App | Wrangler Project | Domain | Secrets |
|-----|-----------------|--------|---------|
| home | duyet-home | duyet.net | No |
| cv | duyet-cv | cv.duyet.net | No |
| blog | duyet-blog | blog.duyet.net | Yes |
| photos | duyet-photos | photos.duyet.net | Yes |
| insights | duyet-insights | insights.duyet.net | Yes |
| homelab | duyet-homelab | homelab.duyet.net | No |

### Deployment Process

The `cf:deploy` command executes a three-phase deployment pipeline:

```
┌─────────────────────────────────────────────────────┐
│  PHASE 1: Build                                      │
│  ├─ Builds all apps in parallel using Turbo         │
│  └─ Output: Each app generates `out/` directory     │
├─────────────────────────────────────────────────────┤
│  PHASE 2: Config                                     │
│  ├─ Syncs secrets to Cloudflare Pages               │
│  ├─ Syncs NEXT_PUBLIC_* environment variables       │
│  └─ Only for apps with secrets (blog, photos, ...)  │
├─────────────────────────────────────────────────────┤
│  PHASE 3: Deploy                                     │
│  ├─ Deploys each app to its Cloudflare project      │
│  ├─ Uses `wrangler pages deploy`                    │
│  └─ Maps to correct domain via Cloudflare DNS       │
└─────────────────────────────────────────────────────┘
```

## Configuration Files

### `wrangler.toml` (per app)

Each app has a `wrangler.toml` configuration file:

```toml
name = "duyet-home"
compatibility_date = "2024-01-01"
pages_build_output_dir = "out"
```

**Required fields:**
- `name`: Cloudflare Pages project name
- `pages_build_output_dir`: Output directory from Next.js build

### `next.config.js` (per app)

All apps use static export for Cloudflare Pages:

```javascript
const config = {
  output: "export",  // Static export to 'out/' directory
  // ... other config
};
```

## Environment Variables

Environment variables are managed at two levels:

### 1. Build-time Variables (NEXT_PUBLIC_*)

These are baked into the static HTML/JS at build time:

```env
NEXT_PUBLIC_DUYET_HOME_URL=https://duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_PHOTOS_URL=https://photos.duyet.net
NEXT_PUBLIC_DUYET_INSIGHTS_URL=https://insights.duyet.net
NEXT_PUBLIC_DUYET_HOMELAB_URL=https://homelab.duyet.net
```

**Syncing:** Automatically synced by `cf:deploy` during Phase 2

### 2. Runtime Secrets (Private Variables)

These are stored securely in Cloudflare Pages:

```env
# blog app
KV_URL=https://...
KV_REST_API_TOKEN=...
POSTHOG_API_KEY=...
POSTGRES_URL=...

# photos app
UNSPLASH_ACCESS_KEY=...
CLOUDINARY_API_KEY=...

# insights app
GITHUB_TOKEN=...
WAKATIME_API_KEY=...
CLICKHOUSE_HOST=...
```

**Syncing:** Automatically synced by `cf:deploy` during Phase 2

**Configuration:** Defined in `scripts/sync-app-secrets.ts`

## Prerequisites

### Required Tools

- **Bun**: Configured as package manager in `package.json`
- **Wrangler CLI**: Installed as dev dependency (automatic)
- **Cloudflare Account**: With Pages projects created

### Cloudflare Setup

1. Create Cloudflare Pages projects:
   - `duyet-home` → Deploy to duyet.net
   - `duyet-cv` → Deploy to cv.duyet.net
   - `duyet-blog` → Deploy to blog.duyet.net
   - `duyet-photos` → Deploy to photos.duyet.net
   - `duyet-insights` → Deploy to insights.duyet.net
   - `duyet-homelab` → Deploy to homelab.duyet.net

2. Configure DNS for custom domains in Cloudflare

3. Set up Cloudflare API credentials for deployment

### Authentication

#### Cloudflare API Token

Set up authentication for `wrangler`:

```bash
# Authenticate with Cloudflare
wrangler auth

# Or set the API token directly
export CLOUDFLARE_API_TOKEN=your_token_here
```

For CI/CD environments:
```bash
export CLOUDFLARE_API_TOKEN=<your-token>
export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
```

## Deployment Commands

### Deploy All Applications

```bash
bun run cf:deploy
```

Deploys all 6 applications to their respective Cloudflare Pages projects.

### Deploy Single Application

```bash
# Deploy just the home app
bun run cf:deploy home

# Deploy just the blog with secrets
bun run cf:deploy blog

# Deploy insights with analytics data
bun run cf:deploy insights
```

### Dry Run (Preview Changes)

```bash
# Preview deployment without making changes
bun run cf:deploy --dry-run

# Preview single app deployment
bun run cf:deploy home --dry-run
```

## Verification

### After Successful Deployment

1. **Check deployment status in Cloudflare Dashboard:**
   - Visit https://dash.cloudflare.com
   - Navigate to Pages → Select project
   - Verify latest deployment is active

2. **Visit deployed applications:**
   - Home: https://duyet.net
   - CV: https://cv.duyet.net
   - Blog: https://blog.duyet.net
   - Photos: https://photos.duyet.net
   - Insights: https://insights.duyet.net
   - Homelab: https://homelab.duyet.net

3. **Test functionality:**
   - Verify pages load correctly
   - Check that links between apps work
   - Confirm environment variables are loaded
   - Test API integrations (if applicable)

### Common Issues

#### Deployment fails with authentication error

```bash
# Re-authenticate with Cloudflare
wrangler auth

# Then retry deployment
bun run cf:deploy
```

#### Secrets are missing after deployment

```bash
# Manually sync secrets
bun scripts/sync-app-secrets.ts duyet-blog
bun scripts/sync-app-secrets.ts duyet-photos
bun scripts/sync-app-secrets.ts duyet-insights

# Redeploy the apps
bun run cf:deploy blog photos insights
```

#### Build fails due to missing dependencies

```bash
# Reinstall dependencies
bun install

# Then retry deployment
bun run cf:deploy
```

#### Environment variable not found in deployed app

1. Check if variable is in the app's config in `sync-app-secrets.ts`
2. Verify variable exists in root `.env` or `.env.local`
3. Manually set in Cloudflare Pages dashboard if needed

## Advanced Usage

### Deploy with Custom Build

```bash
# Build manually first
bun run build

# Then deploy
bun run cf:deploy
```

### Deploy to specific environment

Currently all deployments go to production. For staging/preview environments, configure custom domains in Cloudflare.

### Monitor deployment logs

```bash
# View deployment history
wrangler pages deployments list --project-name=duyet-home

# View deployment logs
wrangler pages deployment tail --project-name=duyet-home
```

## Troubleshooting

### "Unknown app" error

```bash
# Valid app names:
# home, cv, blog, photos, insights, homelab

# Check available apps
bun scripts/cf-deploy.ts --help  # (if --help is implemented)
```

### Build timeout

Increase timeout or check for circular dependencies:

```bash
# Run build separately for debugging
bun run build

# Check specific app
cd apps/blog && bun run build
```

### Wrangler authentication fails

```bash
# Logout and re-authenticate
wrangler logout
wrangler auth

# Or set token directly in environment
export CLOUDFLARE_API_TOKEN=<your-token>
```

### Pages deployment rejected

Common reasons:
- Output directory not found (`out/` missing)
- Build artifacts not in correct location
- File size limits exceeded
- Incompatible file types

Check `next.config.js` for correct `output: "export"` setting.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Deploy to Cloudflare
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: bun run cf:deploy
```

## Rollback

To rollback a deployment:

1. Go to Cloudflare Pages dashboard
2. Select the project
3. Click "Deployments" tab
4. Find the previous working deployment
5. Click "Rollback to this deployment"

## Performance Optimization

### Build caching

Turbo automatically caches build outputs. To clear cache:

```bash
bun run clean
bun run cf:deploy
```

### Parallel builds

All apps build in parallel via Turbo. No additional configuration needed.

## Security Considerations

1. **Never commit `.env` files** - Use `.env.local` for local development
2. **Rotate API tokens** - Periodically update Cloudflare API tokens
3. **Audit secrets** - Review which secrets each app needs
4. **Monitor deployments** - Check deployment logs for errors
5. **Use git for tracking** - All deployed code should be in git

## Next Steps

- [ ] Set up CI/CD pipeline for automatic deployments
- [ ] Configure custom error pages in Cloudflare
- [ ] Set up analytics and monitoring
- [ ] Plan disaster recovery procedures
- [ ] Document rollback procedures

## Support

For issues with:
- **Cloudflare**: Check [Cloudflare Docs](https://developers.cloudflare.com/pages/)
- **Wrangler**: Check [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- **Next.js**: Check [Next.js Static Export Docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
