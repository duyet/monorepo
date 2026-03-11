"use client";

import { useCallback, useEffect } from "react";

/**
 * Timeline keyboard navigation options
 */
export interface TimelineKeyboardNavigationOptions {
  isEnabled: boolean;
  totalItems: number;
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClear?: () => void;
}

/**
 * Hook for keyboard navigation in the timeline
 * - Arrow Up/Down: Navigate between models
 * - Home/End: Jump to first/last model
 * - Escape: Clear search/filters
 */
export function useTimelineKeyboardNavigation({
  isEnabled,
  totalItems,
  currentIndex,
  onNavigate,
  onClear,
}: TimelineKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (currentIndex < totalItems - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        case "Home":
          event.preventDefault();
          onNavigate(0);
          break;
        case "End":
          event.preventDefault();
          onNavigate(totalItems - 1);
          break;
        case "Escape":
          event.preventDefault();
          onClear?.();
          break;
      }
    },
    [isEnabled, currentIndex, totalItems, onNavigate, onClear]
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, handleKeyDown]);

  return { handleKeyDown };
}
