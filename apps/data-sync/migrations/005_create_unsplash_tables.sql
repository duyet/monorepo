-- @name: create_unsplash_tables
-- @version: 5

-- UP

-- Unsplash photo stats raw table
CREATE TABLE IF NOT EXISTS monorepo_unsplash_photo_stats_raw (
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

-- Unsplash portfolio stats raw table
CREATE TABLE IF NOT EXISTS monorepo_unsplash_portfolio_stats_raw (
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    snapshot_date Date,
    username String,
    total_photos UInt32,
    total_downloads UInt64,
    total_views UInt64,
    total_likes UInt32,
    followers_count UInt32,
    following_count UInt32,
    synced_at DateTime64(3) DEFAULT now64()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (snapshot_date, username)
TTL snapshot_date + INTERVAL 90 DAY DELETE
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_unsplash_portfolio_stats_raw;
DROP TABLE IF EXISTS monorepo_unsplash_photo_stats_raw;
