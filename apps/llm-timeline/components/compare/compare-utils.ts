import { parseParamValue } from "@duyet/libs";
import type { Model } from "@/lib/data";

export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

export function parseModelNamesFromParam(params: string | undefined): string[] {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}

/** Newest release first. Returns a new array; never mutates the input. */
export function sortModelsByDateDesc(models: Model[]): Model[] {
  return [...models].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Largest comparable parameter count across the set, floored at 1 so the
 * parameter bars never divide by zero when every model is unlabelled.
 */
export function getMaxParams(models: Model[]): number {
  return Math.max(
    ...models.map((m) => parseParamValue(m.params) || 0),
    1
  );
}
