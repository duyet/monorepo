import { cn } from "@duyet/libs/utils";
import { GitCompare, List, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState, useCallback } from "react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Model } from "@/lib/data";
import { domains } from "@/lib/data";

type View = "models" | "organizations";

interface FilterInfoProps {
  resultCount: number;
  totalCount: number;
  view: View;
  license?: "all" | "open" | "closed" | "partial";
  year?: number;
  org?: string;
  liteMode?: boolean;
  models: Model[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onLicenseChange?: (license: "all" | "open" | "closed" | "partial") => void;
  comparisonMode?: boolean;
  onToggleComparisonMode?: () => void;
}

export function FilterInfo({
  resultCount,
  totalCount,
  view,
  license = "all",
  liteMode,
  searchQuery = "",
  onSearchChange,
  onLicenseChange,
  comparisonMode,
  onToggleComparisonMode,
}: FilterInfoProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [domainFilter, setDomainFilter] = useState("all");

  const toggleLiteMode = () => {
    const url = new URL(window.location.href);
    if (liteMode) {
      url.searchParams.delete("lite");
    } else {
      url.searchParams.set("lite", "true");
    }
    window.location.href = url.toString();
  };

  const isFiltered = resultCount < totalCount;
  const activeFilterCount = [
    license !== "all",
    domainFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search + Filter Toggle Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchAutocomplete
            value={searchQuery}
            onChange={(val) => onSearchChange?.(val)}
            inputClassName="h-10"
            placeholder={`Search ${view === "organizations" ? "organizations" : "models"}...`}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          {onLicenseChange && (
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
          )}

          {/* View toggle */}
          <button
            onClick={toggleLiteMode}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              liteMode
                ? "border-foreground/20 bg-accent text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:bg-accent/50"
            )}
            title={liteMode ? "Switch to full view" : "Switch to compact view"}
          >
            {liteMode ? (
              <List className="h-4 w-4" />
            ) : (
              <GitCompare className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {liteMode ? "Compact" : "Full"}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      {filtersExpanded && onLicenseChange && (
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            <Select
              variant="filter"
              value={license}
              onChange={(e) =>
                onLicenseChange(e.target.value as "all" | "open" | "closed" | "partial")
              }
            >
              <option value="all">All Licenses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="partial">Partial</option>
            </Select>

            <Select
              variant="filter"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="all">All Domains</option>
              {domains.slice(0, 15).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {/* Result count with filtered indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-[family-name:var(--font-mono)] tabular-nums",
            isFiltered ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {resultCount.toLocaleString()}
            <span className="text-muted-foreground"> {view === "organizations" ? "organizations" : "models"}</span>
          </span>
          {isFiltered && (
            <span className="text-muted-foreground">
              of {totalCount.toLocaleString()} total
            </span>
          )}
        </div>

        {/* Compare button when applicable */}
        {comparisonMode !== undefined && onToggleComparisonMode && (
          <Button
            variant={comparisonMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleComparisonMode}
            className="h-8"
          >
            <GitCompare className="h-3.5 w-3.5 mr-1.5" />
            {comparisonMode ? "Comparing" : "Compare"}
          </Button>
        )}
      </div>
    </div>
  );
}
