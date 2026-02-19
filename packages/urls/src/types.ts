/**
 * Type definitions for @duyet/urls package
 *
 * Contains all TypeScript interfaces and types for URL and navigation configuration.
 * Separates types from actual configuration values for better organization.
 */

import type { DeepPartial } from "@duyet/libs";

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

// Re-export DeepPartial for convenience
export type { DeepPartial };
