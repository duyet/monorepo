"use client";

import { cn } from "@duyet/libs/utils";
import { ChevronDown, Download, Filter, LayoutList, Rows2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { models as allModels, domains, organizations } from "@/lib/data";
import type { FilterState } from "@/lib/utils";
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
  liteMode?: boolean;
  onLiteModeToggle?: () => void;
}

export function Filters({
  filters,
  onFilterChange,
  onClearFilters,
  resultCount,
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

  const selectClassName =
    "h-9 rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-900 dark:text-neutral-100 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400/50 dark:focus:ring-neutral-500/50 appearance-none cursor-pointer transition-colors hover:border-neutral-300 dark:hover:border-white/20";

  return (
    <div className="mb-6 animate-fade-in animate-fade-in-delay-2">
      {/* Search + Controls Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchAutocomplete
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            inputClassName="pr-10"
            placeholder="Search models, organizations..."
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className={cn(
            "flex h-[42px] items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all",
            filtersExpanded || activeFilterCount > 0
              ? "border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300"
              : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-white/20"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 px-1.5 text-[10px] font-bold text-white dark:text-black">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn("h-3 w-3 transition-transform", filtersExpanded && "rotate-180")} />
        </button>

        {/* View toggle */}
        {onLiteModeToggle && (
          <button
            onClick={onLiteModeToggle}
            className={cn(
              "h-[42px] rounded-xl border px-3 transition-all",
              liteMode
                ? "border-neutral-300 dark:border-white/20 bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300"
                : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-white/20"
            )}
            title={liteMode ? "Switch to full view" : "Switch to compact view"}
            aria-label={liteMode ? "Switch to full view" : "Switch to compact view"}
          >
            {liteMode ? <LayoutList className="h-4 w-4" /> : <Rows2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      {filtersExpanded && (
        <div className="mt-3 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-4 animate-fade-in-fast">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filters.license}
              onChange={(e) => updateFilter("license", e.target.value as FilterState["license"])}
              className={selectClassName}
            >
              <option value="all">All Licenses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="partial">Partial</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value as FilterState["type"])}
              className={selectClassName}
            >
              <option value="all">All Types</option>
              <option value="model">Models</option>
              <option value="milestone">Milestones</option>
            </select>

            <select
              value={filters.org}
              onChange={(e) => updateFilter("org", e.target.value)}
              className={selectClassName}
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            <select
              value={filters.source}
              onChange={(e) => updateFilter("source", e.target.value)}
              className={selectClassName}
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src === "epoch" ? "Epoch AI" : src.charAt(0).toUpperCase() + src.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filters.domain}
              onChange={(e) => updateFilter("domain", e.target.value)}
              className={selectClassName}
            >
              <option value="all">All Domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filters.params}
              onChange={(e) => updateFilter("params", e.target.value)}
              className={selectClassName}
            >
              <option value="all">All Sizes</option>
              <option value="unknown">Unknown</option>
              <option value="small">{"Small (<1B)"}</option>
              <option value="medium">Medium (1-10B)</option>
              <option value="large">Large (10-100B)</option>
              <option value="xl">{"XL (>100B)"}</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters || clearFilters}
                className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result count + download */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-[family-name:var(--font-mono)] text-neutral-400 dark:text-neutral-500">
          {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
        </span>
        <a
          href="/data.json"
          download="llm-timeline-data.json"
          className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
          title="Download all model data as JSON"
        >
          <Download className="h-3 w-3" />
          Export JSON
        </a>
      </div>
    </div>
  );
}
