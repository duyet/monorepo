"use client";

import { useState, useMemo, useTransition, useRef, useCallback } from "react";
import { Filters } from "@/components/filters";
import { Timeline } from "@/components/timeline";
import { models } from "@/lib/data";
import { DEFAULT_FILTERS, filterModels, groupByYear, type FilterState } from "@/lib/utils";
import { useTimelineKeyboardNav } from "@/hooks/useKeyboardNavigation";

export function TimelineClient() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleFilterChange = (next: FilterState) => {
    startTransition(() => setFilters(next));
  };

  // Clear filters and return to default state
  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Focus search input
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredModels = useMemo(
    () => filterModels(models, filters),
    [filters]
  );
  const modelsByYear = useMemo(
    () => groupByYear(filteredModels),
    [filteredModels]
  );

  // Enable keyboard navigation
  useTimelineKeyboardNav({
    isEnabled: true,
    onEscape: handleClearFilters,
    onSlash: handleFocusSearch,
  });

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : ""}>
      <Filters
        ref={searchInputRef}
        filters={filters}
        onFilterChange={handleFilterChange}
        resultCount={filteredModels.length}
      />
      <Timeline modelsByYear={modelsByYear} />
    </div>
  );
}
