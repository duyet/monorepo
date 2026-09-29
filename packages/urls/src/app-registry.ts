/**
 * Canonical registry of duyet.net apps.
 * Single source of truth for production origins and deploy aliases.
 */

import type { AppUrls } from "./types";

export interface AppRegistryEntry {
  id: string;
  /** Hostname shown in nav (e.g. blog.duyet.net). */
  host: string;
  /** Full production URL including optional path. */
  href: string;
  /** Monorepo apps/ directory when different from id. */
  repoDir?: string;
  /** Pages deploy hostname override. */
  deployDomain?: string;
}

export const APP_REGISTRY = [
  {
    id: "home",
    host: "duyet.net",
    href: "https://duyet.net",
  },
  {
    id: "blog",
    host: "blog.duyet.net",
    href: "https://blog.duyet.net",
  },
  {
    id: "photos",
    host: "photos.duyet.net",
    href: "https://photos.duyet.net",
  },
  {
    id: "about",
    host: "duyet.net",
    href: "https://duyet.net/about",
  },
  {
    id: "projects",
    host: "duyet.net",
    href: "https://duyet.net/projects",
  },
  {
    id: "ls",
    host: "duyet.net",
    href: "https://duyet.net/ls",
  },
  {
    id: "cv",
    host: "cv.duyet.net",
    href: "https://cv.duyet.net",
  },
  {
    id: "insights",
    host: "insights.duyet.net",
    href: "https://insights.duyet.net",
  },
  {
    id: "llm-timeline",
    host: "llm-timeline.duyet.net",
    href: "https://llm-timeline.duyet.net",
  },
  {
    id: "ai-percentage",
    host: "ai-percentage.duyet.net",
    href: "https://ai-percentage.duyet.net",
  },
  {
    id: "x-algo",
    host: "x-algo.duyet.net",
    href: "https://x-algo.duyet.net",
  },
  {
    id: "burn",
    host: "burn.duyet.net",
    href: "https://burn.duyet.net",
    repoDir: "burns",
    deployDomain: "duyet-burns.pages.dev",
  },
  {
    id: "tip",
    host: "tip.duyet.net",
    href: "https://tip.duyet.net",
  },
  {
    id: "news",
    host: "aidr.today",
    href: "https://aidr.today",
    repoDir: "news-redirect",
  },
  {
    id: "agents",
    host: "agents.duyet.net",
    href: "https://agents.duyet.net",
    repoDir: "agent-ui",
  },
  {
    id: "kb",
    host: "kb.duyet.net",
    href: "https://kb.duyet.net",
  },
  {
    id: "html",
    host: "html.duyet.net",
    href: "https://html.duyet.net",
  },
  {
    id: "mcp",
    host: "mcp.duyet.net",
    href: "https://mcp.duyet.net",
  },
  {
    id: "homelab",
    host: "homelab.duyet.net",
    href: "https://homelab.duyet.net",
  },
] as const satisfies readonly AppRegistryEntry[];

export type AppRegistryId = (typeof APP_REGISTRY)[number]["id"];

const registryById = new Map(
  APP_REGISTRY.map((entry) => [entry.id, entry] as const)
);

/** The href of one registry app, by id. Throws on an id outside the registry. */
function appHref(id: AppRegistryId): string {
  const entry = registryById.get(id);
  if (!entry) {
    throw new Error(`Unknown app id: ${id}`);
  }
  return entry.href;
}

export function appOrigin(id: AppRegistryId): string {
  const url = new URL(appHref(id));
  return `${url.protocol}//${url.host}`;
}

export function getRegistryOrigins(): string[] {
  return [...new Set(APP_REGISTRY.map((entry) => appOrigin(entry.id)))].sort();
}

export function getClerkAuthorizedOrigins(): string[] {
  return [
    ...new Set([
      ...getRegistryOrigins(),
      "https://agents-api.duyet.net",
      // Legacy host still hits the path-preserving redirect Worker.
      "https://news.duyet.net",
    ]),
  ].sort();
}

export const PAGES_DOMAIN_OVERRIDES: Record<string, string> = {
  home: "duyet.net",
  "agent-ui": "agents.duyet.net",
  burns: "duyet-burns.pages.dev",
};

/** The `apps` block of {@link UrlsConfig}, resolved straight from the registry so
 * there is one source of truth. Typed as `Record<keyof AppUrls, …>` so the key
 * list can't drift from the `AppUrls` interface this has to satisfy. */
export function getDuyetUrlsApps(): Record<keyof AppUrls, string> {
  return {
    blog: appHref("blog"),
    cv: appHref("cv"),
    insights: appHref("insights"),
    home: appHref("home"),
    photos: appHref("photos"),
    homelab: appHref("homelab"),
    news: appHref("news"),
  };
}
