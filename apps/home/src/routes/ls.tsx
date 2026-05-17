import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
} from "../../app/config/categories";
import { urls } from "../../app/config/urls";
import UrlsList from "../components/UrlsList";

export const Route = createFileRoute("/ls")({
  component: ListPage,
});

// Computed once at module load — urls and categories are static
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

function ListPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto max-w-[1024px] px-5 pb-16 pt-12 sm:px-8">
        <div className="mb-10">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-[13px] text-[var(--muted-soft)] no-underline"
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
          <div className="flex items-baseline gap-4">
            <h1 className="m-0 text-4xl font-semibold text-[var(--foreground)] sm:text-5xl">
              Short URLs
            </h1>
            <span className="text-[13px] text-[var(--muted-soft)]">
              {publicUrls.length}
            </span>
          </div>
          <p className="mt-2 text-base text-[var(--muted-foreground)]">
            Quick links and redirects for duyet.net
          </p>
        </div>

        <UrlsList urls={publicUrls} />

        <div className="mt-16 text-center">
          <a
            href="/"
            className="text-[13px] text-[var(--muted-soft)] no-underline"
          >
            duyet.net
          </a>
        </div>
      </main>
    </div>
  );
}
