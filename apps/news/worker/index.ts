import { tickIngest } from "./ingest-schedule.js";
import type { Env } from "./types.js";

export { NewsIngestScheduler } from "./ingest-scheduler.js";
export { NewsIngestWorkflow } from "./workflow.js";

export async function scheduled(
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  await tickIngest(env);
}
