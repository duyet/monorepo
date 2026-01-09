# WakaTimeChart - Quick Start Guide

## Basic Usage

```typescript
import { WakaTimeChart } from '@/components/blog/WakaTimeChart'
import type { WakaTimeDataPoint } from '@/components/blog/types'

// Your data
const wakaTimeData: WakaTimeDataPoint[] = [
  { date: '2024-01-01', TypeScript: 5.2, JavaScript: 2.1, Python: 1.5 },
  { date: '2024-01-02', TypeScript: 6.3, JavaScript: 3.2, Python: 1.8 },
  // ... more data points
]

// Use in component
export default function MyChart() {
  return (
    <WakaTimeChart 
      data={wakaTimeData}
      title="My Coding Activity"
    />
  )
}
```

## Props

```typescript
interface WakaTimeChartProps {
  data: WakaTimeDataPoint[]    // Required: array of date + language data
  title?: string               // Optional: chart title
  className?: string           // Optional: wrapper CSS class
}

interface WakaTimeDataPoint {
  date: string                 // YYYY-MM-DD format
  [language: string]: number   // Any language name with numeric value
}
```

## In MDX Files

Simply use the component (already registered):

```mdx
# My Blog Post

Here's my coding activity chart:

<WakaTimeChart
  data={wakaActivityData}
  title="Monthly Breakdown"
/>
```

## Supported Languages

The component automatically colors these languages:

| Language   | Color   | HEX Code |
|----------|---------|----------|
| TypeScript | Blue   | #3178c6  |
| JavaScript | Yellow | #f7df1e  |
| Python     | Blue   | #3776ab  |
| Rust       | Orange | #dea584  |
| Go         | Cyan   | #00add8  |
| Other      | Gray   | #718096  |

Use any language name - unknown ones get the "Other" color.

## Features

✨ **Scroll Animation**: Animates when chart enters viewport
🎨 **Dark Mode**: Automatically adapts to theme
📱 **Responsive**: Mobile-optimized with simplified layout
♿ **Accessible**: Respects prefers-reduced-motion
📊 **Stacked Areas**: Shows language distribution over time
🎯 **Empty State**: Shows message when no data provided

## Examples

See `WakaTimeChart.demo.tsx` for 10 complete examples:

```typescript
import {
  BasicWakaTimeChartDemo,
  DarkModeDemo,
  ResponsiveLayoutDemo,
  // ... 7 more examples
} from '@/components/blog/WakaTimeChart.demo'
```

## Full Documentation

For detailed documentation, see `WakaTimeChart.README.md`

## Common Questions

**Q: How do I add custom languages?**
A: Edit `LANGUAGE_COLORS` in WakaTimeChart.tsx to add more languages.

**Q: Why isn't the chart animating?**
A: Check if prefers-reduced-motion is enabled in browser settings.

**Q: Can I use different data?**
A: Yes! Pass any data structure with `{ date, language1, language2 }` format.

**Q: How do I style it?**
A: Use the `className` prop to add wrapper styles via Tailwind.

## File Locations

- **Component**: `/apps/blog/components/blog/WakaTimeChart.tsx`
- **Types**: `/apps/blog/components/blog/types.ts`
- **Demo**: `/apps/blog/components/blog/WakaTimeChart.demo.tsx`
- **Docs**: `/apps/blog/components/blog/WakaTimeChart.README.md`

## Integration Status

✅ Registered in `mdx-components.tsx`
✅ Types defined in `types.ts`
✅ Ready for production use
✅ TypeScript strict mode compliant

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

Need help? Check the full README or demo file for comprehensive guidance!
