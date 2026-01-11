# FeatureMatrix Code Snippets

## Component Import

```tsx
import { FeatureMatrix } from '@/components/blog'
import type { FeatureMatrixProps, FeatureRow, ToolScore } from '@/components/blog/types'
```

## Basic Usage

```tsx
export function MyComparison() {
  const tools = ['React', 'Vue', 'Angular']
  
  const features: FeatureRow[] = [
    {
      featureName: 'Performance',
      scores: [
        { toolName: 'React', score: 4 },
        { toolName: 'Vue', score: 4 },
        { toolName: 'Angular', score: 3 },
      ],
    },
  ]

  return (
    <FeatureMatrix tools={tools} features={features} />
  )
}
```

## With Explanations

```tsx
const features: FeatureRow[] = [
  {
    featureName: 'Learning Curve',
    scores: [
      {
        toolName: 'React',
        score: 3,
        explanation: 'Moderate - requires understanding of JSX syntax',
      },
      {
        toolName: 'Vue',
        score: 4,
        explanation: 'Gentle - excellent documentation and tutorials',
      },
      {
        toolName: 'Angular',
        score: 1,
        explanation: 'Steep - complex framework with many concepts',
      },
    ],
  },
]
```

## Full Featured Example

```tsx
<FeatureMatrix
  tools={['Option A', 'Option B', 'Option C']}
  features={[
    {
      featureName: 'Feature 1',
      scores: [
        { toolName: 'Option A', score: 5, explanation: 'Fully featured' },
        { toolName: 'Option B', score: 3, explanation: 'Basic support' },
        { toolName: 'Option C', score: 4, explanation: 'Good support' },
      ],
    },
    {
      featureName: 'Feature 2',
      scores: [
        { toolName: 'Option A', score: 2 },
        { toolName: 'Option B', score: 5 },
        { toolName: 'Option C', score: 3 },
      ],
    },
  ]}
  title="Tool Comparison"
  description="Detailed comparison of available options"
  className="mb-8"
  showTooltips={true}
/>
```

## With Missing Data

```tsx
const features: FeatureRow[] = [
  {
    featureName: 'Advanced Feature',
    scores: [
      { toolName: 'Tool A', score: 5 },
      { toolName: 'Tool B', score: null }, // Not applicable
      { toolName: 'Tool C', score: 0 },    // Not available
    ],
  },
]

<FeatureMatrix tools={tools} features={features} />
```

## Type Definitions

```typescript
// Rating type - allows 0-5 or null
export type FeatureMatrixRating = 0 | 1 | 2 | 3 | 4 | 5

// Single tool score
export interface ToolScore {
  toolName: string
  score: FeatureMatrixRating | null
  explanation?: string
}

// Feature row with all tool scores
export interface FeatureRow {
  featureName: string
  scores: ToolScore[]
}

// Component props
export interface FeatureMatrixProps {
  tools: string[]
  features: FeatureRow[]
  className?: string
  title?: string
  description?: string
  showTooltips?: boolean
}

// Sort state
export type SortDirection = 'asc' | 'desc' | null
export interface SortState {
  columnIndex: number | null
  direction: SortDirection
}
```

## Rating Scale Reference

| Score | Shape | Color | Label |
|-------|-------|-------|-------|
| 5 | ● | Emerald | Excellent |
| 4 | ◕ | Green | Very Good |
| 3 | ◑ | Yellow | Good |
| 2 | ◔ | Orange | Fair |
| 1 | ○ | Red | Poor |
| 0 | — | Gray | Not Applicable |
| null | — | Gray | Not Available |

## Component Structure

```tsx
<FeatureMatrix>
  ├── Heading (optional)
  │   ├── title
  │   └── description
  │
  ├── Table (responsive)
  │   ├── Header Row
  │   │   ├── Feature Column (sticky)
  │   │   └── Tool Columns (sortable)
  │   │
  │   └── Body Rows
  │       ├── Feature Name (sticky)
  │       └── Score Cells
  │           ├── Color background
  │           ├── Shape indicator
  │           ├── Score value
  │           ├── Trophy icon (if winner)
  │           └── Tooltip (on hover)
  │
  └── Legend
      ├── Rating 5
      ├── Rating 4
      ├── Rating 3
      ├── Rating 2
      ├── Rating 1
      └── Rating 0
```

## Styling Customization

### Custom Wrapper Class

```tsx
<FeatureMatrix
  tools={tools}
  features={features}
  className="p-8 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900"
/>
```

### Using in MDX/Blog Post

```mdx
# Tool Comparison

Here's a detailed comparison of available tools:

<FeatureMatrix
  tools={['Tool A', 'Tool B', 'Tool C']}
  features={featureData}
  title="Detailed Comparison"
/>

The tool with the highest overall score is recommended for most use cases.
```

## Accessibility Attributes Generated

```html
<!-- Header with sort capability -->
<th
  role="columnheader"
  aria-sort="ascending|descending|none"
  onclick="handleHeaderClick(index)"
>

<!-- Rating cells -->
<div
  role="cell"
  aria-label="Excellent (5/5). Fastest option"
>

<!-- Tooltip on hover -->
<div class="group">
  {children}
  <div class="absolute opacity-0 group-hover:opacity-100">
    Explanation text
  </div>
</div>
```

## Performance Notes

- Sorting is O(n log n) using native Array.sort
- Uses useMemo to prevent unnecessary re-calculations
- No external API calls
- All state is local to component
- No database queries
- Suitable for tables up to 1000+ rows

## Browser DevTools Tips

### Check Accessibility
- Open DevTools → Accessibility tab
- Verify contrast ratios
- Check ARIA labels
- Verify semantic structure

### Test Dark Mode
- DevTools → Rendering → Emulate CSS media feature prefers-color-scheme
- Toggle between light and dark
- Verify all colors are readable

### Test Responsiveness
- DevTools → Device Toolbar
- Test at <640px width
- Verify horizontal scroll works
- Check sticky column behavior

## Troubleshooting

### Tooltips not showing
- Check `showTooltips={true}` prop
- Verify `explanation` field is provided
- Check for CSS z-index conflicts

### Sort not working
- Ensure column headers are clickable
- Check that scores have valid numeric values
- Verify sortDirection is updating (should cycle)

### Mobile scroll not sticky
- Verify viewport is <640px
- Check for overflow-hidden on parent
- Clear any transform on parent elements

### Dark mode not working
- Add `dark` class to parent
- Check Tailwind dark mode configuration
- Verify CSS is loaded

## Server Component Note

This is a CLIENT component ('use client'). Use it in:
- Page components (with 'use client' at page level)
- Client-side layouts
- Client components

Do NOT use in:
- Pure server components
- Server-only functions
- RSC (React Server Components)

To use in RSC, wrap in a client component:
```tsx
'use client'
import { FeatureMatrix } from '@/components/blog'

export function ClientWrapper(props) {
  return <FeatureMatrix {...props} />
}
```
