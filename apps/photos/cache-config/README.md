# Unsplash API Cache Configuration

This directory contains configuration examples for persisting the Unsplash API cache across CI/CD builds on different platforms.

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

## Cache Directory

The app stores cache in: `.cache/unsplash/photos.json`

**This directory must persist between builds** using your CI/CD platform's cache mechanism.

## Platform-Specific Setup

Choose your platform:

### 🔷 Cloudflare Pages

Create `.github/workflows/cloudflare-pages.yml` or add to your existing workflow:

```yaml
name: Cloudflare Pages
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Restore cache from previous build
      - name: Cache Unsplash API responses
        uses: actions/cache@v3
        with:
          path: .cache
          key: unsplash-cache-${{ hashFiles('apps/photos/package.json') }}
          restore-keys: |
            unsplash-cache-

      - name: Build
        run: yarn build

      - name: Deploy to Cloudflare Pages
        # ... your deployment steps
```

### ▲ Vercel

Create `vercel.json` in your project root:

```json
{
  "cacheDirectories": [
    ".cache"
  ],
  "buildCommand": "yarn build"
}
```

Or add to existing `vercel.json`:

```json
{
  "cacheDirectories": [
    ".cache",
    "node_modules",
    ".next"
  ]
}
```

Vercel will automatically persist `.cache` between builds.

### 🟢 Netlify

Create `netlify.toml` in your project root:

```toml
[build]
  command = "yarn build"
  publish = "apps/photos/out"

[build.environment]
  # Cache the .cache directory

[[plugins]]
  package = "netlify-plugin-cache"

  [plugins.inputs]
    paths = [".cache"]
```

Or use the Netlify Cache plugin:

```bash
npm install netlify-plugin-cache
```

### 🐙 GitHub Actions

Add to your `.github/workflows/*.yml`:

```yaml
name: Build and Deploy
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      # Cache Unsplash API responses
      - name: Cache Unsplash data
        uses: actions/cache@v3
        with:
          path: |
            .cache
            node_modules
            .next
          key: ${{ runner.os }}-unsplash-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-unsplash-

      - name: Install dependencies
        run: yarn install

      - name: Build
        run: yarn build
```

### 🦊 GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
build:
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - .cache/
      - node_modules/
      - .next/
  script:
    - yarn install
    - yarn build
  artifacts:
    paths:
      - apps/photos/out/
```

### 🔵 Azure Pipelines

Add to `azure-pipelines.yml`:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'

  - task: Cache@2
    inputs:
      key: 'unsplash | "$(Agent.OS)" | apps/photos/package.json'
      restoreKeys: |
        unsplash | "$(Agent.OS)"
      path: .cache
    displayName: 'Cache Unsplash API responses'

  - script: yarn install
    displayName: 'Install dependencies'

  - script: yarn build
    displayName: 'Build'
```

## Verification

To verify cache is working, check your build logs:

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

## Cache Details

- **Location**: `.cache/unsplash/photos.json`
- **Size**: ~100-200KB for 90 photos
- **TTL**: 7 days (auto-expires old entries)
- **Format**: JSON

## Troubleshooting

### Cache not persisting

1. **Check logs** - Look for "Cache contains X valid entries"
2. **Verify path** - Ensure CI/CD caches `.cache` directory
3. **Check permissions** - Build process needs write access
4. **Review platform docs** - Each platform has specific cache requirements

### Still hitting rate limits

1. **Multiple projects** - Each Unsplash app counts toward same limit
2. **Cache cleared** - CI/CD may have cleared cache (check settings)
3. **Cache expired** - Entries older than 7 days are refetched

### Cache not loading

Check build logs for:
```
Failed to load cache: [error message]
```

Common causes:
- **Corrupt cache file** - Delete `.cache` and rebuild
- **Permission issues** - Ensure read/write access
- **Path mismatch** - Verify `CACHE_DIR` in `lib/cache.ts`

## Manual Cache Management

### View cache contents

```bash
cat .cache/unsplash/photos.json | jq
```

### Clear cache

```bash
rm -rf .cache/unsplash
```

### Check cache size

```bash
du -sh .cache/unsplash
```

### Force refresh (specific photo)

Edit `.cache/unsplash/photos.json` and remove the entry, or set `timestamp` to 0.

## Best Practices

1. **Always configure caching** - Don't rely on default behavior
2. **Monitor cache hits** - Check build logs for cache effectiveness
3. **Use cache keys wisely** - Include relevant file hashes
4. **Set appropriate TTL** - 7 days balances freshness and API usage
5. **Version your cache** - Include package.json hash in cache key

## Support

Platform-specific caching issues? Check these resources:

- **Cloudflare Pages**: https://developers.cloudflare.com/pages/platform/build-caching/
- **Vercel**: https://vercel.com/docs/concepts/projects/overview#cache
- **Netlify**: https://docs.netlify.com/configure-builds/file-based-configuration/#cache
- **GitHub Actions**: https://docs.github.com/en/actions/using-workflows/caching-dependencies
- **GitLab CI**: https://docs.gitlab.com/ee/ci/caching/
- **Azure Pipelines**: https://docs.microsoft.com/en-us/azure/devops/pipelines/release/caching
