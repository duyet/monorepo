/** First <title> in a document is what browsers and crawlers use. */
export const NOT_FOUND_ROUTE_ID = "/$";

export function firstHtmlTitle(html: string): string | null {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : null;
}

export function countHtmlTitles(html: string): number {
  return (html.match(/<title\b/gi) ?? []).length;
}

/** True when the splat 404 route matched and must own the document title. */
export function splatOwnsDocumentTitle(
  matches: Array<{ routeId?: string; id?: string }>
): boolean {
  return matches.some(
    (m) => m.routeId === NOT_FOUND_ROUTE_ID || m.id === NOT_FOUND_ROUTE_ID
  );
}

/**
 * Document-order first title from stacked route head() meta lists.
 * Catch-all owns the 404 title; root omits SITE_TITLE when the splat matched.
 */
export function firstTitleFromHeadMetas(
  heads: Array<Array<{ title?: string }>>
): string | undefined {
  for (const meta of heads) {
    for (const tag of meta) {
      if (typeof tag.title === "string" && tag.title) return tag.title;
    }
  }
  return undefined;
}
