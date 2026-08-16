-- Tracks per-channel delivery state (telegram, discord, ...) for each item,
-- so the hourly workflow never double-posts a story, failures are visible,
-- and failed sends retry with a bounded attempt count.
CREATE TABLE IF NOT EXISTS notifications (
  channel TEXT NOT NULL,
  item_id TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'failed'
  attempts INTEGER NOT NULL DEFAULT 1,
  message_id TEXT,
  last_error TEXT,
  posted_at INTEGER NOT NULL,
  PRIMARY KEY (channel, item_id)
);
