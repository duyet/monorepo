import Link from "next/link";

import { cn } from "@duyet/libs/utils";

const BLOG_URL =
  process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";
const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net";
const PHOTO_URL =
  process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || "https://photos.duyet.net";
const CV_URL = process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net";
const HOME_URL = process.env.NEXT_PUBLIC_DUYET_HOME_URL || "https://duyet.net";

export type NavigationItem = {
  name: string;
  href: string;
};

export const ABOUT = { name: "About", href: `${HOME_URL}/about` };
export const INSIGHTS = { name: "Insights", href: INSIGHTS_URL };
export const PHOTOS = { name: "Photos", href: PHOTO_URL };
export const ARCHIVES = { name: "Archives", href: `${BLOG_URL}/archives` };
export const FEED = { name: "Feed", href: `${BLOG_URL}` };
export const BLOG = { name: "Blog", href: `${BLOG_URL}` };
export const CV = { name: "CV", href: CV_URL };
const DEFAULT_NAVIGATION = [ABOUT, PHOTOS, INSIGHTS, CV];

type Props = {
  className?: string;
  navigationItems?: NavigationItem[];
};

export default function Menu({
  className,
  navigationItems = DEFAULT_NAVIGATION,
}: Props) {
  return (
    <div
      className={cn("flex flex-row gap-5 flex-wrap items-center", className)}
    >
      {navigationItems.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          className="text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-8"
        >
          {name}
        </Link>
      ))}
    </div>
  );
}
