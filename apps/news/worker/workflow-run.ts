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

export interface WorkflowRunRecord {
  id: string;
  startedAt: number;
  finishedAt: number;
  itemsFetched: number;
  itemsNew: number;
  error: string | null;
  statsJson: string;
}

export interface D1Runner {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => { run: () => Promise<unknown> };
  };
}

export async function persistWorkflowRun(
  db: D1Runner,
  row: WorkflowRunRecord
): Promise<void> {
  await db
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

/** Best-effort upsert. Never throws — `create()` already succeeded, and
 * ingest must continue even if this observability write fails. */
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
