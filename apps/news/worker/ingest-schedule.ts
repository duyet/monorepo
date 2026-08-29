import { toEpochSeconds } from "./time.js";
import {
  type D1Runner,
  persistOpenedWorkflowRun,
  persistOpenedWorkflowRunVerified,
} from "./workflow-run.js";

/** Coalescing rules for news ingest triggers (GitHub Actions, admin POST,
 * Durable Object alarm). Kept free of `cloudflare:workers` so node tests
 * can import them. */

/** Minimum gap between `NEWS_INGEST.create()` calls. GitHub's 15-minute
 * watchdog and the hourly Durable Object alarm both hit the same endpoint;
 * without this, overlapping Workflow instances stack up and starve. */
export const INGEST_MIN_INTERVAL_MS = 45 * 60 * 1000;

/** Recurring Durable Object alarm interval. Not a Worker cron trigger —
 * DO alarms do not count against the Free-plan 5-cron cap. */
export const INGEST_ALARM_INTERVAL_MS = 60 * 60 * 1000;

/** First alarm after a cold arm (deploy / first public hit) so the hourly
 * loop starts without waiting a full hour. */
export const INGEST_ALARM_ARM_DELAY_MS = 15_000;

export const INGEST_SCHEDULER_NAME = "default";

const MARK_STARTED_ATTEMPTS = 3;

export interface IngestTickResult {
  id: string | null;
  skipped: boolean;
  reason?: string;
}

export interface IngestTickOpts {
  force?: boolean;
}

/** RPC surface of `NewsIngestScheduler`. Declared here so admin handlers
 * can call it without importing `cloudflare:workers`.
 *
 * HTTP ingest persists `workflow_runs` on the Worker D1 binding (the one
 * `/api/system` reads) **before** `NEWS_INGEST.create({ id })` in this
 * isolate. The Durable Object only gates the 45-minute coalesce and
 * records last-started — it must not be the create() path, because a
 * Workflow id is not a `workflow_runs` row. */
export interface IngestSchedulerRpc {
  tick(opts?: IngestTickOpts): Promise<IngestTickResult>;
  canStart(opts?: IngestTickOpts): Promise<IngestTickResult>;
  startInstance(id: string): Promise<IngestTickResult>;
  markStarted(id: string): Promise<void>;
  ensureArmed(): Promise<void>;
}

function schedulerStub(ns: DurableObjectNamespace): IngestSchedulerRpc {
  return ns.get(
    ns.idFromName(INGEST_SCHEDULER_NAME)
  ) as unknown as IngestSchedulerRpc;
}

export async function tickIngest(
  env: {
    DB?: D1Runner;
    NEWS_INGEST: Workflow;
    NEWS_INGEST_SCHEDULER?: DurableObjectNamespace;
  },
  opts: IngestTickOpts = {}
): Promise<IngestTickResult> {
  if (env.NEWS_INGEST_SCHEDULER) {
    const stub = schedulerStub(env.NEWS_INGEST_SCHEDULER);
    // Fail closed on gate errors — do not swallow into skipped:false
    // (that would bypass the 45-minute coalesce during a DO outage).
    const gate = await stub.canStart(opts);
    if (gate.skipped) return gate;
    return startCreatedIngest(env, stub);
  }
  return startCreatedIngest(env);
}

/** Choose the instance id, persist+verify `workflow_runs` as lastRun,
 * then `create({ id })` from this Worker. POST `{id}` is this uuid.
 * create() / markStarted failures throw so the admin route is non-2xx —
 * never return a persisted id as HTTP 200 when the Workflow did not
 * start or the coalesce clock was not updated. */
async function startCreatedIngest(
  env: {
    DB?: D1Runner;
    NEWS_INGEST: Workflow;
  },
  stub?: Pick<IngestSchedulerRpc, "markStarted">
): Promise<IngestTickResult> {
  const id = crypto.randomUUID();
  const result: IngestTickResult = { id, skipped: false };
  await persistCreatedIngestRunVerified(env.DB, result);
  await env.NEWS_INGEST.create({ id });
  if (stub) {
    await markStartedOrThrow(stub, id);
  }
  return result;
}

async function markStartedOrThrow(
  stub: Pick<IngestSchedulerRpc, "markStarted">,
  id: string
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MARK_STARTED_ATTEMPTS; attempt++) {
    try {
      await stub.markStarted(id);
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `ingest scheduler markStarted failed (attempt ${attempt}):`,
        error
      );
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("ingest scheduler markStarted failed");
}

/** Best-effort upsert after the Durable Object alarm `create()`. HTTP
 * ingest uses `persistCreatedIngestRunVerified` instead. */
export async function persistCreatedIngestRun(
  db: D1Runner | undefined,
  result: IngestTickResult
): Promise<void> {
  if (result.skipped || !result.id) return;
  await persistOpenedWorkflowRun(
    db,
    result.id,
    toEpochSeconds(Date.now()),
    "create"
  );
}

/** Must succeed before `create()` / POST 2xx. Throws if D1 is unbound or
 * does not read back the row as lastRun. */
export async function persistCreatedIngestRunVerified(
  db: D1Runner | undefined,
  result: IngestTickResult
): Promise<void> {
  if (result.skipped || !result.id) return;
  if (!db) {
    throw new Error("workflow_runs persist requires DB");
  }
  await persistOpenedWorkflowRunVerified(
    db,
    result.id,
    toEpochSeconds(Date.now()),
    "create"
  );
}

export async function ensureIngestAlarm(env: {
  NEWS_INGEST_SCHEDULER?: DurableObjectNamespace;
}): Promise<void> {
  if (!env.NEWS_INGEST_SCHEDULER) return;
  await schedulerStub(env.NEWS_INGEST_SCHEDULER).ensureArmed();
}

export function shouldSkipIngest(
  lastStartedAt: number | null | undefined,
  now: number,
  opts: IngestTickOpts = {}
): boolean {
  if (opts.force) return false;
  if (lastStartedAt == null) return false;
  return now - lastStartedAt < INGEST_MIN_INTERVAL_MS;
}

export function nextAlarmAt(now: number): number {
  return now + INGEST_ALARM_INTERVAL_MS;
}

export function armAlarmAt(now: number): number {
  return now + INGEST_ALARM_ARM_DELAY_MS;
}
