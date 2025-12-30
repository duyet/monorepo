-- @name: create_sync_logs_table
-- @version: 6

-- UP

-- Operational logging table for sync runs
CREATE TABLE IF NOT EXISTS monorepo_sync_operation_logs (
    id UUID DEFAULT generateUUIDv4(),
    source String,
    started_at DateTime64(3),
    completed_at Nullable(DateTime64(3)),
    success UInt8,
    records_processed UInt32 DEFAULT 0,
    records_inserted UInt32 DEFAULT 0,
    error_message Nullable(String),
    error_code Nullable(String),
    duration_ms UInt32 DEFAULT 0,
    options String DEFAULT '{}',
    metadata String DEFAULT '{}'
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(started_at)
ORDER BY (source, started_at)
TTL toDate(started_at) + INTERVAL 30 DAY DELETE
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_sync_operation_logs;
