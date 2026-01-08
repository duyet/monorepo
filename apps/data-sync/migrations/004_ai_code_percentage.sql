-- @name: ai_code_percentage_table
-- @version: 4

-- UP
CREATE TABLE IF NOT EXISTS monorepo_ai_code_percentage (
  date Date,
  username String,
  total_commits UInt32,
  human_commits UInt32,
  ai_commits UInt32,
  total_lines_added UInt64,
  human_lines_added UInt64,
  ai_lines_added UInt64,
  ai_percentage Float32,
  repo_count UInt32,
  sync_version UInt32 DEFAULT 1,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(date)
ORDER BY (date, username)
TTL date + INTERVAL 2 YEAR DELETE
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_ai_code_percentage;
