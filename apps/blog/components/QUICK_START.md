# MDX Components Quick Start

## Using Shared Types

All components share types defined in `blog/types.ts`. Import them as needed:

```typescript
import type {
  Tool,
  ToolStatus,
  ToolComparisonProps,
  FeatureMatrixProps,
  WakaTimeChartProps,
  ToolTimelineProps,
  WorkflowDiagramProps,
  VersionDiffProps,
  ToolListProps,
  TimelineEvent,
  WorkflowNode,
  Version,
  Rating,
  ToolCategory,
} from './blog/types'
```

## Component Registration

The `mdx-components.tsx` file automatically registers all blog components for MDX. When you add a new component:

1. Create the component file in `blog/` directory
2. Add its types to `blog/types.ts`
3. Register it in `mdx-components.tsx`:

```typescript
const MyNewComponent = dynamic(() => import('./blog/MyNewComponent'), { ssr: true })

export const mdxComponents: MDXComponents = {
  // existing components...
  MyNewComponent,
}
```

## MDX Content Rendering

The `mdx-content.tsx` wrapper handles MDX code execution with automatic component injection:

```typescript
import { MDXContent } from '@/components/mdx-content'

export function BlogPost({ compiledCode }: { compiledCode: string }) {
  return <MDXContent code={compiledCode} />
}
```

## Available Components in MDX

Once registered, use any component directly in MDX:

```mdx
# My Blog Post

<ToolComparison 
  name="Tool A vs Tool B"
  rating={5}
  pros={["Fast", "Easy"]}
  cons={["Expensive"]}
  winner
/>

<ToolList
  tools={toolsData}
  initialFilter="active"
  pageSize={10}
/>

<WorkflowDiagram nodes={workflowSteps} />

<VersionDiff versions={versionHistory} />
```

## Performance Best Practices

1. **Dynamic Imports**: All components are lazy-loaded with dynamic imports
2. **SSR Enabled**: Components render on server for better SEO
3. **Memoization**: Use React.memo() in components for expensive operations
4. **Code Splitting**: Each component loads only when needed

## Type Safety

All components are fully typed:

```typescript
// This will show TypeScript errors
<ToolComparison 
  name="Tool A"
  rating={6}  // Error: Rating must be 1-5
  pros={[123]} // Error: Should be string[]
  cons={["Issue"]}
/>
```

## Directory Structure

```
components/
├── blog/
│   ├── types.ts              # Shared type definitions
│   ├── WakaTimeChart.tsx
│   ├── WorkflowDiagram.tsx
│   ├── ToolList.tsx
│   ├── ToolComparison.tsx
│   └── README.md
├── mdx-components.tsx        # Component registry
├── mdx-content.tsx           # MDX renderer
└── QUICK_START.md            # This file
```

## Common Patterns

### Filtering Tools
```typescript
const activeLoyaltyPrograms = tools.filter(
  (tool: Tool) => tool.status === 'active'
)
```

### Creating Tool Data
```typescript
const toolData: Tool[] = [
  {
    name: 'Next.js',
    category: 'Framework',
    status: 'active',
    rating: 5,
    dateAdded: '2024-01-01',
    notes: 'Primary frontend framework',
  },
  // ... more tools
]
```

## Troubleshooting

### Components Not Appearing in MDX
- Ensure component is exported from `blog/ToolName.tsx`
- Check component is registered in `mdx-components.tsx`
- Verify dynamic import path is correct

### Type Errors
- Check interfaces in `blog/types.ts`
- Ensure component props match interface definition
- Use TypeScript strict mode for better error detection

### Performance Issues
- Check for missing memoization in expensive operations
- Verify dynamic imports are configured correctly
- Use React DevTools Profiler to identify bottlenecks
