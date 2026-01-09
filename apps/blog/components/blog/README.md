# Blog Components

This directory contains reusable React components and TypeScript interfaces for the blog application, with a focus on MDX integration and rich content visualization.

## Files

### types.ts
Central TypeScript interface definitions for all blog components:

- **ToolStatus**: 'active' | 'testing' | 'deprecated'
- **ToolCategory**: 'AI Coding' | 'Framework' | 'SDK' | 'Other'
- **Rating**: 1-5 rating scale

#### Main Interfaces:
- `Tool` - Base tool configuration
- `ToolComparisonProps` - Tool comparison component props
- `FeatureMatrixProps` - Feature comparison matrix
- `WakaTimeChartProps` - Time tracking visualization
- `ToolTimelineProps` - Timeline of tool adoption
- `WorkflowDiagramProps` - Workflow visualization
- `VersionDiffProps` - Version comparison display
- `ToolListProps` - Filterable tool list
- `ErrorFallbackProps` - Error boundary fallback UI

### VersionDiff.tsx
Interactive version history viewer with diff highlighting and timeline navigation.

**Features:**
- Interactive timeline slider for version navigation
- Syntax-highlighted diffs (green for additions, red for removals)
- Git-style commit messages with dates
- Automatic "Coming Soon" badge for future versions
- Mobile-responsive design (simplified slider on mobile)
- Full dark mode support
- Change statistics (added/removed/context lines)
- Smooth animations with Framer Motion

**Props:**
- `versions` (Version[]) - Array of version objects
- `onVersionChange?` - Callback when version changes
- `className?` - Custom CSS classes
- `initialIndex?` - Initial version to display (default: last)
- `showMetadata?` - Show version header (default: true)
- `diffHeight?` - Scrollable area height (default: "600px")

**Example:**
```tsx
import { VersionDiff } from '@/components/blog'

const versions = [
  {
    id: 'v1.0.0',
    label: 'v1.0.0',
    message: 'Initial release',
    date: new Date('2024-01-15'),
    diff: '+ Added feature\n- Removed old code'
  }
]

export default function Page() {
  return <VersionDiff versions={versions} />
}
```

## Usage

### Importing Types
```typescript
import type {
  Tool,
  ToolStatus,
  ToolComparisonProps,
  Rating,
} from './types'
```

### Creating a Tool
```typescript
const myTool: Tool = {
  name: 'Claude Code',
  category: 'AI Coding',
  status: 'active',
  rating: 5,
  dateAdded: '2024-01-10',
  notes: 'Excellent for code generation',
}
```

### Using Components in MDX
The components are automatically available in MDX files through the provider:

```mdx
import { Tool, Rating } from '../components/blog/types'

<ToolComparison
  name="Claude vs GPT"
  rating={5}
  pros={['Better reasoning', 'More accurate']}
  cons={['Slower', 'Higher cost']}
  winner
/>
```

## Component Architecture

### Client-Side Rendering
All components use the `'use client'` directive for client-side state management and interactivity.

### Performance Optimization
- Dynamic imports reduce bundle size
- SSR enabled for better SEO
- Memoization prevents unnecessary re-renders
- Code splitting for lazy loading

### Integration with MDX
Components are registered in `/components/mdx-components.tsx` and accessible via the `useMDXComponents` hook.

## Adding New Components

1. Create component file: `components/blog/NewComponent.tsx`
2. Add interfaces to `types.ts`
3. Register in `components/mdx-components.tsx`:
   ```typescript
   const NewComponent = dynamic(() => import('./blog/NewComponent'), { ssr: true })
   export const mdxComponents: MDXComponents = {
     // ...
     NewComponent,
   }
   ```

## Type Safety
All components are fully typed with TypeScript, providing:
- Compile-time type checking
- IntelliSense support
- Self-documenting interfaces
- Reduced runtime errors

## Related Files
- `/components/mdx-components.tsx` - MDX component provider
- `/components/mdx-content.tsx` - MDX content renderer
