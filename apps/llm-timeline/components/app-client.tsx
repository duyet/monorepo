import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Filters } from "@/components/filters";
import { StatsHeader } from "@/components/stats-header";
import { TimelineGrid } from "@/components/TimelineGrid";
import { MonthGroupedTimeline } from "@/components/MonthGroupedTimeline";
import type { Model } from "@/lib/data";
import {
  DEFAULT_FILTERS,
  type FilterState,
  filterModels,
  groupByOrg,
  groupByYear,
} from "@/lib/utils";

type View = "models" | "organizations";

interface AppClientProps {
  initialModels: Model[];
  stats: {
    models: number;
    organizations: number;
  };
  initialView?: View;
  initialLicense?: FilterState["license"];
  initialLiteMode?: boolean;
}

export function AppClient({
  initialModels,
  stats,
  initialView = "models",
  initialLicense = "all",
  initialLiteMode = false,
}: AppClientProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>(initialView);
  const [liteMode, setLiteMode] = useState(initialLiteMode);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    license: initialLicense,
  });
  const [isPending, startTransition] = useTransition();
  const isInitialized = useRef(false);
  const [grouping, setGrouping] = useState<"year" | "month">("year");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlView = (searchParams.get("view") as View) || initialView;
    const urlLicense =
      (searchParams.get("license") as FilterState["license"]) || initialLicense;
    const urlLiteMode = searchParams.get("lite") === "true";
    const urlSearch = searchParams.get("search") || "";
    const urlType = (searchParams.get("type") as FilterState["type"]) || "all";
    const urlOrg = searchParams.get("org") || "";

    setView(urlView);
    setLiteMode(urlLiteMode);
    setFilters({
      search: urlSearch,
      license: urlLicense,
      type: urlType,
      org: urlOrg,
      source: (searchParams.get("source") as FilterState["source"]) || "all",
      domain: searchParams.get("domain") || "all",
      params: searchParams.get("params") || "all",
    });
    isInitialized.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isInitialized.current) return;
    const params: Record<string, string> = {};

    if (view !== "models") params.view = view;
    if (filters.license !== "all") params.license = filters.license;
    if (liteMode) params.lite = "true";
    if (filters.search) params.search = filters.search;
    if (filters.type !== "all") params.type = filters.type;
    if (filters.org) params.org = filters.org;
    if (filters.source !== "all") params.source = filters.source;
    if (filters.domain !== "all") params.domain = filters.domain;
    if (filters.params !== "all") params.params = filters.params;

    navigate({ to: "/", search: params, replace: true });
  }, [view, filters, liteMode, navigate]);

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next));
  };

  const handleViewChange = (nextView: View) => {
    setView(nextView);
  };

  const filteredModels = useMemo(
    () => filterModels(initialModels, filters),
    [initialModels, filters]
  );
  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );
  const modelsByOrg = useMemo(
    () => groupByOrg(filteredModels),
    [filteredModels]
  );

  return (
    <>
      <StatsHeader
        {...stats}
        activeView={view}
        onViewChange={handleViewChange}
      />
      <div className={isPending ? "opacity-70 transition-opacity" : ""}>
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          resultCount={filteredModels.length}
          totalCount={initialModels.length}
          liteMode={liteMode}
          onLiteModeToggle={() => setLiteMode((prev) => !prev)}
        />
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="rd-eyebrow">View</span>
            <div className="flex gap-1 bg-[var(--rd-surface-2)] rounded-[var(--rd-r-sm)] p-1">
              <button
                onClick={() => setGrouping("year")}
                className={`px-3 py-1.5 text-sm rounded-[var(--rd-r-sm)] transition-all font-medium ${
                  grouping === "year"
                    ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
                    : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setGrouping("month")}
                className={`px-3 py-1.5 text-sm rounded-[var(--rd-r-sm)] transition-all font-medium ${
                  grouping === "month"
                    ? "bg-[var(--rd-text)] text-[var(--rd-bg)]"
                    : "text-[var(--rd-text-3)] hover:text-[var(--rd-text)]"
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {view === "organizations" ? (
          <div className="rd-g3 gap-3">
            {Array.from(modelsByOrg.entries()).map(([orgName, orgModels]) => (
              <div
                key={orgName}
                className="rd-card rd-work-card flex flex-col p-4 min-h-[128px]"
              >
                <div className="mb-3 flex items-start gap-2.5">
                  <div className="shrink-0">
                    <span className="text-2xl font-bold text-[var(--rd-accent-ink)]">{orgName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold font-[family-name:var(--font-sans)] tracking-tight text-foreground leading-snug truncate">
                      {orgName}
                    </h3>
                    <p className="text-xs text-[var(--rd-text-3)] truncate">{orgModels.length} models</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : grouping === "year" ? (
          filteredModels.length > 500 ? (
            <TimelineGrid
              modelsByYear={modelsByYear}
              grouping="year"
            />
          ) : (
            <TimelineGrid
              modelsByYear={modelsByYear}
              grouping="year"
            />
          )
        ) : (
          <MonthGroupedTimeline
            models={filteredModels}
          />
        )}
      </div>
    </>
  );
}