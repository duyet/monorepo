/**
 * Port of apps/news/src/lib/highlight.ts — same needles, word-boundary
 * rule, and 3-highlight cap as the news homepage AI;DR.
 */

const MAX_HIGHLIGHTS = 3;

const isLetter = (ch) => /\p{L}/u.test(ch);

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

export function tagsForHighlight(itemTags) {
  const seen = new Set();
  const out = [];
  const tags = Array.isArray(itemTags) ? itemTags : [];
  for (const tag of [...tags, ...TITLE_KEYWORDS]) {
    const key = String(tag ?? "")
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

export function highlightTitle(title, tags) {
  if (!title || !tags || tags.length === 0) {
    return [{ text: title, highlighted: false }];
  }

  const needleTag = new Map();
  for (const tag of tags) {
    const trimmed = String(tag ?? "").trim();
    if (!trimmed) continue;
    if (!needleTag.has(trimmed)) needleTag.set(trimmed, trimmed);
    const spaced = trimmed.replace(/[-_]+/g, " ");
    if (spaced !== trimmed && !needleTag.has(spaced)) {
      needleTag.set(spaced, trimmed);
    }
  }
  const sorted = [...needleTag.keys()].sort((a, b) => b.length - a.length);

  const lowerTitle = title.toLowerCase();
  const ranges = [];
  const matchedTags = new Set();

  for (const needle of sorted) {
    if (matchedTags.size >= MAX_HIGHLIGHTS) break;
    const lowerNeedle = needle.toLowerCase();
    if (!lowerNeedle) continue;
    let searchFrom = 0;
    while (matchedTags.size < MAX_HIGHLIGHTS) {
      const idx = lowerTitle.indexOf(lowerNeedle, searchFrom);
      if (idx === -1) break;
      const end = idx + lowerNeedle.length;
      const borderedByLetter =
        (idx > 0 && isLetter(lowerTitle[idx - 1])) ||
        (end < lowerTitle.length && isLetter(lowerTitle[end]));
      const overlaps = ranges.some((r) => idx < r.end && end > r.start);
      if (!borderedByLetter && !overlaps) {
        const originalTag = needleTag.get(needle) ?? needle;
        ranges.push({ start: idx, end, tag: originalTag });
        matchedTags.add(lowerNeedle);
        break;
      }
      searchFrom = idx + 1;
    }
  }

  if (ranges.length === 0) return [{ text: title, highlighted: false }];

  ranges.sort((a, b) => a.start - b.start);
  const segments = [];
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
