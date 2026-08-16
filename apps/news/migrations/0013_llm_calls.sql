-- Per-attempt log of anyrouter LLM calls (score/translate/tldr/etc.), one
-- row per model tried in the fallback chain — including failed attempts
-- before a fallback succeeded. Used for admin-facing debugging/observability.

CREATE TABLE IF NOT EXISTS llm_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  task TEXT NOT NULL,
  model TEXT NOT NULL,
  ok INTEGER NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  prompt_chars INTEGER,
  response_snippet TEXT
);

CREATE INDEX IF NOT EXISTS idx_llm_calls_ts ON llm_calls (ts);
