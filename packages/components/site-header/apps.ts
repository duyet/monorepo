/**
 * Public entry point for the site-header nav data and matching helpers.
 *
 * `nav-data` holds the static app + nav-item tables; `nav-match` holds the pure
 * predicate helpers. Both are re-exported here so existing `from "./apps"`
 * import sites keep working.
 */
export { APPS, CATEGORY_ORDER, GLOBAL_NAV } from "./nav-data";
export {
  excludeLocalNavItems,
  filterGlobalNav,
  isNavActive,
  navHrefKey,
} from "./nav-match";
