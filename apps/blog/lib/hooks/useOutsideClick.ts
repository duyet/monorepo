// Hook for detecting clicks outside an element
// Extracted from markdown-menu.tsx

import { useEffect, useRef } from "react";

/**
 * Hook that triggers a callback when user clicks outside the referenced element
 * @param callback - Function to call when clicking outside
 * @param enabled - Whether the listener is active (default: true)
 * @returns ref to attach to the element
 */
export function useOutsideClick<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  enabled = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}
