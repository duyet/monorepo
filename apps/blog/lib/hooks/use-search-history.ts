import { useEffect, useState } from "react";

const STORAGE_KEY = "blog-search-history";
const MAX_HISTORY = 10;

/**
 * Custom hook for managing search history in localStorage.
 *
 * Features:
 * - Lazy initialization (SSR-safe)
 * - Deduplication (most recent occurrence kept)
 * - Max 10 items (configurable)
 * - Persisted across sessions
 *
 * @returns Object containing history, add function, and clear function
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Validate it's an array of strings
        if (
          Array.isArray(parsed) &&
          parsed.every((h) => typeof h === "string")
        ) {
          setHistory(parsed);
        }
      }
    } catch {
      // localStorage not available or corrupted data
      // silently fail with empty history
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const add = (query: string) => {
    if (!query.trim()) return;

    setHistory((prev) => {
      // Remove existing occurrences (dedup - keep newest at front)
      const filtered = prev.filter((h) => h !== query);
      // Add new query to front, limit to MAX_HISTORY
      const newHistory = [query, ...filtered].slice(0, MAX_HISTORY);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch {
        // localStorage not available or quota exceeded
        // silently fail - history will be ephemeral
      }

      return newHistory;
    });
  };

  const clear = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage not available - silently fail
    }
  };

  return { history, add, clear, isInitialized };
}
