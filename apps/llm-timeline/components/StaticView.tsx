import { parseParamValue } from "@duyet/libs";
import { cn } from "@duyet/libs/utils";
import { Calendar, CalendarDays, LayoutGrid, type LucideIcon, Table2, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="rd-eyebrow">Layout</span>
          <div className="flex gap-1 bg-[var(--rd-surface-2)] rounded-[var(--rd-r-sm)] p-1">
            {(
              [
                { value: "grid", Icon: LayoutGrid },
                { value: "table", Icon: Table2 },
              ] as const
            ).map(({ value, Icon }) => (
              <SegButton
                key={value}
                Icon={Icon}
                label={value}
                active={viewMode === value}
                onClick={() => setViewMode(value)}
              />
            ))}
          </div>
        </div>

        {viewMode === "grid" && (
          <div className="flex items-center gap-2">
            <span className="rd-eyebrow">Group</span>
            <div className="flex gap-1 bg-[var(--rd-surface-2)] rounded-[var(--rd-r-sm)] p-1">
              {(
                [
                  { value: "year", Icon: Calendar },
                  { value: "month", Icon: CalendarDays },
                ] as const
              ).map(({ value, Icon }) => (
                <SegButton
                  key={value}
                  Icon={Icon}
                  label={value}
                  active={grouping === value}
                  onClick={() => setGrouping(value)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {view === "models" &&
        (viewMode === "table" ? (
          <TimelineTable modelsByYear={modelsByYear} />
        ) : grouping === "year" ? (
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
        ))}

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
        <>
          {selectedModels.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--rd-border)] bg-background p-3 animate-in slide-in-from-bottom">
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center gap-3">
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {selectedModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--rd-border)] bg-card px-2.5 py-1.5 text-sm"
                      >
                        <span className="font-medium text-foreground">
                          {model.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 text-muted-foreground [&_svg]:size-3"
                          onClick={() => removeModel(model.name)}
                          aria-label={`Remove ${model.name} from comparison`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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

          {isModalOpen && canCompare && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-background"
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

function SegButton({
  Icon,
  label,
  active,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--rd-r-sm)] transition-all font-medium capitalize",
        active
          ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
          : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
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
      <div className="sticky top-0 z-10 border-b border-[var(--rd-border)] p-6 bg-background">
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
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--rd-surface-2)]">
              <TableHead className="w-32 text-xs uppercase tracking-wider text-muted-foreground">
                Metric
              </TableHead>
              {sortedModels.map((model) => (
                <TableHead key={model.name}>{model.name}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Organization
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name}>{model.org}</TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Release Date
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell
                  key={model.name}
                  className="font-[family-name:var(--font-mono)] text-sm"
                >
                  {formatDate(model.date)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Parameters
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell
                  key={model.name}
                  className="font-[family-name:var(--font-mono)] text-sm"
                >
                  {model.params || "Unknown"}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                License
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name}>
                  <Badge variant={getLicenseBadgeVariant(model.license)}>
                    {model.license}
                  </Badge>
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="border-b-0">
              <TableCell className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </TableCell>
              {sortedModels.map((model) => (
                <TableCell key={model.name} className="capitalize">
                  {model.type}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>

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
                    <div className="relative h-7 overflow-hidden rounded-lg bg-[var(--rd-surface-2)]">
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