"use client";

import { cn } from "@duyet/libs/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface SearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Optional CSS classes */
  className?: string;
  /** Input CSS classes */
  inputClassName?: string;
}

/**
 * Search bar component with keyboard shortcut support.
 *
 * Press "/" to focus the search input from anywhere on the page.
 * Search query is stored in URL params for shareability.
 *
 * @example
 * ```tsx
 * <SearchBar placeholder="Search posts..." />
 * ```
 */
export function SearchBar({
  placeholder = "Search posts...",
  className,
  inputClassName,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Update URL when query changes
  const updateSearchQuery = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery) {
        params.set("q", newQuery);
      } else {
        params.delete("q");
      }
      const newUrl = `/search?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateSearchQuery(value);
  };

  // Handle keyboard shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "/" || e.key === "s") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 text-lg",
          "border border-neutral-300 dark:border-neutral-700",
          "bg-white dark:bg-neutral-900",
          "text-neutral-900 dark:text-neutral-100",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-600",
          "rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-neutral-500",
          "transition-all",
          inputClassName
        )}
        autoComplete="off"
      />
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
        <kbd className="hidden rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 sm:inline-block">
          /
        </kbd>
      </div>
    </div>
  );
}
