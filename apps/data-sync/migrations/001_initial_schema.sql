-- @name: initial_schema
-- @version: 1

-- UP

-- Drop old migrations table (if exists from previous setup)
DROP TABLE IF EXISTS data_sync_migrations;

-- Drop old tables with previous naming
DROP VIEW IF EXISTS data_sync_github_daily_mv;
DROP TABLE IF EXISTS data_sync_github_daily;
DROP TABLE IF EXISTS data_sync_github;

DROP VIEW IF EXISTS data_sync_wakatime_daily_mv;
DROP TABLE IF EXISTS data_sync_wakatime_daily;
DROP TABLE IF EXISTS data_sync_wakatime;

DROP VIEW IF EXISTS data_sync_cloudflare_daily_mv;
DROP TABLE IF EXISTS data_sync_cloudflare_daily;
DROP TABLE IF EXISTS data_sync_cloudflare;

DROP TABLE IF EXISTS data_sync_unsplash;

-- GitHub contributions table
CREATE TABLE IF NOT EXISTS monorepo_github (
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

-- GitHub daily materialized view
CREATE TABLE IF NOT EXISTS monorepo_github_daily (
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

CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_github_daily_mv
TO monorepo_github_daily
AS SELECT
  date,
  username,
  contribution_count,
  contribution_level,
  synced_at
FROM monorepo_github
WHERE is_deleted = 0;

-- WakaTime stats table
CREATE TABLE IF NOT EXISTS monorepo_wakatime (
  date Date,
  total_seconds UInt64,
  daily_average UInt64,
  days_active UInt32,
  categories String,
  languages String,
  editors String,
  projects String,
  operating_systems String,
  machines String,
  best_day_date Nullable(Date),
  best_day_seconds Nullable(UInt64),
  raw_response String,
  sync_version UInt32 DEFAULT 1,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date, sync_version)
PARTITION BY toYYYYMM(date)
TTL date + INTERVAL 2 YEAR;

-- WakaTime daily materialized view
CREATE TABLE IF NOT EXISTS monorepo_wakatime_daily (
  date Date,
  total_seconds UInt64,
  daily_average UInt64,
  days_active UInt32,
  categories String,
  languages String,
  editors String,
  projects String,
  operating_systems String,
  machines String,
  best_day_date Nullable(Date),
  best_day_seconds Nullable(UInt64),
  synced_at DateTime
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date)
PARTITION BY toYYYYMM(date);

CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_wakatime_daily_mv
TO monorepo_wakatime_daily
AS SELECT
  date,
  total_seconds,
  daily_average,
  days_active,
  categories,
  languages,
  editors,
  projects,
  operating_systems,
  machines,
  best_day_date,
  best_day_seconds,
  synced_at
FROM monorepo_wakatime
WHERE is_deleted = 0;

-- Cloudflare analytics table
CREATE TABLE IF NOT EXISTS monorepo_cloudflare (
  date Date,
  requests UInt64,
  page_views UInt64,
  unique_visitors UInt64,
  cached_bytes UInt64,
  total_bytes UInt64,
  cache_ratio Float32,
  raw_response String,
  sync_version UInt32 DEFAULT 1,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date, sync_version)
PARTITION BY toYYYYMM(date)
TTL date + INTERVAL 2 YEAR;

-- Cloudflare daily materialized view
CREATE TABLE IF NOT EXISTS monorepo_cloudflare_daily (
  date Date,
  requests UInt64,
  page_views UInt64,
  unique_visitors UInt64,
  cached_bytes UInt64,
  total_bytes UInt64,
  cache_ratio Float32,
  synced_at DateTime
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date)
PARTITION BY toYYYYMM(date);

CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_cloudflare_daily_mv
TO monorepo_cloudflare_daily
AS SELECT
  date,
  requests,
  page_views,
  unique_visitors,
  cached_bytes,
  total_bytes,
  cache_ratio,
  synced_at
FROM monorepo_cloudflare
WHERE is_deleted = 0;

-- Unsplash photos table
CREATE TABLE IF NOT EXISTS monorepo_unsplash (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    snapshot_date Date,
    photo_id String,
    width UInt32,
    height UInt32,
    color String,
    description String,
    alt_description String,
    created_at DateTime64(3),
    downloads UInt32,
    views UInt32,
    likes UInt32,
    url_raw String,
    url_regular String,
    url_thumb String,
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (snapshot_date, photo_id)
TTL snapshot_date + INTERVAL 90 DAY DELETE
SETTINGS index_granularity = 8192;

-- DOWN
DROP VIEW IF EXISTS monorepo_github_daily_mv;
DROP TABLE IF EXISTS monorepo_github_daily;
DROP TABLE IF EXISTS monorepo_github;

DROP VIEW IF EXISTS monorepo_wakatime_daily_mv;
DROP TABLE IF EXISTS monorepo_wakatime_daily;
DROP TABLE IF EXISTS monorepo_wakatime;

DROP VIEW IF EXISTS monorepo_cloudflare_daily_mv;
DROP TABLE IF EXISTS monorepo_cloudflare_daily;
DROP TABLE IF EXISTS monorepo_cloudflare;

DROP TABLE IF EXISTS monorepo_unsplash;
