import type { Env } from "./types.js";

export { NewsIngestWorkflow } from "./workflow.js";

export async function scheduled(
  _controller: ScheduledController,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  await env.NEWS_INGEST.create();
}
