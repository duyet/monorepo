# WakaTimeChart - Usage Snippets

## Import

```typescript
import { WakaTimeChart } from '@/components/blog/WakaTimeChart'
import type { WakaTimeChartProps, WakaTimeDataPoint } from '@/components/blog/types'
```

## Basic Example

```typescript
const data: WakaTimeDataPoint[] = [
  { date: '2024-01-01', TypeScript: 5, JavaScript: 2 },
  { date: '2024-01-02', TypeScript: 6, JavaScript: 3 },
  { date: '2024-01-03', TypeScript: 4, JavaScript: 4 },
]

export default function MyChart() {
  return <WakaTimeChart data={data} title="Weekly Activity" />
}
```

## With Multiple Languages

```typescript
const wakaTimeData: WakaTimeDataPoint[] = [
  {
    date: '2024-01-01',
    TypeScript: 5.5,
    JavaScript: 2.1,
    Python: 1.3,
    Rust: 0.8,
    Go: 0.3,
  },
  // ... more dates
]

export function LanguageChart() {
  return <WakaTimeChart data={wakaTimeData} title="Language Distribution" />
}
```

## Empty State

```typescript
export function EmptyChart() {
  return <WakaTimeChart data={[]} title="No Activity Yet" />
}
// Displays: "No data available"
```

## Generate Mock Data

```typescript
function generateMockData(days: number = 30): WakaTimeDataPoint[] {
  const data: WakaTimeDataPoint[] = []
  const languages = ['TypeScript', 'JavaScript', 'Python']

  for (let i = days; i > 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const point: WakaTimeDataPoint = { date: dateStr }

    languages.forEach((lang) => {
      point[lang] = Math.round(Math.random() * 8 * 10) / 10
    })

    data.push(point)
  }

  return data
}

// Usage
<WakaTimeChart data={generateMockData(30)} title="30-Day Activity" />
```

## In MDX File

```mdx
# My Coding Activity

Here's my coding activity for the past month:

<WakaTimeChart
  data={wakaTimeData}
  title="Monthly Breakdown"
/>

The chart above shows my activity across different programming languages.
```

## With Custom Styling

```typescript
export function StyledChart() {
  return (
    <div className="rounded-lg shadow-lg p-6">
      <WakaTimeChart
        data={wakaTimeData}
        title="Activity Chart"
        className="w-full"
      />
    </div>
  )
}
```

## API Reference

### Props

```typescript
interface WakaTimeChartProps {
  // Required
  data: WakaTimeDataPoint[]

  // Optional
  title?: string           // Chart title
  className?: string       // Wrapper CSS class
}

interface WakaTimeDataPoint {
  date: string            // 'YYYY-MM-DD' format
  [language: string]: string | number  // Any language with value
}
```

## Supported Languages (Pre-colored)

```typescript
// Automatic colors for these languages:
TypeScript    // Blue (#3178c6)
JavaScript    // Yellow (#f7df1e)
Python        // Dark Blue (#3776ab)
Rust          // Orange (#dea584)
Go            // Cyan (#00add8)
Other         // Gray (#718096) - fallback

// Unknown languages use "Other" color
<WakaTimeChart
  data={[{ date: '2024-01-01', 'Elixir': 5, 'Kotlin': 3 }]}
/>
// Both will be gray (Other color)
```

## Data Format Examples

### Minimal
```typescript
[
  { date: '2024-01-01', TypeScript: 5 },
  { date: '2024-01-02', TypeScript: 6 },
]
```

### Full
```typescript
[
  {
    date: '2024-01-01',
    TypeScript: 5.25,
    JavaScript: 2.75,
    Python: 1.5,
    Rust: 0.75,
    Go: 0.25,
  },
  // ... more entries
]
```

## Adding Custom Languages

Edit `LANGUAGE_COLORS` in `WakaTimeChart.tsx`:

```typescript
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3776ab',
  Rust: '#dea584',
  Go: '#00add8',
  Other: '#718096',
  // Add your colors here:
  Elixir: '#4B275F',
  Kotlin: '#7F52FF',
  Dart: '#0175C2',
}
```

## Responsive Layout Breakpoints

```typescript
// Mobile (<768px)
- Chart height: 250px
- Horizontal scrolling enabled
- Legend displayed below (2-column grid)
- Simplified spacing

// Desktop (≥768px)
- Chart height: 350px
- Full-width layout
- Legend at top
- Optimal padding
```

## Animation Features

```typescript
// Automatic scroll-to-view animation:
// 1. Detects when chart enters viewport (30% visible)
// 2. Checks if prefers-reduced-motion is disabled
// 3. Runs 1500ms smooth fill animation
// 4. Auto-cleans up Intersection Observer

// To disable for user:
// Browser: Settings → Accessibility → Reduce motion
```

## Type-Safe Usage

```typescript
import type { WakaTimeChartProps, WakaTimeDataPoint } from '@/components/blog/types'

// This will error if data structure is wrong:
const myData: WakaTimeDataPoint[] = [
  { date: '2024-01-01', TypeScript: 5 },
  // ✓ Type-safe
]

// Props are type-checked:
<WakaTimeChart
  data={myData}
  title="Activity"
  className="my-class"
  // ❌ invalidProp="value"  // Type error!
/>
```

## Common Patterns

### Page with Chart

```typescript
import { WakaTimeChart } from '@/components/blog/WakaTimeChart'

export default function CodingStatsPage() {
  const wakaTimeData = [
    // Your data here
  ]

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">My Coding Stats</h1>
      <WakaTimeChart
        data={wakaTimeData}
        title="30-Day Activity"
      />
    </div>
  )
}
```

### Multiple Charts

```typescript
export function StatsPage() {
  const monthlyData = [/* ... */]
  const yearlyData = [/* ... */]

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">Monthly</h2>
        <WakaTimeChart data={monthlyData} title="Last 30 Days" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Yearly</h2>
        <WakaTimeChart data={yearlyData} title="Last 365 Days" />
      </section>
    </div>
  )
}
```

### With Error Boundary

```typescript
export function SafeChart() {
  try {
    return <WakaTimeChart data={wakaTimeData} />
  } catch (error) {
    return <div>Error loading chart</div>
  }
}
```

## Troubleshooting

### Chart not animating?
```typescript
// Check 1: Is prefers-reduced-motion enabled?
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
console.log('Motion reduced:', reduced)

// Check 2: Is chart in viewport when page loads?
// Scroll down to see the animation
```

### Colors not right?
```typescript
// Check if language name matches exactly:
✓ 'TypeScript' (capital T, camelCase)
✗ 'typescript' (lowercase)
✗ 'type-script' (dashes)
```

### Data not showing?
```typescript
// Check data format:
✓ { date: '2024-01-01', TypeScript: 5 }
✗ { date: 2024-01-01, TypeScript: 5 }      // date must be string
✗ { date: '2024-01-01', 'TypeScript': 5 }  // quotes not needed for keys
```
