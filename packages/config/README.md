# @duyet/config

Centralized configuration package for all apps in the monorepo.

## Overview

This package provides type-safe, reusable configuration for:

- Application metadata (titles, descriptions, fonts)
- API endpoints and client configurations
- UI constants (periods, navigation, themes)

## Installation

This package is part of the monorepo workspace. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@duyet/config": "*"
  }
}
```

## Usage

### App Configuration

```typescript
import { appConfig, blogConfig, insightsConfig } from "@duyet/config";

// Use app URLs
const blogUrl = appConfig.urls.blog;

// Use blog metadata
export const metadata = blogConfig.metadata;

// Use font configuration
const fontConfig = blogConfig.fonts.inter;
```

### API Configuration

```typescript
import { apiConfig, githubConfig, wakatimeConfig } from "@duyet/config";

// Use GitHub API configuration
const response = await fetch(
  `${githubConfig.baseUrl}${githubConfig.endpoints.searchRepositories}`,
  {
    headers: githubConfig.headers,
    next: { revalidate: githubConfig.cache.revalidate },
  },
);

// Use helper functions
import {
  getWakaTimeRange,
  getWakaTimeRangeForElapsedDays,
  calculateBackoffDelay,
} from "@duyet/config";
const range = getWakaTimeRange(30); // 'last_30_days'
getWakaTimeRange("all"); // 'all_time' — unbounded, the period switcher's "All time"
getWakaTimeRangeForElapsedDays(400); // 'all_time' — rounds up to cover the window
const delay = calculateBackoffDelay(2); // exponential backoff
```

### WakaTime range mapping

There is exactly one implementation of "days → `range`", in
`@duyet/config/api`, and it has two entry points because there are two distinct
inputs:

- `getWakaTimeRange(days)` — a value a reader picked in the period switcher
  (`PERIODS` in this package, mirrored by `apps/insights/lib/periods.ts`).
  Exact-key lookup against `wakatimeConfig.rangeMapping`; `"all"` is the
  unbounded `all_time`. Every user-facing `?range=` goes through this, so
  `/users/current/stats/{range}` and `/users/current/insights?range=` can never
  disagree about the window a selection means.
- `getWakaTimeRangeForElapsedDays(days)` — an arbitrary day count, e.g. a
  data-sync backfill window. A threshold ladder that rounds *up* to the smallest
  range containing the window, because an under-covering range silently drops
  rows. It has no `"all"` input; pass a large day count instead.

### UI Configuration

```typescript
import {
  uiConfig,
  PERIODS,
  getPeriodDays,
  insightsNavigation,
} from "@duyet/config";

// Use period configuration
const periods = PERIODS;
const days = getPeriodDays("30"); // 30

// Use navigation
const navItems = insightsNavigation;

// Use theme configuration
const theme = uiConfig.theme.default;
```

## Structure

```
packages/config/
├── src/
│   ├── app.config.ts    # App metadata, URLs, fonts
│   ├── api.config.ts    # API endpoints, retry, cache
│   ├── ui.config.ts     # UI constants, navigation
│   └── index.ts         # Barrel exports
├── package.json
├── tsconfig.json
└── README.md
```

## Benefits

1. **Single Source of Truth**: All configuration in one place
2. **Type Safety**: Full TypeScript support with interfaces
3. **Reusability**: Share configuration across all apps
4. **Maintainability**: Update once, apply everywhere
5. **Testability**: Easy to mock in tests

## Development

```bash
# Type checking
yarn check-types

# Linting
yarn lint
```

## Migration Guide

### Before (hardcoded)

```typescript
// apps/insights/app/github/page.tsx
const response = await fetch("https://api.github.com/search/repositories", {
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  },
  next: { revalidate: 3600 },
});
```

### After (using config)

```typescript
// apps/insights/app/github/page.tsx
import { githubConfig } from "@duyet/config";

const response = await fetch(
  `${githubConfig.baseUrl}${githubConfig.endpoints.searchRepositories}`,
  {
    headers: {
      ...githubConfig.headers,
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: githubConfig.cache.revalidate },
  },
);
```

## Contributing

When adding new configuration:

1. Choose the appropriate config file (app, api, or ui)
2. Add TypeScript interfaces for type safety
3. Export from the main config object
4. Update this README with usage examples
5. Add tests for any helper functions
