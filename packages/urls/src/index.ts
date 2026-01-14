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

// Export Duyet's configuration
export { duyetUrls, duyetUrls as defaultUrls } from "./duyet.urls";
// Export all types
export type {
  AppUrls,
  DeepPartial,
  ExternalUrls,
  Navigation,
  NavLink,
  UrlsConfig,
} from "./types";
// Export utilities
export {
  createNavigation,
  createUrls,
  getAppUrl,
  getAppUrls,
} from "./utils";
