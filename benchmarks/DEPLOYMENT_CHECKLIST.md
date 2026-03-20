# Vite Migration Deployment Checklist

## Current Status (2026-03-21)

**Migration code**: ✅ Committed to master
**Production deployment**: ❌ Not yet deployed to Cloudflare Pages

All 9 apps have Vite configs committed (verified):
- apps/agents/vite.config.ts (updated 2026-03-21)
- apps/ai-percentage/vite.config.ts (updated 2026-03-20)
- apps/blog/vite.config.ts (updated 2026-03-21)
- apps/cv/vite.config.ts (updated 2026-03-20)
- apps/home/vite.config.ts (updated 2026-03-20)
- apps/homelab/vite.config.ts (updated 2026-03-16)
- apps/insights/vite.config.ts (updated 2026-03-20)
- apps/llm-timeline/vite.config.ts (updated 2026-03-18)
- apps/photos/vite.config.ts (updated 2026-03-18)

## Pre-Deployment Verification

### Step 1: Verify Local Builds
```bash
cd /Users/duet/project/monorepo

# Build all apps with Vite
bun run build

# Check build outputs exist
for app in blog cv home homelab llm-timeline photos insights agents ai-percentage; do
  if [ -d "apps/$app/.vercel/output" ] || [ -d "apps/$app/dist" ]; then
    echo "✅ $app built successfully"
  else
    echo "❌ $app build missing"
  fi
done
```

### Step 2: Verify Build Configuration
For each app, verify:
```bash
# Check for proper build output format (Cloudflare Pages needs .output or dist)
cat apps/<app>/vite.config.ts | grep -A 5 "build:"
cat apps/<app>/wrangler.toml 2>/dev/null || echo "No wrangler.toml"
```

### Step 3: Test Production Build Locally
```bash
# For Cloudflare Pages apps
cd apps/<app>
bun run build
bun run preview  # If available, test the preview build
```

## Deployment Commands

### Option A: Deploy via CLI (Recommended for validation)
```bash
# Deploy each app individually to validate before pushing
cd /Users/duet/project/monorepo

# Deploy in order (by traffic/impact)
cd apps/blog && bun run cf:deploy:prod && echo "✅ blog deployed"
cd ../cv && bun run cf:deploy:prod && echo "✅ cv deployed"
cd ../home && bun run cf:deploy:prod && echo "✅ home deployed"
cd ../photos && bun run cf:deploy:prod && echo "✅ photos deployed"
cd ../insights && bun run cf:deploy:prod && echo "✅ insights deployed"
cd ../llm-timeline && bun run cf:deploy:prod && echo "✅ llm-timeline deployed"
cd ../homelab && bun run cf:deploy:prod && echo "✅ homelab deployed"
cd ../agents && bun run cf:deploy:prod && echo "✅ agents deployed"
cd ../ai-percentage && bun run cf:deploy:prod && echo "✅ ai-percentage deployed"
```

### Option B: Deploy via CI/CD
If CI/CD is configured to auto-deploy on master push:
```bash
git push origin master
# Monitor: GitHub Actions → Cloudflare Pages deployments
```

### Option C: Parallel Deployment (All at once)
```bash
cd /Users/duet/project/monorepo
bun run cf:deploy:prod
```

## Post-Deployment Validation

### Immediate Checks (After each deployment)

```bash
# 1. Verify site is responding
curl -I https://<app>.duyet.net/

# 2. Check HTTP status (should be 200)
curl -s -o /dev/null -w "%{http_code}\n" https://<app>.duyet.net/

# 3. Verify Vite build (look for vite markers, no _next)
curl -s https://<app>.duyet.net/ | grep -o "_next\|@vite\|vite.svg" | head -5

# 4. Check page loads without errors (console errors)
# This requires manual testing or Lighthouse CI
```

### Performance Re-benchmark (After all apps deployed)

```bash
# Wait 5-10 minutes for CDN cache to warm up
sleep 300

# Run benchmark
bash /Users/duet/project/monorepo/scripts/benchmark-sites.sh post-vite-deploy

# Compare results
# Metrics to validate:
# - TTFB: Should stay same or improve (within 10%)
# - HTML size: Should improve or stay same
# - Script count: Should SIGNIFICANTLY reduce per app
```

### Rollback Plan (If deployment fails)

If a deployment causes issues:
```bash
# Option 1: Revert to previous commit (if just deployed)
git revert <commit-hash>
git push origin master
bun run cf:deploy:prod

# Option 2: Manual rollback via Cloudflare Dashboard
# Navigate to Cloudflare Pages → Select Project → Deployments
# Click "Rollback to previous deployment"
```

## Expected Performance Changes

### After Successful Vite Deployment

| Metric | Before (Next.js) | After (Vite) | Expected Change |
|--------|------------------|--------------|-----------------|
| TTFB | 170-300ms | 165-290ms | -3 to -10ms (5-10%) |
| HTML Compressed | Varies | Same or -5% | Minimal change |
| HTML Raw | Varies | -30 to -50% | Significant reduction |
| Script Count | 11-215 | 5-80 | -40 to -60% per app |
| Build Time | ~3-5s per app | ~1-2s per app | -50% faster |
| Cold Start | ~200ms | ~150ms | Faster |

### Apps with Biggest Expected Wins

1. **llm-timeline**: 215 → ~50 scripts (-77%)
2. **insights**: 35 → ~12 scripts (-66%)
3. **blog**: 88 → ~35 scripts (-60%)
4. **photos**: 26 → ~10 scripts (-62%)

### Apps Already Optimized

- agents: 2 scripts (minimal footprint)
- ai-percentage: 2 scripts (minimal footprint)
- homelab: 2 scripts (minimal footprint)

## Monitoring During Deployment

### Live Metrics to Watch
- Cloudflare Pages deployment progress
- HTTP status codes (should stay 200)
- Error rates (via Cloudflare Analytics)
- Core Web Vitals (if available in analytics)

### Logs to Check
```bash
# GitHub Actions logs
# Navigate to: github.com/duyet/blog → Actions → Latest workflow

# Cloudflare Pages logs
# Navigate to: Cloudflare Dashboard → Pages → Select Project → Deployments
```

## Post-Deployment Validation Checklist

After deployment completes, verify:

- [ ] All 9 apps return HTTP 200
- [ ] No "404 Not Found" errors on homepages
- [ ] No console JavaScript errors (manual check or Lighthouse)
- [ ] Vite markers detected or Next.js markers absent
- [ ] CDN cache warming (wait 5-10 min)
- [ ] Benchmark shows reduced script counts
- [ ] TTFB remains stable (within 10% of baseline)
- [ ] Core Web Vitals stable (if available)

## Timeline

**Recommended deployment window:**
- Total time: ~30-45 minutes (CLI deploy) or ~5-10 minutes (CI/CD auto-deploy)
- Best time: Off-peak hours (early morning or late evening UTC)
- Rollback capability: Keep previous deployment available for 30 minutes

## Support Resources

### Deployment Issues
- Cloudflare Pages docs: https://developers.cloudflare.com/pages
- Vite build docs: https://vitejs.dev/guide/build.html
- TanStack Router docs: https://tanstack.com/router/latest

### Monitoring Tools
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- Cloudflare Analytics: https://dash.cloudflare.com → Select Project → Analytics
- Sentry: https://sentry.io → Select organization → Project issues

---

**Last updated**: 2026-03-21
**Prepared by**: Performance benchmark suite
**Status**: Ready for deployment
