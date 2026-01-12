-- @name: wakatime_activity
-- @version: 6
-- @description: Add daily granular WakaTime activity table for hybrid storage

-- UP

-- WakaTime daily activity table (granular per-day data for charts)
-- This complements monorepo_wakatime which stores aggregate range stats
CREATE TABLE IF NOT EXISTS monorepo_wakatime_activity (
    date Date,
    total_seconds UInt64,
    human_seconds UInt64,
    ai_seconds UInt64,
    has_ai_breakdown UInt8 DEFAULT 0,  -- 1 if actual AI data, 0 if estimated
    source String DEFAULT 'api',        -- 'api' | 'insights' | 'backfill'
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY date
PARTITION BY toYYYYMM(date)
TTL date + INTERVAL 3 YEAR DELETE
SETTINGS index_granularity = 8192;

-- Create index on date for fast range queries
ALTER TABLE monorepo_wakatime_activity ADD INDEX idx_date date TYPE minmax GRANULARITY 1;

-- DOWN
DROP TABLE IF EXISTS monorepo_wakatime_activity;
