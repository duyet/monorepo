-- @name: github_commits_raw
-- @version: 20250109

-- UP
-- Drop existing table/views if they exist (for clean migration)
DROP TABLE IF EXISTS github_commits_raw;
DROP VIEW IF EXISTS monorepo_ai_code_percentage;
DROP TABLE IF EXISTS monorepo_ai_code_percentage_mv;

-- Create comprehensive raw commits table with all GitHub commit fields
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
    lower(message) LIKE '%renovate%'
  ),

  -- Timestamps
  authored_at DateTime,
  committed_at DateTime,
  pushed_date DateTime,
  inserted_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, repo, committed_at)
TTL committed_at + INTERVAL 3 YEAR DELETE
SETTINGS index_granularity = 8192;

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
DROP VIEW IF EXISTS monorepo_ai_code_percentage;
DROP TABLE IF EXISTS monorepo_ai_code_percentage_mv;
DROP TABLE IF EXISTS github_commits_raw;
