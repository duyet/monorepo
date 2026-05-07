import { cn } from "@duyet/libs/utils";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Link, useRouterState } from "@tanstack/react-router";

export type NavigationItem = {
  name: string;
  href: string;
};

export function createDefaultNavigation(urls: UrlsConfig): NavigationItem[] {
  return [
    { name: "Home", href: urls.apps.home },
    { name: "About", href: `${urls.apps.home}/about` },
    { name: "Photos", href: urls.apps.photos },
    { name: "Insights", href: urls.apps.insights },
    { name: "CV", href: urls.apps.cv },
  ];
}

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
export const SEARCH = {
  name: "Search",
  href: `${duyetUrls.apps.blog}/search`,
};

type Props = {
  urls?: UrlsConfig;
  className?: string;
  navigationItems?: NavigationItem[];
  onItemClick?: () => void;
};

export default function Menu({
  urls = duyetUrls,
  className,
  navigationItems,
  onItemClick,
}: Props) {
  const items = navigationItems ?? createDefaultNavigation(urls);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  function isActive(href: string): boolean {
    if (href.startsWith("http")) return false;
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  }

  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors",
      isActive(href)
        ? "bg-[var(--muted)] text-[var(--foreground)] dark:bg-white/10 dark:text-[#f8f8f2]"
        : "text-[var(--muted-foreground)] dark:text-[#f8f8f2]/70 hover:bg-[var(--muted)]/60 dark:hover:bg-white/5"
    );

  return (
    <div
      className={cn(
        "flex flex-row gap-1 flex-wrap items-center",
        className
      )}
    >
      {items.map(({ name, href }) =>
        href.startsWith("http") ? (
          <a
            key={name}
            href={href}
            onClick={onItemClick}
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors text-[var(--muted-foreground)] dark:text-[#f8f8f2]/70 hover:bg-[var(--muted)]/60 dark:hover:bg-white/5"
          >
            {name}
          </a>
        ) : (
          <Link
            key={name}
            to={href}
            onClick={onItemClick}
            className={linkClass(href)}
          >
            {name}
          </Link>
        )
      )}
    </div>
  );
}
