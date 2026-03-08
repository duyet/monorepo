"use client";

import type { MutableRefObject, RefCallback } from "react";
import { useCallback } from "react";

type AnyRef<T> = RefCallback<T> | MutableRefObject<T | null> | null | undefined;

/**
 * Merges multiple refs (callback refs or RefObjects) into a single callback ref.
 */
export function useMergeRefs<T>(...refs: AnyRef<T>[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((instance: T | null) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") {
        ref(instance);
      } else {
        ref.current = instance;
      }
    }
  }, refs);
}
