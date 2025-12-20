import Link from "next/link";
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
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

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
          <h1 className="mb-3 font-serif text-5xl font-normal text-neutral-900">
            Short URLs
          </h1>
          <p className="text-lg text-neutral-600">
            Quick links and redirects for duyet.net
          </p>
        </div>

        {/* Client-side search and list */}
        <UrlsList urls={publicUrls} />

        {/* Footer */}
        <div className="mt-12 border-t border-neutral-200 pt-8 text-center">
          <p className="text-sm text-neutral-500">
            Managed via{" "}
            <code className="rounded bg-neutral-100 px-2 py-1 font-mono text-xs">
              public/_redirects
            </code>{" "}
            and{" "}
            <code className="rounded bg-neutral-100 px-2 py-1 font-mono text-xs">
              app/config/urls.ts
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
