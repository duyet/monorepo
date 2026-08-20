/** Mirrors migrations/0015_mail.sql so mail works before wrangler d1 apply. */
const MAIL_SCHEMA_SQL = `
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
`;

let schemaReady = false;

export async function ensureMailSchema(db: D1Database): Promise<void> {
  if (schemaReady) return;
  const statements = MAIL_SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((sql) => db.prepare(sql));
  await db.batch(statements);
  schemaReady = true;
}

/** Test helper — the Worker isolate is long-lived; tests share the module. */
export function resetMailSchemaCache(): void {
  schemaReady = false;
}
