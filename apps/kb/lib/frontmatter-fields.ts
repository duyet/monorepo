/**
 * Typed accessors for a parsed frontmatter object.
 *
 * Both frontmatter parsers type `data` as `{[key: string]: any}` — `gray-matter`
 * in the prebuild script, `js-yaml` in the runtime loader — so every field read
 * needs a runtime type guard. These keep that guard in one place instead of
 * inlined at each of the ~25 read sites across the two callers.
 *
 * Deliberately dependency-free (no `node:*`, no `import.meta.glob`, no YAML
 * engine of its own) so the Vite-bundled runtime loader (`lib/content.ts`) and
 * the plain-Node prebuild script (`scripts/generate-static-files.ts`) can share
 * it. The two used to keep private copies of these two functions, which is how
 * they silently drift.
 *
 * This module is the *guard* only. Where a caller needs a different answer for
 * the same field — the generator passes any `type` string through where the
 * runtime loader validates it against the known set — that decision belongs at
 * the call site, not here. See `scripts/generate-static-files.ts` for the one
 * field where the two callers must disagree.
 */

/** A parsed frontmatter block. Field values are untrusted: YAML is dynamic. */
export type Frontmatter = Record<string, any>;

/** Frontmatter string field, falling back when absent or the wrong type. */
export function fmString(data: Frontmatter, key: string, fallback: string): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

/**
 * Frontmatter list field, stringified, or `[]` when absent or not a list.
 *
 * `.map` also means the result never aliases the parsed data, so a caller that
 * mutates what it gets back cannot corrupt the frontmatter for everyone else.
 */
export function fmStringList(data: Frontmatter, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) ? value.map(String) : [];
}
