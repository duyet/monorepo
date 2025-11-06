# @duyet/profile

Centralized profile and identity configuration for the monorepo.

## Philosophy

This package separates **personal identity from infrastructure code**, making the monorepo open-source and forkable:

- **Components become generic** - No hardcoded names, emails, or URLs
- **Personal data is isolated** - All identity in one place
- **Easy customization** - Fork and create your own profile without touching components

## Installation

```bash
# Already included in the monorepo
yarn workspace @duyet/profile install
```

## Usage

### Using the Default Profile

```typescript
import { duyetProfile } from "@duyet/profile";

// Use in your app
export default function Layout() {
  return <Header profile={duyetProfile} />;
}
```

### Creating Your Own Profile

```typescript
import { createProfile, duyetProfile } from "@duyet/profile";

// Start from scratch
const myProfile = createProfile(duyetProfile, {
  personal: {
    name: "Jane Doe",
    shortName: "Jane",
    email: "jane@example.com",
    title: "Frontend Engineer",
    bio: "Building delightful user experiences",
  },
  social: {
    github: "https://github.com/jane",
    twitter: "https://x.com/jane",
    linkedin: "https://linkedin.com/in/jane",
  },
  appearance: {
    theme: {
      primary: "#ff6b6b",
      secondary: "#4ecdc4",
      accent: "#45b7d1",
    },
  },
});
```

### Partial Overrides

You only need to override what you want to change:

```typescript
const myProfile = createProfile(duyetProfile, {
  personal: {
    name: "Jane Doe",
    email: "jane@example.com",
  },
  // Everything else inherits from duyetProfile
});
```

## Profile Structure

```typescript
interface Profile {
  personal: {
    name: string; // Full name
    shortName: string; // Short name (used in header)
    email: string; // Primary email
    title: string; // Professional title
    bio: string; // Short bio
    experience?: string; // Years of experience
    location?: string; // Current location
  };

  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    unsplash?: string;
    tiktok?: string;
    medium?: string;
    devto?: string;
    [key: string]: string | undefined; // Custom links
  };

  appearance: {
    avatar?: string; // Avatar image path
    favicon?: string; // Favicon path
    theme: {
      primary: string; // Primary brand color (hex)
      secondary: string; // Secondary brand color (hex)
      accent: string; // Accent color (hex)
      [key: string]: string; // Custom colors
    };
  };
}
```

## Examples

### Minimal Profile

```typescript
import { createProfile, duyetProfile } from "@duyet/profile";

const minimalProfile = createProfile(duyetProfile, {
  personal: {
    name: "John Smith",
    email: "john@example.com",
  },
});
```

### Complete Custom Profile

```typescript
import type { Profile } from "@duyet/profile";

const customProfile: Profile = {
  personal: {
    name: "Jane Developer",
    shortName: "Jane",
    email: "jane@dev.io",
    title: "Full Stack Engineer",
    bio: "Code, coffee, repeat",
    experience: "8+ years",
    location: "San Francisco, CA",
  },
  social: {
    github: "https://github.com/janedev",
    twitter: "https://x.com/janedev",
    linkedin: "https://linkedin.com/in/janedev",
    devto: "https://dev.to/janedev",
  },
  appearance: {
    avatar: "/images/jane.jpg",
    favicon: "/favicon-jane.ico",
    theme: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#ec4899",
    },
  },
};
```

## Component Integration

Components that accept a `profile` prop will automatically use the profile data:

```typescript
import { duyetProfile } from "@duyet/profile";
import { Header, Footer, Social } from "@duyet/components";

export default function Layout() {
  return (
    <>
      <Header profile={duyetProfile} />
      <main>{children}</main>
      <Footer profile={duyetProfile} />
    </>
  );
}
```

## Best Practices

1. **Create once, use everywhere** - Define your profile in a central location
2. **Use TypeScript** - Get autocomplete and type safety
3. **Document custom fields** - If you add custom social links, document them
4. **Version control** - Keep your profile in git (it's your identity!)

## For Open Source

If you're forking this monorepo:

1. Create your profile: `packages/profile/src/my-profile.ts`
2. Export it from `index.ts`
3. Update app layouts to use your profile
4. Done! All components now use your identity.

**No need to modify component code.**

## License

Private package for the monorepo. See repository LICENSE.
