"use client";

import { cn } from "@duyet/libs/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export interface SearchFiltersProps {
  /** Available categories with post counts */
  categories: Record<string, number>;
  /** Available tags with post counts */
  tags: Record<string, number>;
  /** Optional CSS classes */
  className?: string;
}

/**
 * Date range preset options
 */
type DateRangePreset =
  | "all"
  | "7days"
  | "30days"
  | "90days"
  | "1year"
  | "custom";

interface DateRangeOption {
  value: DateRangePreset;
  label: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Generate date range options with actual dates
 */
function getDateRangeOptions(): DateRangeOption[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    { value: "all", label: "All time" },
    {
      value: "7days",
      label: "Last 7 days",
      fromDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      toDate: today,
    },
    {
      value: "30days",
      label: "Last 30 days",
      fromDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      toDate: today,
    },
    {
      value: "90days",
      label: "Last 90 days",
      fromDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
      toDate: today,
    },
    {
      value: "1year",
      label: "Last year",
      fromDate: new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      ),
      toDate: today,
    },
    { value: "custom", label: "Custom range" },
  ];
}

/**
 * Format date to YYYY-MM-DD for input[type="date"]
 */
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string from input to Date
 */
function parseDateFromInput(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Search filters component with category, tag, and date range filters.
 *
 * Filters are synchronized with URL query params for shareable search results.
 *
 * @example
 * ```tsx
 * <SearchFilters
 *   categories={{ "Engineering": 42, "Design": 15 }}
 *   tags={{ "React": 20, "TypeScript": 18 }}
 * />
 * ```
 */
export function SearchFilters({
  categories,
  tags,
  className,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentCategory = searchParams.get("category") || "";
  const currentTags = (searchParams.get("tags") || "")
    .split(",")
    .filter(Boolean);
  const currentFromDate = searchParams.get("from") || "";
  const currentToDate = searchParams.get("to") || "";
  const currentPreset = (searchParams.get("preset") || "all") as DateRangePreset;

  // Determine if we're using a custom date range
  const [isCustomDateRange, setIsCustomDateRange] = useState<boolean>(
    currentPreset === "custom" || Boolean(currentFromDate && currentToDate)
  );
  const [customFromDate, setCustomFromDate] = useState<string>(currentFromDate);
  const [customToDate, setCustomToDate] = useState<string>(currentToDate);

  // Sort categories by name
  const sortedCategories = Object.entries(categories).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  // Sort tags by count (descending), then by name
  const sortedTags = Object.entries(tags).sort(
    ([nameA, a], [nameB, b]) => {
      if (a !== b) {
        return b - a;
      }
      return nameA.localeCompare(nameB);
    }
  );

  /**
   * Update URL with filter params
   */
  const updateFilters = useCallback(
    (updates: {
      category?: string;
      tags?: string[];
      preset?: DateRangePreset;
      from?: string;
      to?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update category
      if (updates.category !== undefined) {
        if (updates.category) {
          params.set("category", updates.category);
        } else {
          params.delete("category");
        }
      }

      // Update tags
      if (updates.tags !== undefined) {
        if (updates.tags.length > 0) {
          params.set("tags", updates.tags.join(","));
        } else {
          params.delete("tags");
        }
      }

      // Update date range
      if (updates.preset !== undefined) {
        if (updates.preset !== "all") {
          params.set("preset", updates.preset);
        } else {
          params.delete("preset");
          params.delete("from");
          params.delete("to");
        }

        // Set from/to dates for presets
        if (updates.preset !== "all" && updates.preset !== "custom") {
          const option = getDateRangeOptions().find(
            (opt) => opt.value === updates.preset
          );
          if (option?.fromDate && option?.toDate) {
            params.set("from", formatDateForInput(option.fromDate));
            params.set("to", formatDateForInput(option.toDate));
          }
        }
      }

      // Update custom date range
      if (updates.from !== undefined) {
        if (updates.from) {
          params.set("from", updates.from);
        } else {
          params.delete("from");
        }
      }
      if (updates.to !== undefined) {
        if (updates.to) {
          params.set("to", updates.to);
        } else {
          params.delete("to");
        }
      }

      const newUrl = `/search?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  /**
   * Handle category change
   */
  const handleCategoryChange = (category: string) => {
    updateFilters({ category: category === currentCategory ? "" : category });
  };

  /**
   * Handle tag toggle
   */
  const handleTagToggle = (tag: string) => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateFilters({ tags: newTags });
  };

  /**
   * Handle date preset change
   */
  const handleDatePresetChange = (preset: DateRangePreset) => {
    if (preset === "custom") {
      setIsCustomDateRange(true);
    } else {
      setIsCustomDateRange(false);
      updateFilters({ preset });
    }
  };

  /**
   * Handle custom date range change
   */
  const handleCustomDateChange = (
    field: "from" | "to",
    value: string
  ) => {
    if (field === "from") {
      setCustomFromDate(value);
    } else {
      setCustomToDate(value);
    }
    updateFilters({
      preset: "custom",
      from: field === "from" ? value : customFromDate,
      to: field === "to" ? value : customToDate,
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) {
      params.set("q", query);
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
    setIsCustomDateRange(false);
    setCustomFromDate("");
    setCustomToDate("");
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    currentCategory || currentTags.length > 0 || currentFromDate || currentToDate;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentCategory && (
            <ActiveFilterBadge
              label={`Category: ${currentCategory}`}
              onRemove={() => handleCategoryChange(currentCategory)}
            />
          )}
          {currentTags.map((tag) => (
            <ActiveFilterBadge
              key={tag}
              label={`Tag: ${tag}`}
              onRemove={() => handleTagToggle(tag)}
            />
          ))}
          {(currentFromDate || currentToDate) && (
            <ActiveFilterBadge
              label={`Date: ${currentFromDate || "..."} - ${currentToDate || "..."}`}
              onRemove={() => updateFilters({ preset: "all" })}
            />
          )}
        </div>
      )}

      {/* Category Filter */}
      <FilterSection title="Category">
        <select
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
        >
          <option value="">All categories</option>
          {sortedCategories.map(([category, count]) => (
            <option key={category} value={category}>
              {category} ({count})
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Tag Filter */}
      <FilterSection title="Tags">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateFilters({ tags: [] })}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              currentTags.length === 0
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            )}
          >
            All tags
          </button>
          {sortedTags.slice(0, 20).map(([tag, count]) => (
            <button
              type="button"
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                currentTags.includes(tag)
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
              title={`${count} posts`}
            >
              {tag}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Date Range Filter */}
      <FilterSection title="Date Range">
        {!isCustomDateRange ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {getDateRangeOptions()
              .filter((opt) => opt.value !== "custom")
              .map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleDatePresetChange(option.value)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                    currentPreset === option.value ||
                      (!currentPreset && option.value === "all")
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            <button
              type="button"
              onClick={() => handleDatePresetChange("custom")}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              )}
            >
              Custom range
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="from-date"
                  className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
                >
                  From
                </label>
                <input
                  id="from-date"
                  type="date"
                  value={customFromDate}
                  onChange={(e) =>
                    handleCustomDateChange("from", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
              <div>
                <label
                  htmlFor="to-date"
                  className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
                >
                  To
                </label>
                <input
                  id="to-date"
                  type="date"
                  value={customToDate}
                  onChange={(e) => handleCustomDateChange("to", e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCustomDateRange(false);
                updateFilters({ preset: "all" });
              }}
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Back to presets
            </button>
          </div>
        )}
      </FilterSection>
    </div>
  );
}

/**
 * Filter section wrapper component
 */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Active filter badge with remove button
 */
function ActiveFilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-sm">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-neutral-900 dark:hover:text-neutral-100"
        aria-label={`Remove ${label} filter`}
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  );
}
