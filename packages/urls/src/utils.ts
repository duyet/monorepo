/**
 * Utility functions for @duyet/urls package
 *
 * Helper functions for URL manipulation and navigation generation.
 */

import type { Profile } from "@duyet/profile";
import type {
  UrlsConfig,
  AppUrls,
  NavLink,
  Navigation,
  DeepPartial,
} from "./types";

/**
 * Deep merge helper
 *
 * Recursively merges two objects, with source values overriding target values.
 *
 * @param target - Base object
 * @param source - Override object
 * @returns Merged object
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue as any) as any;
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }

  return result;
}

/**
 * Create a custom URLs configuration
 *
 * Merges custom URL overrides with a base configuration.
 * Useful for creating personalized URL configurations.
 *
 * @param base - Base URLs to start with
 * @param overrides - Partial URLs to merge in
 * @returns Merged URLs configuration
 *
 * @example
 * ```ts
 * import { duyetUrls, createUrls } from '@duyet/urls'
 *
 * const myUrls = createUrls(duyetUrls, {
 *   apps: {
 *     blog: "https://myblog.com",
 *     home: "https://mysite.com"
 *   }
 * })
 * ```
 */
export function createUrls(
  base: UrlsConfig,
  overrides?: DeepPartial<UrlsConfig>
): UrlsConfig {
  if (!overrides) return base;
  return deepMerge(base, overrides);
}

/**
 * Generate navigation structure from URLs and profile
 *
 * Creates a standardized navigation structure that components can use.
 * Eliminates hardcoded navigation arrays scattered across components.
 *
 * @param urls - URLs configuration
 * @param profile - Profile configuration
 * @returns Navigation structure with main, profile, social, and general links
 *
 * @example
 * ```ts
 * import { duyetUrls, createNavigation } from '@duyet/urls'
 * import { duyetProfile } from '@duyet/profile'
 *
 * const nav = createNavigation(duyetUrls, duyetProfile)
 *
 * // Use in components
 * <Menu navigation={nav.main} />
 * <Footer socialNav={nav.social} />
 * ```
 */
export function createNavigation(
  urls: UrlsConfig,
  profile: Profile
): Navigation {
  return {
    main: [
      {
        name: "Blog",
        href: urls.apps.blog,
        description: "Personal blog and technical writing",
      },
      {
        name: "CV",
        href: urls.apps.cv,
        description: "Professional resume and experience",
      },
      {
        name: "Insights",
        href: urls.apps.insights,
        description: "Analytics and data insights",
      },
      {
        name: "Photos",
        href: urls.apps.photos,
        description: "Photography portfolio",
      },
      {
        name: "Homelab",
        href: urls.apps.homelab,
        description: "Homelab cluster monitoring",
      },
    ],

    profile: [
      {
        name: "About",
        href: `${urls.apps.home}/about`,
        description: `About ${profile.personal.shortName}`,
      },
      {
        name: "Contact",
        href: `mailto:${profile.personal.email}`,
        description: "Send an email",
        external: true,
      },
    ],

    social: [
      profile.social.github && {
        name: "GitHub",
        href: profile.social.github,
        icon: "github",
        external: true,
      },
      profile.social.twitter && {
        name: "Twitter",
        href: profile.social.twitter,
        icon: "twitter",
        external: true,
      },
      profile.social.linkedin && {
        name: "LinkedIn",
        href: profile.social.linkedin,
        icon: "linkedin",
        external: true,
      },
      profile.social.unsplash && {
        name: "Unsplash",
        href: profile.social.unsplash,
        icon: "unsplash",
        external: true,
      },
      profile.social.tiktok && {
        name: "TikTok",
        href: profile.social.tiktok,
        icon: "tiktok",
        external: true,
      },
    ].filter(Boolean) as NavLink[],

    general: [
      urls.external.rust && {
        name: "Rust Tiếng Việt",
        href: urls.external.rust,
        description: "Vietnamese Rust learning resource",
        external: true,
      },
      urls.external.clickhouse && {
        name: "ClickHouse Monitoring",
        href: urls.external.clickhouse,
        description: "ClickHouse cluster dashboard",
        external: true,
      },
      urls.external.mcp && {
        name: "MCP Tools",
        href: urls.external.mcp,
        description: "Model Context Protocol tools",
        external: true,
      },
      {
        name: "/ai",
        href: `${urls.apps.blog}/ai`,
        description: "AI and ML articles",
      },
      {
        name: "/data",
        href: `${urls.apps.blog}/data`,
        description: "Data engineering content",
      },
    ].filter(Boolean) as NavLink[],
  };
}

/**
 * Get all app URLs as a flat object
 *
 * @param urls - URLs configuration
 * @returns Flat object of app URLs
 *
 * @example
 * ```ts
 * const appUrls = getAppUrls(duyetUrls)
 * // { blog: "...", cv: "...", insights: "...", ... }
 * ```
 */
export function getAppUrls(urls: UrlsConfig): AppUrls {
  return urls.apps;
}

/**
 * Get URL for a specific app
 *
 * @param urls - URLs configuration
 * @param app - App name
 * @returns URL for the app, or undefined if not found
 *
 * @example
 * ```ts
 * const blogUrl = getAppUrl(duyetUrls, "blog")
 * // "https://blog.duyet.net"
 * ```
 */
export function getAppUrl(
  urls: UrlsConfig,
  app: keyof AppUrls
): string | undefined {
  return urls.apps[app];
}
