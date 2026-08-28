import { DurableObject } from "cloudflare:workers";
import {
  armAlarmAt,
  type IngestTickOpts,
  type IngestTickResult,
  nextAlarmAt,
  persistCreatedIngestRun,
  shouldSkipIngest,
} from "./ingest-schedule.js";
import type { Env } from "./types.js";

const LAST_STARTED_KEY = "last_started_at";

/**
 * Singleton Durable Object that fires hourly ingest without a Worker cron
 * trigger (Free accounts are capped at 5 crons). GitHub Actions remains a
 * watchdog; both paths call `tick()` so overlapping POSTs coalesce.
 *
 * HTTP `POST /api/admin/ingest` uses `canStart` + Worker D1 persist +
 * `startInstance` so `workflow_runs` is committed on the same binding
 * `/api/system` reads **before** `NEWS_INGEST.create()`.
 */
export class NewsIngestScheduler extends DurableObject<Env> {
  async alarm(): Promise<void> {
    await this.tick();
  }

  async canStart(opts: IngestTickOpts = {}): Promise<IngestTickResult> {
    const now = Date.now();
    const lastStartedAt = await this.ctx.storage.get<number>(LAST_STARTED_KEY);
    await this.ctx.storage.setAlarm(nextAlarmAt(now));

    if (shouldSkipIngest(lastStartedAt, now, opts)) {
      return {
        id: null,
        skipped: true,
        reason: "ran recently",
      };
    }
    return { id: null, skipped: false };
  }

  async startInstance(id: string): Promise<IngestTickResult> {
    const now = Date.now();
    try {
      await this.env.NEWS_INGEST.create({ id });
      await this.ctx.storage.put(LAST_STARTED_KEY, now);
      await this.ctx.storage.setAlarm(nextAlarmAt(now));
      return { id, skipped: false };
    } catch (error) {
      console.error("ingest scheduler create failed:", error);
      return {
        id,
        skipped: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async tick(opts: IngestTickOpts = {}): Promise<IngestTickResult> {
    const gate = await this.canStart(opts);
    if (gate.skipped) return gate;

    const id = crypto.randomUUID();
    const result: IngestTickResult = { id, skipped: false };
    await persistCreatedIngestRun(this.env.DB, result);
    return this.startInstance(id);
  }

  async ensureArmed(): Promise<void> {
    const existing = await this.ctx.storage.getAlarm();
    if (existing === null) {
      await this.ctx.storage.setAlarm(armAlarmAt(Date.now()));
    }
  }
}
