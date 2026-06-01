import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ORDER } from "../../app/config/categories";
import type { UrlEntry, ViewMode } from "./urls/types";
import { UrlsGridView } from "./urls/UrlsGridView";
import { UrlsListView } from "./urls/UrlsListView";
import { UrlsSearchBar } from "./urls/UrlsSearchBar";

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
      <UrlsSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        view={view}
        setViewAndSave={setViewAndSave}
        filteredCount={filteredUrls.length}
        totalCount={urls.length}
      />

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

      {filteredUrls.length > 0 && view === "grid" && (
        <UrlsGridView grouped={grouped} />
      )}

      {filteredUrls.length > 0 && view === "list" && (
        <UrlsListView filteredUrls={filteredUrls} grouped={grouped} searchQuery={searchQuery} />
      )}
    </>
  );
}
