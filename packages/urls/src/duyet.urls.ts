/**
 * Duyet's URL Configuration
 *
 * Default URL configuration for all apps in the monorepo.
 * Uses environment variables with fallbacks.
 *
 * This serves as both the production configuration and an example
 * for others who want to fork this monorepo.
 */

import type { UrlsConfig } from "./types";
import { getDuyetUrlsApps } from "./app-registry";

const importMetaEnv =
  typeof import.meta !== "undefined"
    ? ((import.meta as unknown as Record<string, unknown>).env as
        | Record<string, string>
        | undefined)
    : undefined;

/**
 * Duyet's default URL configuration
 *
 * Environment variable priority:
 * 1. VITE_DUYET_*_URL (Vite env vars)
 * 2. Hardcoded fallback
 *
 * @example
 * ```ts
 * import { duyetUrls } from '@duyet/urls/duyet'
 *
 * // Use in components
 * <Header urls={duyetUrls} />
 * ```
 */
const registryApps = getDuyetUrlsApps();

export const duyetUrls: UrlsConfig = {
  apps: {
    blog: importMetaEnv?.VITE_DUYET_BLOG_URL || registryApps.blog,
    cv: importMetaEnv?.VITE_DUYET_CV_URL || registryApps.cv,
    insights:
      importMetaEnv?.VITE_DUYET_INSIGHTS_URL || registryApps.insights,
    home: importMetaEnv?.VITE_DUYET_HOME_URL || registryApps.home,
    photos: importMetaEnv?.VITE_DUYET_PHOTOS_URL || registryApps.photos,
    homelab:
      importMetaEnv?.VITE_DUYET_HOMELAB_URL || registryApps.homelab,
    news: importMetaEnv?.VITE_DUYET_NEWS_URL || registryApps.news,
  },
  external: {
    rust: "https://rust-tieng-viet.github.io",
    clickhouse: "https://clickhouse.duyet.net",
    mcp: "https://mcp.duyet.net",
    monica: "https://monica.im/invitation?c=RJF8T7RT",
    googleScript:
      "https://script.google.com/macros/s/AKfycbyRLwRpcBUlE1Iw2mhSN1zQNHLT7EQsnFVPaduKyEUJMQwaBhEuKXJfWjzUZc20F7sR/exec",
  },
};

/**
 * Export as default for convenience
 */
export default duyetUrls;
