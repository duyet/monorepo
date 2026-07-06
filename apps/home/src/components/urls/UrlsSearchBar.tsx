import { cn } from "@duyet/libs/utils";
import { GridIcon, ListIcon } from "./icons";
import type { ViewMode } from "./types";

interface UrlsSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  view: ViewMode;
  setViewAndSave: (v: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
}

export function UrlsSearchBar({
  searchQuery,
  setSearchQuery,
  view,
  setViewAndSave,
  filteredCount,
  totalCount,
}: UrlsSearchBarProps) {
  return (
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
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground"
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
        {filteredCount === totalCount
          ? `Showing all ${totalCount} short URLs`
          : `Showing ${filteredCount} of ${totalCount} URLs`}
      </div>
    </div>
  );
}
