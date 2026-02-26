import Link from "next/link";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
} from "../config/categories";
import { urls } from "../config/urls";
import UrlsList from "./components/UrlsList";

export const dynamic = "force-static";
export const revalidate = 3600;

export default function ListPage() {
  // Filter out system URLs and format for display (server-side)
  const publicUrls = Object.entries(urls)
    .filter(([_, value]) => {
      if (typeof value === "string") return true;
      return !value.system;
    })
    .map(([path, value]) => ({
      path,
      target: typeof value === "string" ? value : value.target,
      desc: typeof value === "string" ? undefined : value.desc,
      category: CATEGORY_MAP[path] ?? DEFAULT_CATEGORY,
    }))
    .sort((a, b) => {
      const aIdx = CATEGORY_ORDER.indexOf(a.category);
      const bIdx = CATEGORY_ORDER.indexOf(b.category);
      const catDiff = (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      if (catDiff !== 0) return catDiff;
      return a.path.localeCompare(b.path);
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="group mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to home
          </Link>
          <div className="flex items-baseline gap-4">
            <h1 className="font-serif text-5xl font-normal text-neutral-900">
              Short URLs
            </h1>
            <span className="rounded-full bg-neutral-200 px-3 py-1 text-sm font-medium text-neutral-600">
              {publicUrls.length}
            </span>
          </div>
          <p className="mt-3 text-lg text-neutral-600">
            Quick links and redirects for duyet.net
          </p>
        </div>

        {/* Client-side search and list */}
        <UrlsList urls={publicUrls} />

        {/* Footer */}
        <div className="mt-12 border-t border-neutral-200 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            All short URLs redirect via{" "}
            <Link
              href="/"
              className="underline underline-offset-2 transition-colors hover:text-neutral-900"
            >
              duyet.net
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
