CREATE TABLE IF NOT EXISTS topics (
  name TEXT PRIMARY KEY,
  canonical TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  last_seen INTEGER
);

CREATE INDEX IF NOT EXISTS idx_topics_canonical ON topics (canonical);
