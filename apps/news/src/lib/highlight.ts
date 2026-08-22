export interface TitleSegment {
  text: string;
  highlighted: boolean;
  /**
   * The original (untrimmed-case, un-spaced) tag string that produced this
   * highlighted segment. Only present when `highlighted` is true.
   */
  tag?: string;
}

const MAX_HIGHLIGHTS = 3;

/** Unicode letters count as "inside a word"; digits and punctuation are
 * boundaries, so "GPT" still matches in "GPT-5" but not in "OpenAI". */
const isLetter = (ch: string): boolean => /\p{L}/u.test(ch);

/**
 * Entity / product names that almost always deserve a highlight even
 * when the scoring step left `items.tags` empty (today's ingest often
 * lands before score/tags catch up). Longest-first matching is handled
 * by `highlightTitle`.
 */
export const TITLE_KEYWORDS = [
  "Hugging Face",
  "OpenRouter",
  "Anthropic",
  "DeepMind",
  "DeepSeek",
  "Microsoft",
  "OpenAI",
  "Nvidia",
  "Alibaba",
  "Mistral",
  "SpaceX",
  "Stripe",
  "Amazon",
  "Apple",
  "Claude",
  "Gemini",
  "Google",
  "Codex",
  "Copilot",
  "Cursor",
  "Llama",
  "Qwen",
  "Grok",
  "Meta",
  "xAI",
  "GPT",
];

/** Merges the item's own tags with title-keyword fallbacks, de-duped
 * case-insensitively, tags first so scored topics win attribution. */
export function tagsForHighlight(itemTags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...itemTags, ...TITLE_KEYWORDS]) {
    const key = tag.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

/**
 * Splits a title into plain/highlighted segments wherever one of the
 * item's own topics/tags appears as a substring, case-insensitively.
 * Multi-word tags like "open-source" also match the hyphen-free spelling
 * ("open source") since headlines rarely keep the dash. Matching is
 * capped at MAX_HIGHLIGHTS distinct tags found (first occurrence order)
 * to avoid a "rainbow title" when a story carries many tags.
 *
 * Each highlighted segment carries the original input `tag` string that
 * matched it (never the spaced/hyphen variant), so callers can color it
 * per-topic.
 *
 * Pure and React-safe: callers render each segment as plain text (no
 * dangerouslySetInnerHTML).
 */
export function highlightTitle(title: string, tags: string[]): TitleSegment[] {
  if (!title || tags.length === 0) return [{ text: title, highlighted: false }];

  // Build the set of literal needles to search for (original + space-joined
  // variant for hyphenated/underscored multi-word tags), longest first so a
  // longer tag ("open source") wins over a shorter one it contains ("open").
  // Each needle remembers the original input tag string it was derived
  // from, so a matched range can be attributed back to its source tag.
  const needleTag = new Map<string, string>();
  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    if (!needleTag.has(trimmed)) needleTag.set(trimmed, trimmed);
    const spaced = trimmed.replace(/[-_]+/g, " ");
    if (spaced !== trimmed && !needleTag.has(spaced)) {
      needleTag.set(spaced, trimmed);
    }
  }
  const sorted = [...needleTag.keys()].sort((a, b) => b.length - a.length);

  const lowerTitle = title.toLowerCase();
  // Collect non-overlapping matches across the whole title.
  const ranges: { start: number; end: number; tag: string }[] = [];
  const matchedTags = new Set<string>();

  for (const needle of sorted) {
    if (matchedTags.size >= MAX_HIGHLIGHTS) break;
    const lowerNeedle = needle.toLowerCase();
    if (!lowerNeedle) continue;
    let searchFrom = 0;
    while (matchedTags.size < MAX_HIGHLIGHTS) {
      const idx = lowerTitle.indexOf(lowerNeedle, searchFrom);
      if (idx === -1) break;
      const end = idx + lowerNeedle.length;
      // Whole-word match only: a needle bordered by letters is a fragment
      // of a larger word ("SpaceX" inside "SpaceXAI") and must not color
      // half a brand name. Digits/punctuation borders are fine ("GPT-5").
      // Checked against lowerTitle so the offsets match the indexOf above.
      const borderedByLetter =
        (idx > 0 && isLetter(lowerTitle[idx - 1])) ||
        (end < lowerTitle.length && isLetter(lowerTitle[end]));
      const overlaps = ranges.some((r) => idx < r.end && end > r.start);
      if (!borderedByLetter && !overlaps) {
        const originalTag = needleTag.get(needle) ?? needle;
        ranges.push({ start: idx, end, tag: originalTag });
        matchedTags.add(lowerNeedle);
        break; // one highlighted occurrence per distinct tag is enough
      }
      searchFrom = idx + 1;
    }
  }

  if (ranges.length === 0) return [{ text: title, highlighted: false }];

  ranges.sort((a, b) => a.start - b.start);
  const segments: TitleSegment[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      segments.push({ text: title.slice(cursor, r.start), highlighted: false });
    }
    segments.push({
      text: title.slice(r.start, r.end),
      highlighted: true,
      tag: r.tag,
    });
    cursor = r.end;
  }
  if (cursor < title.length) {
    segments.push({ text: title.slice(cursor), highlighted: false });
  }
  return segments;
}
