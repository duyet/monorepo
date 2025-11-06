# Unsplash Photo Cache

This directory contains cached photo metadata from the Unsplash API.

## Why is this committed to git?

This cache is **intentionally committed** to the repository to persist across CI/CD builds on platforms like Cloudflare Pages, Vercel, and GitHub Actions.

Without this cache:
- Every build would make 50+ API calls to Unsplash
- Builds would hit Unsplash's rate limit (50 requests/hour)
- Builds would take 60+ seconds for photo enrichment
- Multiple builds per hour would fail due to rate limits

With this cache:
- Subsequent builds make 0-5 API calls (only for new photos)
- Builds complete in seconds
- No risk of hitting rate limits
- Works on any CI/CD platform

## Cache Details

**File:** `photos.json`

**Structure:**
```json
{
  "version": "1.0",
  "entries": {
    "photoId": {
      "photoId": "abc123",
      "timestamp": 1234567890000,
      "data": {
        "exif": { "make": "Canon", ... },
        "location": { "city": "Montreal", ... },
        "description": "...",
        "alt_description": "..."
      }
    }
  }
}
```

**Size:** ~100-200KB for 90 photos

**TTL (Time-To-Live):** 7 days
- Entries expire after 7 days
- Expired entries are automatically cleaned on each build
- Fresh data is fetched for expired photos

## Auto-Update

This cache is **automatically updated** during builds when:
- New photos are detected
- Cached entries expire (>7 days old)
- EXIF or location data is missing

The build process will commit and push cache updates.

## Manual Maintenance

You typically don't need to touch this directory. However, to force a full refresh:

```bash
# Delete the cache file
rm unsplash-cache/photos.json

# Run a build (cache will be recreated)
yarn build
```

## Technical Details

**Cache Management:**
- Managed by: `apps/photos/lib/cache.ts`
- Used by: `apps/photos/lib/unsplash.ts`
- Format: JSON with versioning
- Validation: Checks version and structure on load

**Build Impact:**
- First build: Fetches all photo data (~90 API calls)
- Subsequent builds: Uses cache (~0 API calls)
- New photos: Fetches only new data (~1-5 API calls)

## Why Not Use External Storage?

We chose git-committed cache over KV stores, Redis, or S3 because:
1. **Platform agnostic** - Works on any CI/CD platform
2. **No extra setup** - No API keys or service configuration needed
3. **Version controlled** - Cache changes are tracked
4. **Zero cost** - No external service fees
5. **Simple** - Easy to debug and understand

The cache file is small (~100KB) and rarely changes, so git handles it efficiently.
