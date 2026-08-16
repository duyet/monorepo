export interface TitleSegment {
  text: string;
  highlighted: boolean;
}

const MAX_HIGHLIGHTS = 3;

/**
 * Splits a title into plain/highlighted segments wherever one of the
 * item's own topics/tags appears as a substring, case-insensitively.
 * Multi-word tags like "open-source" also match the hyphen-free spelling
 * ("open source") since headlines rarely keep the dash. Matching is
 * capped at MAX_HIGHLIGHTS distinct tags found (first occurrence order)
 * to avoid a "rainbow title" when a story carries many tags.
 *
 * Pure and React-safe: callers render each segment as plain text (no
 * dangerouslySetInnerHTML).
 */
export function highlightTitle(title: string, tags: string[]): TitleSegment[] {
  if (!title || tags.length === 0) return [{ text: title, highlighted: false }];

  // Build the set of literal needles to search for (original + space-joined
  // variant for hyphenated/underscored multi-word tags), longest first so a
  // longer tag ("open source") wins over a shorter one it contains ("open").
  const needles = new Set<string>();
  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    needles.add(trimmed);
    const spaced = trimmed.replace(/[-_]+/g, " ");
    if (spaced !== trimmed) needles.add(spaced);
  }
  const sorted = [...needles].sort((a, b) => b.length - a.length);

  const lowerTitle = title.toLowerCase();
  // Collect non-overlapping matches across the whole title.
  const ranges: { start: number; end: number }[] = [];
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
      const overlaps = ranges.some((r) => idx < r.end && end > r.start);
      if (!overlaps) {
        ranges.push({ start: idx, end });
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
    segments.push({ text: title.slice(r.start, r.end), highlighted: true });
    cursor = r.end;
  }
  if (cursor < title.length) {
    segments.push({ text: title.slice(cursor), highlighted: false });
  }
  return segments;
}
