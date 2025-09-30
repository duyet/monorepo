# CCUsage Components

This directory contains refactored CCUsage analytics components for the Insights app, providing comprehensive Claude Code usage analytics with improved performance, type safety, and maintainability.

## Architecture Overview

```
ccusage/
├── components/           # Main UI components
│   ├── metrics.tsx      # Usage overview metrics
│   ├── activity.tsx     # Daily activity charts
│   ├── models.tsx       # AI model usage distribution
│   ├── costs.tsx        # Cost breakdown and projections
│   ├── date-filter.tsx  # Interactive date range selector
│   └── static-date-filter.tsx # Static date display
├── core/                # Core utilities and data
│   ├── types.ts         # TypeScript interfaces
│   ├── hooks.ts         # Custom React hooks
│   ├── ccusage-utils.tsx # Data fetching utilities
│   └── error-boundary.tsx # Error handling
├── page.tsx             # Main page component
└── index.ts             # Clean public API exports
```

## Key Features

### 🎯 **Type Safety**
- Comprehensive TypeScript interfaces for all data models
- Strict typing for ClickHouse responses and component props
- Generic types for chart data transformations

### ⚡ **Performance Optimizations**
- Memoized data transformations using `useMemo`
- Performance monitoring for large datasets
- Optimized chart data processing
- Efficient currency formatting

### 🔧 **Custom Hooks**
- **`useFormattedCurrency`**: Smart currency and token formatting
- **`useTokenChartData`**: Transform activity data for charts
- **`useModelChartData`**: Process model usage for visualizations
- **`useProcessedMetrics`**: Add computed properties to metrics
- **`useErrorHandler`**: Standardized error management

### 🛡️ **Error Handling**
- Comprehensive error boundaries with retry mechanisms
- Graceful fallbacks for missing data
- Performance monitoring and logging
- User-friendly error displays

### 🎨 **Component Design**
- Consistent prop interfaces across components
- Flexible className support for styling
- Suspense-compatible async components
- Accessible error states

## Usage Examples

### Basic Component Usage

```tsx
import { CCUsageMetrics, CCUsageActivity } from './ccusage'

// Basic usage with default 30-day period
<CCUsageMetrics />
<CCUsageActivity />

// Custom time period
<CCUsageMetrics days={90} />
<CCUsageActivity days="all" />

// With custom styling
<CCUsageMetrics className="custom-metrics" days={30} />
```

### Using Custom Hooks

```tsx
import { useFormattedCurrency, useTokenChartData } from './ccusage/hooks'

function MyComponent({ data }) {
  const { format: formatCurrency, formatTokens } = useFormattedCurrency()
  const chartData = useTokenChartData(data)
  
  return (
    <div>
      <p>Cost: {formatCurrency(1234.56)}</p> {/* $1.2K */}
      <p>Tokens: {formatTokens(1500000)}</p>  {/* 1.5M */}
    </div>
  )
}
```

### Error Boundary Integration

```tsx
import { CCUsageErrorBoundary, CCUsageMetrics } from './ccusage'

<CCUsageErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Metrics error:', error)
    // Send to error reporting service
  }}
>
  <CCUsageMetrics days={30} />
</CCUsageErrorBoundary>
```

## Data Flow

```
ClickHouse Database
       ↓
ccusage-utils.tsx (Data fetching)
       ↓
hooks.ts (Data processing & formatting)
       ↓
Component (UI rendering)
       ↓
Charts (Visualization)
```

## Performance Considerations

### Data Processing
- Large datasets (>90 days) trigger performance monitoring
- Chart data transformations are memoized
- Token counts converted to thousands for readability

### Memory Management
- ClickHouse queries include memory limits (`max_memory_usage: '1G'`)
- Result row limits prevent runaway queries (`max_result_rows: 10000`)
- Automatic client connection cleanup

### Rendering Optimization
- Components use React.Suspense for loading states
- Error boundaries prevent cascade failures
- Performance logging for render times >100ms

## Static Generation

The main page component (`page.tsx`) is configured for static generation:

```tsx
export const dynamic = 'force-static'
```

All components work with static generation by:
- Using default 30-day period for static builds
- Avoiding client-side state management
- Providing static date filter displays

## Error Handling Strategy

### Levels of Error Handling

1. **Query Level**: ClickHouse connection and query errors
2. **Component Level**: Data processing and rendering errors  
3. **UI Level**: User-facing error displays with retry options
4. **Boundary Level**: React error boundaries for crash recovery

### Error Recovery

- Automatic retry mechanisms for network errors
- Graceful degradation when data is unavailable
- Consistent error messaging across components
- Performance impact logging and monitoring

## Migration Guide

### From Old Implementation

The refactored components maintain backward compatibility while providing enhanced features:

**Before:**
```tsx
import { CCUsageMetrics } from './metrics'
// Limited type safety, inline formatting logic
```

**After:**
```tsx
import { CCUsageMetrics, useFormattedCurrency } from './ccusage'
// Full type safety, reusable hooks, error boundaries
```

### Breaking Changes

- `DateRange` interface moved to `types.ts`
- `formatCurrency` function deprecated in favor of `useFormattedCurrency` hook
- Component props now include optional `className` parameter

### New Features

- Performance monitoring and logging
- Comprehensive error boundaries
- Memoized data transformations
- Enhanced TypeScript support
- Centralized export system

## Best Practices

### Component Development
- Always use the provided hooks for data processing
- Wrap components in error boundaries for production use
- Include performance monitoring for large datasets
- Use consistent prop interfaces across components

### Data Handling
- Validate input parameters before processing
- Use type-safe interfaces for all data operations
- Implement graceful fallbacks for missing data
- Log performance metrics for optimization

### Styling
- Use the `className` prop for custom styling
- Maintain consistent spacing and layout patterns
- Support dark mode with CSS custom properties
- Ensure accessibility compliance

## Contributing

When adding new components or features:

1. **Types First**: Define TypeScript interfaces in `types.ts`
2. **Hooks**: Create reusable hooks in `hooks.ts`
3. **Error Handling**: Include error boundaries and fallbacks
4. **Performance**: Add monitoring for expensive operations
5. **Testing**: Ensure compatibility with static generation
6. **Documentation**: Update this README with new features

## Dependencies

- **@clickhouse/client**: Database connectivity
- **recharts**: Chart visualizations via custom chart components
- **lucide-react**: Icons and UI elements
- **react**: Component framework with hooks and Suspense

## Environment Variables

Required ClickHouse configuration:
- `CLICKHOUSE_HOST`
- `CLICKHOUSE_PORT` (default: 8123)
- `CLICKHOUSE_USER`
- `CLICKHOUSE_PASSWORD` 
- `CLICKHOUSE_DATABASE`