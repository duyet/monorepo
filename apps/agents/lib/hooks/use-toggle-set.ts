import { useCallback, useState } from "react";

/**
 * Custom hook for managing a Set with toggle functionality.
 * Provides a convenient way to add/remove items from a Set with a single callback.
 *
 * @template T - The type of items in the Set
 * @param initialState - The initial state of the Set (defaults to empty Set)
 * @returns A tuple containing the current Set and a toggle function
 *
 * @example
 * ```tsx
 * const [selectedItems, toggleItem] = useToggleSet<string>();
 *
 * // Toggle an item (adds if not present, removes if present)
 * toggleItem("item-id");
 *
 * // Check if item is selected
 * selectedItems.has("item-id");
 * ```
 */
export function useToggleSet<T>(initialState = new Set<T>()) {
  const [set, setState] = useState(initialState);

  const toggle = useCallback((item: T) => {
    setState((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  }, []);

  return [set, toggle] as const;
}
