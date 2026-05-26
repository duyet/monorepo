/**
 * Merges class names, filtering out falsy values.
 * Avoids external clsx/tailwind-merge deps for bundle simplicity.
 */
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(" ");
}
