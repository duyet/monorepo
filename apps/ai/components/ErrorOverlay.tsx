/**
 * Error overlay component with accessibility support
 *
 * Displays error messages and loading states over the ChatKit interface.
 * Includes proper ARIA attributes, keyboard navigation, and screen reader support.
 *
 * @module components/ErrorOverlay
 */

"use client";

import type { ReactNode } from "react";

/**
 * Props for the ErrorOverlay component
 *
 * @property error - Error message to display (takes priority over fallbackMessage)
 * @property fallbackMessage - Non-error message to display (e.g., loading state)
 * @property onRetry - Optional callback to retry the failed operation
 * @property retryLabel - Custom label for the retry button (default: "Restart chat")
 * @property ariaLive - ARIA live region politeness (default: "polite" for fallback, "assertive" for errors)
 */
type ErrorOverlayProps = {
  error: string | null;
  fallbackMessage?: ReactNode;
  onRetry?: (() => void) | null;
  retryLabel?: string;
  ariaLive?: "polite" | "assertive" | "off";
};

/**
 * ErrorOverlay component
 *
 * A full-screen overlay that displays error messages or loading states.
 * Ensures proper accessibility with ARIA attributes and keyboard navigation.
 *
 * Features:
 * - ARIA live regions for screen reader announcements
 * - Proper role attributes (alert for errors, status for loading)
 * - Keyboard accessible retry button
 * - Visual feedback with backdrop blur and transitions
 *
 * @param props - Component props
 * @returns Error overlay UI or null if no content to display
 *
 * @example
 * ```tsx
 * // Display error with retry
 * <ErrorOverlay
 *   error="Failed to connect"
 *   onRetry={handleRetry}
 *   retryLabel="Try again"
 * />
 *
 * // Display loading state
 * <ErrorOverlay
 *   fallbackMessage="Loading session..."
 * />
 * ```
 */
export function ErrorOverlay({
  error,
  fallbackMessage,
  onRetry,
  retryLabel = "Restart chat",
  ariaLive,
}: ErrorOverlayProps) {
  // Don't render if there's nothing to show
  if (!error && !fallbackMessage) {
    return null;
  }

  const content = error ?? fallbackMessage;

  if (!content) {
    return null;
  }

  // Determine accessibility attributes
  const isError = Boolean(error);
  const role = isError ? "alert" : "status";
  const live = ariaLive ?? (isError ? "assertive" : "polite");

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-center rounded-[inherit] bg-white/85 p-6 text-center backdrop-blur dark:bg-slate-900/90"
      // Accessibility: Announce to screen readers
      role={role}
      aria-live={live}
      aria-atomic="true"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-xl bg-white px-6 py-4 text-lg font-medium text-slate-700 dark:bg-transparent dark:text-slate-100">
        {/* Error/Loading message */}
        <div
          // Provide descriptive label for screen readers
          aria-label={isError ? "Error message" : "Loading status"}
        >
          {content}
        </div>

        {/* Retry button (only shown for errors with retry handler) */}
        {error && onRetry ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-none transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={onRetry}
            // Accessibility: Describe button action
            aria-label={`${retryLabel}: Click to attempt recovery from error`}
          >
            {retryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
