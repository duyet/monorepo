import { nn } from "./d1-bind.js";
import { buildRunStats, serializeRunStats } from "./run-stats.js";

/** Upsert used by ingest open-run / close-run. ON CONFLICT so a Workflow
 * replay, a JS `finally`, and the durable `close-run` step can all write
 * the same `workflow_runs.id` without failing the instance.
 * `started_at` is updated on conflict so lastRun ORDER BY cannot keep an
 * older row on top. RETURNING is the write-path proof #1411's separate
 * `WHERE id = ?` SELECT did not provide (live POST `5419a68e-…` was 2xx
 * with no lastRun row). */
export const UPSERT_WORKFLOW_RUN_SQL = `INSERT INTO workflow_runs (id, started_at, finished_at, items_fetched, items_new, error, stats)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  started_at = excluded.started_at,
  finished_at = excluded.finished_at,
  items_fetched = excluded.items_fetched,
  items_new = excluded.items_new,
  error = excluded.error,
  stats = excluded.stats
RETURNING id, started_at`;

/** Read-your-writes check after the HTTP create-path upsert so POST does
 * not return an id that `/api/system` cannot see. */
export const SELECT_WORKFLOW_RUN_ID_SQL =
  "SELECT id FROM workflow_runs WHERE id = ?";

/** Same ordering `/api/system` uses for lastRun. A WHERE-id hit that is
 * not this row is still a phantom as far as recert is concerned. */
export const SELECT_LATEST_WORKFLOW_RUN_ID_SQL =
  "SELECT id FROM workflow_runs ORDER BY started_at DESC LIMIT 1";

const PERSIST_ATTEMPTS = 3;

export interface WorkflowRunRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  itemsFetched: number;
  itemsNew: number;
  error: string | null;
  statsJson: string;
}

export interface D1BoundStatement {
  run: () => Promise<unknown>;
  first: <T>() => Promise<T | null>;
  all?: () => Promise<{ results?: unknown[] } | unknown>;
}

export interface D1PreparedStatement {
  bind: (...args: unknown[]) => D1BoundStatement;
  first?: <T>() => Promise<T | null>;
}

export interface D1Runner {
  prepare: (sql: string) => D1PreparedStatement;
  withSession?: (constraint: string) => D1Runner;
}

function d1RunFailed(result: unknown): boolean {
  return (
    !!result &&
    typeof result === "object" &&
    "success" in result &&
    (result as { success: unknown }).success === false
  );
}

function d1DidNotWrite(result: unknown): boolean {
  if (!result || typeof result !== "object") return false;
  const meta = (result as { meta?: { changes?: unknown; rows_written?: unknown } })
    .meta;
  if (!meta) return false;
  const written =
    typeof meta.changes === "number"
      ? meta.changes
      : typeof meta.rows_written === "number"
        ? meta.rows_written
        : null;
  return written !== null && written < 1;
}

/** D1 `.first()`, `.all().results[0]`, or a row-shaped object. */
export function d1RowId(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  const rec = result as { id?: unknown; results?: unknown[] };
  if (typeof rec.id === "string" && rec.id.length > 0) return rec.id;
  const row = Array.isArray(rec.results) ? rec.results[0] : undefined;
  if (row && typeof row === "object" && typeof (row as { id?: unknown }).id === "string") {
    const id = (row as { id: string }).id;
    if (id.length > 0) return id;
  }
  return undefined;
}

export function d1Session(db: D1Runner): D1Runner {
  if (typeof db.withSession === "function") {
    return db.withSession("first-primary");
  }
  return db;
}

export async function persistWorkflowRun(
  db: D1Runner,
  row: WorkflowRunRecord
): Promise<void> {
  const result = await db
    .prepare(UPSERT_WORKFLOW_RUN_SQL)
    .bind(
      nn(row.id),
      nn(row.startedAt),
      nn(row.finishedAt),
      nn(row.itemsFetched),
      nn(row.itemsNew),
      nn(row.error),
      nn(row.statsJson)
    )
    .run();
  if (d1RunFailed(result)) {
    throw new Error("workflow_runs upsert returned success=false");
  }
  if (d1DidNotWrite(result)) {
    throw new Error("workflow_runs upsert wrote 0 rows");
  }
}

export type OpenedRunStepName = "create" | "open-run";

/** Row written at Workflow `create()` and again at `run()` start so
 * `/api/system` lastRun.id matches the POST id before fetch/LLM. */
export function openedWorkflowRun(
  id: string,
  startedAt: number,
  stepName: OpenedRunStepName
): WorkflowRunRecord {
  return {
    id,
    startedAt,
    finishedAt: startedAt,
    itemsFetched: 0,
    itemsNew: 0,
    error: null,
    statsJson: serializeRunStats(
      buildRunStats({
        steps: [{ name: stepName, action: "started" }],
      })
    ),
  };
}

/** Best-effort upsert. Never throws — Workflow `run()` must continue even
 * if this observability write fails. HTTP create-path uses
 * `persistOpenedWorkflowRunVerified` instead. */
export async function persistOpenedWorkflowRun(
  db: D1Runner | undefined,
  id: string | null | undefined,
  startedAt: number,
  stepName: OpenedRunStepName
): Promise<void> {
  if (!db || !id) return;
  try {
    await persistWorkflowRun(db, openedWorkflowRun(id, startedAt, stepName));
  } catch (error) {
    console.error(`${stepName} d1 failed:`, error);
  }
}

async function returningWorkflowRunRow(
  db: D1Runner,
  row: WorkflowRunRecord
): Promise<void> {
  const bound = db
    .prepare(UPSERT_WORKFLOW_RUN_SQL)
    .bind(
      nn(row.id),
      nn(row.startedAt),
      nn(row.finishedAt),
      nn(row.itemsFetched),
      nn(row.itemsNew),
      nn(row.error),
      nn(row.statsJson)
    );
  const written = await bound.first<{ id: string; started_at?: number }>();
  if (d1RowId(written) !== row.id) {
    throw new Error(`workflow_runs RETURNING missed ${row.id}`);
  }
}

async function verifyWorkflowRunIsLastRun(
  db: D1Runner,
  id: string
): Promise<void> {
  const byId = await db
    .prepare(SELECT_WORKFLOW_RUN_ID_SQL)
    .bind(id)
    .first<{ id: string }>();
  if (d1RowId(byId) !== id) {
    throw new Error(`workflow_runs verify missed ${id}`);
  }
  const latestStmt = db.prepare(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
  const latest = latestStmt.first
    ? await latestStmt.first<{ id: string }>()
    : await latestStmt.bind().first<{ id: string }>();
  if (d1RowId(latest) !== id) {
    throw new Error(
      `workflow_runs lastRun is ${d1RowId(latest) ?? "null"} after persist ${id}`
    );
  }
}

/** Upsert that must stick before POST /api/admin/ingest returns. Throws
 * after retries if D1 does not RETURN the id and show it as lastRun —
 * #1411's WHERE-id SELECT still let live POST `5419a68e-…` return 2xx
 * while `/api/system` lastRun stayed `42d830a9-…`. */
export async function persistOpenedWorkflowRunVerified(
  db: D1Runner,
  id: string,
  startedAt: number,
  stepName: OpenedRunStepName
): Promise<void> {
  const row = openedWorkflowRun(id, startedAt, stepName);
  const session = d1Session(db);
  let lastError: unknown;
  for (let attempt = 1; attempt <= PERSIST_ATTEMPTS; attempt++) {
    try {
      await returningWorkflowRunRow(session, row);
      await verifyWorkflowRunIsLastRun(session, id);
      return;
    } catch (error) {
      lastError = error;
      console.error(`${stepName} d1 failed (attempt ${attempt}):`, error);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`${stepName} d1 failed`);
}

/** Cloudflare Workflows JSON-serialize step returns. `Map` becomes `{}`,
 * so later `.get` / `.size` throw on replay and the instance never reaches
 * close-run. Persist entries (or a plain object) and rebuild the Map. */
export function jsonMap<K extends string, V>(
  value: Map<K, V> | [K, V][] | Record<string, V> | null | undefined
): Map<K, V> {
  if (value instanceof Map) return value;
  if (Array.isArray(value)) return new Map(value);
  if (value && typeof value === "object") {
    return new Map(Object.entries(value) as [K, V][]);
  }
  return new Map();
}

export function mapEntries<K, V>(map: Map<K, V>): [K, V][] {
  return [...map.entries()];
}

/** Workflow `create()` id, so POST /api/admin/ingest `{id}` matches
 * `workflow_runs.id` / `/api/system` lastRun.id. */
export function ingestRunId(event: { instanceId?: string }): string {
  if (typeof event.instanceId === "string" && event.instanceId.length > 0) {
    return event.instanceId;
  }
  return crypto.randomUUID();
}
