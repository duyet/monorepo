import type { AppKey, GlobalNavItem, LocalNavItem, NavMatch } from "./types";

export function filterGlobalNav(
  items: GlobalNavItem[],
  currentApp: AppKey
): GlobalNavItem[] {
  return items.filter((item) => {
    if (item.hideOnApps?.includes(currentApp)) return false;
    if (item.onlyApp) return currentApp === item.onlyApp;
    if (currentApp === "home") return true;
    return item.match.app === currentApp || !item.match.app;
  });
}

/** Normalize in-app and absolute duyet.net hrefs so LocalNav can drop duplicates. */
export function navHrefKey(href: string): string {
  try {
    const url = new URL(href, "https://duyet.net");
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.host}${path}`;
  } catch {
    return href;
  }
}

export function excludeLocalNavItems<T extends { href: string }>(
  items: T[],
  localNav?: LocalNavItem[]
): T[] {
  if (!localNav?.length) return items;
  const localKeys = new Set(localNav.map((item) => navHrefKey(item.href)));
  return items.filter((item) => !localKeys.has(navHrefKey(item.href)));
}

function matchesPath(path: string, pathname: string | null): boolean {
  if (pathname == null) return false;
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function isNavActive(
  m: NavMatch,
  currentApp: AppKey,
  pathname: string | null
): boolean {
  if (m.app && m.app === currentApp) {
    // A bare `app` match would light up every route of the current app;
    // defer to the path check when one is provided so only the matching
    // sub-page (not every item scoped to this app) gets highlighted.
    if (m.path) return matchesPath(m.path, pathname);
    return true;
  }
  // Path-only fallback (no owning app, or the item belongs to "home") only
  // applies while browsing the home app itself — otherwise every other
  // app's items with an overlapping path (e.g. both "/") would incorrectly
  // light up too.
  if (m.path && (!m.app || m.app === "home") && currentApp === "home") {
    return matchesPath(m.path, pathname);
  }
  return false;
}
