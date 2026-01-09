# FeatureMatrix Component

A responsive, sortable comparison table component with accessibility features and dark mode support.

## Features

✅ **Responsive Design**: Horizontal scrolling on mobile (<640px) with sticky feature column
✅ **Sortable Columns**: Click column headers to sort by rating (asc → desc → none)
✅ **Accessibility**: 
  - WCAG 2.1 AA compliant
  - Color-coded AND shape-coded ratings for colorblind users
  - Full ARIA labels and semantic HTML
  - Keyboard navigable

✅ **Visual Indicators**:
  - 5-point rating scale with unique shapes
  - Trophy icon shows highest scorer per row
  - Hover tooltips with explanations
  - Color-blind friendly shapes (●◕◑◔○—)

✅ **Dark Mode**: Full Tailwind dark mode support
✅ **Client Component**: Uses React hooks for interactivity

## Installation

The component is part of the blog app at:
```
/apps/blog/components/blog/FeatureMatrix.tsx
```

## Usage

### Basic Example

```tsx
import { FeatureMatrix } from '@/components/blog/FeatureMatrix'
import type { FeatureRow } from '@/components/blog/types'

export function MyComparison() {
  const tools = ['Tool A', 'Tool B', 'Tool C']
  
  const features: FeatureRow[] = [
    {
      featureName: 'Performance',
      scores: [
        { toolName: 'Tool A', score: 5, explanation: 'Fastest option' },
        { toolName: 'Tool B', score: 3 },
        { toolName: 'Tool C', score: 4 },
      ],
    },
  ]

  return (
    <FeatureMatrix
      tools={tools}
      features={features}
      title="Tool Comparison"
      description="Compare these tools across key metrics"
    />
  )
}
```

## Component Props

```typescript
interface FeatureMatrixProps {
  /** Array of tool names (columns) */
  tools: string[]
  
  /** Array of features with their scores for each tool */
  features: FeatureRow[]
  
  /** Optional class name for the wrapper */
  className?: string
  
  /** Optional title for the matrix */
  title?: string
  
  /** Optional description text */
  description?: string
  
  /** Whether to show explanations on hover (default: true) */
  showTooltips?: boolean
}

interface FeatureRow {
  featureName: string
  scores: ToolScore[]
}

interface ToolScore {
  toolName: string
  score: 0 | 1 | 2 | 3 | 4 | 5 | null
  explanation?: string
}
```

## Rating Scale

| Rating | Shape | Color | Label |
|--------|-------|-------|-------|
| 5 | ● | Emerald | Excellent |
| 4 | ◕ | Green | Very Good |
| 3 | ◑ | Yellow | Good |
| 2 | ◔ | Orange | Fair |
| 1 | ○ | Red | Poor |
| 0/null | — | Gray | Not Available |

## Features

### Sorting
- Click any column header to sort by that tool's ratings
- Cycle through: ascending → descending → unsorted
- Sorting is local state only (not persisted)
- Visual indicator (arrow icon) shows sort status

### Accessibility
- WCAG 2.1 AA compliant
- Both color AND shape differentiate ratings (colorblind safe)
- Full ARIA labels on all interactive elements
- Semantic HTML (table, thead, tbody, th, td)
- Keyboard navigable (tab through headers, click to sort)

### Mobile Responsiveness
- Horizontal scroll on screens <640px
- Sticky feature name column during horizontal scroll
- Touch-friendly tap targets
- Legend adapts to grid layout on different screen sizes

### Tooltips
- Hover over ratings to see detailed explanations
- Disabled if `showTooltips={false}`
- Dark/light mode aware
- Feature rows show help icon (?) if they have explanations

### Winner Indicator
- Trophy icon (🏆) appears in the highest-rated cell per row
- Ties show trophy only in first matching cell
- Visual indication of best performer per feature

## Styling

The component uses Tailwind CSS utility classes and respects:
- Dark mode via `dark:` prefix
- Project's color palette
- Responsive breakpoints (`sm:`, `md:`, etc.)
- Semantic color tokens (`bg-gray-50`, `text-foreground`, etc.)

## Examples

### With Tooltips

```tsx
<FeatureMatrix
  tools={['React', 'Vue', 'Svelte']}
  features={[
    {
      featureName: 'Bundle Size',
      scores: [
        { 
          toolName: 'React', 
          score: 3,
          explanation: 'Medium size at ~40kb gzipped'
        },
        { 
          toolName: 'Vue', 
          score: 4,
          explanation: 'Small at ~34kb gzipped'
        },
        { 
          toolName: 'Svelte', 
          score: 5,
          explanation: 'Very small, ~3-8kb per component'
        },
      ],
    },
  ]}
  showTooltips={true}
/>
```

### With Missing Data

```tsx
const features: FeatureRow[] = [
  {
    featureName: 'Feature',
    scores: [
      { toolName: 'A', score: 5 },
      { toolName: 'B', score: null }, // Not applicable
      { toolName: 'C', score: 0 },    // Not available
    ],
  },
]
```

## Type Definitions

All types are exported from `@/components/blog/types`:

```typescript
export type FeatureMatrixRating = 0 | 1 | 2 | 3 | 4 | 5

export interface ToolScore {
  toolName: string
  score: FeatureMatrixRating | null
  explanation?: string
}

export interface FeatureRow {
  featureName: string
  scores: ToolScore[]
}

export interface FeatureMatrixProps { ... }

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  columnIndex: number | null
  direction: SortDirection
}
```

## Accessibility Considerations

- **Color & Shapes**: Ratings use both color AND Unicode shapes to ensure colorblind accessibility
- **ARIA Labels**: All interactive elements have proper aria-labels
- **Semantic HTML**: Uses proper table structure with thead/tbody
- **Keyboard Navigation**: Fully keyboard navigable
- **Focus Indicators**: Built-in focus styles via Tailwind
- **Screen Reader Support**: Proper roles and labels for screen readers

## Performance Notes

- Uses `useMemo` for sorting to prevent unnecessary recalculations
- Client-side component - sorting happens locally
- No external API calls
- Inline styles avoided, using Tailwind CSS only

## Browser Support

- All modern browsers supporting:
  - ES2020+ JavaScript
  - CSS Grid and Flexbox
  - CSS Custom Properties (dark mode)
  - React 16.8+ (hooks)

## Dark Mode

Component automatically adapts to dark mode:
- Uses `dark:` prefixed classes
- Respects `prefers-color-scheme`
- Parent container must have `[data-theme="dark"]` or include dark class

## Example Integration

```tsx
// /apps/blog/app/my-page.tsx
import { FeatureMatrix } from '@/components/blog/FeatureMatrix'

export default function MyPage() {
  const data = {
    tools: ['Option A', 'Option B', 'Option C'],
    features: [
      /* ... */
    ]
  }

  return (
    <main className="container mx-auto py-12">
      <h1>Detailed Comparison</h1>
      <FeatureMatrix {...data} />
    </main>
  )
}
```

## Related Components

- `ToolComparison` - Card-based tool comparison
- `ToolList` - Filterable list of tools
- `ToolTimeline` - Timeline view of tool adoption

## Notes

- Sorting is not persisted (resets on page reload)
- No pagination - ensure feature list is reasonable length
- Column order follows `tools` array order
- Missing scores display as "-" (dash)
