# CLAUDE.md - Insights App Development Guide

This file provides guidance to Claude Code (claude.ai/code) when working with the insights analytics dashboard application.

## Application Overview

The **insights** app is a comprehensive analytics dashboard that aggregates data from multiple sources to provide insights into development productivity, AI usage, and system performance. Built with Next.js 15 and featuring static generation for optimal performance.

**Live URL**: https://insights.duyet.net | https://duyet-insights.vercel.app

## Architecture & Tech Stack

### Core Technologies

- **Framework**: Next.js 15.5.0 with App Router and React 19
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts with shadcn/ui components
- **Database**: ClickHouse for analytics data
- **Type Safety**: TypeScript with strict mode
- **Static Generation**: Force static for Vercel deployment

### Data Sources Integration

- **GitHub**: Repository statistics, commit activity, language trends
- **PostHog**: User behavior and product analytics
- **WakaTime**: Coding time tracking and productivity metrics
- **Cloudflare**: Website performance and traffic analytics
- **CCUsage**: Claude Code usage and cost analytics (ClickHouse)

## Feature Modules

### 1. GitHub Analytics (`/app/github/`)

**Purpose**: Developer productivity and repository insights

**Components**:

- `activity.tsx` - Commit activity heatmap and trends
- `commit-timeline.tsx` - Daily commit visualization
- `language-stats.tsx` - Programming language distribution
- `repo-trends.tsx` - Repository growth and statistics
- `repos.tsx` - Repository listing and metrics

**Data Flow**: GitHub API → Server-side fetch → Static generation → Client display

### 2. PostHog Analytics (`/app/blog/posthog.tsx`)

**Purpose**: User behavior and product analytics

**Implementation**: Real-time dashboard metrics with privacy-first approach

### 3. WakaTime Integration (`/app/wakatime/`)

**Purpose**: Coding productivity and time tracking

**Components**:

- `activity.tsx` - Coding activity trends and patterns
- `languages.tsx` - Language usage over time
- `metrics.tsx` - Productivity metrics and summaries

**Key Feature**: Smart caching and error handling for API rate limits

### 4. CCUsage Analytics (`/app/ccusage/`) - **NEW FEATURE**

**Purpose**: Claude Code usage analytics and cost tracking

**Architecture**:

```
/app/ccusage/
├── page.tsx              # Main dashboard layout
├── ccusage-utils.tsx     # ClickHouse data fetching utilities
├── types.ts              # TypeScript interfaces
├── hooks.ts              # Custom React hooks for data processing
├── components/
│   ├── metrics.tsx       # Overview metrics cards
│   ├── activity.tsx      # Token usage and cost trends
│   ├── models.tsx        # AI model distribution analytics
│   ├── costs.tsx         # Cost breakdown and analysis
│   └── static-date-filter.tsx # Static-compatible date filtering
├── error-boundary.tsx    # Comprehensive error handling
└── __tests__/           # Unit tests for utilities
```

**Key Features**:

- **Privacy-First Design**: Anonymized project paths, aggregated data only
- **Cost Analytics**: Smart currency formatting with proportional cost calculations
- **Percentage Distribution**: Proper rounding ensuring totals always equal 100%
- **Date Filtering**: Multiple time periods (30d, 90d, 6m, 1y, all)
- **Error Boundaries**: Graceful fallbacks for data loading failures
- **Static Generation**: Compatible with Vercel's edge deployment

**Data Processing**:

- **Source**: ClickHouse database with real-time Claude Code usage logs
- **Connection**: HTTP-based @clickhouse/client (not SSH)
- **Privacy**: No absolute costs, anonymized paths, machine-aggregated data
- **Performance**: Memoized hooks, optimized queries, intelligent caching

## Development Patterns & Best Practices

### Static Generation Strategy

```typescript
// All pages use force-static for optimal performance
export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour cache
```

### Error Handling Pattern

```typescript
// Comprehensive error boundaries with user-friendly fallbacks
<CCUsageErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <AnalyticsComponent />
  </Suspense>
</CCUsageErrorBoundary>
```

### Data Fetching Pattern

```typescript
// Server-side data fetching with proper error handling
export default async function Page() {
  try {
    const data = await fetchAnalyticsData()
    return <Dashboard data={data} />
  } catch (error) {
    return <ErrorFallback error={error} />
  }
}
```

### Custom Hook Pattern

```typescript
// Memoized hooks for performance optimization
export function useProcessedData(rawData: RawData[]) {
  return useMemo(() => {
    return rawData.map(transformData)
  }, [rawData])
}
```

## Environment Variables

### Public Variables (Client-side)

```bash
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXX      # Google Analytics
NEXT_PUBLIC_DUYET_BLOG_URL=https://blog.duyet.net
NEXT_PUBLIC_DUYET_INSIGHTS_URL=https://insights.duyet.net
NEXT_PUBLIC_DUYET_CV_URL=https://cv.duyet.net
```

### Private Variables (Server-side only)

```bash
# External APIs
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
WAKATIME_API_KEY=waka_xxxxxxxx
POSTHOG_API_KEY=phc_xxxxxxxxxx
POSTHOG_PROJECT_ID=5154
CLOUDFLARE_API_KEY=xxxxxxxxxx
CLOUDFLARE_ZONE_ID=xxxxxxxxxx
CLOUDFLARE_EMAIL=user@example.com

# ClickHouse Database (CCUsage)
CLICKHOUSE_HOST=your-clickhouse-host
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=username
CLICKHOUSE_PASSWORD=password
CLICKHOUSE_DATABASE=analytics_db
```

## Development Commands

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev  # Runs on http://localhost:3000

# Type checking
yarn check-types

# Linting and formatting
yarn lint
yarn fmt
```

### Production Build

```bash
# Build for production
yarn build

# Analyze bundle size
yarn analyze
```

### Testing

```bash
# Run unit tests
yarn test

# Test specific module
yarn test ccusage
```

## Code Quality Guidelines

### TypeScript Best Practices

- **Strict Mode**: All code must pass TypeScript strict mode
- **Interface Definition**: Use proper interfaces, avoid `any` types
- **Null Safety**: Always handle null/undefined cases explicitly

### Component Architecture

- **Server Components**: Default for all page-level components
- **Client Components**: Only when interactivity required (marked with 'use client')
- **Error Boundaries**: Wrap data-dependent components
- **Suspense Boundaries**: For async data loading

### Performance Optimization

- **Static Generation**: Force static wherever possible
- **Memoization**: Use useMemo/useCallback for expensive calculations
- **Code Splitting**: Lazy load non-critical components
- **Bundle Analysis**: Monitor bundle size with yarn analyze

### Data Privacy & Security

- **No Sensitive Data**: Never expose API keys or personal information
- **Anonymization**: Aggregate and anonymize all user data
- **GDPR Compliance**: Privacy-first data collection and processing

## API Integration Patterns

### ClickHouse Integration

**IMPORTANT**: Our implementation uses connection pooling and Keep-Alive as recommended by the official ClickHouse JS client documentation. The client instance is a singleton that persists across queries for optimal performance.

```typescript
// ✅ CORRECT: Singleton client with connection pooling (current implementation)
// The client is created once and reused across all queries
const client = createClient({
  url: 'https://username:password@host:port/database', // Official URL format
  request_timeout: 60000,
  clickhouse_settings: {
    max_execution_time: 60,
    max_result_rows: '10000',
    max_memory_usage: '1G',
  },
})

// Query without closing - connection pooling handles reconnection
const result = await client.query({
  query: 'SELECT * FROM table',
  format: 'JSONEachRow',
})
const data = await result.json()

// ❌ WRONG: Do NOT close the client after each query
// This defeats the purpose of connection pooling and causes performance issues
try {
  const result = await client.query({ query })
  return await result.json()
} finally {
  await client.close() // ❌ Don't do this!
}
```

**Key Implementation Details**:

- Client uses HTTP(S) protocol with connection pooling
- Keep-Alive is enabled by default (max 10 connections)
- Client instance persists across queries for performance
- Use `closeClickHouseClient()` only for graceful app shutdown
- URL format embeds credentials: `protocol://user:pass@host:port/db`
- Query format should be `'JSONEachRow'` for array of objects

### GitHub API Pattern

```typescript
// Rate limit aware fetching with exponential backoff
const response = await fetch(url, {
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    'User-Agent': 'insights-app',
  },
})

if (!response.ok) {
  throw new Error(`GitHub API error: ${response.status}`)
}
```

## Testing Strategy

### Unit Tests

- **Utils**: Test all data transformation functions
- **Hooks**: Test custom React hooks with @testing-library
- **Components**: Test error boundaries and edge cases

### Integration Tests

- **API Endpoints**: Mock external API responses
- **Data Flow**: Test complete data fetch → process → display flow
- **Error Scenarios**: Test graceful failure handling

### Performance Tests

- **Bundle Size**: Monitor and alert on bundle growth
- **Load Time**: Test static generation performance
- **Memory Usage**: Profile heavy data processing operations

## Deployment & Monitoring

### Vercel Configuration

- **Static Export**: Compatible with edge functions
- **Environment Variables**: Properly configured in Vercel dashboard
- **Build Optimization**: Monitored build times and success rates

### Monitoring & Alerting

- **Error Tracking**: Automatic error boundary reporting
- **Performance Monitoring**: Core Web Vitals tracking
- **API Health**: Monitor external API availability and response times

## Troubleshooting Guide

### Common Issues

#### 1. ClickHouse Connection Issues

**Symptom**: CCUsage page shows no data, logs show `hasDatabase: false` or empty query results

**Root Cause**: Missing `CLICKHOUSE_DATABASE` environment variable in build/deployment environment

**Debug Logs to Check**:

- `[ClickHouse Config] Environment check:` - Shows which env vars are set
- `[ClickHouse Config] FATAL: Missing required environment variables:` - Lists missing vars
- `[ClickHouse Query] FATAL: Client not available` - Indicates config is incomplete

**Solution**:

1. Verify all ClickHouse environment variables are set:
   - `CLICKHOUSE_HOST` (required)
   - `CLICKHOUSE_PORT` (default: 8123 or 443)
   - `CLICKHOUSE_USER` (required)
   - `CLICKHOUSE_PASSWORD` (required)
   - `CLICKHOUSE_DATABASE` (required) - **Most commonly missing**
   - `CLICKHOUSE_PROTOCOL` (optional: http/https, auto-detected from port)

2. In Cloudflare Pages:
   - Go to Settings → Environment variables
   - Add all required variables to both Production and Preview environments
   - Redeploy after adding variables

3. In Vercel:
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Redeploy after adding variables

**Expected Logs When Working**:

```
[ClickHouse Config] Configuration created: { host, port, protocol, database }
[ClickHouse Client] Creating client with URL: https://host:443
[ClickHouse Client] Client created successfully
[ClickHouse Query] Success: { rowCount: N, hasData: true }
```

#### 2. Static Generation Fails

Verify all data fetching works at build time

#### 3. Type Errors

Ensure proper TypeScript interfaces for all data structures

#### 4. Chart Rendering

Verify data format matches Recharts requirements

### Debug Tools

```bash
# Check environment variables
yarn env-check

# Analyze bundle
yarn analyze

# Type check only
yarn check-types

# Lint specific files
yarn lint app/ccusage/
```

## Security Considerations

### Data Privacy

- **Anonymization**: All user data must be anonymized before processing
- **Aggregation**: Only show aggregated metrics, never individual user data
- **Retention**: Follow data retention policies for analytics data

### API Security

- **Environment Variables**: Never commit secrets to repository
- **Rate Limiting**: Respect all external API rate limits
- **Error Messages**: Sanitize error messages to avoid information leakage

### Content Security Policy

- **External Resources**: Whitelist all external domains
- **Script Sources**: Use strict CSP for analytics scripts
- **Data Sources**: Validate all external data before processing

---

## Development Notes for Claude Code

When working on the insights app:

1. **Preserve Static Generation**: Always use `export const dynamic = 'force-static'`
2. **Respect Data Privacy**: Never expose individual user data or absolute costs
3. **Follow Patterns**: Use existing component patterns and hook structures
4. **Test Thoroughly**: Run full test suite before deploying
5. **Monitor Performance**: Keep bundle size and load times optimal
6. **Handle Errors Gracefully**: Implement proper error boundaries and fallbacks

The insights app is a critical productivity tool that must maintain high reliability and performance standards while respecting user privacy and data security.
