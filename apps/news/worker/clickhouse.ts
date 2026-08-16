import type { Env } from "./types.js";

/** Reference DDL for the mirrored ClickHouse table; applied via infra setup, not by this worker. */
export const NEWS_ITEMS_DDL = `
CREATE TABLE IF NOT EXISTS news.items
(
    id String,
    source_id LowCardinality(String),
    external_id String,
    url String,
    title String,
    summary String,
    published_at DateTime,
    fetched_at DateTime,
    points UInt32,
    comments UInt32,
    llm_relevance Nullable(Float32),
    llm_importance Nullable(Float32),
    llm_quality Nullable(Float32),
    category LowCardinality(String),
    tags Array(String),
    rank_score Float32,
    status LowCardinality(String),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY toYYYYMM(published_at)
ORDER BY (source_id, published_at, id)
`;

export interface MirrorRow {
  id: string;
  source_id: string;
  external_id: string;
  url: string;
  title: string;
  summary: string;
  published_at: string;
  fetched_at: string;
  points: number;
  comments: number;
  llm_relevance: number | null;
  llm_importance: number | null;
  llm_quality: number | null;
  category: string;
  tags: string[];
  rank_score: number;
  status: string;
}

export async function mirrorItems(env: Env, rows: MirrorRow[]): Promise<void> {
  if (!env.CLICKHOUSE_HOST || rows.length === 0) return;

  const database = env.CLICKHOUSE_DATABASE || "news";
  const body = rows.map((row) => JSON.stringify(row)).join("\n");

  try {
    const res = await fetch(
      `${env.CLICKHOUSE_HOST}/?query=${encodeURIComponent(
        `INSERT INTO ${database}.items FORMAT JSONEachRow`
      )}`,
      {
        method: "POST",
        headers: {
          "X-ClickHouse-User": env.CLICKHOUSE_NEWS_USER ?? "",
          "X-ClickHouse-Key": env.CLICKHOUSE_NEWS_PASSWORD ?? "",
          "Content-Type": "text/plain",
        },
        body,
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (!res.ok) {
      console.error("clickhouse mirror failed:", res.status, await res.text());
    }
  } catch (error) {
    console.error("clickhouse mirror error:", error);
  }
}
