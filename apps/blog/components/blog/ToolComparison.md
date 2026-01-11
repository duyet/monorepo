# ToolComparison Component

A production-grade React component for displaying tool/software comparisons with comprehensive feature support and accessibility compliance.

## Features

- **Tool Information Display**: Shows tool name with optional WINNER badge
- **Star Rating System**: 5-star rating visualization with filled/unfilled states
- **Pros and Cons Layout**:
  - Two-column layout on desktop
  - Stacked single-column layout on mobile (< 375px)
  - Green checkmarks for pros with semantic indicators
  - Red X marks for cons with semantic indicators
- **Expandable Description**: Smooth animated expand/collapse for longer text content
- **Dark Mode Support**: Full Tailwind dark: class support for light/dark themes
- **Accessibility**:
  - WCAG 2.1 AA compliant
  - Semantic HTML with proper ARIA labels
  - Keyboard navigation support (expandable button is focusable)
  - Screen reader friendly
- **Error Boundary**: Graceful fallback for invalid props
- **Responsive Design**: Mobile-first approach with smooth breakpoints
- **Animation**: Framer Motion smooth transitions for expand/collapse

## Props

```typescript
interface ToolComparisonProps {
  /** Name of the tool being compared */
  name: string;

  /** Star rating from 0-5 */
  rating: ToolRating; // 0 | 1 | 2 | 3 | 4 | 5

  /** Array of pros (advantages) */
  pros: string[];

  /** Array of cons (disadvantages) */
  cons: string[];

  /** Optional longer description for expandable section */
  description?: string;

  /** Whether this tool is the winner (shows WINNER badge) */
  winner?: boolean;

  /** Optional CSS class name */
  className?: string;
}
```

## Usage Examples

### Basic Comparison

```tsx
import { ToolComparison } from '@/components/blog'

export function MyComparison() {
  return (
    <ToolComparison
      name="React"
      rating={5}
      pros={[
        'Large ecosystem and community support',
        'Excellent documentation',
        'Virtual DOM for performance',
        'JSX makes code more readable',
      ]}
      cons={[
        'Steeper learning curve for beginners',
        'Frequent updates',
        'Requires additional libraries for routing',
      ]}
    />
  )
}
```

### Winner Comparison with Description

```tsx
<ToolComparison
  name="TypeScript"
  rating={5}
  winner={true}
  pros={[
    'Strong type safety prevents runtime errors',
    'Excellent IDE support and autocomplete',
    'Self-documenting code through types',
    'Scales well for large codebases',
  ]}
  cons={[
    'Additional compilation step required',
    'Learning curve for JavaScript developers',
    'Type definitions can be verbose',
  ]}
  description="TypeScript has become the standard for building scalable JavaScript applications. The type system catches bugs at compile time, and the developer experience is significantly enhanced with intelligent tooling support."
/>
```

### Multiple Comparisons

```tsx
export function FrameworkComparison() {
  const frameworks = [
    { name: 'Next.js', rating: 5, winner: true, pros: [...], cons: [...] },
    { name: 'Remix', rating: 4, pros: [...], cons: [...] },
    { name: 'Astro', rating: 4, pros: [...], cons: [...] },
  ]

  return (
    <div className="space-y-6">
      {frameworks.map((framework) => (
        <ToolComparison key={framework.name} {...framework} />
      ))}
    </div>
  )
}
```

## Design System

### Colors

- **Pros Section**: Green (`green-100` / `green-900/30` backgrounds, `green-700` / `green-400` text)
- **Cons Section**: Red (`red-100` / `red-900/30` backgrounds, `red-700` / `red-400` text)
- **Rating Stars**: Amber (`amber-400` for filled, `gray-300` / `gray-600` for unfilled)
- **Winner Badge**: Amber (`amber-100` / `amber-900/30` backgrounds, `amber-900` / `amber-300` text)
- **Card**: White (`gray-200` border) with dark mode support

### Spacing

- Desktop padding: `p-4 sm:p-6` (16px on mobile, 24px on desktop)
- Column gap: `gap-4` between pros and cons
- Item spacing: `space-y-2` within lists

### Typography

- Tool name: `text-lg font-semibold`
- Section headers: `text-sm font-semibold`
- Content: `text-sm`
- Rating text: `text-sm font-medium`

## Accessibility

### WCAG 2.1 AA Compliance

- **Semantic HTML**: Uses `<h3>`, `<h4>`, `<ul>`, `<li>` for proper structure
- **ARIA Labels**:
  - `aria-labelledby` on main card for tool name reference
  - `aria-controls` on expand button for description section
  - `aria-expanded` on expand button to indicate state
  - `aria-hidden="true"` on decorative icons
- **Keyboard Navigation**:
  - Expand button is fully keyboard focusable
  - Enter/Space to toggle expand state
- **Screen Reader Support**: All text content is accessible without relying on icons alone
- **Color Contrast**: All text meets WCAG AA contrast ratios
- **Focus Indicators**: Browser default focus rings visible on button

## Mobile Responsiveness

### Breakpoints

| Screen Size | Behavior |
|------------|----------|
| < 375px | Single-column stacked layout, reduced padding |
| ≥ 375px | Two-column pros/cons layout |
| ≥ 640px (sm) | Increased padding from 16px to 24px |

### Mobile Optimizations

- Pros and cons stack vertically
- Touch-friendly button sizes (min 44x44px recommended)
- Reduced horizontal padding on very small screens
- Full-width content utilization

## Dark Mode

The component uses Tailwind's `dark:` class prefix for complete dark mode support:

```tsx
// Light mode (default)
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white"

// Winner badge
className="bg-amber-100 dark:bg-amber-900/30"

// Description section
className="bg-gray-50/50 dark:bg-gray-900/25"
```

Enable dark mode by adding `dark` class to a parent element or using Tailwind's dark mode configuration.

## Error Handling

The component includes built-in error boundary fallback for invalid props:

```tsx
// Missing required props
<ToolComparison name={null} rating={5} pros={[]} cons={[]} />
// → Renders error message in red box

// Invalid array type
<ToolComparison name="Tool" rating={5} pros="invalid" cons={[]} />
// → Renders error message with helpful guidance
```

Error messages are styled with red background and text for clear visibility.

## Animation

The description expand/collapse uses Framer Motion:

- Duration: 200ms
- Easing: linear
- Animation: Height expands from 0 to auto with opacity fade
- Performance: Uses GPU-accelerated CSS transforms

## Type Safety

The component exports TypeScript types for strict prop validation:

```typescript
export type ToolRating = 0 | 1 | 2 | 3 | 4 | 5

export interface ToolComparisonProps {
  // ... (as shown above)
}
```

## Performance Considerations

- **Memoization**: Consider wrapping in `React.memo()` if props don't change frequently
- **Large Lists**: For multiple comparisons, use `key` prop with unique identifiers
- **Animation**: Framer Motion uses GPU acceleration for smooth 60fps animations
- **Bundle Size**: Icons from lucide-react are tree-shakeable

## Dependencies

- `react` - Core React library
- `framer-motion` - Animation library
- `lucide-react` - Icon library
- `tailwindcss` - Styling

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react'
import { ToolComparison } from './ToolComparison'

describe('ToolComparison', () => {
  it('renders tool name', () => {
    render(
      <ToolComparison
        name="React"
        rating={5}
        pros={['Pros 1']}
        cons={['Con 1']}
      />
    )
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('shows winner badge when winner prop is true', () => {
    render(
      <ToolComparison
        name="TypeScript"
        rating={5}
        winner={true}
        pros={['Pro']}
        cons={['Con']}
      />
    )
    expect(screen.getByText('WINNER')).toBeInTheDocument()
  })

  it('renders correct number of stars', () => {
    const { container } = render(
      <ToolComparison
        name="Tool"
        rating={3}
        pros={['Pro']}
        cons={['Con']}
      />
    )
    const stars = container.querySelectorAll('svg[size="18"]')
    expect(stars).toHaveLength(5)
  })

  it('expands description on button click', async () => {
    const { user } = render(
      <ToolComparison
        name="Tool"
        rating={5}
        pros={['Pro']}
        cons={['Con']}
        description="Test description"
      />
    )
    const button = screen.getByText('Read More')
    await user.click(button)
    expect(screen.getByText('Test description')).toBeVisible()
  })

  it('shows error for invalid props', () => {
    render(
      <ToolComparison
        // @ts-expect-error - Invalid props for testing
        name={null}
        rating={5}
        pros={[]}
        cons={[]}
      />
    )
    expect(screen.getByText(/Error:/)).toBeInTheDocument()
  })
})
```

### Accessibility Tests

- WAVE or Axe DevTools for accessibility audit
- Keyboard navigation testing (Tab to expand button, Enter to toggle)
- Screen reader testing (NVDA, JAWS, or VoiceOver)
- Color contrast verification (WCAG AA ratio)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

When modifying this component:

1. Maintain WCAG 2.1 AA compliance
2. Preserve responsive breakpoints
3. Keep dark mode support functional
4. Update types in `types.ts` if props change
5. Update demo examples in `ToolComparison.demo.tsx`
6. Run `bun run check-types` and `bun run lint` before committing

## License

Same as the parent project.
