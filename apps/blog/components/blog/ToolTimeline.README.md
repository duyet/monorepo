# ToolTimeline Component

A beautiful, accessible timeline component for displaying technology adoption journeys or version histories chronologically.

## Features

- **Responsive Design**
  - Horizontal scrollable timeline on desktop (width ≥ 640px)
  - Vertical stacked timeline on mobile (< 640px)
  - Automatic breakpoint detection with listener

- **Visual Design**
  - Color-coded status dots with semantic meanings
    - Green (#22c55e): Active
    - Amber (#f59e0b): Adopted
    - Blue (#3b82f6): Testing
    - Gray (#6b7280): Deprecated
  - Smooth gradient lines (horizontal/vertical)
  - Status badges with semi-transparent backgrounds
  - Dark mode support with Tailwind CSS

- **Accessibility (WCAG 2.1 AA)**
  - Full keyboard navigation
  - Semantic ARIA labels and roles
  - Focus indicators with ring styles
  - Proper heading hierarchy
  - Screen reader friendly

- **Keyboard Navigation**
  - Arrow keys: Navigate between events
  - Enter/Space: Expand/collapse event details
  - Escape: Close expanded view
  - Focus management with ref tracking

- **Interactions**
  - Click to expand/collapse event details
  - Smooth expand/collapse animations with Framer Motion
  - Hover effects for visual feedback
  - Optional callbacks for event lifecycle

## Usage

### Basic Example

```tsx
import { ToolTimeline } from '@/components/blog/ToolTimeline'
import type { TimelineEvent } from '@/components/blog/types'

const events: TimelineEvent[] = [
  {
    id: '1',
    name: 'React',
    date: '2020-01-15',
    status: 'active',
    details: 'Started using React for building interactive user interfaces.',
    reason: 'Needed better component reusability and ecosystem support',
  },
  {
    id: '2',
    name: 'TypeScript',
    date: '2020-06-01',
    status: 'adopted',
    details: 'Migrated to TypeScript for improved type safety.',
    reason: 'Caught critical bugs early and improved IDE support',
  },
]

export function MyTimeline() {
  return (
    <ToolTimeline
      events={events}
      onEventExpand={(event) => console.log('Expanded:', event.name)}
      onEventCollapse={(event) => console.log('Collapsed:', event.name)}
    />
  )
}
```

### With Custom Styling

```tsx
<ToolTimeline
  events={events}
  className="my-12 px-4 max-w-4xl mx-auto"
  onEventExpand={(event) => analyticsTracker.track('timeline_expand', event)}
/>
```

## Props

### `ToolTimelineProps`

```typescript
interface ToolTimelineProps {
  /** Array of timeline events to display */
  events: TimelineEvent[]

  /** Optional CSS class name for custom styling */
  className?: string

  /** Optional callback when event is expanded */
  onEventExpand?: (event: TimelineEvent) => void

  /** Optional callback when event is collapsed */
  onEventCollapse?: (event: TimelineEvent) => void
}
```

### `TimelineEvent`

```typescript
interface TimelineEvent {
  /** Unique identifier for the event */
  id: string

  /** Tool or technology name */
  name: string

  /** Date when this event occurred (YYYY-MM format recommended) */
  date: string | Date

  /** Status of the tool at this point in time */
  status: 'adopted' | 'active' | 'testing' | 'deprecated'

  /** Full details/description of the event */
  details: string

  /** Reason for the status change or key moment annotation */
  reason?: string
}
```

## Desktop Layout

The desktop timeline displays events horizontally on a continuous line:

```
┌─ Dot (clickable) ─┐
│                   │
└─── Timeline Line ──┘
│
├─ Event Name
├─ Event Date
└─ Status Badge
```

- Events are displayed left-to-right in chronological order
- Horizontal scrolling available if timeline exceeds viewport width
- Colored dots positioned on the timeline line
- Event info displayed below the timeline
- Expanded content slides in below the timeline

## Mobile Layout

The mobile timeline displays events vertically in a stacked format:

```
Dot ─┐
     ├─ Event Card
     │  - Name
     │  - Date
     │  - Status
     │  - Expandable Details
     │
Dot ─┐
     ├─ Event Card
     ...
```

- Vertical line connects all events
- Events displayed in cards with tap-to-expand
- Full-width cards on mobile for better touch targets
- Vertical scrolling for long timelines

## Styling

The component uses Tailwind CSS for all styling with:

- Utility classes for layout and spacing
- Dark mode support with `dark:` variants
- Responsive design with breakpoints
- Custom color mapping for status indicators

### Customizing Colors

To change status colors, modify the `STATUS_COLORS` constant in `ToolTimeline.tsx`:

```typescript
const STATUS_COLORS = {
  adopted: { bg: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-600' },
  active: { bg: 'bg-green-500', ring: 'ring-green-500', text: 'text-green-600' },
  testing: { bg: 'bg-blue-500', ring: 'ring-blue-500', text: 'text-blue-600' },
  deprecated: { bg: 'bg-gray-400', ring: 'ring-gray-400', text: 'text-gray-500' },
}
```

## Animation

Animations are powered by Framer Motion:

- **Expand/Collapse**: Smooth height animation with fade in/out
- **Mount/Unmount**: AnimatePresence for exit animations
- **Dot Interaction**: Scale up on hover and focus
- **Event Info**: Fade in animation on mount

All animations have configurable durations (default: 0.2-0.3s).

## Accessibility

### Keyboard Support

- Tab: Navigate to dot buttons
- Arrow Left/Up: Move to previous event
- Arrow Right/Down: Move to next event
- Enter/Space: Toggle expanded state
- Escape: Close expanded view

### Screen Reader Support

- Region landmark with `aria-label="Tool adoption timeline"`
- Button labels include event name, date, and status
- Expanded state tracked with `aria-expanded`
- Hidden decorative elements with `aria-hidden="true"`

### Visual Accessibility

- High contrast status colors (WCAG AA)
- Focus ring indicators on all interactive elements
- Touch targets ≥ 44px × 44px on mobile
- Readable font sizes (default 14px+)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 12+, Android 8+

## Performance

- Lazy date formatting only when needed
- Memoized handlers with useCallback
- Efficient DOM queries for focus management
- No external dependencies beyond React and Framer Motion

## Example: Technology Journey

See `ToolTimeline.demo.tsx` for a complete working example with 8 technology adoption events.

## Troubleshooting

### Timeline not scrolling on desktop

Ensure the viewport width is ≥ 640px. The component automatically switches to vertical layout below this breakpoint.

### Keyboard navigation not working

Make sure focus is on a dot button element. Click a dot first or Tab to reach it.

### Dark mode not applying

Verify Tailwind CSS dark mode is enabled in your `tailwind.config.ts`:

```typescript
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

### Events not appearing

Check that:
1. `events` array is not empty
2. Each event has a unique `id`
3. Date format is valid (string or Date object)
4. Status is one of: 'adopted', 'active', 'testing', 'deprecated'

## Related Components

- **ToolList**: Categorized tool listing
- **ToolComparison**: Side-by-side tool comparison
- **FeatureMatrix**: Feature comparison matrix

## Future Enhancements

- [ ] Grouping by category or year
- [ ] Custom colors per event
- [ ] Animated counters for statistics
- [ ] Export timeline as SVG/PNG
- [ ] Mobile drawer for expanded content
- [ ] Custom date format options
