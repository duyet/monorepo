/**
 * Custom hook for auto-resizing textarea
 * Automatically adjusts textarea height based on content
 */

"use client";

import { useEffect, useRef } from "react";

export interface UseAutoResizeOptions {
  /**
   * Maximum height in pixels
   * @default 200
   */
  maxHeight?: number;
  /**
   * Minimum height in pixels
   * @default 44
   */
  minHeight?: number;
  /**
   * Whether to enable auto-resize
   * @default true
   */
  enabled?: boolean;
}

/**
 * Returns a callback ref to attach to textarea element
 */
export function useAutoResize(options: UseAutoResizeOptions = {}) {
  const { maxHeight = 200, minHeight = 44, enabled = true } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !enabled) return;

    // Reset height to auto to get accurate scrollHeight
    textarea.style.height = "auto";

    // Calculate new height
    const newHeight = Math.max(
      minHeight,
      Math.min(maxHeight, textarea.scrollHeight)
    );

    textarea.style.height = `${newHeight}px`;

    // Show scrollbar if content exceeds maxHeight
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";

  }, [maxHeight, minHeight, enabled]);

  return {
    textareaRef,
  };
}
