# CLAUDE.md - Data Sync App Development Guide

This file provides guidance to Claude Code (claude.ai/code) when working with the data-sync application.

## Application Overview

The **data-sync** app is a CLI tool for syncing data from various external APIs to ClickHouse. It provides scheduled data collection, migrations, and cleanup operations for the monorepo's analytics infrastructure.

## Architecture & Tech Stack

### Core Technologies

- **Runtime**: Bun
- **Database**: ClickHouse (HTTP protocol)
- **Language**: TypeScript
- **Pattern**: BaseSyncer abstract class for consistent syncer implementation

### Project Structure

```
apps/data-sync/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── sync.ts           # Sync command handler
│   │   ├── migrate.ts        # Migration runner
│   │   └── cleanup.ts        # Data retention cleanup
│   ├── syncers/
│   │   ├── index.ts          # Syncer registry
│   │   ├── wakatime.syncer.ts
│   │   ├── wakatime-activity.syncer.ts  # Daily granular activity
│   │   ├── cloudflare.syncer.ts
│   │   ├── github.syncer.ts
│   │   ├── posthog.syncer.ts
│   │   ├── unsplash.syncer.ts
│   │   ├── unsplash-photos.syncer.ts
│   │   └── ai-code-percentage.syncer.ts
│   ├── lib/
│   │   ├── base/
│   │   │   ├── syncer.ts     # BaseSyncer abstract class
│   │   │   └── types.ts      # Common types
│   │   ├── clickhouse/
│   │   │   ├── client.ts     # ClickHouse client singleton
│   │   │   ├── migrations.ts # Migration utilities
│   │   │   └── retention.ts  # Data retention policies
│   │   └── logger.ts         # Structured logging
│   └── config/
│       ├── sources.config.ts # Data source configurations
│       └── retention.config.ts
├── migrations/               # ClickHouse SQL migrations
└── package.json
```

## Available Syncers

| Syncer | Command | Description | ClickHouse Table |
|--------|---------|-------------|------------------|
| `wakatime` | `bun run sync wakatime` | Aggregate coding stats | `monorepo_wakatime` |
| `wakatime-activity` | `bun run sync wakatime-activity` | Daily granular activity with AI breakdown | `monorepo_wakatime_activity` |
| `cloudflare` | `bun run sync cloudflare` | Website analytics | `monorepo_cloudflare` |
| `github` | `bun run sync github` | Repository statistics | `monorepo_github` |
| `posthog` | `bun run sync posthog` | Product analytics | `monorepo_posthog` |
| `unsplash` | `bun run sync unsplash` | Photo statistics | `monorepo_unsplash` |
| `unsplash-photos` | `bun run sync unsplash-photos` | Individual photo data | `monorepo_unsplash_photos` |
| `ai-code-percentage` | `bun run sync ai-code-percentage` | AI vs human code metrics | `monorepo_ai_code_percentage` |

## Development Commands

```bash
# Run a specific syncer
bun run sync <syncer-name>

# Run with date range
bun run sync wakatime-activity --start-date 2025-01-01 --end-date 2025-01-31

# Run all syncers
bun run sync all

# Run migrations
bun run migrate

# Cleanup old data (retention policies)
bun run cleanup
```

## Creating a New Syncer

### 1. Extend BaseSyncer

```typescript
import { BaseSyncer } from "../lib/base";
import type { SyncOptions } from "../lib/base/types";

interface ApiResponse {
  // Your API response type
}

interface DbRecord {
  // Your ClickHouse record type
}

export class MySyncer extends BaseSyncer<ApiResponse, DbRecord> {
  constructor(client: ClickHouseClient) {
    super(client, "my-syncer");
  }

  protected getTableName(): string {
    return "monorepo_my_table";
  }

  protected async fetchFromApi(options: SyncOptions): Promise<ApiResponse[]> {
    // Fetch data from external API
  }

  protected async transform(data: ApiResponse[]): Promise<DbRecord[]> {
    // Transform API data to ClickHouse records
  }
}
```

### 2. Register the Syncer

In `src/syncers/index.ts`:

```typescript
import { MySyncer } from "./my.syncer";

export const syncerMap: Record<string, SyncerConstructor> = {
  // ... existing syncers
  "my-syncer": MySyncer,
};
```

### 3. Create Migration

In `migrations/XXX_my_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS monorepo_my_table (
    id String,
    data String,
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY id
PARTITION BY toYYYYMM(synced_at);
```

## WakaTime Activity Syncer

The `wakatime-activity` syncer implements a hybrid storage strategy:

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/insights (reads)                     │
│  • hybrid-fetch.ts merges ClickHouse + fresh API data       │
│  • Historical (>7 days) from ClickHouse                     │
│  • Recent (≤7 days) always from WakaTime API                │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ reads
┌─────────────────────────────┴───────────────────────────────┐
│               ClickHouse (monorepo_wakatime_activity)        │
│  • date, total_seconds, human_seconds, ai_seconds           │
│  • has_ai_breakdown flag for data quality                   │
│  • ReplacingMergeTree for deduplication                     │
└─────────────────────────────┬───────────────────────────────┘
                              │ writes
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           apps/data-sync (WakaTimeActivitySyncer)            │
│  • Fetches from insights/days endpoint (daily totals)       │
│  • Attempts durations endpoint for AI breakdown (premium)   │
│  • Falls back to 80/20 estimate when no AI data             │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **Incremental sync**: Only fetches data for the specified date range
- **AI breakdown**: Attempts to get human vs AI coding time from durations endpoint
- **Premium fallback**: Gracefully handles 402 errors (premium feature) by falling back to insights endpoint
- **Rate limiting**: 100ms delay between requests, 1s between chunks

### Usage

```bash
# Sync last 30 days (default)
bun run sync wakatime-activity

# Sync specific range
bun run sync wakatime-activity --start-date 2025-01-01 --end-date 2025-06-30

# Initial backfill (all history)
bun run sync wakatime-activity --start-date 2020-01-01
```

## Environment Variables

```bash
# ClickHouse
CLICKHOUSE_HOST=your-host
CLICKHOUSE_PORT=8123
CLICKHOUSE_USER=username
CLICKHOUSE_PASSWORD=password
CLICKHOUSE_DATABASE=analytics

# WakaTime
WAKATIME_API_KEY=waka_xxxxxxxx

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxx

# Cloudflare
CLOUDFLARE_API_KEY=xxxxxxxx
CLOUDFLARE_ZONE_ID=xxxxxxxx
CLOUDFLARE_EMAIL=user@example.com

# PostHog
POSTHOG_API_KEY=phc_xxxxxxxx
POSTHOG_PROJECT_ID=5154

# Unsplash
UNSPLASH_ACCESS_KEY=xxxxxxxx
```

## BaseSyncer Features

The `BaseSyncer` abstract class provides:

- **Automatic retry**: Exponential backoff for transient failures
- **Rate limiting**: Configurable delays between API calls
- **Structured logging**: Consistent log format with context
- **Error handling**: Graceful failure with detailed error reporting
- **Batch processing**: Chunked inserts for large datasets

## Best Practices

1. **Always use `withRetry`** for external API calls
2. **Implement proper rate limiting** to avoid API throttling
3. **Use `ReplacingMergeTree`** with `sync_version` for idempotent syncs
4. **Add `is_deleted` column** for soft deletes (required by ReplacingMergeTree)
5. **Log meaningful context** for debugging sync issues
6. **Handle premium/paid API features gracefully** with fallbacks

## Testing

```bash
# Run all tests
bun test

# Run specific syncer tests
bun test wakatime
bun test cloudflare
```

## Troubleshooting

### Common Issues

1. **API rate limits**: Increase delay between requests or reduce batch size
2. **ClickHouse connection**: Verify environment variables and network access
3. **Missing data**: Check date range parameters and API response format
4. **Duplicate data**: Ensure `sync_version` is properly incremented

### Debug Logging

Set `LOG_LEVEL=debug` for verbose output:

```bash
LOG_LEVEL=debug bun run sync wakatime-activity
```
