import handler from "@tanstack/react-start/server-entry";
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
  async fetch(request: Request, env: Env) {
    const path = new URL(request.url).pathname;
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
    return applyNotFoundHttpStatus(await handler.fetch(request));
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await env.NEWS_INGEST.create();
  },
};

export { NewsIngestWorkflow };
