import handler from "@tanstack/react-start/server-entry";
import type { Env } from "../worker/types";
import { NewsIngestWorkflow } from "../worker/workflow";
import {
  buildSitemapXml,
  loadSitemapUrls,
  robotsResponse,
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
      const resolved = await resolveEnv(env);
      const urls = resolved?.DB
        ? await loadSitemapUrls(resolved.DB)
        : staticSitemapUrls();
      return sitemapResponse(buildSitemapXml(urls));
    }
    return handler.fetch(request);
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await env.NEWS_INGEST.create();
  },
};

export { NewsIngestWorkflow };
