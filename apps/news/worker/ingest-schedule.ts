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
 * HTTP ingest must persist `workflow_runs` on the Worker D1 binding
 * **before** `NEWS_INGEST.create()`: #1409 upserted after create() (and
 * swallowed D1 errors), and live POST `9a1002fa-…` never appeared in
 * `/api/system`. Split gate/start so the Worker can write+verify first. */
export interface IngestSchedulerRpc {
  tick(opts?: IngestTickOpts): Promise<IngestTickResult>;
  canStart(opts?: IngestTickOpts): Promise<IngestTickResult>;
  startInstance(id: string): Promise<IngestTickResult>;
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
    const gate = await stub.canStart(opts);
    if (gate.skipped) return gate;
    return startCreatedIngest(env, stub);
  }
  return startCreatedIngest(env);
}

/** Choose the instance id, persist+verify `workflow_runs`, then
 * `create({ id })`. POST `{id}` is this uuid, not whatever create()
 * would mint after a D1 write that may never commit. */
async function startCreatedIngest(
  env: {
    DB?: D1Runner;
    NEWS_INGEST: Workflow;
  },
  stub?: Pick<IngestSchedulerRpc, "startInstance">
): Promise<IngestTickResult> {
  const id = crypto.randomUUID();
  const result: IngestTickResult = { id, skipped: false };
  await persistCreatedIngestRunVerified(env.DB, result);
  if (stub) {
    const started = await stub.startInstance(id);
    return {
      id,
      skipped: false,
      reason: started.reason,
    };
  }
  await env.NEWS_INGEST.create({ id });
  return result;
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

/** Must succeed before `create()` / POST 2xx. Throws if D1 does not
 * read back the row. No-ops when DB is unbound (unit tests). */
export async function persistCreatedIngestRunVerified(
  db: D1Runner | undefined,
  result: IngestTickResult
): Promise<void> {
  if (result.skipped || !result.id || !db) return;
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
