-- Admin action log (ingest, TL;DR regen, telegram retry, moderation).
CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  action TEXT NOT NULL,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_ts ON admin_audit (ts DESC);
