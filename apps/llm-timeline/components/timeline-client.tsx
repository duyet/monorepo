"use client";

import { useState, useMemo, useTransition } from "react";
import { Filters } from "@/components/filters";
import { Timeline } from "@/components/timeline";
import { models } from "@/lib/data";
import { DEFAULT_FILTERS, filterModels, groupByYear, type FilterState } from "@/lib/utils";

export function TimelineClient() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next));
  };

  const filteredModels = useMemo(
    () => filterModels(models, filters),
    [filters]
  );
  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : ""}>
      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        resultCount={filteredModels.length}
      />
      <Timeline modelsByYear={modelsByYear} />
    </div>
  );
}
