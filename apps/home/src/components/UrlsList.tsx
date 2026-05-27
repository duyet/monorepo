import { cn } from "@duyet/libs/utils";
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function UrlRow({ path, target, desc }: UrlEntry) {
  const isExternal = target.startsWith("http");
  return (
    <a
      href={target}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="flex flex-col gap-2 border-t py-4 text-foreground no-underline transition-colors first:border-t-0 hover:text-muted-foreground"
    >
      <div className="flex items-center justify-between">
        <code className="font-mono text-[15px] font-semibold">
          {path}
        </code>
        {isExternal && <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      </div>
      {desc ? (
        <p className="m-0 text-[13px] leading-snug text-muted-foreground">{desc}</p>
      ) : (
        <p className="m-0 text-[13px] text-muted-foreground">&mdash;</p>
      )}
      <p className="m-0 truncate font-mono text-[11px] text-muted-foreground">
        {target}
      </p>
    </a>
  );
}

function CategoryHeader({ category, count }: { category: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 className="m-0 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {category}
      </h2>
      <div className="flex-1 border-t" />
      <span className="text-[11px] text-muted-foreground">{count}</span>
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
      {/* Search + Toggle */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            aria-label="Search by path, URL, or description"
            placeholder="Search URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-b bg-transparent px-10 py-3.5 pr-[100px] text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <svg
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <div className="flex rounded-md bg-muted p-0.5">
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewAndSave("list")}
                className={cn(
                  "cursor-pointer rounded border-none p-[5px] transition-colors duration-150",
                  view === "list"
                    ? "bg-background text-foreground"
                    : "bg-transparent text-muted-foreground"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewAndSave("grid")}
                className={cn(
                  "cursor-pointer rounded border-none p-[5px] transition-colors duration-150",
                  view === "grid"
                    ? "bg-background text-foreground"
                    : "bg-transparent text-muted-foreground"
                )}
              >
                <GridIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-2.5 text-[13px] text-muted-foreground">
          {filteredUrls.length === urls.length
            ? `Showing all ${urls.length} short URLs`
            : `Showing ${filteredUrls.length} of ${urls.length} URLs`}
        </div>
      </div>

      {/* No results */}
      {filteredUrls.length === 0 && (
        <div className="border-y py-12 text-center">
          <p className="text-sm text-muted-foreground">No URLs found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 cursor-pointer border-none bg-transparent text-[13px] text-foreground underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid view */}
      {filteredUrls.length > 0 && view === "grid" && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} className="mb-8">
              <CategoryHeader category={category} count={entries.length} />
              <div className="border-y">
                {entries.map((entry) => (
                  <UrlRow key={entry.path} {...entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view — search: flat rows */}
      {filteredUrls.length > 0 && view === "list" && searchQuery && (
        <div className="border-y">
          {filteredUrls.map(({ path, target, desc }) => {
            const isExternal = target.startsWith("http");
            return (
              <a
                key={path}
                href={target}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="flex flex-col gap-1.5 border-t py-4 text-foreground no-underline first:border-t-0"
              >
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[13px] font-semibold">
                    {path}
                  </code>
                  {isExternal && <ExternalIcon className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                {desc && <p className="m-0 text-[13px] text-muted-foreground">{desc}</p>}
                <div className="mt-1 flex items-center gap-1.5">
                  <svg aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{target}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* List view — default: grouped rows */}
      {filteredUrls.length > 0 && view === "list" && !searchQuery && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} className="mb-8">
              <CategoryHeader category={category} count={entries.length} />
              <div className="border-y">
                {entries.map(({ path, target, desc }, i) => {
                  const isExternal = target.startsWith("http");
                  return (
                    <a
                      key={path}
                      href={target}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className={cn(
                        "flex items-center gap-4 px-5 py-3 no-underline text-foreground transition-colors hover:bg-muted duration-150",
                        i === 0 ? "" : "border-t"
                      )}
                    >
                      <code className="w-[120px] shrink-0 font-mono text-[13px] font-semibold">
                        {path}
                      </code>
                      <p className="m-0 hidden flex-1 truncate text-[13px] text-muted-foreground sm:block">
                        {desc ?? <span className="text-muted-foreground">&mdash;</span>}
                      </p>
                      <span className="hidden max-w-[200px] truncate font-mono text-[11px] text-muted-foreground sm:block">
                        {target}
                      </span>
                      <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
