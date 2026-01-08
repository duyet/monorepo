-- @name: github_commits_raw
-- @version: 20250109

-- UP
-- Create raw commits table for storing all GitHub commits
CREATE TABLE IF NOT EXISTS github_commits_raw (
  date Date MATERIALIZED toDate(committed_at),
  repo String,
  repo_owner String,
  sha String,
  message String,
  author_email String,
  author_name String,
  additions Int32,
  deletions Int32,
  changed_files Int32,
  co_authors Array(String),
  is_ai Bool MATERIALIZED (
    hasCoAuthor(co_authors) OR
    endsWith(author_email, '@users.noreply.github.com') OR
    lowercase(message) LIKE '%[bot]%' OR
    lowercase(message) LIKE '%[auto]%' OR
    lowercase(message) LIKE '%[ci]%'
  ),
  committed_at DateTime,
  inserted_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, repo, committed_at)
SETTINGS index_granularity = 8192;

-- Create indexes for faster queries
ALTER TABLE github_commits_raw
ADD INDEX idx_sha sha TYPE bloom_filter GRANULARITY 1;

ALTER TABLE github_commits_raw
ADD INDEX idx_repo repo TYPE bloom_filter GRANULARITY 1;

ALTER TABLE github_commits_raw
ADD INDEX idx_author_email author_email TYPE bloom_filter GRANULARITY 1;

-- Create materialized view for daily AI code percentage aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_ai_code_percentage_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date)
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
  uniqStateIf(repo, date) as repo_count
FROM github_commits_raw
GROUP BY date, repo_owner;

-- Create view for querying aggregated data with computed percentage
CREATE VIEW IF NOT EXISTS monorepo_ai_code_percentage AS
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
  uniqMerge(repo_count) as repo_count
FROM monorepo_ai_code_percentage_mv
GROUP BY date, username
ORDER BY date DESC;

-- DOWN
DROP VIEW IF EXISTS monorepo_ai_code_percentage;
DROP TABLE IF EXISTS monorepo_ai_code_percentage_mv;
DROP TABLE IF EXISTS github_commits_raw;
