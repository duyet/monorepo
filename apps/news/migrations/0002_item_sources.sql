-- Per-story "key sources" (source/support tweets, discussion links).

CREATE TABLE IF NOT EXISTS item_sources (
  item_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  kind TEXT NOT NULL DEFAULT 'source',
  author TEXT,
  posted_at INTEGER,
  quote TEXT,
  url TEXT,
  PRIMARY KEY (item_id, position)
);

CREATE INDEX IF NOT EXISTS idx_item_sources_item ON item_sources (item_id);
