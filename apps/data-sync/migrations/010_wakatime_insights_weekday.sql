-- @name: wakatime_insights_weekday
-- @version: 10
-- @description: WakaTime weekday coding distribution across multiple ranges

-- UP

CREATE TABLE IF NOT EXISTS monorepo_wakatime_insights_weekday (
    range String,                        -- 'last_7_days' | 'last_30_days' | 'last_year' | 'all_time'
    weekday UInt8,                       -- 0 (Sun) - 6 (Sat) per WakaTime API
    name String DEFAULT '',              -- human label e.g. 'Sunday'
    total_seconds UInt64 DEFAULT 0,
    average_seconds UInt64 DEFAULT 0,
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY (range, weekday)
PARTITION BY toYYYYMM(synced_at)
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_wakatime_insights_weekday;
