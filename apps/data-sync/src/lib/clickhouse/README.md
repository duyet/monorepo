# ClickHouse Utilities

This module provides comprehensive ClickHouse client management, migration system, and retention policy enforcement for the data-sync application.

## Features

- **Connection Pooling**: Singleton client with Keep-Alive connections
- **Migration System**: Version-controlled SQL migrations with checksum validation
- **Retention Policies**: Automated data cleanup based on retention rules
- **Error Handling**: Retry logic with exponential backoff
- **Type Safety**: Full TypeScript support with proper interfaces

## Environment Variables

Required environment variables:

```bash
CH_HOST=your-clickhouse-host.com
CH_PORT=8123                    # Default: 8123
CH_PASSWORD=your-password
CH_DATABASE=your_database       # Optional, defaults to "default"
CH_PROTOCOL=https              # Optional: http/https, auto-detected from port
```

## Client Usage

### Basic Connection

```typescript
import { getClient, ping } from './lib/clickhouse'

// Get client instance (singleton)
const client = getClient()

// Test connection
const isConnected = await ping()
console.log('Connected:', isConnected)
```

### Execute Queries

```typescript
import { executeQuery } from './lib/clickhouse'

// Execute a query with automatic retry
const result = await executeQuery('SELECT * FROM my_table LIMIT 10')

if (result.success) {
  console.log('Data:', result.data)
} else {
  console.error('Error:', result.error)
}

// With custom timeout and retries
const result = await executeQuery(
  'SELECT * FROM large_table',
  120000,  // 120 second timeout
  5        // 5 retry attempts
)
```

### Execute Multiple Statements

```typescript
import { executeStatements } from './lib/clickhouse'

const statements = [
  'CREATE TABLE test (id UInt32) ENGINE = MergeTree() ORDER BY id',
  'INSERT INTO test VALUES (1), (2), (3)',
  'SELECT count() FROM test'
]

const result = await executeStatements(statements)
```

### Graceful Shutdown

```typescript
import { closeClient } from './lib/clickhouse'

// Close connection on application shutdown
process.on('SIGTERM', async () => {
  await closeClient()
  process.exit(0)
})
```

## Migration System

### Migration File Format

Create migration files in `migrations/` directory with the following format:

```sql
-- @name: migration_name
-- @version: 1

-- UP
CREATE TABLE users (
  id UUID DEFAULT generateUUIDv4(),
  username String,
  created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (id, created_at)
PARTITION BY toYYYYMM(created_at);

CREATE INDEX idx_username ON users (username) TYPE minmax;

-- DOWN
DROP TABLE IF EXISTS users;
```

### Migration Commands

```typescript
import { MigrationRunner } from './lib/clickhouse'

const runner = new MigrationRunner('./migrations')

// Initialize migrations table
await runner.init()

// Check migration status
const status = await runner.status()
console.log('Pending:', status.pendingCount)
console.log('Applied:', status.appliedCount)

// Apply pending migrations
await runner.up()

// Rollback last migration
await runner.down(1)

// Rollback last 3 migrations
await runner.down(3)

// Verify migration checksums
const isValid = await runner.verify()
```

### Migration Features

- **Version Control**: Sequential version numbers for ordering
- **Checksum Validation**: MD5 hashes prevent tampering
- **Rollback Support**: DOWN sections for safe rollbacks
- **Statement Splitting**: Handles multiple SQL statements per migration
- **Error Recovery**: Atomic operations with rollback on failure

## Retention Policies

### Define Retention Policies

```typescript
import type { RetentionPolicy } from './lib/clickhouse'

const policies: RetentionPolicy[] = [
  {
    table: 'sync_logs',
    days: 90,
    dateColumn: 'started_at'
  },
  {
    table: 'sync_errors',
    days: 30,
    dateColumn: 'created_at',
    conditions: "error_type != 'critical'"  // Optional
  }
]
```

### Apply Retention Policies

```typescript
import { applyRetentionPolicies } from './lib/clickhouse'

// Dry run (check what would be deleted)
const results = await applyRetentionPolicies(policies, true)

for (const result of results) {
  console.log(`${result.table}: ${result.recordsToDelete} records to delete`)
}

// Actually delete expired records
const results = await applyRetentionPolicies(policies, false)

for (const result of results) {
  if (result.deleted) {
    console.log(`${result.table}: Deleted ${result.recordsToDelete} records`)
  } else if (result.error) {
    console.error(`${result.table}: Error - ${result.error}`)
  }
}
```

### Force TTL Cleanup

```typescript
import { optimizeTables } from './lib/clickhouse'

// Trigger immediate cleanup of TTL-marked data
await optimizeTables(['sync_logs', 'sync_errors'])
```

### Get Table Sizes

```typescript
import { getTableSizes } from './lib/clickhouse'

const sizes = await getTableSizes(['sync_logs', 'sync_errors'])

for (const [table, info] of Object.entries(sizes)) {
  console.log(`${table}: ${info.rows} rows, ${info.bytes} bytes`)
}
```

### Check Retention Compliance

```typescript
import { getRetentionStatus } from './lib/clickhouse'

const status = await getRetentionStatus(policies)

for (const info of status) {
  console.log(`${info.table}:`)
  console.log(`  Total rows: ${info.totalRows}`)
  console.log(`  Expired rows: ${info.expiredRows}`)
  console.log(`  Compliance: ${info.compliancePercentage}%`)
}
```

### Using with Config

Convert from existing config format:

```typescript
import { convertRetentionPolicy } from './lib/clickhouse'
import { retentionPolicies } from '../../config/retention.config'

// Convert config policies to internal format
const policies = retentionPolicies.map(convertRetentionPolicy)

// Apply converted policies
await applyRetentionPolicies(policies)
```

## Architecture

### Connection Pooling

The client uses a singleton pattern with connection pooling:

- Single client instance shared across all queries
- Keep-Alive enabled for connection reuse
- Automatic reconnection on connection loss
- Maximum 10 concurrent connections (ClickHouse default)

### Error Handling

All functions implement comprehensive error handling:

- Retry logic with exponential backoff (1s, 2s, 4s)
- Timeout protection with AbortController
- Detailed error logging for debugging
- Graceful fallbacks for non-critical operations

### Query Safety

Built-in safety mechanisms:

- Request timeout: 60 seconds (configurable)
- Max execution time: 60 seconds
- Max result rows: 100,000 rows
- Max memory usage: 2GB

## Best Practices

### 1. Connection Management

```typescript
// ✅ CORRECT: Reuse singleton client
const client = getClient()
const result1 = await executeQuery('SELECT 1')
const result2 = await executeQuery('SELECT 2')

// ❌ WRONG: Don't close client after each query
const client = getClient()
const result = await executeQuery('SELECT 1')
await closeClient() // Don't do this!
```

### 2. Migration Naming

```typescript
// ✅ CORRECT: Sequential numbering
001_initial_schema.sql
002_add_users_table.sql
003_add_indexes.sql

// ❌ WRONG: Non-sequential or unclear names
migration.sql
users.sql
fix.sql
```

### 3. Retention Policies

```typescript
// ✅ CORRECT: Always dry-run first
const dryRunResults = await applyRetentionPolicies(policies, true)
if (confirm(dryRunResults)) {
  await applyRetentionPolicies(policies, false)
}

// ❌ WRONG: Direct deletion without checking
await applyRetentionPolicies(policies, false)
```

### 4. Error Handling

```typescript
// ✅ CORRECT: Check success status
const result = await executeQuery('SELECT 1')
if (result.success) {
  processData(result.data)
} else {
  handleError(result.error)
}

// ❌ WRONG: Assume success
const result = await executeQuery('SELECT 1')
processData(result.data) // May be empty on error!
```

## Troubleshooting

### Connection Issues

**Problem**: Client not available or connection fails

**Solution**:
1. Check environment variables are set
2. Verify CH_HOST is accessible
3. Test with `ping()` function
4. Check firewall/security group rules

### Migration Failures

**Problem**: Migration fails during UP

**Solution**:
1. Check migration SQL syntax
2. Verify table/column names
3. Run migration in ClickHouse directly to debug
4. Check migration history for conflicts

### Retention Cleanup Issues

**Problem**: Records not being deleted

**Solution**:
1. Run dry-run to verify query
2. Check date column exists and has correct type
3. Verify retention policy conditions
4. Run `optimizeTables()` to force TTL cleanup

## Examples

See `migrations/001_initial_schema.sql` for a complete migration example.

## Type Definitions

All types are exported from `./lib/clickhouse/index.ts`:

```typescript
import type {
  ClickHouseConfig,
  QueryResult,
  Migration,
  AppliedMigration,
  MigrationStatus,
  RetentionPolicy,
  RetentionResult,
} from './lib/clickhouse'
```
