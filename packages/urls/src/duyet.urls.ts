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

/**
 * Duyet's default URL configuration
 *
 * Environment variable priority:
 * 1. NEXT_PUBLIC_DUYET_*_URL (specific to Duyet)
 * 2. NEXT_PUBLIC_APP_* (generic)
 * 3. Hardcoded fallback
 *
 * @example
 * ```ts
 * import { duyetUrls } from '@duyet/urls/duyet'
 *
 * // Use in components
 * <Header urls={duyetUrls} />
 * ```
 */
export const duyetUrls: UrlsConfig = {
  apps: {
    blog:
      process.env.NEXT_PUBLIC_DUYET_BLOG_URL ||
      process.env.NEXT_PUBLIC_APP_BLOG ||
      "https://blog.duyet.net",
    cv:
      process.env.NEXT_PUBLIC_DUYET_CV_URL ||
      process.env.NEXT_PUBLIC_APP_CV ||
      "https://cv.duyet.net",
    insights:
      process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
      process.env.NEXT_PUBLIC_APP_INSIGHTS ||
      "https://insights.duyet.net",
    home:
      process.env.NEXT_PUBLIC_DUYET_HOME_URL ||
      process.env.NEXT_PUBLIC_APP_HOME ||
      "https://duyet.net",
    photos:
      process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL ||
      process.env.NEXT_PUBLIC_APP_PHOTOS ||
      "https://photos.duyet.net",
    homelab:
      process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL ||
      process.env.NEXT_PUBLIC_APP_HOMELAB ||
      "https://homelab.duyet.net",
  },
  external: {
    rust: "https://rust-tieng-viet.github.io",
    clickhouse: "https://clickhouse-monitoring.vercel.app",
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
