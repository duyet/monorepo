CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  user_id TEXT,
  user_name TEXT,
  ip_hash TEXT, -- sha256 of the client IP; never store the raw IP
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rating REAL,
  review_note TEXT,
  item_id TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_url ON submissions (url);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_ip_hash ON submissions (ip_hash);

INSERT OR IGNORE INTO sources (id, name, type, config, enabled)
VALUES ('user', 'User submissions', 'push', '{}', 1);
