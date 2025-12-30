-- @name: create_migrations_table
-- @version: 2

-- UP
CREATE TABLE IF NOT EXISTS monorepo_migrations (
    version UInt32,
    name String,
    applied_at DateTime64(3) DEFAULT now64(),
    checksum String
)
ENGINE = ReplacingMergeTree(applied_at)
ORDER BY (version)
SETTINGS index_granularity = 8192;

-- DOWN
DROP TABLE IF EXISTS monorepo_migrations;
