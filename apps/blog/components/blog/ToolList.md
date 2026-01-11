# ToolList Component

A fully-featured, accessible tool/technology listing component with filtering, sorting, searching, and pagination capabilities.

## Features

- **Responsive Grid Layout**: 3 columns on desktop, 2 on tablet, 1 on mobile
- **Client-side Fuzzy Search**: Search by tool name, category, or notes
- **Status Filtering**: Filter by All, Active, Testing, or Deprecated status
- **Category Filtering**: Dropdown filter for tool categories
- **Multiple Sort Options**: Sort by Name (A-Z), Rating (high to low), or Date Added (newest first)
- **Pagination**: "Load More" button with 20 items per page
- **Colorblind-Accessible Status Badges**: Each status has both color AND shape:
  - Active: Green + Circle (●)
  - Testing: Blue + Square (■)
  - Deprecated: Gray + Triangle (▲)
- **Star Ratings**: Visual star display with numeric rating
- **Dark Mode Support**: Full light/dark theme compatibility
- **WCAG 2.1 AA Compliance**: Keyboard accessible, proper ARIA labels, semantic HTML
- **Responsive Filter Controls**: Mobile-friendly filter UI

## Usage

### Basic Example

```tsx
import { ToolList } from '@/components/blog/ToolList'
import type { Tool } from '@/components/blog/types'

const tools: Tool[] = [
  {
    name: 'Claude AI',
    category: 'AI Coding',
    status: 'active',
    rating: 5,
    notes: 'Advanced AI assistant for coding',
    dateAdded: '2024-01-15',
  },
  // ... more tools
]

export function MyToolsPage() {
  return <ToolList tools={tools} />
}
```

### With Custom Styling

```tsx
<ToolList
  tools={tools}
  className="my-custom-wrapper-class"
/>
```

## Component Props

```typescript
interface ToolListProps {
  /** Array of tools to display */
  tools: Tool[]

  /** Optional CSS class name for the wrapper */
  className?: string

  /** Optional initial filter status (planned for future) */
  initialFilter?: ToolStatus | 'all'

  /** Optional items per page (planned for future) */
  pageSize?: number
}

interface Tool {
  /** Tool name */
  name: string

  /** Category: 'AI Coding' | 'Framework' | 'SDK' | 'Other' */
  category: ToolCategory

  /** Status: 'active' | 'testing' | 'deprecated' */
  status: ToolStatus

  /** Rating from 1-5 */
  rating: Rating

  /** Optional notes/description (truncated to 2 lines in cards) */
  notes?: string

  /** Optional date added (ISO format or any Date-parseable string) */
  dateAdded?: string
}
```

## Features & Interactions

### Search
- **Placeholder**: "Search tools by name, category, or notes..."
- **Type**: Real-time fuzzy matching (includes matching)
- **Scope**: Searches tool name, category, and notes fields
- **Reset**: Resets to page 1 when filter changes

### Filter Chips
- **Status Buttons**: All, Active (green), Testing (blue), Deprecated (gray)
- **Behavior**: Clicking a chip filters results and resets to page 1
- **Visual Feedback**: Active filters have darker backgrounds

### Category Dropdown
- **Display**: Shows all unique categories from tools
- **Sorting**: Categories listed alphabetically
- **Accessibility**: Uses proper listbox ARIA roles

### Sort Dropdown
- **Options**: Name (A-Z), Rating (high to low), Date Added (newest first)
- **Default**: Name
- **Behavior**: Resets to page 1 when sort changes

### Reset Button
- **Visibility**: Only shows when filters are active
- **Action**: Clears search, status, category, and sort; resets to page 1
- **Style**: Red text on light background

### Pagination
- **Items Per Page**: 20
- **Button Text**: "Load More (Page X of Y)"
- **Visibility**: Only shows when more pages exist
- **Behavior**: Appends items to current view

### Results Counter
- **Format**: "Showing X-Y of Z tools"
- **Updates**: In real-time as filters/pagination changes
- **Alignment**: Left-aligned above grid

### Empty State
- **Message**: "No tools found matching '[query]'"
- **Action**: Offers "Clear Filters" button if filters are active
- **Styling**: Centered, with padding

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✓ Proper heading hierarchy
- ✓ Semantic HTML (`<section>`, `<article>`, `<button>`, `<select>`)
- ✓ ARIA labels for all interactive elements
- ✓ ARIA roles for custom components (listbox, option, status, etc.)
- ✓ Proper `aria-pressed` states on toggle buttons
- ✓ `aria-expanded` on dropdown triggers
- ✓ `aria-selected` on dropdown options
- ✓ `aria-hidden` on decorative icons
- ✓ Screen reader-only labels (`sr-only` class)

### Keyboard Navigation
- ✓ All buttons focusable with Tab key
- ✓ Buttons activatable with Space/Enter
- ✓ Dropdown navigable with arrow keys (native select)
- ✓ Focus visible indicators with ring styles
- ✓ Logical tab order

### Color Accessibility
- ✓ Status badges use both color AND shape
  - Active: Green + Circle
  - Testing: Blue + Square
  - Deprecated: Gray + Triangle
- ✓ Star ratings use color fill + numeric display
- ✓ Sufficient color contrast ratios (WCAG AA)
- ✓ Not relying on color alone to convey information

### Motion & Animation
- ✓ Smooth transitions (200ms)
- ✓ No auto-playing animations
- ✓ Respects `prefers-reduced-motion` via Tailwind

## Styling

### Dark Mode
- Full dark mode support via `dark:` Tailwind classes
- Automatic theme switching based on system preference
- All text and backgrounds have dark variants

### Responsive Breakpoints
- **Mobile (1 column)**: Default/xs
- **Tablet (2 columns)**: `md:` breakpoint
- **Desktop (3 columns)**: `lg:` breakpoint

### Color Palette
- **Primary**: Blue (filters, buttons, focus rings)
- **Success**: Green (active status)
- **Info**: Blue (testing status)
- **Neutral**: Gray (deprecated status, text)

## Component Architecture

### Internal Components
1. **StarRating**: Displays 5-star rating with numeric value
2. **StatusBadge**: Displays status with shape icon and label
3. **ToolCard**: Individual tool display card with all information
4. **ToolList**: Main component with filtering, sorting, pagination

### Hooks Used
- `useState`: Local state for filters, pagination, search
- `useMemo`: Filtered/sorted tool calculation, categories extraction, pagination
- `useCallback`: Filter change handlers to reset pagination

### Performance Optimizations
- Memoized filtering and sorting calculations
- Pagination slicing to avoid rendering all tools
- Debounced search via state change (React batches updates)

## Data Format

### Tool Data Requirements
```typescript
const tool: Tool = {
  name: 'React',                      // Required
  category: 'Framework',              // Required, must be one of enum values
  status: 'active',                   // Required, must be one of enum values
  rating: 5,                          // Required, number 1-5
  notes: 'UI library',                // Optional
  dateAdded: '2024-01-15',            // Optional, any date format
}
```

### Date Format
- Accepts any format parseable by `new Date()`
- Common formats: ISO (2024-01-15), US (01/15/2024), etc.
- Falls back to "Invalid Date" text if unparseable

## Common Use Cases

### Filter to Active Tools Only
```tsx
const activeTools = tools.filter(t => t.status === 'active')
<ToolList tools={activeTools} />
```

### Group by Category
```tsx
const categories = [...new Set(tools.map(t => t.category))]
{categories.map(cat => (
  <div key={cat}>
    <h2>{cat}</h2>
    <ToolList tools={tools.filter(t => t.category === cat)} />
  </div>
))}
```

### Sort by Rating Descending
The component handles this internally, but to pre-sort:
```tsx
const sorted = [...tools].sort((a, b) => b.rating - a.rating)
<ToolList tools={sorted} />
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari 12+
- Chrome Mobile
- Requires JavaScript enabled
- Graceful degradation for reduced CSS support

## Dependencies

- **React**: 19.x (uses hooks)
- **React DOM**: 19.x
- **lucide-react**: ^0.562.0 (icons)
- **Tailwind CSS**: ^3.x (styling)

## Future Enhancements

Potential features for future versions:
- Multi-select category filtering
- Custom comparison of selected tools
- Export/share filtered results
- Save favorite filters
- Tool submission form
- User ratings/comments
- Similar tools suggestions
- Full-text search with highlighting
- Advanced filter builder
- View mode toggle (grid/list/table)

## Styling Customization

### Tailwind Configuration
If you need to customize colors or spacing:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'tool-active': 'var(--color-active)',
        'tool-testing': 'var(--color-testing)',
        'tool-deprecated': 'var(--color-deprecated)',
      }
    }
  }
}
```

## Troubleshooting

### Search Not Working
- Ensure tools have `name`, `category`, or `notes` populated
- Check that search query matches (case-insensitive matching)

### Filters Not Applying
- Verify tool `status` and `category` match valid enum values
- Check that tools array is not empty

### Pagination Not Showing
- "Load More" only appears when there are more than 20 items
- Verify total filtered results exceed 20

### Dark Mode Not Working
- Ensure your app wraps component in dark mode provider (next-themes)
- Check Tailwind CSS `darkMode` configuration

### Accessibility Issues
- Run through WAVE browser extension
- Test with keyboard-only navigation
- Use screen reader (NVDA, JAWS, VoiceOver)
- Check color contrast with online tools
