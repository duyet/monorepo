export type SearchKind = "memory" | "article" | "daily";

export interface SearchDoc {
  slug: string;
  title: string;
  href: string;
  kind: SearchKind;
  subtitle: string;
  tags: string[];
  haystack: string;
}

export interface SearchHit extends SearchDoc {
  score: number;
  snippet: string;
}

const WEIGHT = {
  titleExact: 100,
  titlePrefix: 60,
  title: 40,
  subtitle: 20,
  tag: 16,
  slug: 12,
  body: 4,
} as const;

export function parseSearchTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

export function snippetAround(text: string, term: string, radius = 72): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx < 0) {
    const compact = text.replace(/\s+/g, " ").trim();
    return compact.length > radius * 2
      ? `${compact.slice(0, radius * 2)}…`
      : compact;
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + term.length + radius);
  const slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

function scoreDoc(doc: SearchDoc, terms: string[]): number | null {
  const title = doc.title.toLowerCase();
  const subtitle = doc.subtitle.toLowerCase();
  const slug = doc.slug.toLowerCase();
  const tags = doc.tags.map((t) => t.toLowerCase());
  const hay = doc.haystack.toLowerCase();

  let score = 0;
  for (const term of terms) {
    const blob = `${title} ${subtitle} ${slug} ${tags.join(" ")} ${hay}`;
    if (!blob.includes(term)) {
      return null;
    }
    if (title === term) score += WEIGHT.titleExact;
    else if (title.startsWith(term)) score += WEIGHT.titlePrefix;
    else if (title.includes(term)) score += WEIGHT.title;
    if (subtitle.includes(term)) score += WEIGHT.subtitle;
    if (tags.some((t) => t.includes(term))) score += WEIGHT.tag;
    if (slug.includes(term)) score += WEIGHT.slug;
    if (hay.includes(term)) score += WEIGHT.body;
  }
  return score;
}

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  kind?: SearchKind | "all"
): SearchHit[] {
  const terms = parseSearchTerms(query);
  if (terms.length === 0) return [];

  const filtered =
    !kind || kind === "all" ? docs : docs.filter((d) => d.kind === kind);

  const hits: SearchHit[] = [];
  for (const doc of filtered) {
    const score = scoreDoc(doc, terms);
    if (score == null) continue;
    hits.push({
      ...doc,
      score,
      snippet: snippetAround(doc.haystack || doc.subtitle || doc.title, terms[0]),
    });
  }
  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return hits;
}
