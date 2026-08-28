import { nn } from "./d1-bind.js";
import { buildRunStats, serializeRunStats } from "./run-stats.js";

/** Upsert used by ingest open-run / close-run. ON CONFLICT so a Workflow
 * replay, a JS `finally`, and the durable `close-run` step can all write
 * the same `workflow_runs.id` without failing the instance. */
export const UPSERT_WORKFLOW_RUN_SQL = `INSERT INTO workflow_runs (id, started_at, finished_at, items_fetched, items_new, error, stats)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  finished_at = excluded.finished_at,
  items_fetched = excluded.items_fetched,
  items_new = excluded.items_new,
  error = excluded.error,
  stats = excluded.stats`;

/** Read-your-writes check after the HTTP create-path upsert so POST does
 * not return an id that `/api/system` cannot see. */
export const SELECT_WORKFLOW_RUN_ID_SQL =
  "SELECT id FROM workflow_runs WHERE id = ?";

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
}

export interface D1Runner {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => D1BoundStatement;
  };
}

function d1RunFailed(result: unknown): boolean {
  return (
    !!result &&
    typeof result === "object" &&
    "success" in result &&
    (result as { success: unknown }).success === false
  );
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

async function verifyWorkflowRunRow(db: D1Runner, id: string): Promise<void> {
  const seen = await db
    .prepare(SELECT_WORKFLOW_RUN_ID_SQL)
    .bind(id)
    .first<{ id: string }>();
  if (seen?.id !== id) {
    throw new Error(`workflow_runs verify missed ${id}`);
  }
}

/** Upsert that must stick before POST /api/admin/ingest returns. Throws
 * after retries if D1 does not read back the same id — swallowing here
 * is what left lastRun on 42d830a9 after #1409. */
export async function persistOpenedWorkflowRunVerified(
  db: D1Runner,
  id: string,
  startedAt: number,
  stepName: OpenedRunStepName
): Promise<void> {
  const row = openedWorkflowRun(id, startedAt, stepName);
  let lastError: unknown;
  for (let attempt = 1; attempt <= PERSIST_ATTEMPTS; attempt++) {
    try {
      await persistWorkflowRun(db, row);
      await verifyWorkflowRunRow(db, id);
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
