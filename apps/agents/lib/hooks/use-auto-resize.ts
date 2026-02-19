"use client";

import { useCallback, useRef } from "react";

export interface UseAutoResizeOptions {
  maxHeight?: number;
  minHeight?: number;
}

export function useAutoResize(options: UseAutoResizeOptions = {}) {
  const { maxHeight = 200, minHeight = 44 } = options;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight));
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [maxHeight, minHeight]);

  // Callback ref: attaches/detaches the input listener when the element mounts/unmounts
  const callbackRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      // Detach from previous node
      if (textareaRef.current) {
        textareaRef.current.removeEventListener("input", resize);
      }

      textareaRef.current = node;

      // Attach to new node
      if (node) {
        node.addEventListener("input", resize);
        resize(); // Initial sizing
      }
    },
    [resize]
  );

  return { ref: callbackRef, resize };
}
