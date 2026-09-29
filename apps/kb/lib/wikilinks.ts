/**
 * Wikilink helpers, shared by every KB markdown consumer.
 *
 * Deliberately dependency-free (no `node:*`, no `import.meta.glob`) so both
 * the Vite-bundled runtime loader (`lib/content.ts`) and the plain-Node prebuild
 * script (`scripts/generate-static-files.ts`) can import it. The two used to
 * keep private copies of these regexes, which is how they silently drift.
 */

/** Extracts `[[wikilink]]` targets from a markdown body. Brackets stripped, deduped. */
export function extractWikilinks(md: string): string[] {
  const found = new Set<string>();
  const re = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex-exec loop
  while ((match = re.exec(md))) {
    const target = match[1].trim();
    if (target) found.add(target);
  }
  return [...found];
}

/** Strips a leading `[[` / trailing `]]` pair from a `related:` frontmatter entry. */
export function stripWikilinkBrackets(ref: string): string {
  return ref.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

/**
 * Normalizes a `related:` frontmatter list into bare slugs.
 *
 * Kept deliberately as strict as the two hand-rolled copies it replaces: a
 * non-string entry still throws in `.replace`, exactly as before.
 */
export function normalizeRelatedRefs(refs: unknown): string[] {
  return Array.isArray(refs)
    ? refs.map((r) => stripWikilinkBrackets(r as string))
    : [];
}
