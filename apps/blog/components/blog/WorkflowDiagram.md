# WorkflowDiagram Component

A circular/vertical flow diagram component that displays interconnected workflow steps with smooth animations and interactive expansion.

## Features

- **Circular Layout (Desktop)**: Displays nodes in a triangular arrangement on desktop devices
- **Vertical Layout (Mobile)**: Stacks nodes vertically with connecting arrows on mobile devices
- **Interactive Expansion**: Click or focus nodes to expand and view detailed descriptions
- **Smooth Animations**: Continuous pulse/flow animations on arrows with prefers-reduced-motion support
- **Lucide Icons**: Dynamic icon loading with fallback to default circle icon
- **Dark Mode Support**: Full support for dark mode via Tailwind CSS
- **WCAG 2.1 AA Compliant**: Fully accessible with keyboard navigation (Tab, Enter)
- **Responsive Design**: Automatically adapts between desktop and mobile layouts

## Installation

The component is already integrated into the blog app. It requires:

- `framer-motion` - Animation library (already in dependencies)
- `lucide-react` - Icon library (already in dependencies)
- `react` and `react-dom` - React framework (already in dependencies)

## Usage

### Basic Example

```tsx
import WorkflowDiagram from '@/components/blog/WorkflowDiagram'
import type { WorkflowNode } from '@/components/blog/types'

export default function MyWorkflow() {
  const nodes: WorkflowNode[] = [
    {
      id: 'plan',
      icon: 'Lightbulb',
      title: 'Plan',
      description: 'Define requirements and outline the project scope.',
    },
    {
      id: 'develop',
      icon: 'Code',
      title: 'Develop',
      description: 'Write clean, maintainable code.',
    },
    {
      id: 'deploy',
      icon: 'Rocket',
      title: 'Deploy',
      description: 'Deploy to production with monitoring.',
    },
  ]

  return <WorkflowDiagram nodes={nodes} />
}
```

### With Custom Styling

```tsx
<WorkflowDiagram
  nodes={nodes}
  className="my-custom-wrapper-class"
/>
```

## Props

### WorkflowDiagramProps

```typescript
interface WorkflowDiagramProps {
  /** Array of workflow nodes to display */
  nodes: WorkflowNode[]

  /** Optional CSS class name for custom styling */
  className?: string
}
```

### WorkflowNode

```typescript
interface WorkflowNode {
  /** Unique identifier for the workflow node */
  id: string

  /** Lucide React icon name (e.g., "Code", "Cog", "Zap") */
  icon?: string

  /** Node title/label */
  title: string

  /** Detailed description shown when expanded */
  description: string
}
```

## Icon Options

The component uses Lucide React icons. Some commonly used icons:

- `Code` - Development related
- `Lightbulb` - Ideas, planning
- `Rocket` - Deployment, launch
- `Cog` - Configuration, settings
- `Zap` - Energy, power, speed
- `Database` - Data, storage
- `Palette` - Design, colors
- `CheckCircle2` - Testing, verification
- `TrendingUp` - Analytics, growth
- `Brain` - AI, machine learning
- `BarChart3` - Metrics, analysis

For a complete list of available icons, visit [Lucide React Icons](https://lucide.dev/icons/).

If you specify an icon that doesn't exist, the component automatically falls back to a Circle icon.

## Behavior

### Desktop (≥768px width)

- Nodes are arranged in a triangular/circular pattern
- SVG arrows connect nodes with animated flow effect
- Arrows pulse continuously (unless prefers-reduced-motion is set)
- Click a node to expand/collapse its description

### Mobile (<768px width)

- Nodes are stacked vertically
- Down arrows separate each node
- Final arrow shows "loops" indicator
- Same click-to-expand behavior

### Keyboard Navigation

- **Tab**: Focus nodes in order
- **Enter/Space**: Expand/collapse focused node
- **Arrows**: Navigate through nodes (standard browser behavior)

### Animations

- Arrows pulse with opacity animation: 0.6 → 1 → 0.6 over 2 seconds
- Flow pathLength animates from 0 to 1 to create a drawing effect
- Expand/collapse uses smooth height and opacity transitions
- Icon hover effect scales slightly for visual feedback

All animations respect `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled */
}
```

## Accessibility

### WCAG 2.1 AA Compliance

- Proper semantic HTML (`<button>` elements)
- `aria-expanded` attribute indicates node expansion state
- `aria-hidden` on decorative arrows and SVG elements
- Clear focus indicators with `focus:ring-2 focus:ring-blue-500`
- Descriptive aria-labels for screen readers
- Keyboard accessible: Tab and Enter/Space for interaction
- Color contrast: All text meets WCAG AA standards
- Clear visual hierarchy with heading hierarchy

### Color

- Uses Tailwind color classes for dark mode compatibility
- Text has sufficient contrast in both light and dark modes
- Icon colors clearly distinguish from background

## Styling

The component uses Tailwind CSS for styling. You can customize appearance by:

### Custom Wrapper Class

```tsx
<WorkflowDiagram
  nodes={nodes}
  className="max-w-3xl mx-auto"
/>
```

### Dark Mode

Dark mode is automatically supported. Colors adapt based on `dark:` prefix:

- Light background: `bg-white`
- Dark background: `dark:bg-gray-900`
- Light borders: `border-gray-200`
- Dark borders: `dark:border-gray-700`

### Responsive Behavior

The component automatically detects window size and switches layouts:

```typescript
// Automatically switches at 768px (md breakpoint)
const [mobile, setMobile] = useState(false)

useEffect(() => {
  const handleResize = () => setMobile(window.innerWidth < 768)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

## Examples

### Data Processing Workflow

```tsx
const nodes: WorkflowNode[] = [
  {
    id: 'ingest',
    icon: 'Database',
    title: 'Data Ingestion',
    description: 'Collect data from various sources including APIs and databases.',
  },
  {
    id: 'process',
    icon: 'Zap',
    title: 'Processing',
    description: 'Transform and normalize data.',
  },
  {
    id: 'analyze',
    icon: 'TrendingUp',
    title: 'Analysis',
    description: 'Generate insights and create visualizations.',
  },
]

return <WorkflowDiagram nodes={nodes} />
```

### With Complex Descriptions

```tsx
const nodes: WorkflowNode[] = [
  {
    id: 'research',
    icon: 'Microscope',
    title: 'Research',
    description:
      'Conduct market research and analyze competitors. ' +
      'Identify user needs and document findings with data-driven insights.',
  },
  // ... more nodes
]
```

## Performance Considerations

- Component uses React hooks for state management
- Framer Motion handles all animations efficiently
- SVG arrows are rendered once and animated via properties
- Mobile/desktop detection runs only on mount and resize
- No unnecessary re-renders due to proper dependency arrays

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Works in all major browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers without animation support
- SVG support required for animated arrows on desktop

## Known Limitations

- Limited to 3 nodes for optimal circular layout (desktop)
- Mobile layout works with any number of nodes but is optimized for 3-5 nodes
- SVG arrow animations may have performance impact with many nodes
- Very long descriptions may overflow on small screens

## Troubleshooting

### Icon Not Showing

If an icon doesn't appear, ensure:

1. Icon name is spelled correctly (case-sensitive)
2. Icon exists in Lucide React library
3. Component falls back to Circle icon if not found

### Layout Not Responsive

- Ensure browser window is resized to test mobile layout
- Component checks width on mount and on resize events
- Check browser DevTools to verify actual window width

### Animations Not Working

- Check if `prefers-reduced-motion: reduce` is set in system settings
- Verify browser supports CSS animations and transforms
- Ensure Framer Motion is installed: `bun add framer-motion`

### Dark Mode Not Working

- Ensure `dark:` classes are available in Tailwind config
- Check that theme provider is configured correctly
- Verify HTML root element has `dark` class when dark mode is enabled

## File Structure

```
components/blog/
├── WorkflowDiagram.tsx          # Main component
├── WorkflowDiagram.example.tsx  # Usage examples
├── WorkflowDiagram.md           # This file
└── types.ts                      # TypeScript types
```

## Related Types

Types are defined in `types.ts`:

```typescript
// Main component types
export interface WorkflowNode { ... }
export interface WorkflowDiagramProps { ... }
```

## Testing

To test the component:

1. Import and render with sample nodes
2. Test desktop layout at widths ≥768px
3. Test mobile layout at widths <768px
4. Test keyboard navigation (Tab, Enter)
5. Test click expansion/collapse
6. Verify animations with DevTools
7. Test with `prefers-reduced-motion: reduce` enabled

## Contributing

When modifying this component:

1. Maintain accessibility standards (WCAG 2.1 AA)
2. Ensure animations respect `prefers-reduced-motion`
3. Test on mobile and desktop viewports
4. Update TypeScript types if interfaces change
5. Keep component focused on workflow visualization
6. Avoid adding props that bloat the component

## Future Enhancements

Potential improvements:

- Support for more than 3 nodes with different layouts
- Configurable animation timing and easing
- Custom arrow and node styling
- Step validation and conditional flows
- Horizontal desktop layout option
- Multi-row mobile layout for many nodes
