/**
 * Custom hook for auto-scrolling to bottom of chat container
 * Provides smooth scrolling with proper ref management
 */

"use client";

import { useRef, useCallback, useEffect } from "react";

export interface UseAutoScrollOptions {
  /**
   * Whether to enable auto-scroll
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether to use smooth scrolling
   * @default true
   */
  smooth?: boolean;
  /**
   * Dependency array that triggers scroll when changed
   */
  dependencies?: unknown[];
}

/**
 * Returns a ref to attach to the scrollable container and a manual scroll function
 */
export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { enabled = true, smooth = true, dependencies = [] } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((isSmooth = smooth) => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: isSmooth ? "smooth" : "auto",
    });
  }, [enabled, smooth]);

  // Auto-scroll when dependencies change
  useEffect(() => {
    scrollToBottom();
  }, [...dependencies, scrollToBottom]);

  return {
    containerRef,
    scrollToBottom,
  };
}
