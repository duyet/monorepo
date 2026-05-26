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
          className={cn("em-search-input", inputClassName)}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          <kbd className="hidden font-mono text-[10px] uppercase tracking-wider sm:inline-block">
            press /
          </kbd>
        </div>
      </form>

      {/* Recent searches dropdown */}
      {showHistory && isInitialized && history.length > 0 && !query && (
        <div
          data-search-history
          className="absolute z-10 mt-2 w-full rounded-md border border-border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Recent searches
            </span>
            <button
              type="button"
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground shrink-0"
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
