# MDX Components Guide

This blog supports interactive MDX components inspired by [HTML Effectiveness Patterns](https://thariqs.github.io/html-effectiveness/). These components make your posts more engaging and readable.

## Available Components

### Collapsible

Expandable sections for long content or technical details.

```mdx
<Collapsible title="Advanced Usage">
  Content that can be collapsed...
</Collapsible>
```

**Props:**
- `title` (required): Section heading
- `defaultOpen`: Start expanded (default: `false`)
- `variant`: `"default"` | `"muted"` | `"accent"`

---

### MarginNote, MarginBlock, InlineNote

Add contextual notes without breaking flow.

```mdx
This is a concept <MarginNote>A brief explanation</MarginNote> in the text.

<MarginBlock position="right">
  Longer aside content that appears in the margin on desktop.
</MarginBlock>

This is an <InlineNote>inline note</InlineNote> for quick context.
```

---

### DesignSwatches, ColorPalette

Display design tokens and color palettes visually.

```mdx
<DesignSwatches
  title="Primary Colors"
  variant="colors"
  swatches={[
    { name: "Coral", value: "#cc785c", description: "Primary accent" },
    { name: "Clay", value: "#d97757", description: "Background tone" },
  ]}
/>

<ColorPalette
  name="Coral Palette"
  colors={[
    { shade: "50", value: "#fdf2f0" },
    { shade: "100", value: "#fbe6e1" },
    { shade: "500", value: "#cc785c" },
  ]}
/>
```

---

### Timeline, StatusBadge

Visual timelines for project roadmaps, changelogs, or history.

```mdx
<Timeline
  items={[
    { date: "2024-01", title: "Project Start", status: "completed" },
    { date: "2024-03", title: "Alpha Release", status: "completed" },
    { date: "2024-06", title: "Beta Release", status: "in-progress" },
    { date: "2024-09", title: "v1.0 Release", status: "planned" },
  ]}
/>

<StatusBadge status="in-progress">In Development</StatusBadge>
```

---

### AnnotatedDiff, SideBySideDiff

Code review with annotations and side-by-side comparisons.

```mdx
<AnnotatedDiff
  language="typescript"
  lines={[
    { type: "removed", content: "const old = 'deprecated'", lineNumber: 1 },
    { type: "added", content: "const new = 'modern'", lineNumber: 1, annotation: "Updated API" },
    { type: "neutral", content: "export function example() {}", lineNumber: 2 },
  ]}
/>

<SideBySideDiff
  before="const oldWay = 'legacy';"
  after="const newWay = 'modern';"
/>
```

---

### Callout

Highlighted information boxes with semantic variants.

```mdx
<Callout variant="info" title="Information">
  Helpful information for readers.
</Callout>

<Callout variant="warning" title="Warning">
  Something to be careful about.
</Callout>

<Callout variant="tip" title="Pro Tip">
  Expert advice for readers.
</Callout>

<Callout variant="error" title="Error">
  Something that went wrong.
</Callout>

<Callout variant="success" title="Success">
  Achievement or milestone.
</Callout>
```

---

### ChartGrid, StatGrid, StatCard

Simple data visualization for metrics and statistics.

```mdx
<ChartGrid
  title="Performance Metrics"
  type="bar"
  items={[
    { label: "Requests/sec", value: 1250, max: 2000, color: "#cc785c" },
    { label: "Latency (p95)", value: 45, max: 100, unit: "ms" },
    { label: "Error Rate", value: 0.02, max: 1, unit: "%" },
  ]}
/>

<StatGrid
  stats={[
    { label: "Users", value: "12.5K", change: 15 },
    { label: "Revenue", value: "$45K", change: -5 },
    { label: "Growth", value: "23%", change: 8 },
  ]}
/>
```

---

## Existing Components

These components were already available and continue to work:

- **Tabs**: Tabbed interface for multiple code examples or views
- **Steps, Step**: Collapsible step-by-step guides
- **CardGrid**: Grid of content cards
- **ClaudeCard**: Anthropic-style cards with nested options
- **PricingTable**: Feature comparison tables
- **ComparisonList**: Side-by-side feature comparisons
- **InfoBox**: Highlighted information boxes
- **Mermaid**: Diagrams and flowcharts

## Styling Notes

All components use the blog's design tokens:
- Colors: `var(--primary)`, `var(--ink)`, `var(--body)`, `var(--muted)`
- Surfaces: `var(--surface-card)`, `var(--surface-soft)`
- Borders: `var(--hairline)`, `var(--border-subtle)`

Dark mode is supported automatically through CSS variables.
