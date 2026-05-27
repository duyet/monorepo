-- @name: wakatime_insights_best_day
-- @version: 9
-- @description: WakaTime best day insights across multiple ranges

-- UP

CREATE TABLE IF NOT EXISTS monorepo_wakatime_insights_best_day (
    range String,                        -- 'last_7_days' | 'last_30_days' | 'last_year' | 'all_time'
    date Date,
    total_seconds UInt64 DEFAULT 0,
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY (range, date)
PARTITION BY toYYYYMM(synced_at)
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_wakatime_insights_best_day;
