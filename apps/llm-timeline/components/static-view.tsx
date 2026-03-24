import { parseParamValue } from "@duyet/libs";
import { cn } from "@duyet/libs/utils";
import { X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VirtualOrgTimeline } from "@/components/virtual-org-timeline";
import { VirtualTimeline } from "@/components/virtual-timeline";
import type { Model } from "@/lib/data";
import { organizations } from "@/lib/data";
import {
  DEFAULT_FILTERS,
  type FilterState,
  filterModels,
  formatDate,
  getLicenseBarColor,
  getLicenseBadgeVariant,
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
        searchQuery={searchQuery}
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
        <div className="mb-4 flex flex-wrap gap-1.5">
          {shortcutOrgs.map((shortcutOrg, index) => (
            <button
              key={shortcutOrg.id}
              onClick={() => setOrgFilter(shortcutOrg.name)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                orgFilter === shortcutOrg.name
                  ? "bg-foreground text-background border-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              <span className="mr-1.5 font-mono text-xs opacity-50">
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
          {/* Floating comparison bar */}
          {selectedModels.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm p-3 animate-in slide-in-from-bottom">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3">
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {selectedModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {model.name}
                        </span>
                        <button
                          onClick={() => removeModel(model.name)}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label={`Remove ${model.name} from comparison`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canCompare}
                    size="sm"
                    className="shrink-0"
                  >
                    Compare ({selectedModels.length})
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comparison modal */}
          {isModalOpen && canCompare && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border border-border bg-background shadow-2xl"
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
  const sortedModels = [...models].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const maxParams = Math.max(
    ...sortedModels.map((m) => parseParamValue(m.params) || 0),
    1
  );

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border p-6 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Model Comparison
            </h2>
            <p className="text-sm text-muted-foreground">
              {sortedModels.length} model{sortedModels.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close comparison"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-32">
                  Metric
                </th>
                {sortedModels.map((model) => (
                  <th
                    key={model.name}
                    className="px-4 py-3 text-left font-semibold text-foreground"
                  >
                    {model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Organization
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3 text-foreground"
                  >
                    {model.org}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Release Date
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-foreground"
                  >
                    {formatDate(model.date)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Parameters
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-foreground"
                  >
                    {model.params || "Unknown"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  License
                </td>
                {sortedModels.map((model) => (
                  <td key={model.name} className="px-4 py-3">
                    <Badge variant={getLicenseBadgeVariant(model.license)}>
                      {model.license}
                    </Badge>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Type
                </td>
                {sortedModels.map((model) => (
                  <td
                    key={model.name}
                    className="px-4 py-3 capitalize text-foreground"
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
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                      <span className="font-medium text-foreground">
                        {model.name}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-muted-foreground">
                        {model.params}
                      </span>
                    </div>
                    <div className="relative h-7 overflow-hidden rounded-lg bg-muted">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getLicenseBarColor(model.license),
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
