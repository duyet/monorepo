"use client";

import { cn } from "@duyet/libs/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchHistory } from "@/lib/hooks/use-search-history";

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
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, add, clear, isInitialized } = useSearchHistory();

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
    // Hide history when user starts typing
    if (value) {
      setShowHistory(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      add(query.trim());
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    updateSearchQuery(historyQuery);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    // Show history only if input is empty and we have history
    if (!query && history.length > 0) {
      setShowHistory(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding to allow clicking on history items
    // Only hide if the new focus target is not within the history dropdown
    setTimeout(() => {
      if (
        !inputRef.current?.contains(e.relatedTarget as Node) &&
        !(e.relatedTarget as HTMLElement)?.closest("[data-search-history]")
      ) {
        setShowHistory(false);
      }
    }, 100);
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
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close history on escape key
  useEffect(() => {
    if (!showHistory) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowHistory(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showHistory]);

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      </form>

      {/* Recent searches dropdown */}
      {showHistory &&
        isInitialized &&
        history.length > 0 &&
        !query && (
          <div
            data-search-history
            className="absolute z-10 mt-2 w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Recent searches
              </span>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {history.map((historyQuery) => (
                <li key={historyQuery}>
                  <button
                    type="button"
                    onClick={() => handleHistoryClick(historyQuery)}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-neutral-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="truncate">{historyQuery}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
