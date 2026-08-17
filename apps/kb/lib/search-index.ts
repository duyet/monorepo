import type { Article, InboxNote, MemoryNote } from "./content";
import type { SearchDoc } from "./search";

function compact(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function articleToSearchDoc(article: Article): SearchDoc {
  return {
    slug: article.slug,
    title: article.title,
    href: `/k/${article.slug}`,
    kind: "article",
    subtitle: article.summary || article.category,
    tags: article.tags,
    haystack: compact(
      [article.title, article.summary, article.category, ...article.tags, article.raw].join(" ")
    ),
  };
}

export function memoryToSearchDoc(note: MemoryNote): SearchDoc {
  return {
    slug: note.slug,
    title: note.title || note.name,
    href: `/m/${note.slug}`,
    kind: "memory",
    subtitle: note.description || note.memoryType,
    tags: note.tags,
    haystack: compact(
      [
        note.title,
        note.name,
        note.description,
        note.memoryType,
        note.category,
        ...note.tags,
        ...note.aliases,
        note.raw,
      ].join(" ")
    ),
  };
}

export function inboxToSearchDoc(note: InboxNote): SearchDoc {
  return {
    slug: note.slug,
    title: note.title,
    href: `/d/${note.slug}`,
    kind: "daily",
    subtitle: note.date,
    tags: [],
    haystack: compact([note.title, note.date, note.raw].join(" ")),
  };
}

export function buildSearchIndex(
  articles: Article[],
  memory: MemoryNote[],
  inbox: InboxNote[]
): SearchDoc[] {
  return [
    ...memory.map(memoryToSearchDoc),
    ...articles.map(articleToSearchDoc),
    ...inbox.map(inboxToSearchDoc),
  ];
}
