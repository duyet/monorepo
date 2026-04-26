import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Filters } from "@/components/filters";
import { OrgTimeline } from "@/components/org-timeline";
import { StatsHeader } from "@/components/stats-header";
import { Timeline } from "@/components/timeline";
import { VirtualOrgTimeline } from "@/components/virtual-org-timeline";
import { VirtualTimeline } from "@/components/virtual-timeline";
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
  // Use window.location for search params since AppClient is used in a context
  // where useSearch might not have the right route context
  const navigate = useNavigate();
  const [view, setView] = useState<View>(initialView);
  const [liteMode, setLiteMode] = useState(initialLiteMode);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    license: initialLicense,
  });
  const [isPending, startTransition] = useTransition();
  const isInitialized = useRef(false);

  // Sync initial state with URL params on mount
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

  // Update URL when filters change (skip until initial URL read is done)
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
          totalCount={filteredModels.length}
          liteMode={liteMode}
          onLiteModeToggle={() => setLiteMode((prev) => !prev)}
        />
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
    </>
  );
}
