import { cn } from "@duyet/libs/utils";
import { GitCompare, List, X } from "lucide-react";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Model } from "@/lib/data";

type View = "models" | "organizations";

interface FilterInfoProps {
  resultCount: number;
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
  view,
  license = "all",
  liteMode,
  searchQuery = "",
  onSearchChange,
  onLicenseChange,
  comparisonMode,
  onToggleComparisonMode,
}: FilterInfoProps) {
  const toggleLiteMode = () => {
    const url = new URL(window.location.href);
    if (liteMode) {
      url.searchParams.delete("lite");
    } else {
      url.searchParams.set("lite", "true");
    }
    window.location.href = url.toString();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 rounded-xl border border-border bg-card px-4 py-3 animate-fade-in animate-fade-in-delay-2">
        {/* Search with autocomplete — full width on mobile */}
        <div className="flex-1 min-w-0">
          <SearchAutocomplete
            value={searchQuery}
            onChange={(val) => onSearchChange?.(val)}
            placeholder={`Search ${view === "organizations" ? "organizations" : "models"}...`}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Result count */}
          <div className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
            <span className="font-semibold font-[family-name:var(--font-mono)] text-foreground">
              {resultCount.toLocaleString()}
            </span>
            {view === "organizations" ? "orgs" : "models"}
          </div>

          {/* License filter pills */}
          {onLicenseChange && (
            <div className="hidden sm:flex items-center gap-1">
              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["closed", "Closed"],
                  ["partial", "Partial"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => onLicenseChange(value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                    license === value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile license select */}
          {onLicenseChange && (
            <select
              value={license}
              onChange={(e) =>
                onLicenseChange(
                  e.target.value as "all" | "open" | "closed" | "partial"
                )
              }
              className="sm:hidden rounded-lg border border-border bg-card text-foreground py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="partial">Partial</option>
            </select>
          )}

          {/* Divider */}
          <div className="hidden sm:block h-5 w-px bg-border" />

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {view === "models" && onToggleComparisonMode && (
              <Button
                variant={comparisonMode ? "default" : "ghost"}
                size="icon"
                onClick={onToggleComparisonMode}
                className="h-8 w-8"
                title={
                  comparisonMode
                    ? "Exit comparison mode"
                    : "Compare models"
                }
                aria-label={
                  comparisonMode
                    ? "Exit comparison mode"
                    : "Enter comparison mode"
                }
              >
                <GitCompare className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant={liteMode ? "default" : "ghost"}
              size="icon"
              onClick={toggleLiteMode}
              className="h-8 w-8"
              title={liteMode ? "Switch to full view" : "Switch to compact view"}
              aria-label="Toggle view mode"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison mode hint */}
      {comparisonMode && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm animate-fade-in-fast">
          <Badge variant="default" className="text-[11px]">
            Compare
          </Badge>
          <span className="text-muted-foreground">
            Click models to select (max 3), then press{" "}
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs bg-muted">
              c
            </kbd>{" "}
            to compare.
          </span>
          <button
            onClick={onToggleComparisonMode}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Exit comparison mode"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
