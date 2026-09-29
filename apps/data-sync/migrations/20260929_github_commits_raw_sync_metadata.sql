-- @name: github_commits_raw_sync_metadata
-- @version: 20260929
-- @description: Rebuild github_commits_raw as ReplacingMergeTree(sync_version, is_deleted) so `sync ai-code-percentage` is idempotent

-- UP
-- BaseSyncer.insert stamps every record with sync_version / is_deleted /
-- synced_at before writing it (src/lib/base/syncer.ts). 20250109 created
-- github_commits_raw as a plain MergeTree with none of those three columns, so
-- ClickHouse silently dropped all three on insert (input_format_skip_unknown_fields
-- defaults to 1) and left the table with no dedup at all: every re-run of
-- `sync ai-code-percentage` appended a second physical copy of every commit,
-- and monorepo_ai_code_percentage_mv counted them again. This is the only
-- syncer in the app writing to a table without a ReplacingMergeTree upsert,
-- which is what CLAUDE.md requires of every sync target.
--
-- The table is rebuilt rather than ALTERed because the engine family cannot be
-- changed in place and because the sort key has to gain `sha`: with
-- ORDER BY (date, repo, committed_at) the dedup key is "this repo during this
-- second", so two distinct commits in the same second would collapse into one
-- row once the ReplacingMergeTree merged them.
--
-- Runs after 20250109 - the runner applies pending migrations in ascending
-- version order and 20250109 < 20260929 - and copies the columns 20250109
-- defined, so it assumes that table is the one in place. Do not run a sync
-- concurrently: between the RENAME and the CREATE the table does not exist
-- under its own name.
--
-- 005's monorepo_ai_percentage_mv and monorepo_ai_code_percentage_v2 are left
-- alone. They still read a pre-20250109 column set (owner, has_co_author) and
-- 20250109 replaced the table under them, so they are orphaned and never fed;
-- apps/api reads the _v2 view. If this server has them attached to
-- github_commits_raw rather than orphaned, the backfill below fails loudly -
-- and nothing is lost, the rows are still parked as github_commits_raw_old -
-- which is the outcome to see before retiring those objects separately.

-- Drop the aggregation pipeline first. It reads github_commits_raw, and
-- leaving it attached would double count the backfill below. Both objects are
-- derived and are rebuilt at the end of this migration.
DROP VIEW IF EXISTS monorepo_ai_code_percentage;
DROP TABLE IF EXISTS monorepo_ai_code_percentage_mv;

-- Park the existing rows under a temporary name so they survive the rebuild
-- and can be re-copied if the CREATE below fails.
RENAME TABLE github_commits_raw TO github_commits_raw_old;

-- Same columns as 20250109, plus the three sync metadata columns the base
-- class writes, and the ReplacingMergeTree that consumes them.
CREATE TABLE github_commits_raw (
  -- Computed fields
  date Date MATERIALIZED toDate(committed_at),

  -- Repository info
  repo String,
  repo_owner String,
  repo_url String,

  -- Commit identifiers
  sha String,
  short_sha String,
  commit_url String,
  web_url String,

  -- Author information (person who wrote the code)
  author_name String,
  author_email String,
  author_date DateTime,

  -- Committer information (person who committed the code)
  committer_name String,
  committer_email String,
  committer_date DateTime,

  -- Commit content
  message String,
  message_headline String,
  message_body String,

  -- Change statistics
  additions Int32,
  deletions Int32,
  changed_files Int32,

  -- Parents (for merge commits, etc)
  parents Array(String),

  -- Co-authors (from commit message)
  co_authors Array(String), -- Array of "name <email>" strings

  -- Signature (GPG/GPGSSH/SMIME)
  signature_exists Bool DEFAULT 0,
  signature_valid Bool DEFAULT 0,
  signature_method String, -- 'GPG', 'GPGSSH', 'SMIME'

  -- AI detection (computed from commit metadata)
  is_ai Bool MATERIALIZED (
    length(co_authors) > 0 OR
    endsWith(author_email, '@users.noreply.github.com') OR
    lower(message) LIKE '%[bot]%' OR
    lower(message) LIKE '%[auto]%' OR
    lower(message) LIKE '%[ci]%' OR
    lower(message) LIKE '%dependabot%' OR
    lower(message) LIKE '%[renovate%'
  ),

  -- Timestamps
  authored_at DateTime,
  committed_at DateTime,
  pushed_date DateTime,
  inserted_at DateTime DEFAULT now(),

  -- Sync metadata, stamped on every row by BaseSyncer.insert. Backfilled rows
  -- keep sync_version 0 so that any row written by a later sync (epoch
  -- seconds, ~1.8e9) wins the comparison and replaces it instead of piling up.
  sync_version UInt32 DEFAULT 0,
  is_deleted UInt8 DEFAULT 0,
  synced_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(sync_version, is_deleted)
PARTITION BY toYYYYMM(date)
ORDER BY (date, repo, committed_at, sha)
TTL committed_at + INTERVAL 3 YEAR DELETE
SETTINGS index_granularity = 8192;

-- Copy the existing commits across. `date` and `is_ai` are MATERIALIZED and
-- are recomputed on insert, so they are left out of the column list.
-- max_execution_time is raised because the client default (60s, set in
-- src/lib/clickhouse/client.ts) would abort the copy half way on a large
-- table, leaving the new table holding a partial history.
--
-- This copies rows one for one and does NOT collapse duplicates. Re-runs of
-- the syncer before this migration appended a second physical row per commit,
-- so a production table may already hold duplicates. They are identical in
-- every column except inserted_at, and a ReplacingMergeTree only collapses
-- rows that share the sort key *and* a version - with every row backfilled to
-- sync_version 0, merges will pick one arbitrarily per commit. The POPULATE
-- below therefore still over-counts whatever duplicates exist today. To
-- correct history, insert `LIMIT 1 BY committed_at, repo, sha` here (or drop
-- and re-backfill) before running the POPULATE.
INSERT INTO github_commits_raw (
  repo,
  repo_owner,
  repo_url,
  sha,
  short_sha,
  commit_url,
  web_url,
  author_name,
  author_email,
  author_date,
  committer_name,
  committer_email,
  committer_date,
  message,
  message_headline,
  message_body,
  additions,
  deletions,
  changed_files,
  parents,
  co_authors,
  signature_exists,
  signature_valid,
  signature_method,
  authored_at,
  committed_at,
  pushed_date,
  inserted_at,
  sync_version,
  is_deleted,
  synced_at
)
SELECT
  repo,
  repo_owner,
  repo_url,
  sha,
  short_sha,
  commit_url,
  web_url,
  author_name,
  author_email,
  author_date,
  committer_name,
  committer_email,
  committer_date,
  message,
  message_headline,
  message_body,
  additions,
  deletions,
  changed_files,
  parents,
  co_authors,
  signature_exists,
  signature_valid,
  signature_method,
  authored_at,
  committed_at,
  pushed_date,
  inserted_at,
  0 AS sync_version,
  0 AS is_deleted,
  inserted_at AS synced_at
FROM github_commits_raw_old
SETTINGS max_execution_time = 0;

DROP TABLE github_commits_raw_old;

-- Create indexes for faster queries
ALTER TABLE github_commits_raw
  ADD INDEX idx_sha sha TYPE bloom_filter GRANULARITY 1;

ALTER TABLE github_commits_raw
  ADD INDEX idx_repo repo TYPE bloom_filter GRANULARITY 1;

ALTER TABLE github_commits_raw
  ADD INDEX idx_author_email author_email TYPE bloom_filter GRANULARITY 1;

ALTER TABLE github_commits_raw
  ADD INDEX idx_is_ai is_ai TYPE minmax GRANULARITY 4;

ALTER TABLE github_commits_raw
  ADD INDEX idx_message message TYPE tokenbf_v1(32768, 3, 0) GRANULARITY 1;

-- Create materialized view for daily AI code percentage aggregation
CREATE MATERIALIZED VIEW monorepo_ai_code_percentage_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, repo_owner)
POPULATE
AS SELECT
  date,
  repo_owner as username,
  countState(*) as total_commits,
  countStateIf(is_ai) as ai_commits,
  countStateIf(not is_ai) as human_commits,
  sumState(additions) as total_lines_added,
  sumStateIf(additions, is_ai) as ai_lines_added,
  sumStateIf(additions, not is_ai) as human_lines_added,
  uniqState(repo) as repo_count,
  uniqState(author_email) as unique_contributors
FROM github_commits_raw
GROUP BY date, repo_owner;

-- Create view for querying aggregated data with computed percentage
CREATE VIEW monorepo_ai_code_percentage AS
SELECT
  date,
  username,
  countMerge(total_commits) as total_commits,
  countMerge(ai_commits) as ai_commits,
  countMerge(human_commits) as human_commits,
  sumMerge(total_lines_added) as total_lines_added,
  sumMerge(ai_lines_added) as ai_lines_added,
  sumMerge(human_lines_added) as human_lines_added,
  if(total_lines_added > 0,
     round(ai_lines_added / total_lines_added * 100, 2),
     0) as ai_percentage,
  uniqMerge(repo_count) as repo_count,
  uniqMerge(unique_contributors) as unique_contributors
FROM monorepo_ai_code_percentage_mv
GROUP BY date, username
ORDER BY date DESC;

-- DOWN
-- Destructive, as in 20250109: the rebuilt raw table is dropped rather than
-- converted back. Its rows are re-derivable by re-running the syncer.
DROP VIEW IF EXISTS monorepo_ai_code_percentage;
DROP TABLE IF EXISTS monorepo_ai_code_percentage_mv;
DROP TABLE IF EXISTS github_commits_raw;
