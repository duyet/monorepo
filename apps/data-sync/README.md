# data-sync

Data synchronization service for syncing external data sources to ClickHouse.

## Overview

This service syncs data from multiple external sources into ClickHouse for analytics and visualization:

- **WakaTime**: Coding activity stats
- **Cloudflare Analytics**: Website analytics data
- **GitHub**: Contributions, events, and repository stats
- **Unsplash**: Photo statistics

## Quick Start

```bash
# Show help
pnpm run start

# Initialize database
pnpm run migrate:up

# Sync all data sources
pnpm run sync:all

# Run cleanup
pnpm run cleanup
```

## Usage

For detailed command documentation, see [COMMANDS.md](./COMMANDS.md).

### Main CLI

```bash
# Show help and available commands
pnpm run start
pnpm run start -- --help

# Run specific commands
pnpm run start -- sync all
pnpm run start -- migrate status
pnpm run start -- cleanup --dry-run
```

### Sync Commands

```bash
# Sync all sources
pnpm run sync -- all
pnpm run sync:all

# Sync specific source
pnpm run sync -- wakatime
pnpm run sync:wakatime
pnpm run sync:cloudflare
pnpm run sync:github
pnpm run sync:unsplash

# Sync multiple sources
pnpm run sync -- wakatime cloudflare

# Dry run (preview without writing)
pnpm run sync -- all --dry-run
```

### Migration Commands

```bash
# Show migration help
pnpm run migrate -- help

# Apply pending migrations
pnpm run migrate -- up
pnpm run migrate:up

# Rollback last migration
pnpm run migrate -- down
pnpm run migrate:down

# Rollback multiple migrations
pnpm run migrate -- down --count 2

# Check migration status
pnpm run migrate -- status
pnpm run migrate:status

# Verify migration checksums
pnpm run migrate -- verify
pnpm run migrate:verify
```

### Cleanup Commands

```bash
# Run data retention cleanup
pnpm run cleanup

# Preview cleanup (dry run)
pnpm run cleanup -- --dry-run
pnpm run cleanup:dry-run
```

## Configuration

### Sources

Source configurations are defined in `src/config/sources.config.ts`:

- Enable/disable sources
- Configure sync schedules (cron expressions)
- Set source descriptions

### Retention Policies

Data retention policies are defined in `src/config/retention.config.ts`:

- Configure retention days per table
- Define partition columns for cleanup

## Development

```bash
# Type checking
pnpm run check-types

# Run tests
pnpm run test
```

## Environment Variables

Required environment variables:

- `CLICKHOUSE_HOST`: ClickHouse server host
- `CLICKHOUSE_USER`: ClickHouse user
- `CLICKHOUSE_PASSWORD`: ClickHouse password
- `WAKATIME_API_KEY`: WakaTime API key
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ZONE_ID`: Cloudflare zone ID
- `GITHUB_TOKEN`: GitHub personal access token
- `UNSPLASH_ACCESS_KEY`: Unsplash access key

## Architecture

```
src/
├── config/          # Configuration files
├── lib/
│   ├── base/        # Base classes and utilities
│   └── clickhouse/  # ClickHouse client and utilities
├── syncers/         # Source-specific sync implementations
└── commands/        # CLI commands
migrations/          # Database migrations
```

---

**This repository is maintained by [@duyetbot](https://github.com/duyetbot).**
