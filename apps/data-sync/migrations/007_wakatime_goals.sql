-- @name: wakatime_goals
-- @version: 7
-- @description: WakaTime coding goals with daily progress

-- UP

CREATE TABLE IF NOT EXISTS monorepo_wakatime_goals (
    goal_id String,
    title String,
    custom_title String DEFAULT '',
    type String,                         -- 'coding_activity' | 'language' | 'project' | etc.
    seconds UInt64 DEFAULT 0,            -- target seconds
    status String DEFAULT '',            -- 'success' | 'fail' | 'pending'
    average_status String DEFAULT '',    -- 'success' | 'fail' | 'pending'
    range_text String DEFAULT '',        -- human-readable range description
    snoozed UInt8 DEFAULT 0,
    modified_at DateTime DEFAULT now(),
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY goal_id
PARTITION BY toYYYYMM(synced_at)
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_wakatime_goals;
