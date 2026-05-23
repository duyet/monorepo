import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
} from "../../app/config/categories";
import { urls } from "../../app/config/urls";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
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
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <header className="max-w-3xl">
          <div className="flex items-baseline gap-4">
            <h1 className="font-serif text-5xl tracking-tight md:text-6xl">
              Short URLs
            </h1>
            <span className="font-mono text-sm tabular-nums text-[color:var(--subtle)]">
              {publicUrls.length}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-lg text-[color:var(--muted)]">
            Quick links and redirects for duyet.net.
          </p>
        </header>

        <div className="mt-16">
          <UrlsList urls={publicUrls} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
