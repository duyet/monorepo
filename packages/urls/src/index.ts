/**
 * @duyet/urls
 *
 * Unified URL and navigation configuration.
 * Single source of truth for all app URLs, external links, and navigation.
 *
 * This package eliminates the problem of URLs being defined in 5+ different places
 * by providing centralized configuration with environment variable support.
 *
 * @example
 * ```ts
 * import { duyetUrls, createNavigation } from '@duyet/urls'
 * import { duyetProfile } from '@duyet/profile'
 *
 * const navigation = createNavigation(duyetUrls, duyetProfile)
 * ```
 */

// Export all types
export type {
  AppUrls,
  ExternalUrls,
  UrlsConfig,
  NavLink,
  Navigation,
  DeepPartial,
} from "./types";

// Export utilities
export {
  createUrls,
  createNavigation,
  getAppUrls,
  getAppUrl,
} from "./utils";

// Export Duyet's configuration
export { duyetUrls } from "./duyet.urls";
export { duyetUrls as defaultUrls } from "./duyet.urls";
