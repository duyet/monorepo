-- @name: unsplash_photos
-- @version: 3

-- UP

-- Full Unsplash photo metadata table
-- Stores complete photo data for apps/photos consumption
-- Separate from monorepo_unsplash which tracks daily stats with TTL
CREATE TABLE IF NOT EXISTS monorepo_unsplash_photos (
    -- Sync metadata
    sync_version Int64,
    is_deleted UInt8 DEFAULT 0,
    synced_at DateTime64(3) DEFAULT now64(),

    -- Primary identifiers
    photo_id String,
    provider String DEFAULT 'unsplash',

    -- Timestamps
    created_at DateTime64(3),
    updated_at DateTime64(3),
    promoted_at Nullable(DateTime64(3)),

    -- Dimensions and visual
    width UInt32,
    height UInt32,
    color Nullable(String),
    blur_hash Nullable(String),

    -- Text content
    description Nullable(String),
    alt_description Nullable(String),

    -- URLs (flattened for efficient access)
    url_raw String,
    url_full String,
    url_regular String,
    url_small String,
    url_thumb String,

    -- Links (flattened)
    link_self String,
    link_html String,
    link_download String,
    link_download_location String,

    -- Stats (updated each sync)
    likes UInt32 DEFAULT 0,
    downloads UInt32 DEFAULT 0,
    views UInt64 DEFAULT 0,

    -- Location (flattened for querying)
    location_name Nullable(String),
    location_city Nullable(String),
    location_country Nullable(String),
    location_latitude Nullable(Float64),
    location_longitude Nullable(Float64),

    -- EXIF (flattened for filtering)
    exif_make Nullable(String),
    exif_model Nullable(String),
    exif_exposure_time Nullable(String),
    exif_aperture Nullable(String),
    exif_focal_length Nullable(String),
    exif_iso Nullable(UInt32),

    -- User (simplified - just what we need for attribution)
    user_id String,
    user_username String,
    user_name String,
    user_profile_image_small Nullable(String),
    user_profile_image_medium Nullable(String),
    user_profile_image_large Nullable(String),
    user_link_html Nullable(String),

    -- Full raw data for future-proofing (JSON)
    raw_data String
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYear(created_at)
ORDER BY (photo_id)
SETTINGS index_granularity = 8192;

-- DOWN

DROP TABLE IF EXISTS monorepo_unsplash_photos;
