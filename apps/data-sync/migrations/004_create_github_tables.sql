-- @name: create_github_tables
-- @version: 4

-- UP

-- GitHub contributions raw table
CREATE TABLE IF NOT EXISTS monorepo_github_contributions_raw (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    date Date,
    username String,
    contribution_count UInt32,
    contribution_level Enum8(
        'NONE' = 0,
        'FIRST_QUARTILE' = 1,
        'SECOND_QUARTILE' = 2,
        'THIRD_QUARTILE' = 3,
        'FOURTH_QUARTILE' = 4
    ),
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(date)
ORDER BY (date, username)
TTL date + INTERVAL 365 DAY DELETE
SETTINGS index_granularity = 8192;

-- GitHub contributions daily target table
CREATE TABLE IF NOT EXISTS monorepo_github_contributions_daily (
  date Date,
  username String,
  contribution_count UInt32,
  contribution_level Enum8(
      'NONE' = 0,
      'FIRST_QUARTILE' = 1,
      'SECOND_QUARTILE' = 2,
      'THIRD_QUARTILE' = 3,
      'FOURTH_QUARTILE' = 4
  ),
  synced_at DateTime64(3)
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date, username)
PARTITION BY toYYYYMM(date);

-- GitHub contributions daily materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_github_contributions_daily_mv
TO monorepo_github_contributions_daily
AS SELECT
  date,
  username,
  contribution_count,
  contribution_level,
  synced_at
FROM monorepo_github_contributions_raw
WHERE is_deleted = 0;

-- GitHub events raw table
CREATE TABLE IF NOT EXISTS monorepo_github_events_raw (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    event_id String,
    event_type String,
    created_at DateTime64(3),
    actor_login String,
    repo_name String,
    payload String,
    commits_count UInt32 DEFAULT 0,
    additions UInt32 DEFAULT 0,
    deletions UInt32 DEFAULT 0,
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(toDate(created_at))
ORDER BY (event_id)
TTL toDate(created_at) + INTERVAL 90 DAY DELETE
SETTINGS index_granularity = 8192;

-- GitHub repository stats raw table
CREATE TABLE IF NOT EXISTS monorepo_github_repo_stats_raw (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    snapshot_date Date,
    repo_name String,
    stars UInt32,
    forks UInt32,
    watchers UInt32,
    open_issues UInt32,
    size_kb UInt32,
    languages Array(Tuple(name String, bytes UInt64)),
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (snapshot_date, repo_name)
TTL snapshot_date + INTERVAL 90 DAY DELETE
SETTINGS index_granularity = 8192;

-- DOWN
DROP VIEW IF EXISTS monorepo_github_contributions_daily_mv;
DROP TABLE IF EXISTS monorepo_github_contributions_daily;
DROP TABLE IF EXISTS monorepo_github_repo_stats_raw;
DROP TABLE IF EXISTS monorepo_github_events_raw;
DROP TABLE IF EXISTS monorepo_github_contributions_raw;
