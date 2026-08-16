import { createServerFn } from "@tanstack/react-start";

export interface WorkflowRunRow {
  id: string;
  started_at: number | null;
  finished_at: number | null;
  items_fetched: number | null;
  items_new: number | null;
  error: string | null;
}

export interface DayCount {
  date: string;
  count: number;
}

export interface NamedCount {
  name: string;
  count: number;
}

export interface SystemStats {
  totals: {
    items: number;
    translations: number;
    tldrSnapshots: number;
    subscribers: number;
    sources: number;
    itemSourcesRows: number;
  };
  itemsByStatus: NamedCount[];
  itemsBySource: NamedCount[];
  itemsByCategory: NamedCount[];
  itemsPerDay: DayCount[];
  tokens: {
    total: number;
    avgPerItem: number;
    perDay: DayCount[];
  };
  runs: WorkflowRunRow[];
  runsToday: number;
  lastRun: WorkflowRunRow | null;
  latestTldrDate: string | null;
}

let llmTokensSupported: boolean | null = null;

async function supportsLlmTokens(db: D1Database): Promise<boolean> {
  if (llmTokensSupported !== null) return llmTokensSupported;
  try {
    await db.prepare("SELECT llm_tokens FROM items LIMIT 1").all();
    llmTokensSupported = true;
  } catch {
    // column not migrated in yet
    llmTokensSupported = false;
  }
  return llmTokensSupported;
}

async function loadSystemStats(db: D1Database): Promise<SystemStats> {
  const hasTokens = await supportsLlmTokens(db);

  const [
    itemsTotal,
    translationsTotal,
    tldrTotal,
    subscribersTotal,
    sourcesTotal,
    itemSourcesTotal,
    byStatus,
    bySource,
    byCategory,
    perDay,
    runs,
    latestTldr,
  ] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS c FROM items").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM translations").first<{ c: number }>(),
    db
      .prepare("SELECT COUNT(*) AS c FROM tldr_snapshots")
      .first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM subscribers").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM sources").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM item_sources").first<{ c: number }>(),
    db
      .prepare(
        "SELECT status AS name, COUNT(*) AS count FROM items GROUP BY status ORDER BY count DESC"
      )
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        "SELECT source_id AS name, COUNT(*) AS count FROM items GROUP BY source_id ORDER BY count DESC LIMIT 10"
      )
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        "SELECT COALESCE(category, 'uncategorized') AS name, COUNT(*) AS count FROM items GROUP BY name ORDER BY count DESC LIMIT 10"
      )
      .all<{ name: string; count: number }>(),
    db
      .prepare(
        `SELECT date(published_at, 'unixepoch') AS date, COUNT(*) AS count
         FROM items
         WHERE status = 'published' AND published_at >= unixepoch('now', '-14 days')
         GROUP BY date ORDER BY date ASC`
      )
      .all<{ date: string; count: number }>(),
    db
      .prepare(
        "SELECT id, started_at, finished_at, items_fetched, items_new, error FROM workflow_runs ORDER BY started_at DESC LIMIT 30"
      )
      .all<WorkflowRunRow>(),
    db
      .prepare("SELECT date FROM tldr_snapshots ORDER BY date DESC LIMIT 1")
      .first<{
        date: string;
      }>(),
  ]);

  let tokenTotal = 0;
  let tokenAvg = 0;
  let tokenPerDay: DayCount[] = [];
  if (hasTokens) {
    const [totalRow, avgRow, perDayRows] = await Promise.all([
      db
        .prepare("SELECT SUM(llm_tokens) AS s FROM items")
        .first<{ s: number | null }>(),
      db
        .prepare(
          "SELECT AVG(llm_tokens) AS a FROM items WHERE llm_tokens IS NOT NULL AND llm_tokens > 0"
        )
        .first<{ a: number | null }>(),
      db
        .prepare(
          `SELECT date(fetched_at, 'unixepoch') AS date, SUM(llm_tokens) AS count
           FROM items
           WHERE fetched_at >= unixepoch('now', '-14 days')
           GROUP BY date ORDER BY date ASC`
        )
        .all<{ date: string; count: number | null }>(),
    ]);
    tokenTotal = totalRow?.s ?? 0;
    tokenAvg = Math.round(avgRow?.a ?? 0);
    tokenPerDay = (perDayRows.results ?? []).map((r) => ({
      date: r.date,
      count: r.count ?? 0,
    }));
  }

  const runRows = runs.results ?? [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const runsToday = runRows.filter(
    (r) =>
      r.started_at &&
      new Date(r.started_at * 1000).toISOString().slice(0, 10) === todayStr
  ).length;

  return {
    totals: {
      items: itemsTotal?.c ?? 0,
      translations: translationsTotal?.c ?? 0,
      tldrSnapshots: tldrTotal?.c ?? 0,
      subscribers: subscribersTotal?.c ?? 0,
      sources: sourcesTotal?.c ?? 0,
      itemSourcesRows: itemSourcesTotal?.c ?? 0,
    },
    itemsByStatus: byStatus.results ?? [],
    itemsBySource: bySource.results ?? [],
    itemsByCategory: byCategory.results ?? [],
    itemsPerDay: perDay.results ?? [],
    tokens: {
      total: tokenTotal,
      avgPerItem: tokenAvg,
      perDay: tokenPerDay,
    },
    runs: runRows,
    runsToday,
    lastRun: runRows[0] ?? null,
    latestTldrDate: latestTldr?.date ?? null,
  };
}

export const fetchSystemStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<SystemStats> => {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: D1Database }).DB;
    if (!db) throw new Error("D1 binding DB not configured");
    return loadSystemStats(db);
  }
);
