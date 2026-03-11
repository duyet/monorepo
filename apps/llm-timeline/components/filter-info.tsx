"use client";

import { List, Search, X, GitCompare } from "lucide-react";
import { useState } from "react";
import type { Model } from "@/lib/data";
import { cn } from "@duyet/libs/utils";

type View = "models" | "organizations";

interface FilterInfoProps {
  resultCount: number;
  view: View;
  license?: "all" | "open" | "closed" | "partial";
  year?: number;
  org?: string;
  liteMode?: boolean;
  models: Model[];
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
  onSearchChange,
  onLicenseChange,
  comparisonMode,
  onToggleComparisonMode,
}: FilterInfoProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearchChange?.("");
  };

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
      <div
        className="mb-4 flex items-center gap-4 rounded-lg border px-4 py-3"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Left side: Search and Result Count */}
        <div className="flex items-center gap-4 flex-1">
          {/* Search input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-64 rounded-md border py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-1"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Result Count */}
          <span
            className="text-sm whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="font-semibold" style={{ color: "var(--text)" }}>
              {resultCount.toLocaleString()}
            </span>{" "}
            {view === "organizations" ? "organizations" : "models"}
          </span>
        </div>

        {/* Center: License dropdown */}
        {onLicenseChange && (
          <select
            value={license}
            onChange={(e) =>
              onLicenseChange(
                e.target.value as "all" | "open" | "closed" | "partial"
              )
            }
            className="rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-1"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg)",
              color: "var(--text)",
            }}
          >
            <option value="all">All Licenses</option>
            <option value="open">Open Weights</option>
            <option value="closed">Closed</option>
            <option value="partial">Partials</option>
          </select>
        )}

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-2">
          {/* Comparison mode toggle (only for models view) */}
          {view === "models" && onToggleComparisonMode && (
            <button
              onClick={onToggleComparisonMode}
              className={cn(
                "rounded-lg p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                comparisonMode && "bg-[var(--accent)]"
              )}
              style={{
                borderColor: comparisonMode ? "var(--primary)" : undefined,
              }}
              title={comparisonMode ? "Exit comparison mode" : "Enter comparison mode (select 2-3 models to compare)"}
              aria-label={comparisonMode ? "Exit comparison mode" : "Enter comparison mode"}
            >
              <GitCompare
                className="h-4 w-4"
                style={{ color: comparisonMode ? "white" : "var(--muted-foreground)" }}
              />
            </button>
          )}

          {/* Lite mode toggle */}
          <button
            onClick={toggleLiteMode}
            className="rounded-lg p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            style={{
              borderColor: liteMode ? "var(--primary)" : undefined,
              backgroundColor: liteMode ? "var(--accent)" : undefined,
            }}
            title={liteMode ? "Switch to full view" : "Switch to lite mode"}
            aria-label="Toggle lite mode"
          >
            <List
              className="h-4 w-4"
              style={{ color: "var(--muted-foreground)" }}
            />
          </button>
        </div>
      </div>

      {/* Comparison mode hint */}
      {comparisonMode && (
        <div
          className="mb-4 rounded-lg border px-4 py-2 text-sm"
          style={{
            borderColor: "var(--accent)",
            backgroundColor: "var(--accent-subtle)",
          }}
        >
          <span style={{ color: "var(--text)" }}>
            <strong>Comparison mode:</strong> Click on model cards to select them (max 3). Press{' '}
            <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs" style={{ borderColor: "var(--border)" }}>
              c
            </kbd>{' '}
            when ready to compare.
          </span>
        </div>
      )}
    </>
  );
}
