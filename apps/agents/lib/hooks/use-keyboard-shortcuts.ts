"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcutHandlers {
  onFocusInput?: () => void;
  onStop?: () => void;
  onClearInput?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;
  const { onFocusInput, onStop, onClearInput } = handlers;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Cmd/Ctrl + Shift + K: Clear input (check before Cmd+K since it's more specific)
      if (isCmdOrCtrl && e.shiftKey && key === "k") {
        e.preventDefault();
        onClearInput?.();
        return;
      }

      // Cmd/Ctrl + K: Focus input
      if (isCmdOrCtrl && !e.shiftKey && key === "k") {
        e.preventDefault();
        onFocusInput?.();
        return;
      }

      // Escape: Stop generation (only when handler is provided)
      if (e.key === "Escape" && onStop) {
        e.preventDefault();
        onStop();
      }
    },
    [enabled, onFocusInput, onStop, onClearInput]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
