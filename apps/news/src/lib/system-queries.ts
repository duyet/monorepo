import { WORKFLOW_RUN_STARTED_AT_ORDER_SQL } from "../../worker/workflow-run.js";

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
  notified?: Record<string, number>;
  notifyReason?: Record<string, unknown>;
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
  /** LLM attempts attributed to this run by timestamp window (from
   * `llm_calls`). Empty when the table is missing or no calls overlap. */
  llm?: RunLlmSummary;
}

/** One anyrouter attempt from `llm_calls`, including optional usage split
 * from migration 0016. */
export interface LlmCallRow {
  ts: number;
  task: string;
  model: string;
  ok: boolean;
  tokens: number;
  durationMs: number;
  promptChars: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  cachedTokens: number | null;
  error: string | null;
}

export interface RunLlmSummary {
  calls: number;
  failures: number;
  tokens: number;
  cachedTokens: number;
  durationMs: number;
  /** Distinct models attempted (ok or fail), first-seen order — shows
   * fallback chains as e.g. anyrouter/auto → google/gemma-4-…. */
  models: string[];
  /** Per-attempt rows for the expandable Recent runs detail. */
  attempts: LlmCallRow[];
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

export interface LlmDayTaskCount {
  date: string;
  task: string;
  calls: number;
  failures: number;
  tokens: number;
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
  llmCallsPerDay: LlmDayTaskCount[];
}

/** Legacy workflow_runs rows may store started_at/finished_at in ms. */
function normalizeTs(v: number | null): number | null {
  if (v == null) return null;
  return v > 1e12 ? Math.floor(v / 1000) : v;
}

function normalizeRunRow(
  row: Omit<WorkflowRunRow, "stats" | "llm"> & {
    stats?: string | null;
  }
): WorkflowRunRow {
  return {
    id: row.id,
    started_at: normalizeTs(row.started_at),
    finished_at: normalizeTs(row.finished_at),
    items_fetched: row.items_fetched,
    items_new: row.items_new,
    error: row.error,
    stats: parseRunStats(row.stats),
  };
}

/** Grace ms after finished_at so trailing log inserts still match. */
const LLM_RUN_GRACE_MS = 15_000;

function emptyLlmSummary(): RunLlmSummary {
  return {
    calls: 0,
    failures: 0,
    tokens: 0,
    cachedTokens: 0,
    durationMs: 0,
    models: [],
    attempts: [],
  };
}

function summarizeAttempts(attempts: LlmCallRow[]): RunLlmSummary {
  const summary = emptyLlmSummary();
  const seenModels = new Set<string>();
  for (const call of attempts) {
    summary.calls += 1;
    if (!call.ok) summary.failures += 1;
    summary.tokens += call.tokens;
    summary.cachedTokens += call.cachedTokens ?? 0;
    summary.durationMs += call.durationMs;
    if (!seenModels.has(call.model)) {
      seenModels.add(call.model);
      summary.models.push(call.model);
    }
  }
  summary.attempts = attempts;
  return summary;
}

/** Attribute llm_calls rows to runs by timestamp window. Exported for tests. */
export function attachLlmCallsToRuns(
  runs: WorkflowRunRow[],
  calls: LlmCallRow[]
): WorkflowRunRow[] {
  if (runs.length === 0) return runs;
  const buckets = new Map<string, LlmCallRow[]>();
  for (const run of runs) buckets.set(run.id, []);

  for (const call of calls) {
    let best: WorkflowRunRow | null = null;
    let bestSpan = Number.POSITIVE_INFINITY;
    for (const run of runs) {
      if (run.started_at == null) continue;
      const startMs = run.started_at * 1000;
      const endMs =
        (run.finished_at ?? Math.floor(Date.now() / 1000)) * 1000 +
        LLM_RUN_GRACE_MS;
      if (call.ts < startMs || call.ts > endMs) continue;
      const span = endMs - startMs;
      if (span < bestSpan) {
        bestSpan = span;
        best = run;
      }
    }
    if (best) buckets.get(best.id)?.push(call);
  }

  return runs.map((run) => {
    const attempts = (buckets.get(run.id) ?? []).sort((a, b) => a.ts - b.ts);
    return {
      ...run,
      llm: attempts.length ? summarizeAttempts(attempts) : undefined,
    };
  });
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

let llmCallsSupported: boolean | null = null;

async function supportsLlmCalls(db: D1Database): Promise<boolean> {
  if (llmCallsSupported !== null) return llmCallsSupported;
  try {
    await db.prepare("SELECT ts FROM llm_calls LIMIT 1").all();
    llmCallsSupported = true;
  } catch {
    llmCallsSupported = false;
  }
  return llmCallsSupported;
}

async function loadLlmCallsPerDay(db: D1Database): Promise<LlmDayTaskCount[]> {
  const { results } = await db
    .prepare(
      `SELECT date(ts / 1000, 'unixepoch') AS date,
              task,
              COUNT(*) AS calls,
              SUM(CASE WHEN ok = 0 THEN 1 ELSE 0 END) AS failures,
              SUM(COALESCE(tokens, 0)) AS tokens
       FROM llm_calls
       WHERE ts >= (unixepoch('now') - 14 * 86400) * 1000
       GROUP BY date, task
       ORDER BY date ASC, task ASC`
    )
    .all<{
      date: string;
      task: string;
      calls: number;
      failures: number;
      tokens: number | null;
    }>();
  return (results ?? []).map((r) => ({
    date: r.date,
    task: r.task,
    calls: r.calls,
    failures: r.failures,
    tokens: r.tokens ?? 0,
  }));
}

interface LlmCallDbRow {
  ts: number;
  task: string;
  model: string;
  ok: number;
  tokens: number | null;
  duration_ms: number | null;
  prompt_chars: number | null;
  error: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  cached_tokens?: number | null;
}

function mapLlmCallRow(r: LlmCallDbRow): LlmCallRow {
  return {
    ts: r.ts,
    task: r.task,
    model: r.model,
    ok: r.ok === 1,
    tokens: r.tokens ?? 0,
    durationMs: r.duration_ms ?? 0,
    promptChars: r.prompt_chars ?? null,
    promptTokens: r.prompt_tokens ?? null,
    completionTokens: r.completion_tokens ?? null,
    cachedTokens: r.cached_tokens ?? null,
    error: r.error ?? null,
  };
}

/** Recent llm_calls covering the last N workflow runs' time window. */
async function loadRecentLlmCalls(
  db: D1Database,
  sinceMs: number
): Promise<LlmCallRow[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT ts, task, model, ok, tokens, duration_ms, prompt_chars, error,
                prompt_tokens, completion_tokens, cached_tokens
         FROM llm_calls
         WHERE ts >= ?
         ORDER BY ts ASC
         LIMIT 2000`
      )
      .bind(sinceMs)
      .all<LlmCallDbRow>();
    return (results ?? []).map(mapLlmCallRow);
  } catch {
    // Pre-0016 DB without usage columns.
    const { results } = await db
      .prepare(
        `SELECT ts, task, model, ok, tokens, duration_ms, prompt_chars, error
         FROM llm_calls
         WHERE ts >= ?
         ORDER BY ts ASC
         LIMIT 2000`
      )
      .bind(sinceMs)
      .all<LlmCallDbRow>();
    return (results ?? []).map(mapLlmCallRow);
  }
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
  const [hasTokens, hasRunStats, hasLlmCalls] = await Promise.all([
    supportsLlmTokens(db),
    supportsRunStats(db),
    supportsLlmCalls(db),
  ]);

  const runColumns = hasRunStats
    ? "id, started_at, finished_at, items_fetched, items_new, error, stats"
    : "id, started_at, finished_at, items_fetched, items_new, error";
  const runsQuery = `SELECT ${runColumns} FROM workflow_runs ORDER BY ${WORKFLOW_RUN_STARTED_AT_ORDER_SQL} DESC, id DESC LIMIT 30`;

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
      .all<Omit<WorkflowRunRow, "stats" | "llm"> & { stats?: string | null }>(),
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

  const runRowsRaw: WorkflowRunRow[] = (runs.results ?? []).map(
    normalizeRunRow
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const runsToday = runRowsRaw.filter(
    (r) =>
      r.started_at &&
      new Date(r.started_at * 1000).toISOString().slice(0, 10) === todayStr
  ).length;

  let llmCallsPerDay: LlmDayTaskCount[] = [];
  let runRows = runRowsRaw;
  if (hasLlmCalls) {
    try {
      llmCallsPerDay = await loadLlmCallsPerDay(db);
    } catch {
      llmCallsPerDay = [];
    }
    try {
      const oldestStart = runRowsRaw.reduce<number | null>((min, r) => {
        if (r.started_at == null) return min;
        return min == null ? r.started_at : Math.min(min, r.started_at);
      }, null);
      const sinceMs =
        oldestStart != null ? oldestStart * 1000 : Date.now() - 7 * 86400_000;
      const recentCalls = await loadRecentLlmCalls(db, sinceMs);
      runRows = attachLlmCallsToRuns(runRowsRaw, recentCalls);
    } catch {
      // leave runs without llm detail
    }
  }

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
    llmCallsPerDay,
  };
}
