import { cn } from "@duyet/libs/utils";
import {
  ChevronDown,
  Download,
  LayoutList,
  Rows2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useState } from "react";
import { models as allModels, domains } from "@/lib/data";
import type { FilterState } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select } from "./ui/select";
import { SearchAutocomplete } from "./SearchAutocomplete";

// Compute unique sources for filter dropdown
const uniqueSources = Array.from(
  new Set(allModels.filter((m) => m.source).map((m) => m.source!))
);

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters?: () => void;
  resultCount: number;
  totalCount: number;
  liteMode?: boolean;
  onLiteModeToggle?: () => void;
}

export function Filters({
  filters,
  onFilterChange,
  onClearFilters,
  resultCount,
  totalCount,
  liteMode,
  onLiteModeToggle,
}: FiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFilterChange({ ...filters, [key]: value });
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    onFilterChange({
      search: "",
      license: "all",
      type: "all",
      org: "",
      source: "all",
      domain: "all",
      params: "all",
    });
  }, [onFilterChange]);

  const activeFilterCount = [
    filters.license !== "all",
    filters.type !== "all",
    filters.org !== "",
    filters.source !== "all",
    filters.domain !== "all",
    filters.params !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = !!filters.search || activeFilterCount > 0;
  const isFiltered = resultCount < totalCount;

  return (
    <div className="mb-6 space-y-3">
      {/* Search + Controls Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchAutocomplete
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            inputClassName="h-10"
            placeholder="Search models, organizations..."
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filtersExpanded || activeFilterCount > 0
                ? "border-foreground/20 bg-accent text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-accent/50"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
              >
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                filtersExpanded && "rotate-180"
              )}
            />
          </button>

          {/* View toggle */}
          {onLiteModeToggle && (
            <Button
              variant={liteMode ? "default" : "outline"}
              size="icon"
              onClick={onLiteModeToggle}
              className="h-10 w-10"
              title={liteMode ? "Switch to full view" : "Switch to compact view"}
              aria-label={
                liteMode ? "Switch to full view" : "Switch to compact view"
              }
            >
              {liteMode ? (
                <LayoutList className="h-4 w-4" />
              ) : (
                <Rows2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filters */}
      {filtersExpanded && (
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Select
              variant="filter"
              value={filters.license}
              onChange={(e) =>
                updateFilter(
                  "license",
                  e.target.value as FilterState["license"]
                )
              }
            >
              <option value="all">All Licenses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="partial">Partial</option>
            </Select>

            <Select
              variant="filter"
              value={filters.type}
              onChange={(e) =>
                updateFilter("type", e.target.value as FilterState["type"])
              }
            >
              <option value="all">All Types</option>
              <option value="model">Models</option>
              <option value="milestone">Milestones</option>
            </Select>

            <Select
              variant="filter"
              value={filters.source}
              onChange={(e) => updateFilter("source", e.target.value)}
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src === "epoch"
                    ? "Epoch AI"
                    : src.charAt(0).toUpperCase() + src.slice(1)}
                </option>
              ))}
            </Select>

            <Select
              variant="filter"
              value={filters.domain}
              onChange={(e) => updateFilter("domain", e.target.value)}
            >
              <option value="all">All Domains</option>
              {domains.slice(0, 20).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              variant="filter"
              value={filters.params}
              onChange={(e) => updateFilter("params", e.target.value)}
            >
              <option value="all">All Sizes</option>
              <option value="unknown">Unknown</option>
              <option value="small">{"Small (<1B)"}</option>
              <option value="medium">Medium (1-10B)</option>
              <option value="large">Large (10-100B)</option>
              <option value="xl">{"XL (>100B)"}</option>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters || clearFilters}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-all hover:text-foreground hover:border-foreground/20"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result count + download */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-[family-name:var(--font-mono)] tabular-nums",
            isFiltered ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {resultCount.toLocaleString()}
            <span className="text-muted-foreground"> result{resultCount !== 1 ? "s" : ""}</span>
          </span>
          {isFiltered && (
            <span className="text-muted-foreground">
              of {totalCount.toLocaleString()} total
            </span>
          )}
        </div>
        <a
          href="/data.json"
          download="llm-timeline-data.json"
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          title="Download all model data as JSON"
        >
          <Download className="h-3 w-3" />
          Export JSON
        </a>
      </div>
    </div>
  );
}
