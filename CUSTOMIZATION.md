# Customization Guide

This monorepo is designed to be **open-source and forkable**. Anyone can clone it and customize it for their own use without modifying component code.

## Philosophy: Identity as Data, Not Code

Previously, personal information (name, email, social links, URLs) was hardcoded throughout the codebase. This made the monorepo Duyet-specific and difficult to reuse.

**The Solution**: We separated identity from infrastructure:
- **Components are generic** - No hardcoded personal data
- **Configuration is centralized** - All identity in `@duyet/profile` and `@duyet/urls`
- **Customization is simple** - Change config, not components

## Quick Start: Create Your Own Site

### 1. Fork and Clone

```bash
git clone https://github.com/duyet/monorepo my-awesome-site
cd my-awesome-site
yarn install
```

### 2. Create Your Profile

Create a new profile file:

```typescript
// packages/profile/src/my-profile.ts
import type { Profile } from './index'

export const myProfile: Profile = {
  personal: {
    name: "Jane Doe",
    shortName: "Jane",
    email: "jane@example.com",
    title: "Full Stack Engineer",
    bio: "Building delightful web experiences",
    experience: "8+ years",
    location: "San Francisco, CA"
  },

  social: {
    github: "https://github.com/jane",
    twitter: "https://x.com/jane",
    linkedin: "https://linkedin.com/in/jane",
    // Add more social links as needed
  },

  appearance: {
    theme: {
      primary: "#6366f1",    // Indigo
      secondary: "#8b5cf6",  // Purple
      accent: "#ec4899"      // Pink
    }
  }
}
```

Export it from the index:

```typescript
// packages/profile/src/index.ts
// ... existing code ...

// Add your profile
export { myProfile } from './my-profile'
```

### 3. Configure Your URLs

Create custom URLs (optional):

```typescript
// packages/urls/src/my-urls.ts
import { createUrls, duyetUrls } from './index'

export const myUrls = createUrls(duyetUrls, {
  apps: {
    blog: "https://blog.jane.dev",
    home: "https://jane.dev",
    cv: "https://cv.jane.dev",
    insights: "https://insights.jane.dev",
    photos: "https://photos.jane.dev",
    homelab: "https://homelab.jane.dev"
  }
})
```

Or use environment variables:

```bash
# .env.local
NEXT_PUBLIC_APP_BLOG=https://blog.jane.dev
NEXT_PUBLIC_APP_HOME=https://jane.dev
NEXT_PUBLIC_APP_CV=https://cv.jane.dev
NEXT_PUBLIC_APP_INSIGHTS=https://insights.jane.dev
NEXT_PUBLIC_APP_PHOTOS=https://photos.jane.dev
NEXT_PUBLIC_APP_HOMELAB=https://homelab.jane.dev
```

### 4. Update App Layouts

Update each app's root layout to use your profile:

```typescript
// apps/blog/app/layout.tsx
import { myProfile } from '@duyet/profile/my-profile'  // Your profile
import { duyetUrls } from '@duyet/urls'  // Or myUrls
import { Header, Footer } from '@duyet/components'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header profile={myProfile} urls={duyetUrls} />
        {children}
        <Footer profile={myProfile} urls={duyetUrls} />
      </body>
    </html>
  )
}
```

Repeat for:
- `apps/blog/app/layout.tsx`
- `apps/home/app/layout.tsx`
- `apps/cv/app/layout.tsx`
- `apps/insights/app/layout.tsx`
- `apps/photos/app/layout.tsx`
- `apps/homelab/app/layout.tsx`

### 5. Customize Colors (Optional)

Update your profile's theme colors, which will be available as CSS variables:

```typescript
// In your profile
appearance: {
  theme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#ec4899"
  }
}
```

These colors are automatically available as:
- Tailwind classes: `bg-brand-primary`, `text-brand-secondary`, etc.
- CSS variables: `var(--brand-primary)`, `var(--brand-secondary)`, etc.

You can also use the Claude color palette:
- `bg-claude-peach`
- `bg-claude-mint`
- `bg-claude-lavender`
- `bg-claude-coral`
- `bg-claude-yellow`
- `bg-claude-sky`

### 6. Deploy!

```bash
yarn build
# Deploy to Vercel, Netlify, etc.
```

## Architecture Overview

### Package Structure

```
packages/
├── profile/          # 🆕 Identity configuration
│   ├── src/
│   │   ├── index.ts           # Profile types & utilities
│   │   └── duyet.profile.ts   # Default profile (example)
│   └── README.md
├── urls/             # 🆕 URL & navigation configuration
│   ├── src/
│   │   └── index.ts           # URL management & navigation
│   └── README.md
├── components/       # 🔄 Refactored - now config-aware
│   ├── Header.tsx             # Accepts profile & URLs
│   ├── Footer.tsx             # Accepts profile & URLs
│   ├── Menu.tsx               # Accepts URLs
│   ├── Social.tsx             # Accepts profile
│   └── ...
├── tailwind-config/  # 🔄 Updated with design system
│   ├── colors.js              # Centralized color palette
│   └── tailwind.config.mjs
└── ...
```

### How Components Work Now

**Before** (Hardcoded):
```tsx
// Header.tsx
export default function Header() {
  return <h1>Duyệt</h1>  // ❌ Hardcoded
}
```

**After** (Configurable):
```tsx
// Header.tsx
import { duyetProfile } from '@duyet/profile'

export default function Header({
  profile = duyetProfile  // ✅ Configurable with defaults
}) {
  return <h1>{profile.personal.shortName}</h1>
}
```

## What Changed?

### Created Packages

1. **`@duyet/profile`** - Centralized identity
   - Personal info (name, email, title, bio)
   - Social links (GitHub, Twitter, LinkedIn, etc.)
   - Appearance (colors, avatar, favicon)

2. **`@duyet/urls`** - Centralized URLs
   - App URLs (blog, cv, insights, photos, etc.)
   - External URLs (Rust resources, projects, etc.)
   - Navigation generation

### Refactored Components

All components now accept `profile` and `urls` props:

| Component | What Changed |
|-----------|--------------|
| **Header** | Accepts `profile` for name/title, `urls` for home link |
| **Footer** | Accepts `profile` for email/social, `urls` for all links |
| **Menu** | Accepts `urls` to generate navigation |
| **Social** | Accepts `profile.social` to display icons |

### Added Design System

- **Colors centralized** in `packages/tailwind-config/colors.js`
- **Claude palette**: peach, mint, lavender, coral, yellow, sky
- **Brand colors**: primary, secondary, accent (from profile theme)

## Examples

### Minimal Customization

Just change the name and email:

```typescript
import { createProfile, duyetProfile } from '@duyet/profile'

export const myProfile = createProfile(duyetProfile, {
  personal: {
    name: "John Smith",
    email: "john@example.com"
  }
})
```

Everything else (social links, colors, etc.) inherits from `duyetProfile`.

### Complete Customization

Override everything:

```typescript
export const myProfile: Profile = {
  personal: {
    name: "Jane Developer",
    shortName: "Jane",
    email: "jane@dev.io",
    title: "Full Stack Engineer",
    bio: "Code, coffee, repeat",
    experience: "8+ years",
    location: "SF"
  },
  social: {
    github: "https://github.com/jane",
    twitter: "https://x.com/jane",
    linkedin: "https://linkedin.com/in/jane"
  },
  appearance: {
    theme: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899"
    }
  }
}
```

### Brand-Specific Colors

Use your own color scheme:

```typescript
appearance: {
  theme: {
    primary: "#1DB954",    // Spotify green
    secondary: "#191414",  // Spotify black
    accent: "#1DB954"
  }
}
```

## Benefits

✅ **No Component Modification** - Change config, not code
✅ **Type-Safe** - Full TypeScript support
✅ **Environment-Aware** - Respects `.env` variables
✅ **DRY** - Single source of truth for URLs and identity
✅ **Truly Open Source** - Fork and customize easily

## Migration from Old Code

If you're updating existing apps to use the new configuration:

### Before

```tsx
// Hardcoded everywhere
const BLOG_URL = "https://blog.duyet.net"
const name = "Duyệt"
<h1>{name}</h1>
<a href={BLOG_URL}>Blog</a>
```

### After

```tsx
import { duyetProfile } from '@duyet/profile'
import { duyetUrls } from '@duyet/urls'

<h1>{duyetProfile.personal.shortName}</h1>
<a href={duyetUrls.apps.blog}>Blog</a>
```

## FAQ

**Q: Do I need to modify components to customize the site?**
A: No! Just create your profile and update the app layouts.

**Q: Can I use my own color scheme?**
A: Yes! Set `appearance.theme` in your profile.

**Q: What if I want to add a new social link?**
A: Add it to `profile.social` and the Social component will automatically display it.

**Q: Can I use different profiles for different apps?**
A: Yes! Each app can use a different profile if needed.

**Q: How do I add custom navigation items?**
A: Pass `navigationItems` prop to Menu component, or use `createNavigation()` from `@duyet/urls`.

## Contributing

Found a hardcoded value we missed? Open a PR! Our goal is 100% configurability.

## License

MIT - Feel free to fork and customize!

---

