"use client";

import { useCallback } from "react";
import { X, Rows2, LayoutList, Download } from "lucide-react";
import type { FilterState } from "@/lib/utils";
import { organizations, domains, models as allModels } from "@/lib/data";
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

  const hasActiveFilters =
    filters.search ||
    filters.license !== "all" ||
    filters.type !== "all" ||
    filters.org ||
    filters.source !== "all" ||
    filters.domain !== "all" ||
    filters.params !== "all";

  const inputStyle = {
    backgroundColor: "var(--bg-card)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };

  const selectClassName =
    "rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 appearance-none cursor-pointer";

  return (
    <div className="mb-8 space-y-4">
      {/* Search with Autocomplete */}
      <div>
        <SearchAutocomplete
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
          inputClassName="pr-10"
          placeholder="Search models, organizations..."
        />
        {filters.search && (
          <button
            onClick={() => updateFilter("search", "")}
            className="absolute right-3 top-[1.9rem] transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* License Filter */}
        <select
          value={filters.license}
          onChange={(e) =>
            updateFilter("license", e.target.value as FilterState["license"])
          }
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Licenses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="partial">Partial</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.type}
          onChange={(e) =>
            updateFilter("type", e.target.value as FilterState["type"])
          }
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Types</option>
          <option value="model">Models</option>
          <option value="milestone">Milestones</option>
        </select>

        {/* Organization Filter */}
        <select
          value={filters.org}
          onChange={(e) => updateFilter("org", e.target.value)}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="">All Organizations</option>
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          value={filters.source}
          onChange={(e) => updateFilter("source", e.target.value)}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Sources</option>
          {uniqueSources.map((src) => (
            <option key={src} value={src}>
              {src === "epoch"
                ? "Epoch AI"
                : src.charAt(0).toUpperCase() + src.slice(1)}
            </option>
          ))}
        </select>

        {/* Domain Filter */}
        <select
          value={filters.domain}
          onChange={(e) => updateFilter("domain", e.target.value)}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Params Filter */}
        <select
          value={filters.params}
          onChange={(e) => updateFilter("params", e.target.value)}
          className={selectClassName}
          style={inputStyle}
        >
          <option value="all">All Sizes</option>
          <option value="unknown">Unknown</option>
          <option value="small">Small (&lt;1B)</option>
          <option value="medium">Medium (1-10B)</option>
          <option value="large">Large (10-100B)</option>
          <option value="xl">XL (&gt;100B)</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters || clearFilters}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
            aria-label="Clear all filters"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}

        {/* Download Data Button */}
        <a
          href="/data.json"
          download="llm-timeline-data.json"
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
          title="Download all model data as JSON"
        >
          <Download className="h-3 w-3" />
          Data
        </a>

        {/* Result Count */}
        <span
          className="ml-auto text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
          }}
        >
          {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
        </span>

        {/* Lite Mode Toggle */}
        {onLiteModeToggle && (
          <button
            onClick={onLiteModeToggle}
            className="rounded-lg border p-1.5 transition-colors"
            style={{
              borderColor: liteMode ? "var(--accent)" : "var(--border)",
              backgroundColor: liteMode
                ? "var(--accent-subtle)"
                : "var(--bg-card)",
              color: liteMode ? "var(--accent)" : "var(--text-muted)",
            }}
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
          </button>
        )}
      </div>
    </div>
  );
}
