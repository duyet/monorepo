# Unsplash API Cache Configuration for Cloudflare Pages

This configuration enables persistent caching of Unsplash API responses across Cloudflare Pages builds.

## Why Cache Persistence Matters

Without cache persistence:
- Every build makes **90+ API calls** to Unsplash
- Builds hit **rate limits** (50 requests/hour)
- Multiple builds per hour **fail**
- Build time: **60+ seconds**

With cache persistence:
- Subsequent builds make **0-5 API calls**
- No rate limit issues
- Build time: **1-2 seconds**
- Reliable builds

## Cloudflare Pages Native Caching

Cloudflare Pages **automatically caches** the `node_modules/.cache` directory between builds on the same branch.

### How It Works

1. **Cache Location**: `node_modules/.cache/unsplash/photos.json`
2. **Automatic Persistence**: Cloudflare Pages preserves `node_modules` directory
3. **No Configuration Needed**: Works out of the box
4. **Branch-Specific**: Each branch maintains its own cache

### Cache Details

- **Location**: `node_modules/.cache/unsplash/photos.json`
- **Size**: ~100-200KB for 90 photos
- **TTL**: 7 days (auto-expires old entries)
- **Format**: JSON
- **Persistence**: Automatic via Cloudflare Pages build cache

## Verification

To verify cache is working, check your Cloudflare Pages build logs:

**First build (cold cache):**
```
💾 Loading photo cache...
   Cache contains 0 valid entries
📊 Cache hits: 0, API calls: 90
```

**Second build (warm cache):**
```
💾 Loading photo cache...
   Cache contains 90 valid entries
📊 Cache hits: 90, API calls: 0 (saved 90 API requests!)
```

## Build Configuration

In Cloudflare Pages dashboard:

1. Go to your project **Settings** → **Builds & deployments**
2. **Build command**: `yarn build`
3. **Build output directory**: `apps/photos/out`
4. **Root directory**: `/`

No additional cache configuration is needed - Cloudflare Pages handles it automatically.

## Troubleshooting

### Cache not persisting

**Symptom**: Every build shows "Cache contains 0 valid entries"

**Solutions**:
1. **Check build environment** - Ensure using Node.js 18+
2. **Verify build command** - Should run from monorepo root: `yarn build`
3. **Clear build cache** - In Cloudflare Pages: Settings → Clear build cache, then rebuild
4. **Check branch** - Each branch has separate cache; switching branches resets cache

### Still hitting rate limits

**Causes**:
1. **First build after cache clear** - Expected, subsequent builds will be cached
2. **Multiple projects** - Each Unsplash app counts toward same account limit
3. **Cache expired** - Entries older than 7 days are refetched
4. **Branch switching** - New branch starts with empty cache

**Solutions**:
1. Wait for cache to warm up (one successful build)
2. Avoid frequent cache clears
3. Limit concurrent builds across branches

### Cache not loading

**Check build logs for**:
```
Failed to load cache: [error message]
```

**Common causes**:
- **Permission issues** - Build process can't write to `node_modules/.cache`
- **Corrupt cache file** - Delete cache and rebuild
- **Path mismatch** - Verify `CACHE_DIR` in `lib/cache.ts`

## Manual Cache Management

### View cache contents (locally)

```bash
cat node_modules/.cache/unsplash/photos.json | jq
```

### Clear cache (locally)

```bash
rm -rf node_modules/.cache/unsplash
```

### Clear cache (Cloudflare Pages)

1. Go to project **Settings** → **Builds & deployments**
2. Click **Clear build cache**
3. Trigger new build

### Check cache size (locally)

```bash
du -sh node_modules/.cache/unsplash
```

## Best Practices

1. **Let it warm up** - First build will be slow, second will be fast
2. **Monitor cache hits** - Check build logs for cache effectiveness
3. **Branch strategy** - Each branch maintains separate cache
4. **Avoid cache clears** - Only clear when troubleshooting
5. **Rate limit awareness** - Initial builds consume API quota

## How Cache Persistence Works

```
┌─────────────────────────────────────────────┐
│  Cloudflare Pages Build Environment         │
├─────────────────────────────────────────────┤
│                                             │
│  1. Restore node_modules/ from cache        │
│     ↓ (includes .cache/unsplash/)           │
│                                             │
│  2. yarn install (updates dependencies)     │
│     ↓ (preserves .cache/unsplash/)          │
│                                             │
│  3. yarn build (reads/writes cache)         │
│     ↓ (updates .cache/unsplash/)            │
│                                             │
│  4. Save node_modules/ to cache             │
│     ↓ (persists for next build)             │
│                                             │
│  5. Deploy output directory                 │
│                                             │
└─────────────────────────────────────────────┘
```

## Cache File Structure

```json
{
  "version": "1.0",
  "entries": {
    "photo-id-1": {
      "timestamp": 1699876543210,
      "data": {
        "location": { "city": "San Francisco", "country": "USA" },
        "exif": { "make": "Canon", "model": "EOS R5", ... },
        "description": "Golden Gate Bridge at sunset",
        "alt_description": "Bridge photo"
      }
    }
  }
}
```

## Support

- **Cloudflare Pages Build Caching**: https://developers.cloudflare.com/pages/platform/build-caching/
- **Cloudflare Pages Builds**: https://developers.cloudflare.com/pages/configuration/build-configuration/
- **Unsplash API Rate Limits**: https://unsplash.com/documentation#rate-limiting
