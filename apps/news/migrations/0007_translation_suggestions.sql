CREATE TABLE IF NOT EXISTS translation_suggestions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'vi',
  field TEXT NOT NULL DEFAULT 'title',
  suggestion TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  ip_hash TEXT, -- sha256 of the client IP; never store the raw IP
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  rating REAL,
  review_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_suggestions_item ON translation_suggestions (item_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON translation_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_suggestions_ip_hash ON translation_suggestions (ip_hash);
