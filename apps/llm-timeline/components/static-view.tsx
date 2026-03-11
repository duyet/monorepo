"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterInfo } from "@/components/filter-info";
import {
  KeyboardHelpButton,
  KeyboardHelpTooltip,
  useKeyboardShortcuts,
} from "@/components/KeyboardShortcuts";
import { OrgTimeline } from "@/components/org-timeline";
import { StatsCards } from "@/components/stats-cards";
import { Timeline } from "@/components/timeline";
import { VirtualOrgTimeline } from "@/components/virtual-org-timeline";
import { VirtualTimeline } from "@/components/virtual-timeline";
import type { Model } from "@/lib/data";
import { organizations } from "@/lib/data";
import {
  DEFAULT_FILTERS,
  type FilterState,
  filterModels,
  groupByOrg,
  groupByYear,
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

  // Simple comparison state (no URL sync for filtered pages to avoid SSR issues)
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      // Parse comparison models from URL if available (only on main page)
      if (!year && !org) {
        const compareParam = params.get("compare");
        if (compareParam) {
          const slugs = compareParam.split(",").filter(Boolean).slice(0, 3);
          const found: Model[] = [];
          for (const slug of slugs) {
            const model = allModels.find(
              (m) =>
                m.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
            );
            if (model && !found.find((f) => f.name === model.name)) {
              found.push(model);
            }
          }
          setSelectedModels(found);
        }
      }
    };

    updateFromUrl();
    window.addEventListener("popstate", updateFromUrl);
    return () => window.removeEventListener("popstate", updateFromUrl);
  }, [year, org, allModels]);

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

  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );
  const modelsByOrg = useMemo(
    () => groupByOrg(filteredModels),
    [filteredModels]
  );

  // Selected model names set for efficient lookup
  const selectedModelNames = useMemo(
    () => new Set(selectedModels.map((m) => m.name)),
    [selectedModels]
  );

  // Handle toggle selection
  const handleToggleSelection = (model: Model) => {
    const isSelected = selectedModelNames.has(model.name);
    if (isSelected) {
      setSelectedModels(selectedModels.filter((m) => m.name !== model.name));
    } else if (selectedModels.length < 3) {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const removeModel = (modelName: string) => {
    setSelectedModels(selectedModels.filter((m) => m.name !== modelName));
  };

  // Update URL when selection changes (only on main page)
  useEffect(() => {
    if (year || org || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (selectedModels.length > 0) {
      params.set(
        "compare",
        selectedModels
          .map((m) => m.name.toLowerCase().replace(/\s+/g, "-"))
          .join(",")
      );
    } else {
      params.delete("compare");
    }
    const newUrl = params.toString() ? `/?${params}` : "/";
    window.history.replaceState({}, "", newUrl);
  }, [selectedModels, year, org]);

  // Keyboard shortcuts
  const { showBadges, showHelp, setShowHelp, shortcutOrgs } =
    useKeyboardShortcuts({
      organizations,
      onFilterByOrg: setOrgFilter,
      onClearFilters: () => {
        setOrgFilter("");
        setSearchQuery("");
        setLicenseFilter("all");
      },
    });

  // Keyboard shortcut for comparison
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "c" && selectedModels.length >= 2) {
        e.preventDefault();
        setIsModalOpen(true);
      }

      if (e.key === "Escape" && isModalOpen) {
        e.preventDefault();
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModels.length, isModalOpen]);

  const canCompare = selectedModels.length >= 2;
  const enableComparisonToggle = !year && !org;

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
        comparisonMode={comparisonMode}
        onToggleComparisonMode={
          enableComparisonToggle
            ? () => setComparisonMode(!comparisonMode)
            : undefined
        }
      />

      {/* Organization Shortcuts */}
      {view === "models" && showBadges && !comparisonMode && (
        <div className="mb-4 flex flex-wrap gap-2">
          {shortcutOrgs.map((shortcutOrg, index) => (
            <button
              key={shortcutOrg.id}
              onClick={() => setOrgFilter(shortcutOrg.name)}
              className="relative rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              style={{
                borderColor: "var(--border)",
                backgroundColor:
                  orgFilter === shortcutOrg.name
                    ? "var(--accent-subtle)"
                    : "var(--bg-card)",
              }}
            >
              <span className="mr-2 font-mono text-xs opacity-60">
                {index + 1}
              </span>
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
          <VirtualTimeline
            modelsByYear={modelsByYear}
            liteMode={liteMode}
            comparisonMode={comparisonMode}
            selectedModelNames={selectedModelNames}
            onToggleSelection={handleToggleSelection}
          />
        ) : (
          <Timeline
            modelsByYear={modelsByYear}
            liteMode={liteMode}
            comparisonMode={comparisonMode}
            selectedModelNames={selectedModelNames}
            onToggleSelection={handleToggleSelection}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <KeyboardHelpTooltip
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcutOrgs={shortcutOrgs}
      />
      <KeyboardHelpButton onClick={() => setShowHelp(true)} />

      {/* Comparison UI - only on main page */}
      {enableComparisonToggle && (
        <>
          {selectedModels.length > 0 && (
            <div
              className="fixed bottom-0 left-0 right-0 z-40 border-t p-4 animate-in slide-in-from-bottom"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
              }}
            >
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-4">
                  <div className="flex flex-1 flex-wrap gap-2">
                    {selectedModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center gap-2 rounded-lg border px-3 py-2"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--bg-card)",
                        }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {model.name}
                        </span>
                        <button
                          onClick={() => removeModel(model.name)}
                          className="rounded p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          aria-label={`Remove ${model.name} from comparison`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canCompare}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: canCompare
                        ? "var(--accent)"
                        : "var(--bg-card)",
                      color: canCompare ? "white" : "var(--text-muted)",
                    }}
                  >
                    Compare ({selectedModels.length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && canCompare && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border"
                style={{
                  backgroundColor: "var(--bg)",
                  borderColor: "var(--border)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ComparisonModalContent
                  models={selectedModels}
                  onClose={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

interface ComparisonModalContentProps {
  models: Model[];
  onClose: () => void;
}

function ComparisonModalContent({
  models,
  onClose,
}: ComparisonModalContentProps) {
  const { formatDate, getLicenseColor } = require("@/lib/utils");
  const { parseParamValue } = require("@duyet/libs");

  const sortedModels = [...models].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const maxParams = Math.max(
    ...sortedModels.map((m) => parseParamValue(m.params) || 0),
    1
  );

  return (
    <>
      <div
        className="sticky top-0 z-10 border-b p-6 backdrop-blur-sm"
        style={{ borderBottomColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text)" }}
            >
              Model Comparison
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {sortedModels.length} model{sortedModels.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Close comparison"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: "var(--border)" }}
        >
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderBottomColor: "var(--border)" }}
              >
                <th
                  className="px-4 py-3 text-left font-semibold w-32"
                  style={{ color: "var(--text)" }}
                >
                  Metric
                </th>
                {sortedModels.map((model) => (
                  <th
                    key={model.name}
                    className="px-4 py-3 text-left font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr
                className="border-b"
                style={{ borderBottomColor: "var(--border)" }}
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Organization
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3"
                    style={{ color: "var(--text)" }}
                  >
                    {model.org}
                  </td>
                ))}
              </tr>
              <tr
                className="border-b"
                style={{ borderBottomColor: "var(--border)" }}
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Release Date
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3"
                    style={{ color: "var(--text)" }}
                  >
                    {formatDate(model.date)}
                  </td>
                ))}
              </tr>
              <tr
                className="border-b"
                style={{ borderBottomColor: "var(--border)" }}
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Parameters
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3"
                    style={{ color: "var(--text)" }}
                  >
                    {model.params || "Unknown"}
                  </td>
                ))}
              </tr>
              <tr
                className="border-b"
                style={{ borderBottomColor: "var(--border)" }}
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  License
                </td>
                {sortedModels.map((model) => (
                  <td key={model.name} className="px-4 py-3">
                    <span
                      className={`rounded border px-2 py-1 text-xs font-medium uppercase tracking-wide ${getLicenseColor(model.license)}`}
                    >
                      {model.license}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Type
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3 capitalize"
                    style={{ color: "var(--text)" }}
                  >
                    {model.type}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {sortedModels.some((m) => m.params) && (
          <div>
            <h3
              className="mb-4 text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              Parameter Count Comparison
            </h3>
            <div className="space-y-3">
              {sortedModels.map((model) => {
                const paramValue = parseParamValue(model.params);
                if (!paramValue) return null;
                const percentage = (paramValue / maxParams) * 100;
                return (
                  <div key={model.name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span
                        className="font-medium"
                        style={{ color: "var(--text)" }}
                      >
                        {model.name}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {model.params}
                      </span>
                    </div>
                    <div
                      className="relative h-8 overflow-hidden rounded-md"
                      style={{ backgroundColor: "var(--border)", opacity: 0.3 }}
                    >
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getLicenseColor(model.license).split(
                            " "
                          )[0],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
