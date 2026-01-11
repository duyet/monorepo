# VersionDiff Component - Quick Start Guide

## Location

All files are in: `/Users/duet/project/monorepo/apps/blog/components/blog/`

## Files Created

- **VersionDiff.tsx** (364 lines) - Main component
- **types.ts** (207 lines) - Type definitions (updated)
- **index.ts** - Barrel export
- **VersionDiff.example.tsx** - Usage examples
- **VERSIONDIFF.md** - Full documentation

## Basic Usage

```tsx
import { VersionDiff } from '@/components/blog'
import type { Version } from '@/components/blog'

const versions: Version[] = [
  {
    id: 'v1.0.0',
    label: 'v1.0.0',
    message: 'Initial release',
    date: new Date('2024-01-15'),
    diff: `+ Added feature
+ Another feature
- Removed old code`,
  },
  {
    id: 'v2.0.0',
    label: 'v2.0.0',
    message: 'Major update',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Future
    diff: `+ New architecture
- Legacy support`,
  },
]

export default function Page() {
  return <VersionDiff versions={versions} />
}
```

## Features

- Interactive timeline slider (mobile-friendly)
- Git-style metadata with dates
- Syntax-highlighted diffs (green/red)
- Automatic "Coming Soon" badge for future versions
- Full dark mode support
- Change statistics
- Smooth Framer Motion animations

## Props

```typescript
<VersionDiff
  versions={versions}                    // Required
  onVersionChange={(v, i) => {}}         // Optional callback
  className="max-w-4xl mx-auto"          // Optional styling
  initialIndex={0}                       // Optional initial version
  showMetadata={true}                    // Optional (default: true)
  diffHeight="600px"                     // Optional (default: "600px")
/>
```

## Type Definitions

```typescript
interface Version {
  id: string                  // Unique ID
  label: string              // Version label (e.g., "v1.0.0")
  message: string            // Commit message
  date: Date | string        // Release date
  diff: string               // Diff with + and - prefixes
}

interface VersionDiffProps {
  versions: Version[]
  onVersionChange?: (version: Version, index: number) => void
  className?: string
  initialIndex?: number
  showMetadata?: boolean
  diffHeight?: string
}
```

## Diff Format

Use + and - prefixes in your diff string:

```
+ Lines starting with + appear in green (added)
- Lines starting with - appear in red (removed)
  Lines without prefix appear in normal color (context)
```

## Features

- **Desktop**: Full-width continuous slider with dots
- **Mobile**: Horizontal scrolling stepper with pills
- **Dark Mode**: Automatic via Tailwind `dark:` prefix
- **Accessibility**: Semantic HTML, ARIA labels, keyboard nav
- **Performance**: Memoized parsing, efficient re-renders

## MDX Integration

The component is already registered in `mdx-components.tsx` and ready to use in MDX blog posts.

## Documentation

See `/Users/duet/project/monorepo/apps/blog/components/blog/VERSIONDIFF.md` for:
- Complete API reference
- Advanced usage examples
- Edge case handling
- Accessibility features
- Performance considerations

## Code Quality

- TypeScript: Strict mode compliant
- Linting: Biome (PASS)
- Formatting: Prettier (applied)
- No external dependencies (uses existing project deps)

## Next Steps

1. Copy the versions data structure to your component
2. Import VersionDiff from `@/components/blog`
3. Pass your versions array
4. Optionally handle `onVersionChange` callback

That's it! The component handles everything else (timeline, diffs, dark mode, mobile responsiveness, etc.)
