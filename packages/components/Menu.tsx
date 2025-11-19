import Link from "next/link";
import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls, createNavigation } from "@duyet/urls";

export type NavigationItem = {
  name: string;
  href: string;
};

/**
 * Helper function to create default navigation items from URLs
 */
export function createDefaultNavigation(urls: UrlsConfig): NavigationItem[] {
  return [
    { name: "Home", href: urls.apps.home },
    { name: "About", href: `${urls.apps.home}/about` },
    { name: "Photos", href: urls.apps.photos },
    { name: "Insights", href: urls.apps.insights },
    { name: "CV", href: urls.apps.cv },
  ];
}

/**
 * Helper exports for common navigation items (for backward compatibility)
 * These now use the duyetUrls configuration
 */
export const HOME = { name: "Home", href: duyetUrls.apps.home };
export const ABOUT = { name: "About", href: `${duyetUrls.apps.home}/about` };
export const INSIGHTS = { name: "Insights", href: duyetUrls.apps.insights };
export const PHOTOS = { name: "Photos", href: duyetUrls.apps.photos };
export const ARCHIVES = {
  name: "Archives",
  href: `${duyetUrls.apps.blog}/archives`,
};
export const FEED = { name: "Feed", href: duyetUrls.apps.blog };
export const BLOG = { name: "Blog", href: duyetUrls.apps.blog };
export const CV = { name: "CV", href: duyetUrls.apps.cv };

type Props = {
  /** Profile configuration (defaults to duyetProfile) */
  profile?: Profile;
  /** URLs configuration (defaults to duyetUrls) */
  urls?: UrlsConfig;
  /** Optional CSS classes */
  className?: string;
  /** Custom navigation items (if not provided, uses default from urls) */
  navigationItems?: NavigationItem[];
};

/**
 * Navigation menu component
 *
 * Displays navigation links based on URLs configuration.
 * Can accept custom navigation items or auto-generate from URLs.
 *
 * @example
 * ```tsx
 * import { Menu } from '@duyet/components'
 * import { duyetProfile } from '@duyet/profile'
 * import { duyetUrls } from '@duyet/urls'
 *
 * <Menu profile={duyetProfile} urls={duyetUrls} />
 * ```
 */
export default function Menu({
  profile = duyetProfile,
  urls = duyetUrls,
  className,
  navigationItems,
}: Props) {
  // Use provided navigation items or generate from URLs
  const items = navigationItems ?? createDefaultNavigation(urls);
  return (
    <div
      className={cn(
        "flex flex-row gap-3 sm:gap-5 flex-wrap items-center",
        className,
      )}
    >
      {items.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          className="text-sm sm:text-base text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
