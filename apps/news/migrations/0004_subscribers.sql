CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  lang TEXT NOT NULL DEFAULT 'vi',
  created_at INTEGER,
  confirmed INTEGER NOT NULL DEFAULT 1,
  unsubscribe_token TEXT NOT NULL
);

ALTER TABLE tldr_snapshots ADD COLUMN sent_at INTEGER;
