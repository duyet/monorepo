"use client";

import { cn } from "@duyet/libs/utils";
import { ArrowUpDown, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SortOption } from "@/lib/photo-utils";

/**
 * Debounce hook for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Sort options configuration
 */
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "liked", label: "Most liked" },
  { value: "viewed", label: "Most viewed" },
];

interface PhotoSearchBarProps {
  className?: string;
}

/**
 * Search and sort controls for photo gallery
 * Handles URL state management for search query and sort option
 */
export function PhotoSearchBar({ className }: PhotoSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const sort = (searchParams.get("sort") as SortOption) || "newest";

  const [searchInput, setSearchInput] = useState(query);
  const debouncedQuery = useDebounce(searchInput, 300);

  // Update URL when debounced query changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    // Preserve year parameter if it exists
    const year = params.get("year");
    const newQueryString = params.toString();
    const newPath = year ? `/${year}?${newQueryString}` : `/?${newQueryString}`;

    router.replace(newPath);
  }, [debouncedQuery, router, searchParams]);

  // Handle sort change
  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", newSort);

      const year = params.get("year");
      const newQueryString = params.toString();
      const newPath = year ? `/${year}?${newQueryString}` : `/?${newQueryString}`;

      router.replace(newPath);
    },
    [router, searchParams]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 sm:max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by description or tags..."
          className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-700 dark:bg-slate-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          aria-label="Search photos"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <label htmlFor="sort-select" className="sr-only">
          Sort photos by
        </label>
        <div className="relative">
          <ArrowUpDown
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="appearance-none rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-10 text-sm font-medium text-neutral-700 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 dark:border-neutral-700 dark:bg-slate-800 dark:text-neutral-300"
            aria-label="Sort photos"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
