import { cn } from "@duyet/libs/utils";
import {
  ClearIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "../components/urls/icons";
import type { ViewMode } from "./filter-utils";

export function ProjectsSearchBar({
  searchQuery,
  setSearchQuery,
  view,
  setView,
  filteredCount,
  totalCount,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  view: ViewMode;
  setView: (view: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
}) {
  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="search"
          aria-label="Search by name, tag, or domain"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border-b bg-transparent px-10 py-3.5 pr-[100px] text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
        />
        <SearchIcon className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground"
            >
              <ClearIcon className="h-4 w-4" />
            </button>
          ) : null}
          <div className="flex rounded-md bg-muted p-0.5">
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={cn(
                "cursor-pointer rounded border-none p-[5px] transition-colors duration-150",
                view === "list"
                  ? "bg-background text-foreground"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={cn(
                "cursor-pointer rounded border-none p-[5px] transition-colors duration-150",
                view === "grid"
                  ? "bg-background text-foreground"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              <GridIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-[13px] text-muted-foreground">
        {filteredCount === totalCount
          ? `Showing all ${totalCount} projects`
          : `Showing ${filteredCount} of ${totalCount} projects`}
      </p>
    </div>
  );
}
