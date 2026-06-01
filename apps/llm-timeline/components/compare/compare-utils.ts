export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

export function parseModelNamesFromParam(params: string | undefined): string[] {
  if (!params) return [];
  return params.split(",").filter(Boolean).slice(0, MAX_COMPARE);
}
