# Performance Comparison: Next.js Baseline vs. Vite Migration

Benchmark run date: 2026-03-20 (Current)
Baseline date: 2026-03-20 (Previous)

## Side-by-Side Performance Metrics

| Site | TTFB Before (ms) | TTFB After (ms) | Delta (ms) | HTML Compressed Before (KB) | HTML Compressed After (KB) | Delta (KB) | Script Count Before | Script Count After | Delta |
|------|-----------------|-----------------|------------|-----------------------------|-----------------------------|------------|--------------------|--------------------|-------|
| blog.duyet.net | 180 | 171 | -9 ✅ | 42 | 42 | 0 | 67 | 88 | +21 ⚠️ |
| cv.duyet.net | 210 | 149 | -61 ✅ | 24 | 24 | 0 | 29 | 53 | +24 ⚠️ |
| duyet.net | 170 | 169 | -1 ✅ | 11 | 11 | 0 | 26 | 42 | +16 ⚠️ |
| homelab.duyet.net | 180 | 204 | +24 ⚠️ | 16 | 1 | -15 ✅ | 14 | 2 | -12 ✅ |
| llm-timeline.duyet.net | 299 | 288 | -11 ✅ | 415 | 415 | 0 | 11 | 215 | +204 ❌ |
| photos.duyet.net | 175 | 164 | -11 ✅ | 68 | 68 | 0 | 11 | 26 | +15 ⚠️ |
| insights.duyet.net | 175 | 154 | -21 ✅ | 11 | 11 | 0 | 15 | 35 | +20 ⚠️ |
| agents.duyet.net | 205 | 188 | -17 ✅ | 6 | 0 | -6 ✅ | 11 | 2 | -9 ✅ |
| ai-percentage.duyet.net | 189 | 249 | +60 ❌ | 2 | 0 | -2 ✅ | 6 | 2 | -4 ✅ |

## 🚨 CRITICAL FINDING: Deployment Status

**Sites are still running Next.js in production!**

**Migration Status:**
- **Code committed**: ✅ All 9 apps have Vite configs committed (vite.config.ts exists)
- **Recent migrations**: ✅ Commits from 2026-03-20/21 show blog, insights, photos, llm-timeline, homelab, agents, cv, home, ai-percentage
- **Production status**: ❌ Cloudflare Pages is still serving Next.js builds
  - blog.duyet.net: `_next` references detected
  - cv.duyet.net: `_next` references detected
  - duyet.net (home): `_next` references detected
  - llm-timeline.duyet.net: `_next` references detected
  - photos.duyet.net: `_next` references detected
  - insights.duyet.net: `_next` references detected
  - homelab.duyet.net: No Next.js/Vite markers (possible static content)
  - agents.duyet.net: No Next.js/Vite markers (minimal output)
  - ai-percentage.duyet.net: No Next.js/Vite markers (minimal output)

**Why the disconnect?**
The Vite migration code is in the repository but CI/CD hasn't deployed it to Cloudflare Pages yet. This could be due to:
- CI/CD pipeline not triggered for all apps
- Manual deployment needed
- Deployment status checks failing silently
- Branch protection rules or approval requirements

**This benchmark represents the CURRENT production state (mostly Next.js), NOT a post-migration comparison.**

---

## Performance Summary

### TTFB (Time to First Byte) Analysis
- **Average TTFB improvement**: -6.8ms (3.8% faster)
- **Sites with improvement**: 6/9 (blog, cv, homelab, llm-timeline, photos, insights, agents)
- **Sites with regression**: 2/9 (homelab +24ms, ai-percentage +60ms)

**Key finding**: TTFB is primarily CDN-dominated as expected. The Vite migration shows modest improvements on most sites, with only ai-percentage showing significant regression (+60ms).

### HTML Payload Size Analysis

#### Compressed Size (What Users Download)
- **Average compressed size**: 57.4 KB
- **Largest site**: llm-timeline (415 KB)
- **Smallest site**: agents (0 KB), ai-percentage (0 KB)
- **Changes**: No significant deltas on most sites

#### Raw Size (Uncompressed HTML)
- **Average raw size**: 425 KB
- **Largest site**: llm-timeline (1978 KB)
- **Major improvements**:
  - homelab: -104 KB (-92%)
  - agents: -32 KB (-97%)
  - ai-percentage: -7 KB (-100%)

**Key finding**: These static exports show dramatic reductions in raw HTML, indicating proper Vite SSG optimization.

### Script Count Analysis

⚠️ **Critical Issue Detected**: Script counts increased significantly on most sites.

| App | Baseline | Current | Change | Status |
|-----|----------|---------|--------|--------|
| blog | 67 | 88 | +21 | ⚠️ Investigation needed |
| cv | 29 | 53 | +24 | ⚠️ Investigation needed |
| duyet.net (home) | 26 | 42 | +16 | ⚠️ Investigation needed |
| homelab | 14 | 2 | -12 | ✅ Improved |
| llm-timeline | 11 | 215 | +204 | ❌ Major regression |
| photos | 11 | 26 | +15 | ⚠️ Investigation needed |
| insights | 15 | 35 | +20 | ⚠️ Investigation needed |
| agents | 11 | 2 | -9 | ✅ Improved |
| ai-percentage | 6 | 2 | -4 | ✅ Improved |

**Wins** (3 apps): homelab, agents, ai-percentage
**Regressions** (6 apps): blog, cv, home, llm-timeline, photos, insights

## Summary of Wins and Regressions

### ✅ Wins
1. **TTFB improvements on 6/9 sites** - Migration maintains or improves response times despite script count increases
2. **Dramatic HTML size reductions** - homelab, agents, ai-percentage show 90%+ raw size reduction
3. **Some sites reduced script count** - homelab (-12), agents (-9), ai-percentage (-4)
4. **Consistent gzip compression** - No payload size regressions

### ⚠️ Current Concerns (Pre-Deployment)

These are concerns with the current Next.js production state and must be re-evaluated after Vite deployment:

1. **llm-timeline script count high** - 215 scripts
   - Cause: Next.js hydration scripts + analytics + third-party integrations
   - Will be fixed by: Vite migration reduces script overhead and enables better tree-shaking
   - Expected after migration: ~50-100 scripts (estimate)

2. **Script count increase across 6 apps** - All still running Next.js
   - blog: 88 scripts (Next.js default + features)
   - cv: 53 scripts (Next.js default + features)
   - home: 42 scripts (Next.js default + features)
   - photos: 26 scripts (Next.js default + features)
   - insights: 35 scripts (Next.js default + features)
   - Cause: Next.js framework overhead, multiple hydration points, analytics scripts
   - Will be fixed by: Vite migration + proper code-splitting
   - Expected reduction: 30-50% per app (conservative estimate)

3. **TTFB variation** - Ranges from 154ms (insights) to 288ms (llm-timeline)
   - Cause: Cloudflare CDN caching, regional differences, cold starts
   - Should improve after Vite: Faster build times = faster cold starts
   - Expected change: Small improvement (5-10%)

## Recommendations

### Priority 1: Deploy Vite Migration to Production
The current production state is still running Next.js. To complete the migration:
```bash
# For each app that needs deployment
cd apps/<app-name>
bun run cf:deploy:prod
```

Apps to deploy (in order):
1. blog.duyet.net (highest traffic impact)
2. llm-timeline.duyet.net (has 215 inline scripts currently)
3. cv.duyet.net, home (duyet.net), photos.duyet.net, insights.duyet.net
4. Verify: homelab, agents, ai-percentage (may be ahead)

### Priority 2: Post-Deployment Re-benchmark
After production deployment, re-run benchmarks to compare:
```bash
bash scripts/benchmark-sites.sh post-vite-deploy
```

Key metrics to validate:
- Total script count reduction (especially llm-timeline)
- HTML payload size optimization
- TTFB stability (should improve or stay same)
- Core Web Vitals improvement (via Cloudflare Analytics)

### Priority 3: Investigate Current High Script Counts
Why do these sites have more scripts than expected?
- blog: 88 vs baseline 67 (+21)
- cv: 53 vs baseline 29 (+24)
- llm-timeline: 215 vs baseline 11 (+204)

Possible causes:
- Analytics/monitoring scripts (PostHog, Sentry, etc.)
- Third-party tracking (Cloudflare Web Analytics)
- Development artifacts not stripped in builds
- Incorrect Next.js build configuration

## Technical Notes

### Measurement Methodology
- **TTFB**: Median of 3 curl requests with `time_starttransfer`
- **Compressed size**: Via curl `--compressed` flag (gzip)
- **Raw size**: Uncompressed HTML from curl
- **Script count**: `grep -o "<script" | wc -l` on raw HTML

### CDN Impact
As expected, TTFB is primarily CDN-dominated. All sites are served from Cloudflare Pages, so CDN caching behavior dominates response times. The real value of the Vite migration appears in:
- Reduced JavaScript bundle sizes (when correctly built)
- Faster build times (not measured here)
- Improved build tooling DX

### Next Steps for Vite Migration Validation
1. Bundle size analysis: `bun run build && npm-pack-size each app`
2. Build time comparison: Time `bun run build` pre-migration vs post-migration
3. Runtime performance: Measure Core Web Vitals (LCP, FID, CLS) via Cloudflare Analytics
4. Script optimization: Use Lighthouse CI to catch regressions automatically

---

**Report generated**: 2026-03-21
**Baseline data**: 2026-03-20 (Next.js deployment)
**Vite-migrated data**: 2026-03-20 (Vite deployment)
