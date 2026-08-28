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

/** RPC surface of `NewsIngestScheduler`. Declared here so admin handlers
 * can call it without importing `cloudflare:workers`. */
export interface IngestSchedulerRpc {
  tick(opts?: { force?: boolean }): Promise<IngestTickResult>;
  ensureArmed(): Promise<void>;
}

export async function tickIngest(
  env: {
    NEWS_INGEST: Workflow;
    NEWS_INGEST_SCHEDULER?: DurableObjectNamespace;
  },
  opts: { force?: boolean } = {}
): Promise<IngestTickResult> {
  if (env.NEWS_INGEST_SCHEDULER) {
    const ns = env.NEWS_INGEST_SCHEDULER;
    const stub = ns.get(
      ns.idFromName(INGEST_SCHEDULER_NAME)
    ) as unknown as IngestSchedulerRpc;
    return stub.tick(opts);
  }
  const instance = await env.NEWS_INGEST.create();
  return { id: instance.id, skipped: false };
}

export async function ensureIngestAlarm(env: {
  NEWS_INGEST_SCHEDULER?: DurableObjectNamespace;
}): Promise<void> {
  if (!env.NEWS_INGEST_SCHEDULER) return;
  const ns = env.NEWS_INGEST_SCHEDULER;
  const stub = ns.get(
    ns.idFromName(INGEST_SCHEDULER_NAME)
  ) as unknown as IngestSchedulerRpc;
  await stub.ensureArmed();
}

export function shouldSkipIngest(
  lastStartedAt: number | null | undefined,
  now: number,
  opts: { force?: boolean } = {}
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
