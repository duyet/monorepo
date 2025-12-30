-- @name: initial_schema
-- @version: 1

-- UP
CREATE TABLE IF NOT EXISTS monorepo_sync_logs (
  id UUID DEFAULT generateUUIDv4(),
  sync_type String,
  status Enum8('pending' = 1, 'running' = 2, 'success' = 3, 'failed' = 4),
  started_at DateTime DEFAULT now(),
  completed_at Nullable(DateTime),
  records_processed UInt64 DEFAULT 0,
  error_message Nullable(String),
  metadata String DEFAULT '{}'
) ENGINE = MergeTree()
ORDER BY (sync_type, started_at)
PARTITION BY toYYYYMM(started_at)
TTL started_at + INTERVAL 90 DAY;

CREATE TABLE IF NOT EXISTS monorepo_sync_errors (
  id UUID DEFAULT generateUUIDv4(),
  sync_log_id UUID,
  error_type String,
  error_message String,
  stack_trace Nullable(String),
  created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (sync_log_id, created_at)
PARTITION BY toYYYYMM(created_at)
TTL created_at + INTERVAL 30 DAY;

-- DOWN
DROP TABLE IF EXISTS monorepo_sync_errors;
DROP TABLE IF EXISTS monorepo_sync_logs;
