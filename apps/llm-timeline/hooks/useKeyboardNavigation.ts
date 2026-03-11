"use client";

import { useCallback, useEffect } from "react";

/**
 * Keyboard navigation options for timeline
 */
export interface TimelineKeyboardNavOptions {
  isEnabled: boolean;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onSlash?: () => void; // Focus search
}

/**
 * Custom hook for keyboard navigation in the timeline
 *
 * Supported shortcuts:
 * - Escape: Clear filters / close overlay
 * - Arrow Up/Down: Navigate between models
 * - Home/End: Jump to first/last model
 * - Slash (/): Focus search input
 */
export function useTimelineKeyboardNav(
  options: TimelineKeyboardNavOptions
) {
  const { isEnabled, onEscape, onArrowUp, onArrowDown, onHome, onEnd, onSlash } =
    options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Ignore if typing in an input or textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to work even from inputs
        if (event.key === "Escape") {
          onEscape?.();
        }
        return;
      }

      let handled = false;

      switch (event.key) {
        case "Escape":
          onEscape?.();
          handled = true;
          break;
        case "ArrowUp":
          onArrowUp?.();
          handled = true;
          break;
        case "ArrowDown":
          onArrowDown?.();
          handled = true;
          break;
        case "Home":
          onHome?.();
          handled = true;
          break;
        case "End":
          onEnd?.();
          handled = true;
          break;
        case "/":
          onSlash?.();
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    },
    [isEnabled, onEscape, onArrowUp, onArrowDown, onHome, onEnd, onSlash]
  );

  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled, handleKeyDown]);
}
