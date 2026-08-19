-- Newsletter campaigns, templates, send log, and subscribe rate-limit.
-- Subscriber list stays in `subscribers` (0004/0009). New tables only so
-- this is safe to apply with CREATE TABLE IF NOT EXISTS even if wrangler
-- d1 migrations have not been run yet (ensureMailSchema mirrors this).

CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  preheader TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  template_id TEXT,
  subject TEXT NOT NULL,
  preheader TEXT NOT NULL DEFAULT '',
  body_md TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  sent_at INTEGER,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS email_sends (
  campaign_id TEXT NOT NULL,
  email TEXT NOT NULL,
  sent_at INTEGER,
  error TEXT,
  PRIMARY KEY (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_created
  ON email_campaigns (created_at DESC);

CREATE TABLE IF NOT EXISTS subscriber_sources (
  email TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribe_attempts (
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribe_attempts_ip
  ON subscribe_attempts (ip_hash, created_at);
