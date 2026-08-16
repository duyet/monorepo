import type { FetchedItem } from "./sources/types.js";

const MAX_ENRICH_FETCHES = 20;
const ENRICH_BATCH_SIZE = 4;
const ENRICH_FETCH_TIMEOUT_MS = 8_000;
/** Read at most this many bytes of the article HTML — og/description meta
 * tags live in <head>, no need to download the whole page. */
const MAX_HTML_BYTES = 100_000;

export interface OgData {
  imageUrl?: string;
  description?: string;
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

/** Decodes numeric (decimal/hex) and the common named HTML entities found
 * in meta description content. Unknown named entities are left as-is. */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(
      /&([a-zA-Z]+);/g,
      (whole, name: string) => NAMED_ENTITIES[name] ?? whole
    );
}

function isAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Matches a <meta> tag's `content` regardless of whether `content` comes
 * before or after the property/name attribute, single- or double-quoted. */
function extractMetaContent(
  html: string,
  attr: "property" | "name",
  key: string
): string | null {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const contentThenAttr = new RegExp(
    `<meta[^>]*\\bcontent=["']([^"']*)["'][^>]*\\b${attr}=["']${escapedKey}["']`,
    "i"
  );
  const attrThenContent = new RegExp(
    `<meta[^>]*\\b${attr}=["']${escapedKey}["'][^>]*\\bcontent=["']([^"']*)["']`,
    "i"
  );
  return (
    html.match(attrThenContent)?.[1] ?? html.match(contentThenAttr)?.[1] ?? null
  );
}

/**
 * Pure HTML parsing: extracts og:image (absolute http(s) URLs only — a
 * relative or non-http(s) value is dropped rather than resolved, since we
 * don't reliably know the page's base URL) and a description from
 * og:description, falling back to <meta name="description">. HTML
 * entities in the description are decoded.
 */
export function parseOgTags(html: string): OgData {
  const rawImage = extractMetaContent(html, "property", "og:image");
  const imageUrl =
    rawImage && isAbsoluteHttpUrl(rawImage) ? rawImage : undefined;

  const rawDescription =
    extractMetaContent(html, "property", "og:description") ??
    extractMetaContent(html, "name", "description");
  const description = rawDescription
    ? decodeHtmlEntities(rawDescription).trim() || undefined
    : undefined;

  return { imageUrl, description };
}

async function readCappedText(
  res: Response,
  capBytes: number
): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, capBytes);

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < capBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  try {
    await reader.cancel();
  } catch {
    // best-effort; nothing to do if the stream is already closed
  }

  const buf = new Uint8Array(Math.min(total, capBytes));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= buf.length) break;
    const remaining = buf.length - offset;
    buf.set(chunk.subarray(0, remaining), offset);
    offset += Math.min(chunk.length, remaining);
  }
  return new TextDecoder().decode(buf);
}

/** Fetches `url` and extracts og:image/description. Only text/html
 * responses are read. Any failure (network, non-2xx, wrong content type)
 * resolves to `{}`, never throws. */
export async function fetchOgData(url: string): Promise<OgData> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(ENRICH_FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; duyet-news-bot/1.0)" },
    });
    if (!res.ok) return {};

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) return {};

    const html = await readCappedText(res, MAX_HTML_BYTES);
    return parseOgTags(html);
  } catch (error) {
    console.error(`enrich: og fetch failed for ${url}:`, error);
    return {};
  }
}

/**
 * Mutates `items` in place, filling in `summary`/`imageUrl` for whichever
 * of those fields are still missing, by fetching the article URL itself
 * and reading og/description meta tags. Only the first
 * MAX_ENRICH_FETCHES items lacking either field are fetched (in batches of
 * ENRICH_BATCH_SIZE), so a large new-item batch doesn't blow the run's
 * subrequest budget. Never fetches an item that already has both fields
 * (e.g. HuggingNews items whose summary came from the detail-page body).
 */
export async function enrichMissingContent(
  items: FetchedItem[]
): Promise<void> {
  const candidates = items.filter((item) => !item.summary || !item.imageUrl);
  const toEnrich = candidates.slice(0, MAX_ENRICH_FETCHES);

  for (let i = 0; i < toEnrich.length; i += ENRICH_BATCH_SIZE) {
    const batch = toEnrich.slice(i, i + ENRICH_BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        const og = await fetchOgData(item.url);
        if (!item.imageUrl && og.imageUrl) item.imageUrl = og.imageUrl;
        if (!item.summary && og.description) item.summary = og.description;
      })
    );
  }
}
