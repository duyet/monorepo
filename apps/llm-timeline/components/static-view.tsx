"use client";

import { useState, useMemo, useEffect } from "react";
import { Timeline } from "@/components/timeline";
import { OrgTimeline } from "@/components/org-timeline";
import { VirtualTimeline } from "@/components/virtual-timeline";
import { VirtualOrgTimeline } from "@/components/virtual-org-timeline";
import { FilterInfo } from "@/components/filter-info";
import { StatsCards } from "@/components/stats-cards";
import {
  useKeyboardShortcuts,
  KeyboardHelpTooltip,
  KeyboardHelpButton,
} from "@/components/KeyboardShortcuts";
import { organizations } from "@/lib/data";
import type { Model } from "@/lib/data";
import {
  DEFAULT_FILTERS,
  groupByYear,
  groupByOrg,
  filterModels,
  type FilterState,
} from "@/lib/utils";

type View = "models" | "organizations";

interface StaticViewProps {
  models: Model[];
  stats: {
    models: number;
    organizations: number;
  };
  sourceStats?: Record<string, number>;
  view: View;
  license?: "all" | "open" | "closed" | "partial";
  year?: number;
  org?: string;
  liteMode?: boolean;
}

export function StaticView({
  models: allModels,
  stats,
  sourceStats,
  view,
  license = "all",
  year,
  org,
  liteMode: initialLiteMode = false,
}: StaticViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [licenseFilter, setLicenseFilter] = useState<
    "all" | "open" | "closed" | "partial"
  >(license);
  const [orgFilter, setOrgFilter] = useState("");
  const [liteMode, setLiteMode] = useState(initialLiteMode);

  // Read lite mode and search from URL on mount
  useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const initialSearch = params.get("search") || "";
      const initialOrg = params.get("org") || "";
      const isLite = params.get("lite") === "true";
      setSearchQuery(initialSearch);
      setOrgFilter(initialOrg);
      setLiteMode(isLite);
    };

    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, []);

  // Filter models based on search, license, and org
  const filteredModels = useMemo(() => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      search: searchQuery,
      license: licenseFilter,
      org: orgFilter,
    };
    return filterModels(allModels, filters);
  }, [allModels, searchQuery, licenseFilter, orgFilter]);

  const modelsByYear = useMemo(() => groupByYear(filteredModels), [filteredModels]);
  const modelsByOrg = useMemo(() => groupByOrg(filteredModels), [filteredModels]);

  // Keyboard shortcuts
  const {
    showBadges,
    showHelp,
    setShowHelp,
    shortcutOrgs,
  } = useKeyboardShortcuts({
    organizations,
    onFilterByOrg: setOrgFilter,
    onClearFilters: () => {
      setOrgFilter("");
      setSearchQuery("");
      setLicenseFilter("all");
    },
  });

  return (
    <>
      {/* Stats Cards */}
      <StatsCards
        models={stats.models}
        organizations={stats.organizations}
        activeView={view}
        sourceStats={sourceStats}
      />

      {/* Filter Info with Search */}
      <FilterInfo
        resultCount={filteredModels.length}
        view={view}
        license={licenseFilter}
        year={year}
        org={orgFilter || org || ""}
        liteMode={liteMode}
        models={allModels}
        onSearchChange={setSearchQuery}
        onLicenseChange={setLicenseFilter}
      />

      {/* Organization Shortcuts */}
      {view === "models" && showBadges && (
        <div className="mb-4 flex flex-wrap gap-2">
          {shortcutOrgs.map((shortcutOrg, index) => (
            <button
              key={shortcutOrg.id}
              onClick={() => setOrgFilter(shortcutOrg.name)}
              className="relative rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              style={{
                borderColor: "var(--border)",
                backgroundColor:
                  orgFilter === shortcutOrg.name ? "var(--accent-subtle)" : "var(--bg-card)",
              }}
            >
              <span className="mr-2 font-mono text-xs opacity-60">{index + 1}</span>
              {shortcutOrg.name}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div>
        {view === "organizations" ? (
          filteredModels.length > 500 ? (
            <VirtualOrgTimeline modelsByOrg={modelsByOrg} liteMode={liteMode} />
          ) : (
            <OrgTimeline modelsByOrg={modelsByOrg} liteMode={liteMode} />
          )
        ) : filteredModels.length > 500 ? (
          <VirtualTimeline modelsByYear={modelsByYear} liteMode={liteMode} />
        ) : (
          <Timeline modelsByYear={modelsByYear} liteMode={liteMode} />
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardHelpTooltip
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcutOrgs={shortcutOrgs}
      />
      <KeyboardHelpButton onClick={() => setShowHelp(true)} />
    </>
  );
}
