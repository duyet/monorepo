export interface WorkflowRunStats {
  bySource?: Record<string, number>;
  new?: number;
  merged?: number;
  rejected?: number;
  published?: number;
  tokens?: number;
  backfilledSummaries?: number;
  backfilledTranslations?: number;
  qaRated?: number;
  qaAdjusted?: number;
  suggestionsReviewed?: number;
  submissionsReviewed?: number;
  tldrGenerated?: number;
  emailsSent?: number;
}

export interface WorkflowRunRow {
  id: string;
  started_at: number | null;
  finished_at: number | null;
  items_fetched: number | null;
  items_new: number | null;
  error: string | null;
  /** Parsed from the `stats` JSON column, added in migration 0012. Older
   * rows (or rows on a DB not yet migrated) have no stats — always null
   * in that case, never a partial/guessed object. */
  stats: WorkflowRunStats | null;
}

/** Best-effort parse of the `stats` JSON column: malformed JSON, a
 * non-object value, or a missing column (pre-migration-0012 DB) all fall
 * back to null rather than throwing, so the runs table just renders the
 * plain columns for that row. */
function parseRunStats(raw: unknown): WorkflowRunStats | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as WorkflowRunStats;
    }
    return null;
  } catch {
    return null;
  }
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
  models: ModelChains;
}

export interface ModelChains {
  scoring: string[];
  translation: string[];
  tldr: string[];
}

/** Splits the comma-separated ANYROUTER_* model fallback chains into
 * arrays. Public config (which models power scoring/translate/TL;DR), not
 * a secret — safe to surface on /about and /system. */
export function getModelChains(env: {
  ANYROUTER_MODEL?: string;
  ANYROUTER_TRANSLATE_MODEL?: string;
  ANYROUTER_TLDR_MODEL?: string;
}): ModelChains {
  const split = (chain: string | undefined): string[] =>
    (chain ?? "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

  const scoring = split(env.ANYROUTER_MODEL);
  const translation = split(env.ANYROUTER_TRANSLATE_MODEL);
  const tldr = split(env.ANYROUTER_TLDR_MODEL);
  return {
    scoring,
    translation: translation.length ? translation : scoring,
    tldr: tldr.length ? tldr : scoring,
  };
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

let runStatsSupported: boolean | null = null;

async function supportsRunStats(db: D1Database): Promise<boolean> {
  if (runStatsSupported !== null) return runStatsSupported;
  try {
    await db.prepare("SELECT stats FROM workflow_runs LIMIT 1").all();
    runStatsSupported = true;
  } catch {
    // column not migrated in yet (pre-0012 DB)
    runStatsSupported = false;
  }
  return runStatsSupported;
}

export async function loadSystemStats(
  db: D1Database,
  env: {
    ANYROUTER_MODEL?: string;
    ANYROUTER_TRANSLATE_MODEL?: string;
    ANYROUTER_TLDR_MODEL?: string;
  } = {}
): Promise<SystemStats> {
  const [hasTokens, hasRunStats] = await Promise.all([
    supportsLlmTokens(db),
    supportsRunStats(db),
  ]);

  const runsQuery = hasRunStats
    ? "SELECT id, started_at, finished_at, items_fetched, items_new, error, stats FROM workflow_runs ORDER BY started_at DESC LIMIT 30"
    : "SELECT id, started_at, finished_at, items_fetched, items_new, error FROM workflow_runs ORDER BY started_at DESC LIMIT 30";

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
      .prepare(runsQuery)
      .all<Omit<WorkflowRunRow, "stats"> & { stats?: string | null }>(),
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

  const runRows: WorkflowRunRow[] = (runs.results ?? []).map((r) => ({
    id: r.id,
    started_at: r.started_at,
    finished_at: r.finished_at,
    items_fetched: r.items_fetched,
    items_new: r.items_new,
    error: r.error,
    stats: parseRunStats(r.stats),
  }));
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
    models: getModelChains(env),
  };
}
