-- @name: add_posthog
-- @version: 1

-- UP

-- PostHog analytics table
CREATE TABLE IF NOT EXISTS monorepo_posthog (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    date Date,
    path String,
    visitors UInt32,
    views UInt32,
    bounce_rate Nullable(Float32),
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(date)
ORDER BY (date, path)
TTL date + INTERVAL 2 YEAR DELETE
SETTINGS index_granularity = 8192;

-- PostHog daily summary materialized view
CREATE TABLE IF NOT EXISTS monorepo_posthog_daily (
  date Date,
  total_visitors UInt32,
  total_views UInt32,
  unique_paths UInt32,
  synced_at DateTime64(3)
) ENGINE = ReplacingMergeTree(synced_at)
ORDER BY (date)
PARTITION BY toYYYYMM(date);

CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_posthog_daily_mv
TO monorepo_posthog_daily
AS SELECT
  date,
  sum(visitors) as total_visitors,
  sum(views) as total_views,
  countDistinct(path) as unique_paths,
  max(synced_at) as synced_at
FROM monorepo_posthog
WHERE is_deleted = 0
GROUP BY date;

-- DOWN

DROP VIEW IF EXISTS monorepo_posthog_daily_mv;
DROP TABLE IF EXISTS monorepo_posthog_daily;
DROP TABLE IF EXISTS monorepo_posthog;
