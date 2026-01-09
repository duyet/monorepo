# WakaTimeChart Component

A beautiful, responsive stacked area chart component for visualizing coding activity over time. Built with Recharts and optimized for performance with scroll-triggered animations.

## Features

- **Stacked Area Chart**: Display multiple programming languages with visual hierarchy
- **Scroll-into-View Animation**: Charts animate when they enter the viewport using Intersection Observer
- **Motion Preference Respect**: Automatically skips animations for users with `prefers-reduced-motion` enabled
- **Dark Mode Support**: Fully themed for both light and dark modes using Tailwind CSS
- **Responsive Design**: Optimized layouts for mobile (horizontal scroll) and desktop (full width)
- **Error Handling**: Graceful empty state display
- **Language Color Palette**: Pre-defined colors for popular programming languages
- **Dynamic Legend**: Auto-generated legend with color indicators

## Installation

The component is already part of the blog app. Just import it:

```typescript
import { WakaTimeChart } from '@/components/blog/WakaTimeChart'
import type { WakaTimeChartProps } from '@/components/blog/types'
```

## Usage

### Basic Example

```typescript
import { WakaTimeChart } from '@/components/blog/WakaTimeChart'
import type { WakaTimeDataPoint } from '@/components/blog/types'

const data: WakaTimeDataPoint[] = [
  { date: '2024-01-01', TypeScript: 5, JavaScript: 2, Python: 1 },
  { date: '2024-01-02', TypeScript: 6, JavaScript: 3, Python: 1.5 },
  { date: '2024-01-03', TypeScript: 4, JavaScript: 4, Python: 2 },
  // ... more data points
]

export function MyChart() {
  return <WakaTimeChart data={data} title="My Coding Activity" />
}
```

### Using in MDX

The component is registered in `mdx-components.tsx` for use in MDX files:

```mdx
# My Blog Post

Here's my coding activity for the month:

<WakaTimeChart
  data={wakaTimeData}
  title="Monthly Breakdown"
/>
```

## Props

### WakaTimeChartProps

```typescript
interface WakaTimeChartProps {
  /** Array of data points with date and language activity */
  data: WakaTimeDataPoint[]

  /** Optional title displayed above the chart */
  title?: string

  /** Optional CSS class name for the wrapper */
  className?: string
}

interface WakaTimeDataPoint {
  /** Date string in YYYY-MM-DD format */
  date: string

  /** Language names as keys with numeric values (hours) */
  [language: string]: string | number
}
```

## Supported Languages

The component includes a predefined color palette for these languages:

- **TypeScript** - `#3178c6` (Blue)
- **JavaScript** - `#f7df1e` (Yellow)
- **Python** - `#3776ab` (Dark Blue)
- **Rust** - `#dea584` (Orange)
- **Go** - `#00add8` (Cyan)
- **Other** - `#718096` (Gray) - fallback for unknown languages

Languages not in the palette automatically use the "Other" color. You can extend the `LANGUAGE_COLORS` object in the component to add more languages.

## Features in Detail

### Scroll-into-View Animation

The chart automatically detects when it enters the viewport and animates the area fills. The animation:

- Uses the Intersection Observer API for performance
- Respects the user's `prefers-reduced-motion` media query
- Sets a 1500ms animation duration
- Automatically cleans up observers

### Dark Mode Support

The component automatically adapts to the current theme using `next-themes`:

- Text colors change for readability
- Grid lines adapt to the background
- Tooltip styling matches the theme
- Gradient fills maintain contrast in both modes

### Responsive Layout

**Mobile** (< 768px):
- Simplified 250px height chart
- Horizontal scrolling enabled
- Simplified legend at the bottom
- Color indicators for each language

**Desktop** (≥ 768px):
- Full-width 350px height chart
- Integrated legend at the top
- Optimal spacing and padding

### Empty State

When no data is provided:
```typescript
<WakaTimeChart data={[]} />
```

Displays a centered "No data available" message with appropriate styling.

## Examples

See `WakaTimeChart.demo.tsx` for comprehensive examples:

- `BasicWakaTimeChartDemo` - Standard 30-day chart
- `ExtendedWakaTimeChartDemo` - 90-day extended view
- `MinimalWakaTimeChartDemo` - Small dataset
- `EmptyWakaTimeChartDemo` - Empty state handling
- `SingleLanguageDemo` - Single language tracking
- `ManyLanguagesDemo` - Multiple languages
- `CustomTitleDemo` - Title customization
- `DarkModeDemo` - Light/dark mode showcase
- `ResponsiveLayoutDemo` - Mobile/desktop layout
- `UnevenDistributionDemo` - Uneven language distribution

## Styling

The component uses Tailwind CSS for styling:

- **Wrapper**: `rounded-lg border bg-white dark:bg-neutral-900`
- **Title**: `text-lg font-semibold text-neutral-900 dark:text-neutral-100`
- **Legend**: `grid grid-cols-2 gap-2 md:hidden` on mobile only
- **Empty State**: `flex items-center justify-center p-8`

### Customizing Colors

To add or modify language colors, edit the `LANGUAGE_COLORS` object:

```typescript
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Other: '#718096',
  // Add your languages here
  Elixir: '#4B275F',
  Kotlin: '#7F52FF',
}
```

## Performance Considerations

- **Lazy Animation**: Charts only animate when visible, reducing unnecessary reflows
- **Efficient Data Processing**: Language extraction is memoized through the component lifecycle
- **Responsive Images**: Uses ResponsiveContainer for fluid sizing
- **Gradient Fills**: SVG gradients are generated per-language for visual appeal
- **Intersection Observer**: Low-cost visibility detection without continuous polling

## Accessibility

- Semantic HTML structure
- Proper color contrast ratios in both themes
- Respects user's motion preferences
- Tooltip support for data exploration
- Clear empty state messaging

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Requires support for:
  - CSS Grid and Flexbox
  - SVG Gradients
  - Intersection Observer API
  - CSS Custom Properties (via Tailwind)

## Dependencies

- `react` - Component framework
- `next-themes` - Theme detection and management
- `recharts` - Chart library
- `tailwindcss` - Styling

## Related Components

- `FeatureMatrix` - Feature comparison tables
- `ToolComparison` - Tool evaluation cards
- `ToolTimeline` - Technology adoption timeline
- `VersionDiff` - Version comparison views

## Troubleshooting

### Chart not animating on scroll
- Check if `prefers-reduced-motion` is enabled in your browser settings
- Verify the chart element is visible in the viewport
- Check browser console for any JavaScript errors

### Incorrect colors
- Ensure language names in your data exactly match the `LANGUAGE_COLORS` keys
- Check if custom languages are added to the color palette
- Verify CSS is loading correctly in dark mode

### Layout issues on mobile
- Check viewport meta tag in HTML head
- Verify Tailwind CSS breakpoints are configured correctly
- Test with actual mobile device or browser DevTools

## Future Enhancements

- [ ] Custom color palette prop
- [ ] Configurable animation duration
- [ ] Export chart as image
- [ ] Interactive filtering by language
- [ ] Zoom and pan capabilities
- [ ] Data aggregation options (daily, weekly, monthly)
