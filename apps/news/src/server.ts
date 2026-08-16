import handler from "@tanstack/react-start/server-entry";
import type { Env } from "../worker/types";
import { NewsIngestWorkflow } from "../worker/workflow";

export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await env.NEWS_INGEST.create();
  },
};

export { NewsIngestWorkflow };
