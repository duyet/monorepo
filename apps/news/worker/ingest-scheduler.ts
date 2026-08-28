import { DurableObject } from "cloudflare:workers";
import {
  armAlarmAt,
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
 */
export class NewsIngestScheduler extends DurableObject<Env> {
  async alarm(): Promise<void> {
    await this.tick();
  }

  async tick(opts: { force?: boolean } = {}): Promise<IngestTickResult> {
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

    try {
      const instance = await this.env.NEWS_INGEST.create();
      await this.ctx.storage.put(LAST_STARTED_KEY, now);
      const result: IngestTickResult = {
        id: instance.id,
        skipped: false,
      };
      await persistCreatedIngestRun(this.env.DB, result);
      return result;
    } catch (error) {
      console.error("ingest scheduler create failed:", error);
      return {
        id: null,
        skipped: false,
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async ensureArmed(): Promise<void> {
    const existing = await this.ctx.storage.getAlarm();
    if (existing === null) {
      await this.ctx.storage.setAlarm(armAlarmAt(Date.now()));
    }
  }
}
