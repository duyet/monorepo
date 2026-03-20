import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ORDER, type Category } from "../../app/config/categories";

type ViewMode = "list" | "grid";

interface UrlEntry {
  path: string;
  target: string;
  desc?: string;
  category?: Category;
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function UrlCard({ path, target, desc }: UrlEntry) {
  const isExternal = target.startsWith("http");
  return (
    <a
      href={target}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex flex-col gap-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <code className="font-mono text-base font-bold text-neutral-900 transition-colors group-hover:text-neutral-600">
          {path}
        </code>
        {isExternal && (
          <ExternalIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </div>
      {desc ? (
        <p className="line-clamp-2 text-sm text-neutral-600">{desc}</p>
      ) : (
        <p className="text-sm text-neutral-300">—</p>
      )}
      <p className="mt-auto truncate font-mono text-xs text-neutral-400">
        {target}
      </p>
    </a>
  );
}

function CategoryHeader({
  category,
  count,
}: {
  category: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {category}
      </h2>
      <div className="flex-1 border-t border-neutral-200" />
      <span className="text-xs text-neutral-400">{count}</span>
    </div>
  );
}

export default function UrlsList({ urls }: { urls: UrlEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    const saved = localStorage.getItem("ls-view") as ViewMode | null;
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function setViewAndSave(v: ViewMode) {
    setView(v);
    localStorage.setItem("ls-view", v);
  }

  const filteredUrls = useMemo(() => {
    if (!searchQuery) return urls;
    const query = searchQuery.toLowerCase();
    return urls.filter(
      ({ path, target, desc }) =>
        path.toLowerCase().includes(query) ||
        target.toLowerCase().includes(query) ||
        desc?.toLowerCase().includes(query)
    );
  }, [searchQuery, urls]);

  // grouped always uses filteredUrls so search works in both views
  const grouped = useMemo(() => {
    const map = new Map<string, UrlEntry[]>();
    for (const entry of filteredUrls) {
      const cat = entry.category ?? "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(entry);
    }
    const sorted = new Map<string, UrlEntry[]>();
    for (const key of CATEGORY_ORDER) {
      if (map.has(key)) sorted.set(key, map.get(key)!);
    }
    map.forEach((entries, key) => {
      if (!sorted.has(key)) sorted.set(key, entries);
    });
    return sorted;
  }, [filteredUrls]);

  return (
    <>
      {/* Search Bar + View Toggle */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            aria-label="Search by path, URL, or description"
            placeholder="Search by path, URL, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-4 pl-12 pr-28 text-neutral-900 placeholder-neutral-500 shadow-sm transition-all focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
          <svg
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-900"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {/* View toggle */}
            <div className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewAndSave("list")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "list"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewAndSave("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors",
                  view === "grid"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <GridIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            {filteredUrls.length === urls.length ? (
              <>Showing all {urls.length} short URLs</>
            ) : (
              <>
                Showing {filteredUrls.length} of {urls.length} URLs
              </>
            )}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* No results */}
      {filteredUrls.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <svg
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12 text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-neutral-600">
            No URLs found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 text-sm text-neutral-900 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid view — grouped cards, 3 cols */}
      {filteredUrls.length > 0 && view === "grid" && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} className="mb-8">
              <CategoryHeader category={category} count={entries.length} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <UrlCard key={entry.path} {...entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view — search results: flat 2-col cards */}
      {filteredUrls.length > 0 && view === "list" && searchQuery && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredUrls.map(({ path, target, desc }) => {
            const isExternal = target.startsWith("http");
            return (
              <a
                key={path}
                href={target}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <code className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-sm font-semibold text-neutral-900 transition-colors group-hover:bg-neutral-200">
                      {path}
                    </code>
                    {isExternal && (
                      <ExternalIcon className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </div>
                  {desc && <p className="text-sm text-neutral-700">{desc}</p>}
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    <svg
                      aria-hidden="true"
                      className="h-3 w-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span className="truncate font-mono">{target}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* List view — default: grouped table rows */}
      {filteredUrls.length > 0 && view === "list" && !searchQuery && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} className="mb-8">
              <CategoryHeader category={category} count={entries.length} />
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {entries.map(({ path, target, desc }, i) => {
                  const isExternal = target.startsWith("http");
                  return (
                    <a
                      key={path}
                      href={target}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        "group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50",
                        i !== 0 && "border-t border-neutral-100"
                      )}
                    >
                      <code className="w-28 flex-shrink-0 font-mono text-sm font-semibold text-neutral-900 sm:w-36">
                        {path}
                      </code>
                      <p className="min-w-0 flex-1 truncate text-sm text-neutral-600">
                        {desc ?? <span className="text-neutral-300">—</span>}
                      </p>
                      <span className="hidden truncate font-mono text-xs text-neutral-400 sm:block sm:max-w-[200px]">
                        {target}
                      </span>
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4 flex-shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
