import { nn } from "./d1-bind.js";
import { buildRunStats, serializeRunStats } from "./run-stats.js";

/** Upsert used by ingest open-run / close-run. ON CONFLICT so a Workflow
 * replay, a JS `finally`, and the durable `close-run` step can all write
 * the same `workflow_runs.id` without failing the instance.
 * `started_at` is updated on conflict so lastRun ORDER BY cannot keep an
 * older row on top.
 *
 * No RETURNING: D1 `.first()` / `.run().results` are empty for INSERT
 * (`results` is empty for writes). #1413 used INSERT…RETURNING + `.first()`
 * as write-path proof; live force POST then HTTP 500'd (`RETURNING missed`)
 * and lastRun stayed `42d830a9-…`. Writes go through `.run()` / `batch()`. */
export const UPSERT_WORKFLOW_RUN_SQL = `INSERT INTO workflow_runs (id, started_at, finished_at, items_fetched, items_new, error, stats)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  started_at = excluded.started_at,
  finished_at = excluded.finished_at,
  items_fetched = excluded.items_fetched,
  items_new = excluded.items_new,
  error = excluded.error,
  stats = excluded.stats`;

/** Same ordering `/api/system` uses for lastRun. `id DESC` breaks ties when
 * two rows share a second-precision `started_at` (concurrent force/alarm).
 * This SELECT — not WHERE-id and not INSERT RETURNING — is the 2xx gate:
 * a bind-echo or write-shaped `{id}` is not lastRun. */
export const SELECT_LATEST_WORKFLOW_RUN_ID_SQL =
  "SELECT id FROM workflow_runs ORDER BY started_at DESC, id DESC LIMIT 1";

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
  run?: () => Promise<unknown>;
  all?: () => Promise<{ results?: unknown[] } | unknown>;
}

/** Structural subset of `D1Database` / `D1DatabaseSession` so `Env.DB` stays
 * assignable. Do not add `batch` here: real D1 `batch(D1PreparedStatement[])`
 * is not assignable to a union that includes `D1BoundStatement` (TS2345 on
 * `tickIngest(env)` / persist). Call `batch` through `d1Batch()` instead. */
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
  const meta = (
    result as { meta?: { changes?: unknown; rows_written?: unknown } }
  ).meta;
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
  if (
    row &&
    typeof row === "object" &&
    typeof (row as { id?: unknown }).id === "string"
  ) {
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

/** Duck-typed D1 `batch()`, always invoked with the binding as `this`.
 * Kept off `D1Runner` so `D1Database` assigns. Do not extract
 * `const batch = db.batch` and call it unbound: native Workers D1 host
 * methods throw `Illegal invocation` (#1415 type-check follow-up, live
 * force POST HTTP 500, lastRun stayed `42d830a9-…`). */
async function d1Batch(
  db: D1Runner,
  statements: unknown[]
): Promise<unknown[] | undefined> {
  const batch = (db as { batch?: unknown }).batch;
  if (typeof batch !== "function") return undefined;
  const result = await (
    batch as (this: unknown, stmts: unknown[]) => unknown
  ).call(db, statements);
  return Array.isArray(result) ? result : undefined;
}

export async function persistWorkflowRun(
  db: D1Runner,
  row: WorkflowRunRecord
): Promise<void> {
  const result = await boundUpsert(db, row).run();
  assertWriteOk(result);
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

function boundUpsert(db: D1Runner, row: WorkflowRunRecord): D1BoundStatement {
  return db
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
}

async function readLatestWorkflowRunId(
  db: D1Runner
): Promise<string | undefined> {
  const stmt = db.prepare(SELECT_LATEST_WORKFLOW_RUN_ID_SQL);
  // Prefer row-returning APIs. `.run()` on a write is empty `.results`
  // (#1413); a SELECT `.run()` that also comes back empty is not lastRun.
  if (typeof stmt.all === "function") {
    const id = d1RowId(await stmt.all());
    if (id) return id;
  }
  if (typeof stmt.first === "function") {
    const id = d1RowId(await stmt.first<{ id: string }>());
    if (id) return id;
  }
  if (typeof stmt.run === "function") {
    const id = d1RowId(await stmt.run());
    if (id) return id;
  }
  return d1RowId(await stmt.bind().first<{ id: string }>());
}

function assertWriteOk(result: unknown): void {
  if (d1RunFailed(result)) {
    throw new Error("workflow_runs upsert returned success=false");
  }
  if (d1DidNotWrite(result)) {
    throw new Error("workflow_runs upsert wrote 0 rows");
  }
}

function assertLastRun(latestId: string | undefined, id: string): void {
  if (latestId !== id) {
    throw new Error(
      `workflow_runs lastRun is ${latestId ?? "null"} after persist ${id}`
    );
  }
}

/** `.run()` / `batch()` write, then the same lastRun SELECT `/api/system`
 * uses. INSERT RETURNING + `.first()` is not a D1 write API. Native D1
 * `batch()` is invoked with the binding as `this`; if that throws or the
 * SELECT `.results` are empty, fall through to `.run()` + a row read. */
async function persistAndConfirmLastRun(
  db: D1Runner,
  row: WorkflowRunRecord
): Promise<void> {
  const upsert = boundUpsert(db, row);
  let wrote = false;
  if (typeof (db as { batch?: unknown }).batch === "function") {
    try {
      const batched = await d1Batch(db, [
        upsert,
        db.prepare(SELECT_LATEST_WORKFLOW_RUN_ID_SQL),
      ]);
      if (batched && batched.length >= 2) {
        assertWriteOk(batched[0]);
        wrote = true;
        // Second batch result only — INSERT `{id}` / empty `.results` is not lastRun.
        if (d1RowId(batched[1]) === row.id) return;
      }
    } catch (error) {
      console.error("create d1 batch failed:", error);
    }
  }
  if (!wrote) {
    assertWriteOk(await upsert.run());
  }
  assertLastRun(await readLatestWorkflowRunId(db), row.id);
}

/** Upsert that must stick before POST /api/admin/ingest returns. Throws
 * after retries if D1 does not show the id as lastRun (`ORDER BY
 * started_at DESC, id DESC LIMIT 1` — same query `/api/system` uses).
 * #1413's INSERT…RETURNING `.first()` 500'd the live force POST while
 * lastRun stayed `42d830a9-…`; #1411's WHERE-id SELECT was 2xx for
 * `5419a68e-…` without that row becoming lastRun. */
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
      await persistAndConfirmLastRun(session, row);
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
