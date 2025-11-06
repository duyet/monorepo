/**
 * @duyet/urls
 *
 * Unified URL and navigation configuration.
 * Single source of truth for all app URLs, external links, and navigation.
 *
 * This eliminates the problem of URLs being defined in 5+ different places.
 *
 * @example
 * ```ts
 * import { duyetUrls, createNavigation } from '@duyet/urls'
 * import { duyetProfile } from '@duyet/profile'
 *
 * const navigation = createNavigation(duyetUrls, duyetProfile)
 * ```
 */

import type { Profile } from "@duyet/profile";

/**
 * Core application URLs
 */
export interface AppUrls {
  /** Blog application URL */
  blog: string;
  /** CV/Resume application URL */
  cv: string;
  /** Insights/Analytics dashboard URL */
  insights: string;
  /** Home/Landing page URL */
  home: string;
  /** Photos gallery URL */
  photos: string;
  /** Homelab dashboard URL */
  homelab: string;
}

/**
 * External project and service URLs
 */
export interface ExternalUrls {
  /** Rust Tiếng Việt learning resource */
  rust?: string;
  /** ClickHouse monitoring dashboard */
  clickhouse?: string;
  /** MCP (Model Context Protocol) tools */
  mcp?: string;
  /** Monica AI assistant */
  monica?: string;
  /** Google Apps Script endpoint */
  googleScript?: string;
  /** Custom external URLs */
  [key: string]: string | undefined;
}

/**
 * Complete URL configuration
 */
export interface UrlsConfig {
  /** Core application URLs */
  apps: AppUrls;
  /** External URLs */
  external: ExternalUrls;
}

/**
 * Navigation link
 */
export interface NavLink {
  /** Display name */
  name: string;
  /** URL or path */
  href: string;
  /** Optional description */
  description?: string;
  /** Optional icon identifier */
  icon?: string;
  /** Open in new tab */
  external?: boolean;
}

/**
 * Navigation structure
 */
export interface Navigation {
  /** Main navigation links */
  main: NavLink[];
  /** Profile/About links */
  profile: NavLink[];
  /** Social media links */
  social: NavLink[];
  /** General/External links */
  general?: NavLink[];
}

/**
 * Duyet's default URL configuration
 * Uses environment variables with fallbacks
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
 * Deep partial type for URL overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge helper
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
 * @param base - Base URLs to start with
 * @param overrides - Partial URLs to merge in
 * @returns Merged URLs configuration
 *
 * @example
 * ```ts
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
 * This creates a standardized navigation structure that components can use.
 * Eliminates hardcoded navigation arrays scattered across components.
 *
 * @param urls - URLs configuration
 * @param profile - Profile configuration
 * @returns Navigation structure
 *
 * @example
 * ```ts
 * import { duyetUrls, createNavigation } from '@duyet/urls'
 * import { duyetProfile } from '@duyet/profile'
 *
 * const nav = createNavigation(duyetUrls, duyetProfile)
 *
 * // Use in Menu component
 * <Menu navigation={nav} />
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
 */
export function getAppUrls(urls: UrlsConfig): AppUrls {
  return urls.apps;
}

/**
 * Get URL for a specific app
 *
 * @param urls - URLs configuration
 * @param app - App name
 * @returns URL for the app
 */
export function getAppUrl(
  urls: UrlsConfig,
  app: keyof AppUrls
): string | undefined {
  return urls.apps[app];
}

// Export default URLs for convenience
export { duyetUrls as defaultUrls };
