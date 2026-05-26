-- @name: wakatime_projects
-- @version: 8
-- @description: WakaTime full project list

-- UP

CREATE TABLE IF NOT EXISTS monorepo_wakatime_projects (
    project_id String,
    name String,
    repository String DEFAULT '',
    last_heartbeat_at DateTime DEFAULT now(),
    has_public_url UInt8 DEFAULT 0,
    urls String DEFAULT '{}',            -- JSON: { main, wakatime_dashboard }
    languages String DEFAULT '[]',       -- JSON: string[]
    created_at DateTime DEFAULT now(),
    sync_version UInt32,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
ORDER BY project_id
PARTITION BY toYYYYMM(synced_at)
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_wakatime_projects;
