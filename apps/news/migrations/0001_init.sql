-- News ingestion pipeline schema (D1 / SQLite)

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1
);

INSERT OR IGNORE INTO sources (id, name, type, config, enabled) VALUES
  ('hn', 'Hacker News', 'hn', '{"query":"AI OR LLM OR GPT OR Claude OR Gemini OR OpenAI OR Anthropic"}', 1),
  ('huggingnews', 'HuggingNews', 'huggingnews', '{}', 1);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY, -- sha256 hex of url
  source_id TEXT NOT NULL,
  external_id TEXT,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  published_at INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  llm_relevance REAL,
  llm_importance REAL,
  llm_quality REAL,
  category TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  rank_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_items_published_at ON items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_category_published_at ON items (category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_status ON items (status);

CREATE TABLE IF NOT EXISTS translations (
  item_id TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'vi',
  title TEXT,
  summary TEXT,
  PRIMARY KEY (item_id, lang)
);

CREATE TABLE IF NOT EXISTS tldr_snapshots (
  date TEXT PRIMARY KEY,
  bullets_en TEXT,
  bullets_vi TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id TEXT PRIMARY KEY,
  started_at INTEGER,
  finished_at INTEGER,
  items_fetched INTEGER,
  items_new INTEGER,
  error TEXT
);
