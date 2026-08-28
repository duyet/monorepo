import handler from "@tanstack/react-start/server-entry";
import { ensureIngestAlarm, tickIngest } from "../worker/ingest-schedule";
import { NewsIngestScheduler } from "../worker/ingest-scheduler";
import { handlePublicCors } from "../worker/public-cors";
import { handleSubscribeCors } from "../worker/subscribe/cors";
import type { Env } from "../worker/types";
import { NewsIngestWorkflow } from "../worker/workflow";
import { applyNotFoundHttpStatus } from "./lib/not-found-status";
import {
  buildSitemapXml,
  loadSitemapUrls,
  robotsResponse,
  safeSitemapResponse,
  sitemapResponse,
  staticSitemapUrls,
} from "./lib/sitemap";

async function resolveEnv(env?: Env): Promise<Env | undefined> {
  if (env?.DB) return env;
  try {
    const workers = await import("cloudflare:workers");
    return workers.env as Env;
  } catch {
    return env;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx?: ExecutionContext) {
    const path = new URL(request.url).pathname;
    if (path === "/api/public" || path === "/api/admin/ingest") {
      ctx?.waitUntil?.(ensureIngestAlarm(env));
    }
    if (path === "/robots.txt") {
      return robotsResponse();
    }
    if (path === "/sitemap.xml") {
      try {
        return await safeSitemapResponse(async () => {
          const resolved = await resolveEnv(env);
          return resolved?.DB
            ? loadSitemapUrls(resolved.DB)
            : staticSitemapUrls();
        });
      } catch (error) {
        console.error("sitemap.xml failed; serving static fallback", error);
        return sitemapResponse(buildSitemapXml(staticSitemapUrls()));
      }
    }
    return handlePublicCors(request, () =>
      handleSubscribeCors(request, async () =>
        applyNotFoundHttpStatus(await handler.fetch(request))
      )
    );
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await tickIngest(env);
  },
};

export { NewsIngestScheduler, NewsIngestWorkflow };
