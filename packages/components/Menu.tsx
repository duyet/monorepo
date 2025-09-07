import Link from "next/link";

import { cn } from "@duyet/libs/utils";
import ThemeToggle from "./ThemeToggle";

const BLOG_URL =
  process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";
const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net";
const PHOTO_URL =
  process.env.NEXT_PUBLIC_DUYET_PHOTO_URL || "https://photos.duyet.net";

export type NavigationItem = {
  name: string;
  href: string;
};

export const ABOUT = { name: "About", href: `${BLOG_URL}/about` };
export const INSIGHTS = { name: "Insights", href: INSIGHTS_URL };
export const PHOTOS = { name: "Photos", href: PHOTO_URL };
export const ARCHIVES = { name: "Archives", href: `${BLOG_URL}/archives` };
export const FEED = { name: "Feed", href: `${BLOG_URL}/feed` };
export const BLOG = { name: "Blog", href: `${BLOG_URL}` };
const defaultNavigation = [FEED, PHOTOS, INSIGHTS, ABOUT];

type Props = {
  className?: string;
  navigationItems?: NavigationItem[];
};

export default function Menu({
  className,
  navigationItems = defaultNavigation,
}: Props) {
  return (
    <div className={cn("flex flex-row gap-5 flex-wrap items-center", className)}>
      {navigationItems.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          className="hover:underline underline-offset-8"
        >
          {name}
        </Link>
      ))}
      <ThemeToggle />
    </div>
  );
}
