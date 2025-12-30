# Data Syncers

This directory contains syncer implementations that fetch data from external APIs and sync them to ClickHouse.

## Available Syncers

### WakaTime Syncer

Syncs coding activity statistics from WakaTime API.

**Table**: `wakatime_daily_stats`

**Environment Variables**:
- `WAKATIME_API_KEY` (required)

**Data Fetched**:
- Total coding time
- Daily average coding time
- Days active
- Languages breakdown
- Editors used
- Projects worked on
- Operating systems
- Machines used
- Best day statistics

**API Endpoints**:
- `/users/current/stats/{range}` - Aggregated stats for time range

**Sync Frequency**: Daily (recommended)

**Example Usage**:
```bash
bun run sync:wakatime
bun run sync:wakatime --dry-run
```

### Cloudflare Syncer

Syncs website analytics from Cloudflare GraphQL API.

**Table**: `cloudflare_analytics_daily`

**Environment Variables**:
- `CLOUDFLARE_ZONE_ID` (required)
- `CLOUDFLARE_API_KEY` (required)

**Data Fetched**:
- Daily HTTP requests
- Page views
- Unique visitors
- Cached bytes
- Total bytes
- Cache ratio

**API Endpoints**:
- GraphQL endpoint: `https://api.cloudflare.com/client/v4/graphql`
- Query: `httpRequests1dGroups` for daily aggregated data

**Sync Frequency**: Daily (recommended)

**Limitations**:
- Free tier has a 365-day limit for historical data
- Maximum 364 days per request to stay within quota

**Example Usage**:
```bash
bun run sync:cloudflare
bun run sync:cloudflare --dry-run
```

## Implementation Guide

### Creating a New Syncer

1. **Create syncer file** in `src/syncers/{name}.syncer.ts`

```typescript
import type { ClickHouseClient } from '@clickhouse/client';
import { BaseSyncer } from '../lib/base';
import type { SyncOptions } from '../lib/base/types';

interface MyApiResponse {
  // Define API response structure
}

interface MyRecord {
  // Define ClickHouse record structure
  date: string;
  // ... other fields
  raw_response: string;
}

export class MySyncer extends BaseSyncer<MyApiResponse, MyRecord> {
  constructor(client: ClickHouseClient) {
    super(client, 'my-source');
  }

  protected getTableName(): string {
    return 'my_table_name';
  }

  protected async fetchFromApi(options: SyncOptions): Promise<MyApiResponse[]> {
    // Implement API fetching logic
    const apiKey = process.env.MY_API_KEY;
    if (!apiKey) throw new Error('MY_API_KEY not set');

    // Use this.withRetry() for automatic retry with exponential backoff
    return await this.withRetry(async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return [await response.json()];
    });
  }

  protected async transform(data: MyApiResponse[]): Promise<MyRecord[]> {
    // Transform API response to ClickHouse records
    return data.map(item => ({
      date: item.date,
      // ... transform fields
      raw_response: JSON.stringify(item),
    }));
  }
}
```

2. **Create migration** in `migrations/{version}_create_{name}_table.sql`

```sql
-- @name: create_{name}_table
-- @version: {version}

-- UP
CREATE TABLE IF NOT EXISTS {table_name} (
  date Date,
  -- ... your fields
  raw_response String,

  -- Sync metadata (required)
  sync_version UInt32 DEFAULT 1,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date, sync_version)
PARTITION BY toYYYYMM(date)
TTL date + INTERVAL 2 YEAR;

-- DOWN
DROP TABLE IF EXISTS {table_name};
```

3. **Register syncer** in `src/syncers/index.ts`

```typescript
import { MySyncer } from './my.syncer';

export const syncerMap: Record<string, SyncerConstructor> = {
  // ... existing syncers
  mysyncer: MySyncer,
};
```

4. **Add source config** in `src/config/sources.config.ts`

```typescript
export const sourceConfigs: Record<string, SourceConfig> = {
  // ... existing configs
  mysyncer: {
    name: 'mysyncer',
    enabled: true,
    schedule: '0 0 * * *', // cron expression
    description: 'My data source description',
  },
};
```

5. **Create tests** in `src/syncers/__tests__/{name}.syncer.test.ts`

```typescript
import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { MySyncer } from '../my.syncer';
import type { ClickHouseClient } from '@clickhouse/client';

describe('MySyncer', () => {
  let mockClient: ClickHouseClient;

  beforeEach(() => {
    mockClient = {
      insert: mock(() => Promise.resolve()),
      query: mock(() => Promise.resolve()),
      close: mock(() => Promise.resolve()),
    } as unknown as ClickHouseClient;
  });

  test('should create syncer instance', () => {
    const syncer = new MySyncer(mockClient);
    expect(syncer).toBeDefined();
  });

  test('should have correct table name', () => {
    const syncer = new MySyncer(mockClient);
    expect(syncer['getTableName']()).toBe('my_table_name');
  });
});
```

## Best Practices

### Error Handling

- Use `this.withRetry()` for API calls with automatic exponential backoff
- Throw descriptive errors when environment variables are missing
- Handle rate limiting errors (429 status codes)
- Store raw API responses for debugging

### Data Quality

- Always validate API responses before transforming
- Store complete raw responses in `raw_response` field
- Use proper date formats (ISO 8601 or ClickHouse Date type)
- Include metadata fields (sync_version, is_deleted, synced_at)

### Performance

- Use batch inserts (handled by BaseSyncer)
- Implement reasonable date ranges to avoid quota limits
- Respect API rate limits
- Use dry-run mode for testing

### Testing

- Test environment variable validation
- Test API error handling
- Mock external API calls
- Verify data transformation logic

## CLI Commands

```bash
# Sync individual source
bun run sync:wakatime
bun run sync:cloudflare

# Sync all enabled sources
bun run sync:all

# Dry run (no database writes)
bun run sync:wakatime --dry-run

# Run migrations
bun run migrate:up
bun run migrate:status
```

## Troubleshooting

### Common Issues

**"API key not set" error**:
- Verify environment variables are set correctly
- Check `.env` file or deployment environment configuration

**"ClickHouse client not available"**:
- Verify ClickHouse connection settings (CH_HOST, CH_PASSWORD, CH_DATABASE)
- Run `bun run migrate:verify` to test connection

**"Rate limit exceeded"**:
- Reduce sync frequency
- Implement custom retry logic with longer backoff
- Check API quota and limits

**Type errors**:
- Run `bun run check-types` to verify TypeScript types
- Ensure interface definitions match API responses

### Debugging

Enable debug logging by checking syncer logs:
```typescript
this.logger.info('Fetching data...', { options });
this.logger.error('API error', { error });
```

Use dry-run mode to test without database writes:
```bash
bun run sync:wakatime --dry-run
```

## Architecture

### Base Syncer Class

All syncers extend `BaseSyncer<TApiResponse, TRecord>` which provides:

- **Automatic retry logic** with exponential backoff
- **Batch insert** with configurable batch size
- **Sync metadata** (version, deletion flag, sync timestamp)
- **Error handling** and logging
- **Dry-run mode** for testing

### Data Flow

```
1. fetchFromApi() → Fetch data from external API
2. transform() → Convert API response to ClickHouse records
3. insert() → Batch insert records with metadata
4. Return SyncResult with statistics
```

### Database Schema Conventions

- Use `ReplacingMergeTree` engine for deduplication
- Include `sync_version`, `is_deleted`, `synced_at` metadata fields
- Partition by month: `toYYYYMM(date)`
- Set TTL based on data retention requirements
- Store raw API responses in `raw_response` String field
