# Data Sync CLI Commands

Command-line interface for managing data synchronization, database migrations, and retention policies.

## Overview

The data-sync CLI provides three main commands:

1. **sync** - Sync data from external sources (WakaTime, Cloudflare, GitHub, Unsplash)
2. **migrate** - Manage database schema migrations
3. **cleanup** - Apply retention policies and clean up old data

## Installation

```bash
cd apps/data-sync
bun install
```

## Environment Variables

Required environment variables for ClickHouse connection:

```bash
CH_HOST=your-clickhouse-host
CH_PORT=8123
CH_PASSWORD=your-password
CH_DATABASE=default
CH_PROTOCOL=https  # optional, auto-detected from port
```

## Commands

### Sync Command

Sync data from external sources to ClickHouse.

#### Usage

```bash
# Show help
bun run start

# Sync all enabled sources
bun run sync all
bun run sync:all

# Sync specific source
bun run sync wakatime
bun run sync:wakatime

# Sync multiple sources
bun run sync wakatime cloudflare github

# Preview sync without writing data
bun run sync all --dry-run
```

#### Available Sources

- `wakatime` - WakaTime coding activity statistics
- `cloudflare` - Cloudflare analytics data
- `github` - GitHub contributions and events
- `unsplash` - Unsplash photo statistics

#### Output

The sync command provides a summary table showing:
- Status (✓ success or ✗ failure)
- Number of records processed
- Duration
- Error messages (if any)

Example output:
```
============================================================
SYNC SUMMARY
============================================================
✓ wakatime          1,234 records  2.34s
✓ cloudflare          567 records  1.23s
✗ github                0 records  0.12s
  Error: API rate limit exceeded
============================================================
Total: 1,801 records | 2 success | 1 failed | 3.69s
============================================================
```

### Migrate Command

Manage database schema migrations using SQL files.

#### Usage

```bash
# Apply pending migrations
bun run migrate up
bun run migrate:up

# Rollback last migration
bun run migrate down
bun run migrate:down

# Rollback multiple migrations
bun run migrate down --count 2

# Show migration status
bun run migrate status
bun run migrate:status

# Verify migration checksums
bun run migrate verify
bun run migrate:verify

# Show help
bun run migrate help
```

#### Migration Files

Migrations are SQL files in the `migrations/` directory with the following format:

```sql
-- @name: migration_name
-- @version: 1

-- UP
CREATE TABLE example_table (
  id UUID DEFAULT generateUUIDv4(),
  created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY created_at;

-- DOWN
DROP TABLE IF EXISTS example_table;
```

#### Migration Status Output

```
============================================================
MIGRATION STATUS
============================================================
Total migrations:   3
Applied:            2
Pending:            1

Applied Migrations:
  ✓ v1   initial_schema                2024-01-15
  ✓ v2   add_github_tables             2024-01-16

Pending Migrations:
  • v3   add_unsplash_tables
============================================================
```

### Cleanup Command

Apply retention policies to delete old data from tables.

#### Usage

```bash
# Run cleanup
bun run cleanup

# Preview cleanup without deleting data
bun run cleanup --dry-run
bun run cleanup:dry-run
```

#### Retention Policies

Retention policies are configured in `src/config/retention.config.ts`:

```typescript
export const retentionPolicies: RetentionPolicy[] = [
  { tableName: 'wakatime_daily_stats', retentionDays: 90, partitionColumn: 'date' },
  { tableName: 'cloudflare_analytics_daily', retentionDays: 90, partitionColumn: 'date' },
  { tableName: 'github_contributions_daily', retentionDays: 365, partitionColumn: 'date' },
  // ...
]
```

#### Output

```
============================================================
CLEANUP SUMMARY
============================================================
✓ wakatime_daily_stats              Deleted:     12,345 records
  Space freed: 1.23 MB
✓ cloudflare_analytics_daily        Deleted:      5,678 records
  Space freed: 567.89 KB
• github_contributions_daily        Found:            0 records
============================================================
Total: 18,023 records deleted across 9 tables
Space freed: 1.79 MB
============================================================
```

## Error Handling

All commands:
- Exit with code `0` on success
- Exit with code `1` on failure
- Log errors with timestamps and colored output
- Close ClickHouse connections gracefully

## Development

### Adding a New Source

1. Create syncer class in `src/syncers/[source].syncer.ts`
2. Add source configuration to `src/config/sources.config.ts`
3. Add table schemas to a migration file
4. Add retention policy to `src/config/retention.config.ts`
5. Update the syncer import in `src/commands/sync.ts`

### Testing

```bash
# Run type checking
bun run check-types

# Run tests
bun run test
```

## Architecture

```
apps/data-sync/
├── src/
│   ├── commands/           # CLI command implementations
│   │   ├── sync.ts         # Sync command
│   │   ├── migrate.ts      # Migration command
│   │   └── cleanup.ts      # Cleanup command
│   ├── config/             # Configuration files
│   │   ├── sources.config.ts    # Source definitions
│   │   └── retention.config.ts  # Retention policies
│   ├── lib/                # Core libraries
│   │   ├── clickhouse/     # ClickHouse utilities
│   │   │   ├── client.ts   # Connection management
│   │   │   ├── migrations.ts    # Migration runner
│   │   │   └── retention.ts     # Retention policies
│   │   ├── logger.ts       # Colored logging
│   │   └── base.ts         # Base syncer class
│   ├── syncers/            # Source-specific syncers
│   └── index.ts            # Main entry point
├── migrations/             # SQL migration files
└── package.json
```

## Troubleshooting

### Connection Errors

If you get ClickHouse connection errors:

1. Verify environment variables are set
2. Check network connectivity to ClickHouse host
3. Verify credentials and permissions
4. Check protocol (HTTP vs HTTPS) matches the port

### Migration Checksum Errors

If migration checksums don't match:

1. Run `bun run migrate verify` to see which migrations failed
2. DO NOT modify applied migrations (this breaks checksum validation)
3. Create a new migration to fix issues instead

### Sync Failures

If sync commands fail:

1. Check API credentials for the source
2. Verify API rate limits
3. Use `--dry-run` to test without writing data
4. Check ClickHouse table schemas are up to date

## License

MIT
