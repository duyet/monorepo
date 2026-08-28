export const AIDR_LAYOUTS = ["a", "b", "c"] as const;
export type AidrLayout = (typeof AIDR_LAYOUTS)[number];

/** Homepage default: numbered copy on the left, thumb on the right. */
export const DEFAULT_AIDR_LAYOUT: AidrLayout = "a";

/** QA-only `?aidr=a|b|c`. Anything else (including missing) is Version A. */
export function parseAidrLayout(raw: unknown): AidrLayout {
  if (raw === "b" || raw === "c" || raw === "a") return raw;
  return DEFAULT_AIDR_LAYOUT;
}
