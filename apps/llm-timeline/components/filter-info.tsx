"use client";

import Link from "next/link";
import { List, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  onSearchChange?: (query: string) => void;
  onLicenseChange?: (license: "all" | "open" | "closed" | "partial") => void;
}

export function FilterInfo({
  resultCount,
  view,
  license = "all",
  year,
  org,
  liteMode,
  models,
  onSearchChange,
  onLicenseChange,
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

  // Read lite mode from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isLite = params.get("lite") === "1";
    if (isLite !== liteMode) {
      // Force re-render with parent's liteMode if different
    }
  }, [liteMode]);

  const toggleLiteMode = () => {
    const url = new URL(window.location.href);
    if (liteMode) {
      url.searchParams.delete("lite");
    } else {
      url.searchParams.set("lite", "1");
    }
    window.location.href = url.toString();
  };

  return (
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

      {/* Right side: Lite mode toggle */}
      <button
        onClick={toggleLiteMode}
        className="rounded-lg p-2 transition-colors hover:bg-muted"
        style={{
          borderColor: liteMode ? "var(--primary)" : undefined,
          backgroundColor: liteMode ? "var(--accent)" : undefined,
        }}
        title={liteMode ? "Switch to full view" : "Switch to lite mode"}
      >
        <List
          className="h-4 w-4"
          style={{ color: "var(--muted-foreground)" }}
        />
      </button>
    </div>
  );
}
