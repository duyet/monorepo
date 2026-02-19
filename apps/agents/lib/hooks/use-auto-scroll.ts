"use client";

import { useRef, useCallback, useEffect } from "react";

export interface UseAutoScrollOptions {
  enabled?: boolean;
  smooth?: boolean;
  /** A single value that triggers scroll when it changes (e.g. messages.length) */
  trigger?: unknown;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { enabled = true, smooth = true, trigger } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(
    (useSmooth = smooth) => {
      if (!enabled) return;
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: useSmooth ? "smooth" : "auto",
      });
    },
    [enabled, smooth]
  );

  // Auto-scroll when trigger changes
  useEffect(() => {
    scrollToBottom();
  }, [trigger, scrollToBottom]);

  return { containerRef, scrollToBottom };
}
