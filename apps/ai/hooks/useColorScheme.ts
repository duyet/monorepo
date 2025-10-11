/**
 * Color scheme management hook with system preference detection
 *
 * This module provides a complete color scheme management solution including:
 * - Light/dark/system preference modes
 * - localStorage persistence with cross-tab synchronization
 * - System preference detection via media queries
 * - Automatic DOM updates (data-attribute, class, and style.colorScheme)
 * - SSR-safe implementation with proper hydration
 *
 * @module hooks/useColorScheme
 */

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * Supported color schemes
 */
export type ColorScheme = "light" | "dark";

/**
 * User preference options (includes system to follow OS preference)
 */
export type ColorSchemePreference = ColorScheme | "system";

/**
 * localStorage key for persisting user preference
 */
const STORAGE_KEY = "chatkit-color-scheme";

/**
 * Media query for detecting OS dark mode preference
 */
const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Type for media query event handlers
 */
type MediaQueryCallback = (event: MediaQueryListEvent) => void;

/**
 * Gets the media query list for dark mode detection
 *
 * @returns MediaQueryList or null if unavailable (SSR or unsupported browser)
 */
function getMediaQuery(): MediaQueryList | null {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  try {
    return window.matchMedia(PREFERS_DARK_QUERY);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useColorScheme] matchMedia failed", error);
    }
    return null;
  }
}

/**
 * Gets the current system color scheme preference (client-side)
 *
 * @returns Current system color scheme based on OS preferences
 */
function getSystemSnapshot(): ColorScheme {
  const media = getMediaQuery();
  return media?.matches ? "dark" : "light";
}

/**
 * Gets the default color scheme for server-side rendering
 *
 * Always returns 'light' to prevent hydration mismatches.
 * The actual system preference will be detected on the client.
 *
 * @returns Default color scheme for SSR
 */
function getServerSnapshot(): ColorScheme {
  return "light";
}

/**
 * Subscribes to system color scheme changes
 *
 * Uses React's useSyncExternalStore pattern to listen for OS theme changes.
 * Supports both modern (addEventListener) and legacy (addListener) APIs.
 *
 * @param listener - Callback to invoke when system preference changes
 * @returns Cleanup function to unsubscribe
 */
function subscribeSystem(listener: () => void): () => void {
  const media = getMediaQuery();
  if (!media) {
    return () => {};
  }

  const handler: MediaQueryCallback = () => listener();

  // Modern API (preferred)
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }

  // Legacy API fallback for older browsers
  if (typeof media.addListener === "function") {
    media.addListener(handler);
    return () => media.removeListener(handler);
  }

  return () => {};
}

/**
 * Reads the stored user preference from localStorage
 *
 * @returns Stored preference or null if not set or invalid
 */
function readStoredPreference(): ColorSchemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark") {
      return raw;
    }
    return raw === "system" ? "system" : null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useColorScheme] Failed to read preference", error);
    }
    return null;
  }
}

/**
 * Persists user preference to localStorage
 *
 * If preference is "system", removes the key to let the system default apply.
 * Otherwise, stores the explicit light/dark preference.
 *
 * @param preference - User's color scheme preference to persist
 */
function persistPreference(preference: ColorSchemePreference): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (preference === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, preference);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[useColorScheme] Failed to persist preference", error);
    }
  }
}

/**
 * Applies the color scheme to the document root element
 *
 * Updates three properties for comprehensive framework support:
 * - data-color-scheme attribute (for custom CSS selectors)
 * - 'dark' class (for Tailwind and similar utility frameworks)
 * - style.colorScheme property (for native browser dark mode support)
 *
 * @param scheme - Color scheme to apply to the document
 */
function applyDocumentScheme(scheme: ColorScheme): void {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.dataset.colorScheme = scheme;
  root.classList.toggle("dark", scheme === "dark");
  root.style.colorScheme = scheme;
}

/**
 * Return type for the useColorScheme hook
 *
 * @property scheme - Current active color scheme (resolved from preference and system)
 * @property preference - User's preference setting (light/dark/system)
 * @property setScheme - Updates to a specific color scheme (light or dark)
 * @property setPreference - Updates the preference (light/dark/system)
 * @property resetPreference - Resets to system default
 */
type UseColorSchemeResult = {
  scheme: ColorScheme;
  preference: ColorSchemePreference;
  setScheme: (scheme: ColorScheme) => void;
  setPreference: (preference: ColorSchemePreference) => void;
  resetPreference: () => void;
};

/**
 * Internal hook to track system color scheme changes
 *
 * Uses React's useSyncExternalStore for proper SSR/client hydration.
 *
 * @returns Current system color scheme
 */
function useSystemColorScheme(): ColorScheme {
  return useSyncExternalStore(
    subscribeSystem,
    getSystemSnapshot,
    getServerSnapshot,
  );
}

/**
 * Hook for managing color scheme with system preference detection
 *
 * Provides complete color scheme management including user preferences,
 * system detection, persistence, and cross-tab synchronization.
 *
 * Features:
 * - Resolves color scheme from user preference or system default
 * - Persists preference to localStorage
 * - Syncs changes across browser tabs
 * - Applies scheme to document root automatically
 * - SSR-safe with proper hydration handling
 *
 * @param initialPreference - Initial preference (default: "system")
 * @returns Color scheme state and setters
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { scheme, preference, setScheme, resetPreference } = useColorScheme()
 *
 *   return (
 *     <div>
 *       <p>Current scheme: {scheme}</p>
 *       <p>Preference: {preference}</p>
 *       <button onClick={() => setScheme('dark')}>Dark</button>
 *       <button onClick={() => setScheme('light')}>Light</button>
 *       <button onClick={resetPreference}>System</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useColorScheme(
  initialPreference: ColorSchemePreference = "system",
): UseColorSchemeResult {
  // Subscribe to system color scheme changes
  const systemScheme = useSystemColorScheme();

  // Initialize preference from localStorage or use initial value
  const [preference, setPreferenceState] = useState<ColorSchemePreference>(
    () => {
      if (typeof window === "undefined") {
        return initialPreference;
      }
      return readStoredPreference() ?? initialPreference;
    },
  );

  // Resolve actual scheme from preference and system
  const scheme = useMemo<ColorScheme>(
    () => (preference === "system" ? systemScheme : preference),
    [preference, systemScheme],
  );

  // Persist preference changes to localStorage
  useEffect(() => {
    persistPreference(preference);
  }, [preference]);

  // Apply scheme changes to document
  useEffect(() => {
    applyDocumentScheme(scheme);
  }, [scheme]);

  // Sync preference changes across tabs via storage events
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }
      setPreferenceState((current) => {
        const stored = readStoredPreference();
        return stored ?? current;
      });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Stable setter functions
  const setPreference = useCallback((next: ColorSchemePreference) => {
    setPreferenceState(next);
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    setPreferenceState(next);
  }, []);

  const resetPreference = useCallback(() => {
    setPreferenceState("system");
  }, []);

  return {
    scheme,
    preference,
    setScheme,
    setPreference,
    resetPreference,
  };
}
