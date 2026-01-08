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
bun run start

# Initialize database
bun run migrate:up

# Sync all data sources
bun run sync:all

# Run cleanup
bun run cleanup
```

## Usage

For detailed command documentation, see [COMMANDS.md](./COMMANDS.md).

### Main CLI

```bash
# Show help and available commands
bun run start
bun run start --help

# Run specific commands
bun run start sync all
bun run start migrate status
bun run start cleanup --dry-run
```

### Sync Commands

```bash
# Sync all sources
bun run sync all
bun run sync:all

# Sync specific source
bun run sync wakatime
bun run sync:wakatime
bun run sync:cloudflare
bun run sync:github
bun run sync:unsplash

# Sync multiple sources
bun run sync wakatime cloudflare

# Dry run (preview without writing)
bun run sync all --dry-run
```

### Migration Commands

```bash
# Show migration help
bun run migrate help

# Apply pending migrations
bun run migrate up
bun run migrate:up

# Rollback last migration
bun run migrate down
bun run migrate:down

# Rollback multiple migrations
bun run migrate down --count 2

# Check migration status
bun run migrate status
bun run migrate:status

# Verify migration checksums
bun run migrate verify
bun run migrate:verify
```

### Cleanup Commands

```bash
# Run data retention cleanup
bun run cleanup

# Preview cleanup (dry run)
bun run cleanup --dry-run
bun run cleanup:dry-run
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
bun run check-types

# Run tests
bun run test
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

