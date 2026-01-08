-- @name: github_commits_raw_and_mv
-- @version: 5

-- UP
-- Raw commits table - stores every GitHub commit for analysis
CREATE TABLE IF NOT EXISTS github_commits_raw (
  date Date,
  repo String,
  owner String,
  sha String,
  message String,
  author_email String,
  author_name String,
  additions Int32,
  deletions Int32,
  changed_files Int32,
  co_authors Array(String),
  has_co_author UInt8 DEFAULT 0,
  is_ai UInt8 DEFAULT 0,
  committed_at DateTime,
  synced_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, repo, committed_at)
TTL committed_at + INTERVAL 3 YEAR DELETE
SETTINGS index_granularity = 8192;

-- Index for faster queries
ALTER TABLE github_commits_raw
ADD INDEX idx_is_ai (is_ai) TYPE minmax GRANULARITY 4;

-- Materialized view - aggregates daily AI percentages from raw commits
CREATE MATERIALIZED VIEW IF NOT EXISTS monorepo_ai_percentage_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, owner)
POPULATE
AS SELECT
  toDate(committed_at) as date,
  owner,
  countState(*) as total_commits,
  countState(if(is_ai = 1, 1, NULL)) as ai_commits,
  countState(if(is_ai = 0, 1, NULL)) as human_commits,
  sumState(additions) as total_lines_added,
  sumState(if(is_ai = 1, additions, 0)) as ai_lines_added,
  sumState(if(is_ai = 0, additions, 0)) as human_lines_added,
  uniqStateCombined(repo) as repo_count,
  max(synced_at) as synced_at
FROM github_commits_raw
GROUP BY date, owner;

-- Queryable view - materialized view results in readable format
CREATE VIEW IF NOT EXISTS monorepo_ai_code_percentage_v2 AS
SELECT
  date,
  owner as username,
  countMerge(total_commits) as total_commits,
  countMerge(human_commits) as human_commits,
  countMerge(ai_commits) as ai_commits,
  sumMerge(total_lines_added) as total_lines_added,
  sumMerge(human_lines_added) as human_lines_added,
  sumMerge(ai_lines_added) as ai_lines_added,
  if(total_lines_added > 0, (ai_lines_added / total_lines_added) * 100, 0) as ai_percentage,
  uniqMerge(repo_count) as repo_count,
  synced_at
FROM monorepo_ai_percentage_mv
GROUP BY date, owner, synced_at
ORDER BY date DESC;

-- DOWN
DROP VIEW IF EXISTS monorepo_ai_code_percentage_v2;
DROP TABLE IF EXISTS monorepo_ai_percentage_mv;
DROP TABLE IF EXISTS github_commits_raw;
