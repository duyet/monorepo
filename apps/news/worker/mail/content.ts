import type { Env } from "../types.js";

export interface MailContentItem {
  kind: "news" | "blog";
  title: string;
  url: string;
  excerpt: string;
}

interface NewsRow {
  title: string;
  url: string;
  summary: string | null;
}

function stripCdata(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseRssItems(xml: string, limit = 12): MailContentItem[] {
  const items: MailContentItem[] = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks) {
    const title = stripCdata(
      /<title>([\s\S]*?)<\/title>/i.exec(block)?.[1] ?? ""
    );
    const link = stripCdata(/<link>([\s\S]*?)<\/link>/i.exec(block)?.[1] ?? "");
    const desc = stripCdata(
      /<description>([\s\S]*?)<\/description>/i.exec(block)?.[1] ?? ""
    );
    if (!title || !link) continue;
    items.push({
      kind: "blog",
      title,
      url: link,
      excerpt: desc.slice(0, 280),
    });
    if (items.length >= limit) break;
  }
  return items;
}

export async function listMailContent(env: Env): Promise<{
  items: MailContentItem[];
}> {
  const items: MailContentItem[] = [];
  const { results } = await env.DB.prepare(
    `SELECT title, url, summary FROM items
     WHERE status = 'published'
     ORDER BY published_at DESC
     LIMIT 20`
  ).all<NewsRow>();
  for (const row of results ?? []) {
    items.push({
      kind: "news",
      title: row.title,
      url: row.url,
      excerpt: (row.summary ?? "").slice(0, 280),
    });
  }

  try {
    const res = await fetch("https://blog.duyet.net/rss.xml", {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) {
      items.push(...parseRssItems(await res.text()));
    }
  } catch (error) {
    console.error("blog rss fetch failed:", error);
  }

  return { items };
}
