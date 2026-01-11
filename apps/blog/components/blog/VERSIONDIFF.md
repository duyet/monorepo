# VersionDiff Component

A production-ready React component for displaying version history with interactive diff highlighting and timeline navigation.

## Overview

The VersionDiff component provides an intuitive interface for exploring version history with syntax-highlighted diffs, git-style metadata, and smooth animations. It's designed for showcasing changelog entries, API versioning, or feature releases in blog posts and documentation.

## Features

### Core Features
- **Interactive Timeline**: Visual slider for navigating between versions
- **Syntax Highlighting**: Color-coded diffs (green for additions, red for removals)
- **Git-Style Metadata**: Commit messages with dates in git format
- **Upcoming Versions**: Automatic "Coming Soon" badge for future releases
- **Responsive Design**: Simplified mobile interface with compact stepper
- **Dark Mode**: Full support for light and dark color schemes
- **Change Statistics**: Summary of added/removed/context lines
- **Smooth Animations**: Framer Motion transitions for visual feedback

### Performance
- **Memoization**: Optimized re-renders with useMemo
- **Lazy Parsing**: Diff lines parsed only when version changes
- **Efficient State**: Minimal state management
- **Bundle Friendly**: Tree-shakeable exports

## Installation

The component is part of the blog components library:

```typescript
import { VersionDiff } from "@/components/blog";
import type { Version } from "@/components/blog";
```

## Props

### VersionDiffProps

```typescript
interface VersionDiffProps {
  // Required
  versions: Version[]

  // Optional
  onVersionChange?: (version: Version, index: number) => void
  className?: string
  initialIndex?: number
  showMetadata?: boolean
  diffHeight?: string
}
```

#### Props Details

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `versions` | `Version[]` | Required | Array of version objects to display |
| `onVersionChange` | `(version, index) => void` | - | Callback fired when version changes |
| `className` | `string` | `""` | Custom CSS classes for root element |
| `initialIndex` | `number` | `versions.length - 1` | Index of version to display initially |
| `showMetadata` | `boolean` | `true` | Show version header with metadata |
| `diffHeight` | `string` | `"600px"` | CSS height for scrollable diff area |

### Version Type

```typescript
interface Version {
  id: string                    // Unique identifier
  label: string                 // Version label (e.g., "v1.0.0")
  message: string               // Commit message or description
  date: Date | string           // Release date
  diff: string                  // Diff content with +/- prefixes
}
```

## Basic Usage

```tsx
import { VersionDiff } from "@/components/blog";
import type { Version } from "@/components/blog";

const versions: Version[] = [
  {
    id: "v1.0.0",
    label: "v1.0.0",
    message: "Initial release with core features",
    date: new Date("2024-01-15"),
    diff: `+ Added authentication
+ Created database schema
+ Implemented API endpoints`,
  },
  {
    id: "v1.1.0",
    label: "v1.1.0",
    message: "Performance improvements",
    date: new Date("2024-02-20"),
    diff: `+ Added caching layer
+ Optimized queries
- Removed deprecated API`,
  },
];

export default function Changelog() {
  return <VersionDiff versions={versions} />;
}
```

## Advanced Usage

### With Callbacks

```tsx
function VersionExplorer() {
  const handleVersionChange = (version: Version, index: number) => {
    console.log(`Viewing version ${index}: ${version.label}`);
    // Track version views, analytics, etc.
  };

  return (
    <VersionDiff
      versions={versions}
      onVersionChange={handleVersionChange}
    />
  );
}
```

### Custom Styling

```tsx
<VersionDiff
  versions={versions}
  className="max-w-4xl mx-auto"
  diffHeight="400px"
/>
```

### Custom Initial Version

```tsx
// Start at version 1 instead of latest
<VersionDiff
  versions={versions}
  initialIndex={0}
/>
```

### Hide Metadata

```tsx
// Show only diff, no header
<VersionDiff
  versions={versions}
  showMetadata={false}
/>
```

## Diff Format

The `diff` property uses a simple line-based format where each line can start with a prefix character:

- `+` - Added line (shown in green)
- `-` - Removed line (shown in red)
- Any other character - Context line (normal styling)

```typescript
const diff = `+ function newFeature() {
+   return true;
+ }
- function oldFeature() {
-   return false;
- }
  // Unchanged line
  const context = true;`;
```

## Styling & Customization

### Color Scheme

The component uses Tailwind CSS with semantic color names:

- **Additions**: Green (green-50/700 background, green-700/300 text)
- **Removals**: Red (red-50/700 background, red-700/300 text)
- **Context**: Neutral (neutral-700/300 text)

### Dark Mode

Full dark mode support via Tailwind's `dark:` prefix:

```tsx
// Automatically adapts to system theme
<VersionDiff versions={versions} />
```

### Custom Height

Control the scrollable area height:

```tsx
// Tall viewport
<VersionDiff versions={versions} diffHeight="800px" />

// Compact view
<VersionDiff versions={versions} diffHeight="300px" />
```

## Responsive Behavior

### Desktop (≥768px)
- Full-width timeline slider with continuous gradient
- Circular buttons for precise version selection
- Previous/Next navigation arrows
- Hover states on slider dots

### Mobile (<768px)
- Horizontal scrolling stepper with pill buttons
- Version labels as clickable tabs
- Optimized touch targets (32px minimum)
- Reduced horizontal space usage

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and structure
- **ARIA Labels**: Navigation buttons have aria-label attributes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus States**: Clear focus indicators for keyboard users
- **Date Time**: Proper `<time>` element with ISO format
- **Color Contrast**: WCAG AA compliant color combinations

## Edge Cases

The component handles various edge cases gracefully:

### Empty Versions
```tsx
<VersionDiff versions={[]} />
// Displays: "No versions available"
```

### Single Version
```tsx
<VersionDiff versions={[version]} />
// Hides timeline slider, shows version directly
```

### Empty Diff
```tsx
const version: Version = {
  id: "empty",
  label: "v1.0.0",
  message: "No changes",
  date: new Date(),
  diff: "",
};
<VersionDiff versions={[version]} />
// Displays: "No changes"
```

### Future Dates
```tsx
const version: Version = {
  id: "v2.0.0",
  label: "v2.0.0",
  message: "Coming soon",
  date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  diff: "+ Upcoming feature",
};
<VersionDiff versions={[version]} />
// Shows "Coming Soon" badge with clock icon
```

## Performance Considerations

### Memoization
Diff parsing and "upcoming" status are memoized to prevent unnecessary recalculations:

```typescript
const diffLines = useMemo(
  () => parseDiffLines(currentVersion.diff),
  [currentVersion.diff]
);

const upcoming = useMemo(
  () => isVersionUpcoming(currentVersion.date),
  [currentVersion.date]
);
```

### Rendering
- Uses `AnimatePresence` with `mode="wait"` to prevent layout shifts
- Only renders current version's diff (not all versions)
- Lazy evaluation of date formatting
- No external dependencies beyond required libraries

### Large Diffs
For very large diffs (1000+ lines), consider:
- Splitting into multiple component instances
- Virtualization libraries (react-window)
- Pagination or filtering

## Internationalization

Date formatting uses the browser's default locale:

```typescript
const dateObj = new Date(date);
const options: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
dateObj.toLocaleDateString("en-US", options);
```

To customize, modify `formatGitDate` function or pass pre-formatted dates.

## Testing

The component includes comprehensive test coverage for:

- Rendering with valid/invalid data
- Diff highlighting and classification
- Timeline navigation and callbacks
- Upcoming version detection
- Edge cases (empty, single, no diff)
- Mobile vs desktop behavior
- Accessibility features

Run tests:

```bash
bun test VersionDiff.test.tsx
```

## Examples

See `VersionDiff.example.tsx` for complete working examples including:
- Basic usage with multiple versions
- Upcoming version handling
- Custom callbacks
- Different configurations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Framer Motion 10+
- Lucide React 0.2+
- Tailwind CSS 3+

## License

Part of the blog application. See repository LICENSE.
