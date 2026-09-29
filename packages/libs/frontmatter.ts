/**
 * YAML frontmatter fence splitter.
 *
 * ## Why this exists
 *
 * Three "days -> range"-style copies of the frontmatter fence regex had
 * drifted, and none of them was wrong on its own:
 *
 * | Site                          | BOM | empty `---` block | no body / no trailing NL |
 * | ----------------------------- | --- | ------------------ | ------------------------- |
 * | `apps/kb/lib/content.ts`      | no  | no                 | yes                       |
 * | `apps/blog/lib/shortform-parse.ts` | no | no              | no                        |
 * | `apps/kb/lib/markdown.ts` (`stripFrontmatter`) | yes | yes | yes           |
 *
 * The same `---` fence is therefore read three different ways, so a file that
 * one of them accepts can be invisible to another. The BOM row is the sharp
 * one: `stripFrontmatter` handles a BOM and the two *parsers* do not, so a
 * BOM-prefixed article would be stripped of its frontmatter for display while
 * the loader that read the metadata saw no frontmatter at all.
 *
 * ## What this does and does not do
 *
 * It splits the fence and returns the **raw YAML text** plus the body. It does
 * not parse the YAML. That is deliberate: `apps/kb` must use `js-yaml` and not
 * `gray-matter` (which pulls in Node's `Buffer` and crashes during client-side
 * navigation), while `apps/blog`'s shortform loader needs no YAML engine at
 * all. Parsing is therefore left to each caller, and only the part that
 * actually drifted is shared.
 *
 * The result is a **strict superset** of all three previous behaviours: for
 * every input the old regexes accepted, `body` is byte-identical. It also
 * accepts three inputs they rejected. See `frontmatter.test.ts`, which pins
 * that claim against the old expressions transcribed verbatim.
 */

/**
 * Matches the opening fence, the frontmatter block, and the closing fence.
 *
 * Deliberately **not** anchored at the end: a document can contain `---`
 * again in its body (a horizontal rule, or a nested example), and the old
 * three implementations all stopped at the *first* closing fence. The lazy
 * group plus the lack of a trailing anchor reproduce exactly that, so a
 * `---`-separated body survives intact.
 *
 * `\uFEFF?` handles a UTF-8 BOM, `[ \t]*` tolerates trailing whitespace on the
 * fence lines, and the frontmatter group is optional so `---\n---\n` is a valid
 * empty block rather than a non-match.
 */
const FENCE = /^\uFEFF?---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*/;

/** A document split at its frontmatter fence. */
export interface FrontmatterSplit {
  /**
   * The raw YAML between the fences, or `""` for an empty block.
   *
   * Unparsed, and untrimmed — `js-yaml` tolerates the surrounding newlines and
   * trimming here would change column positions in YAML error messages.
   */
  frontmatter: string;
  /** Everything after the closing fence, minus at most one line break. */
  body: string;
}

/**
 * Split a markdown document at its frontmatter fence.
 *
 * Returns `null` when there is no complete fence — no frontmatter at all, or
 * an opening `---` that is never closed. Callers should treat `null` as "this
 * document has no frontmatter" and keep the whole input as the body.
 */
export function splitFrontmatter(raw: string): FrontmatterSplit | null {
  const match = FENCE.exec(raw);
  if (match === null) return null;

  // The regex stops *at* the closing fence, so the line break that terminated
  // it is still in the remainder. Consume exactly one, and only if present:
  // `---\ntitle: A\n---foo` has no line break, and eating the `f` would corrupt
  // the body. The lone-`\r` case is old-Mac line endings, which the old
  // implementations dropped for the same reason.
  let body = raw.slice(match[0].length);
  if (body.startsWith("\r\n")) body = body.slice(2);
  else if (body.startsWith("\n")) body = body.slice(1);
  else if (body.startsWith("\r")) body = body.slice(1);

  return { frontmatter: match[1] ?? "", body };
}

/**
 * The document body with any frontmatter fence removed.
 *
 * The non-throwing counterpart of {@link splitFrontmatter}, for callers that
 * only need the body (`stripFrontmatter`'s old job). A document with no
 * complete fence is returned unchanged.
 */
export function stripFrontmatter(markdown: string): string {
  return splitFrontmatter(markdown)?.body ?? markdown;
}
