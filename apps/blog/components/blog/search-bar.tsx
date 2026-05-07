import { cn } from "@duyet/libs/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
 */
export function SearchBar({
  placeholder = "Search posts...",
  className,
  inputClassName,
}: SearchBarProps) {
  const navigate = useNavigate({ from: "/search" });
  const search = useSearch({ from: "/search" });
  const [query, setQuery] = useState(search.q || "");
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, add, clear, isInitialized } = useSearchHistory();

  // Update URL when query changes
  const updateSearchQuery = useCallback(
    (newQuery: string) => {
      navigate({
        search: (prev) => ({ ...prev, q: newQuery || undefined }),
        replace: true,
      });
    },
    [navigate]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateSearchQuery(value);
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
    if (!query && history.length > 0) {
      setShowHistory(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
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
            "border border-[#1a1a1a]/10 dark:border-white/10",
            "bg-white dark:bg-[#1a1a1a]",
            "text-[#1a1a1a] dark:text-[#f8f8f2]",
            "placeholder:text-[#1a1a1a]/55 dark:placeholder:text-[#f8f8f2]/55",
            "rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/55",
            "transition-all",
            inputClassName
          )}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
          <kbd className="hidden rounded border border-[#1a1a1a]/10 px-2 py-1 text-xs dark:border-white/10 sm:inline-block">
            /
          </kbd>
        </div>
      </form>

      {/* Recent searches dropdown */}
      {showHistory && isInitialized && history.length > 0 && !query && (
        <div
          data-search-history
          className="absolute z-10 mt-2 w-full rounded-lg border border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-white/10 px-4 py-2">
            <span className="text-xs font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
              Recent searches
            </span>
            <button
              type="button"
              onClick={clear}
              className="text-xs text-[#1a1a1a]/55 hover:text-[#1a1a1a] dark:text-[#f8f8f2]/55 dark:hover:text-[#f8f8f2] transition-colors"
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
                  className="w-full px-4 py-2 text-left text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 hover:bg-[#f7f7f7] dark:hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 shrink-0"
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
