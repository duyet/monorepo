-- @name: create_wakatime_cloudflare_tables
-- @version: 3

-- UP

-- WakaTime raw data table
CREATE TABLE IF NOT EXISTS monorepo_wakatime_raw (
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

-- WakaTime daily materialized view target table
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

-- WakaTime daily materialized view
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
FROM monorepo_wakatime_raw
WHERE is_deleted = 0;

-- Cloudflare raw data table
CREATE TABLE IF NOT EXISTS monorepo_cloudflare_raw (
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

-- Cloudflare daily materialized view target table
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

-- Cloudflare daily materialized view
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
FROM monorepo_cloudflare_raw
WHERE is_deleted = 0;

-- DOWN
DROP VIEW IF EXISTS monorepo_cloudflare_daily_mv;
DROP TABLE IF EXISTS monorepo_cloudflare_daily;
DROP TABLE IF EXISTS monorepo_cloudflare_raw;
DROP VIEW IF EXISTS monorepo_wakatime_daily_mv;
DROP TABLE IF EXISTS monorepo_wakatime_daily;
DROP TABLE IF EXISTS monorepo_wakatime_raw;
