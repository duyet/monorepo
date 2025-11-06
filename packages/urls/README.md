# @duyet/urls

Unified URL and navigation configuration for the monorepo.

## Problem Statement

Previously, URLs were defined in **5+ different places**:
- `packages/config/app.config.ts`
- `packages/components/Footer.tsx`
- `packages/components/Menu.tsx`
- `apps/home/app/config/urls.ts`
- Inline in various page components

This package provides a **single source of truth** for all URLs and navigation.

## Installation

```bash
# Already included in the monorepo
yarn workspace @duyet/urls install
```

## Usage

### Basic URL Access

```typescript
import { duyetUrls } from "@duyet/urls";

// Access app URLs
const blogUrl = duyetUrls.apps.blog;
const homeUrl = duyetUrls.apps.home;

// Access external URLs
const rustUrl = duyetUrls.external.rust;
```

### Creating Navigation

```typescript
import { duyetUrls, createNavigation } from "@duyet/urls";
import { duyetProfile } from "@duyet/profile";

// Generate navigation from URLs and profile
const navigation = createNavigation(duyetUrls, duyetProfile);

// Use in components
<Menu navigation={navigation.main} />
<Footer
  mainNav={navigation.main}
  socialNav={navigation.social}
  generalNav={navigation.general}
/>
```

### Custom URLs

```typescript
import { createUrls, duyetUrls } from "@duyet/urls";

// Override specific URLs
const myUrls = createUrls(duyetUrls, {
  apps: {
    blog: "https://myblog.com",
    home: "https://mysite.com",
  },
  external: {
    customLink: "https://example.com",
  },
});
```

### Environment Variables

URLs automatically respect environment variables:

```bash
# .env or .env.local
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_HOME_URL=https://duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
NEXT_PUBLIC_DUYET_INSIGHTS_URL=https://insights.duyet.net
NEXT_PUBLIC_DUYET_PHOTOS_URL=https://photos.duyet.net
NEXT_PUBLIC_DUYET_HOMELAB_URL=https://homelab.duyet.net
```

Or use generic names:

```bash
NEXT_PUBLIC_APP_BLOG=https://myblog.com
NEXT_PUBLIC_APP_HOME=https://mysite.com
```

## Types

### UrlsConfig

```typescript
interface UrlsConfig {
  apps: {
    blog: string;
    cv: string;
    insights: string;
    home: string;
    photos: string;
    homelab: string;
  };
  external: {
    rust?: string;
    clickhouse?: string;
    mcp?: string;
    [key: string]: string | undefined;
  };
}
```

### Navigation

```typescript
interface Navigation {
  main: NavLink[];      // Main app navigation
  profile: NavLink[];   // Profile/About links
  social: NavLink[];    // Social media links
  general?: NavLink[];  // General/External links
}

interface NavLink {
  name: string;         // Display name
  href: string;         // URL
  description?: string; // Optional description
  icon?: string;        // Optional icon identifier
  external?: boolean;   // Open in new tab
}
```

## API Reference

### `createUrls(base, overrides)`

Create a custom URLs configuration by merging overrides with a base.

```typescript
const myUrls = createUrls(duyetUrls, {
  apps: {
    blog: "https://custom.blog",
  },
});
```

### `createNavigation(urls, profile)`

Generate navigation structure from URLs and profile.

```typescript
import { duyetUrls, createNavigation } from "@duyet/urls";
import { duyetProfile } from "@duyet/profile";

const nav = createNavigation(duyetUrls, duyetProfile);
```

Returns:
- `nav.main` - Main application links (Blog, CV, Insights, etc.)
- `nav.profile` - Profile links (About, Contact)
- `nav.social` - Social media links (GitHub, Twitter, LinkedIn)
- `nav.general` - General/External links (Rust, ClickHouse, etc.)

### `getAppUrls(urls)`

Get all app URLs as a flat object.

```typescript
const appUrls = getAppUrls(duyetUrls);
// { blog: "...", cv: "...", insights: "...", ... }
```

### `getAppUrl(urls, app)`

Get URL for a specific app.

```typescript
const blogUrl = getAppUrl(duyetUrls, "blog");
```

## Migration Guide

### Before (Hardcoded)

```typescript
// Menu.tsx
const BLOG_URL = process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";
const CV_URL = process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net";

const navigation = [
  { name: "Blog", href: BLOG_URL },
  { name: "CV", href: CV_URL },
];
```

### After (Centralized)

```typescript
// Menu.tsx
import { duyetUrls, createNavigation } from "@duyet/urls";
import { duyetProfile } from "@duyet/profile";

const navigation = createNavigation(duyetUrls, duyetProfile);
// Use navigation.main
```

## Component Integration

### Header Component

```typescript
import { duyetUrls } from "@duyet/urls";

export default function Header() {
  return (
    <header>
      <Link href={duyetUrls.apps.home}>
        <Logo />
      </Link>
    </header>
  );
}
```

### Footer Component

```typescript
import { duyetUrls, createNavigation } from "@duyet/urls";
import { duyetProfile } from "@duyet/profile";

export default function Footer() {
  const nav = createNavigation(duyetUrls, duyetProfile);

  return (
    <footer>
      <nav>
        {nav.main.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.name}
          </Link>
        ))}
      </nav>
      <nav>
        {nav.social.map((link) => (
          <a key={link.href} href={link.href} target="_blank">
            {link.name}
          </a>
        ))}
      </nav>
    </footer>
  );
}
```

## Benefits

1. **Single Source of Truth** - URLs defined once, used everywhere
2. **Type Safety** - TypeScript ensures correct URL usage
3. **Environment Aware** - Respects environment variables with fallbacks
4. **Navigation Generation** - Automatically creates navigation from URLs and profile
5. **Easy Customization** - Override URLs without modifying components
6. **DRY Principle** - No more duplicate URL definitions

## License

Private package for the monorepo. See repository LICENSE.
