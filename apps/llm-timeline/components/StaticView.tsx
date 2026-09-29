import { cn } from "@duyet/libs/utils";
import { Calendar, CalendarDays, LayoutGrid, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FilterInfo } from "@/components/filter-info";
import {
  KeyboardHelpButton,
  KeyboardHelpTooltip,
  useKeyboardShortcuts,
} from "@/components/KeyboardShortcuts";
import { StatsCards } from "@/components/stats-cards";
import { TimelineGrid } from "@/components/TimelineGrid";
import { TimelineTable } from "@/components/TimelineTable";
import { MonthGroupedTimeline } from "@/components/MonthGroupedTimeline";
import { ModelCardGrid } from "@/components/ModelCardGrid";
import { ComparisonDock } from "@/components/compare/ComparisonDock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
type Grouping = "year" | "month";

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
  const [grouping, setGrouping] = useState<Grouping>("year");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const initialSearch = params.get("search") || "";
      const initialOrg = params.get("org") || "";
      const isLite = params.get("lite") === "true";
      setSearchQuery(initialSearch);
      setOrgFilter(initialOrg);
      setLiteMode(isLite);

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

  const filteredModels = useMemo(() => {
    const filters: FilterState = {
      ...DEFAULT_FILTERS,
      search: searchQuery,
      license: licenseFilter,
      org: orgFilter,
    };
    return filterModels(allModels, filters);
  }, [allModels, searchQuery, licenseFilter, orgFilter]);

  const yearCount = useMemo(
    () =>
      new Set(allModels.map((m) => new Date(m.date).getFullYear())).size,
    [allModels]
  );

  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );
  const modelsByOrg = useMemo(
    () => groupByOrg(filteredModels),
    [filteredModels]
  );

  const selectedModelNames = useMemo(
    () => new Set(selectedModels.map((m) => m.name)),
    [selectedModels]
  );

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
      <StatsCards
        models={stats.models}
        organizations={stats.organizations}
        years={yearCount}
        activeView={view}
        sourceStats={sourceStats}
      />

      <div className="mb-6" />

      <FilterInfo
        resultCount={filteredModels.length}
        totalCount={allModels.length}
        view={view}
        license={licenseFilter}
        liteMode={liteMode}
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

      {view === "models" && (
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "grid" | "table")}
        >
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="rd-eyebrow">Layout</span>
              <TabsList aria-label="Timeline layout">
                <TabsTrigger value="grid">
                  <LayoutGrid />
                  grid
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Table2 />
                  table
                </TabsTrigger>
              </TabsList>
            </div>

            {viewMode === "grid" && (
              <div className="flex items-center gap-2">
                <span className="rd-eyebrow">Group</span>
                <Tabs
                  value={grouping}
                  onValueChange={(v) => setGrouping(v as Grouping)}
                >
                  <TabsList aria-label="Group models by">
                    <TabsTrigger value="year">
                      <Calendar />
                      year
                    </TabsTrigger>
                    <TabsTrigger value="month">
                      <CalendarDays />
                      month
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </div>

          <TabsContent value="grid">
            {grouping === "year" ? (
              <TimelineGrid
                modelsByYear={modelsByYear}
                comparisonMode={comparisonMode}
                selectedModelNames={selectedModelNames}
                onToggleSelection={handleToggleSelection}
                grouping="year"
              />
            ) : (
              <MonthGroupedTimeline
                models={filteredModels}
                comparisonMode={comparisonMode}
                selectedModelNames={selectedModelNames}
                onToggleSelection={handleToggleSelection}
              />
            )}
          </TabsContent>

          <TabsContent value="table">
            <TimelineTable modelsByYear={modelsByYear} />
          </TabsContent>
        </Tabs>
      )}

      {view === "organizations" && (
        <div className="rd-g3 gap-3">
          {Array.from(modelsByOrg.entries()).map(([orgName, orgModels]) => (
            <ModelCardGrid
              key={orgName}
              model={{ ...orgModels[0], name: orgName, desc: `${orgModels.length} models` } as Model}
            />
          ))}
        </div>
      )}

      <KeyboardHelpTooltip
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        shortcutOrgs={shortcutOrgs}
      />
      <KeyboardHelpButton onClick={() => setShowHelp(true)} />

      {enableComparisonToggle && (
        <ComparisonDock
          selectedModels={selectedModels}
          canCompare={canCompare}
          isModalOpen={isModalOpen}
          onRemove={removeModel}
          onOpenModal={() => setIsModalOpen(true)}
          onCloseModal={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
