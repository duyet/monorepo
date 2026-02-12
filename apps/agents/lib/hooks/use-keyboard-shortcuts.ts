/**
 * Custom hook for keyboard shortcuts in chat interface
 * Provides common keyboard shortcuts for better UX
 */

"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcutHandlers {
  /**
   * Handler for focusing the input (default: Cmd/Ctrl + K)
   */
  onFocusInput?: () => void;
  /**
   * Handler for stopping generation (default: Escape)
   */
  onStop?: () => void;
  /**
   * Handler for clearing input (default: Cmd/Ctrl + Shift + K)
   */
  onClearInput?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  /**
   * Whether shortcuts are enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Attaches keyboard shortcuts to the document
 */
export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;
  const { onFocusInput, onStop, onClearInput } = handlers;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Cmd/Ctrl + K: Focus input
    if (isCmdOrCtrl && !isShift && e.key === "k") {
      e.preventDefault();
      onFocusInput?.();
    }

    // Escape: Stop generation
    if (e.key === "Escape") {
      e.preventDefault();
      onStop?.();
    }

    // Cmd/Ctrl + Shift + K: Clear input
    if (isCmdOrCtrl && isShift && e.key === "k") {
      e.preventDefault();
      onClearInput?.();
    }
  }, [enabled, onFocusInput, onStop, onClearInput]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
