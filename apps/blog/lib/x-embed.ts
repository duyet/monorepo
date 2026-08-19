/**
 * Parse X/Twitter status URLs and turn dedicated quote/URL blocks into
 * official live embeds (`blockquote.twitter-tweet` + permalink).
 *
 * Only dedicated blocks are converted: a blockquote whose last line/link is
 * a status URL, or a paragraph that is only a status URL/link. Casual
 * in-sentence mentions stay plain links.
 */

const STATUS_HOST = /^(?:www\.|mobile\.)?(?:twitter|x)\.com$/i;

/** Path: /user/status/ID, /i/web/status/ID, optional /photo/1 etc. */
const STATUS_PATH = /^\/(?:i\/web\/status|@?[\w]+\/status)\/(\d+)(?:\/|$)/i;

function bareStatusUrlRe(): RegExp {
  return /https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/(?:i\/web\/status|@?[\w]+\/status)\/(\d+)(?:\/[^\s<]*)?/gi;
}

export interface ParsedTweetUrl {
  id: string;
  url: string;
  handle?: string;
}

/** Extract a numeric status id from a URL or a raw id. */
export function parseTweetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^\d{5,20}$/.test(trimmed)) return trimmed;

  const withScheme = /:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!STATUS_HOST.test(url.hostname)) return null;
    const match = url.pathname.match(STATUS_PATH);
    return match?.[1] ?? null;
  } catch {
    const fallback = trimmed.match(/\/status\/(\d+)/i);
    return fallback?.[1] ?? null;
  }
}

/** Parse a status URL (or raw id) into id + canonical-enough permalink. */
export function parseTweetUrl(input: string): ParsedTweetUrl | null {
  const id = parseTweetId(input);
  if (!id) return null;

  const href = input.match(/https?:\/\/[^\s<]+/i)?.[0];
  const handle = input.match(
    /(?:twitter|x)\.com\/(?!i\/)@?([\w]+)\/status/i
  )?.[1];

  return {
    id,
    url: href ?? `https://x.com/i/web/status/${id}`,
    handle,
  };
}

function stripTagsKeepNewlines(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function lastNonEmptyLine(text: string): string {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? "";
}

function decodeHref(href: string): string {
  return href.replace(/&amp;/g, "&");
}

function lastStatusInBlock(inner: string): ParsedTweetUrl | null {
  const lastLine = lastNonEmptyLine(stripTagsKeepNewlines(inner));
  if (!lastLine) return null;

  const fromLine = parseTweetUrl(lastLine);
  if (fromLine && lastLine.replace(bareStatusUrlRe(), "").trim() === "") {
    return fromLine;
  }

  // Last visible text is not a URL, but the last <a> might still be the
  // permalink (e.g. "— @_duyet <a href=status>Aug 19</a>").
  const anchors = [...inner.matchAll(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>/gi)];
  if (anchors.length === 0) return null;
  const lastHref = decodeHref(anchors[anchors.length - 1][2]);
  const parsed = parseTweetUrl(lastHref);
  if (!parsed) return null;

  // Only treat as a dedicated quote if that last link is at the end of
  // the block (no leftover prose after the closing </a>).
  const lastAnchorIdx = inner.lastIndexOf(anchors[anchors.length - 1][0]);
  const after = inner.slice(lastAnchorIdx).replace(/<\/a>[\s\S]*$/i, "");
  const trailing = inner
    .slice(lastAnchorIdx + after.length)
    .replace(/<\/a>/i, "")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "")
    .trim();
  if (trailing) return null;
  return parsed;
}

function hasStatusAnchor(inner: string, id: string): boolean {
  const re = new RegExp(
    `<a\\b[^>]*href=(["'])[^"']*\\/status\\/${id}(?:[/?#][^"']*)?\\1`,
    "i"
  );
  return re.test(inner);
}

function linkifyLastStatusUrl(inner: string, parsed: ParsedTweetUrl): string {
  if (hasStatusAnchor(inner, parsed.id)) return inner;

  const re = new RegExp(
    `https?:\\/\\/(?:www\\.|mobile\\.)?(?:twitter|x)\\.com\\/[^\\s<]*\\/status\\/${parsed.id}[^\\s<]*`,
    "gi"
  );
  let last: RegExpExecArray | null = null;
  let match: RegExpExecArray | null = re.exec(inner);
  while (match) {
    last = match;
    match = re.exec(inner);
  }
  if (!last) {
    const href = parsed.url;
    return `${inner.replace(/\s+$/, "")}\n<a href="${href}">${href}</a>`;
  }
  const url = last[0];
  return `${inner.slice(0, last.index)}<a href="${url}">${url}</a>${inner.slice(last.index + url.length)}`;
}

function withClass(attrs: string, extra: string): string {
  const trimmed = attrs.trim();
  if (!trimmed) return ` class="${extra}"`;
  if (/\bclass\s*=/.test(trimmed)) {
    return ` ${trimmed.replace(
      /class\s*=\s*(["'])(.*?)\1/i,
      (_all, q, value) => {
        const classes = String(value).split(/\s+/).filter(Boolean);
        if (classes.includes(extra)) {
          return `class=${q}${value}${q}`;
        }
        return `class=${q}${[...classes, extra].join(" ")}${q}`;
      }
    )}`;
  }
  return ` ${trimmed} class="${extra}"`;
}

function toTweetBlockquote(
  inner: string,
  parsed: ParsedTweetUrl,
  attrs: string
): string {
  const body = linkifyLastStatusUrl(inner, parsed);
  return `<blockquote${withClass(attrs, "twitter-tweet")}>${body}</blockquote>`;
}

function isStatusOnlyParagraph(inner: string): ParsedTweetUrl | null {
  const trimmed = inner.trim();
  if (!trimmed) return null;

  const onlyAnchor = trimmed.match(
    /^<a\b[^>]*href=(["'])(.*?)\1[^>]*>[\s\S]*<\/a>$/i
  );
  if (onlyAnchor) {
    return parseTweetUrl(decodeHref(onlyAnchor[2]));
  }

  const text = stripTagsKeepNewlines(trimmed).trim();
  if (!text || /\n/.test(text)) return null;
  const parsed = parseTweetUrl(text);
  if (!parsed) return null;
  if (text.replace(bareStatusUrlRe(), "").trim() !== "") return null;
  return parsed;
}

function isInsideTwitterTweet(before: string): boolean {
  const lower = before.toLowerCase();
  const lastOpen = lower.lastIndexOf("<blockquote");
  if (lastOpen === -1) return false;
  const afterOpen = lower.slice(lastOpen);
  if (afterOpen.includes("</blockquote>")) return false;
  const openTagEnd = before.indexOf(">", lastOpen);
  const openTag = before.slice(
    lastOpen,
    openTagEnd === -1 ? undefined : openTagEnd
  );
  return /\btwitter-tweet\b/i.test(openTag);
}

function replaceStandaloneStatusParagraphs(html: string): string {
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let out = "";
  let lastIndex = 0;
  let match = re.exec(html);
  while (match) {
    const start = match.index;
    const end = start + match[0].length;
    if (!isInsideTwitterTweet(html.slice(0, start))) {
      const parsed = isStatusOnlyParagraph(match[1]);
      if (parsed) {
        out += html.slice(lastIndex, start);
        const inner = hasStatusAnchor(match[1], parsed.id)
          ? match[1]
          : linkifyLastStatusUrl(match[1], parsed);
        out += `<blockquote class="twitter-tweet"><p>${inner}</p></blockquote>`;
        lastIndex = end;
      }
    }
    match = re.exec(html);
  }
  return out + html.slice(lastIndex);
}

/**
 * Convert dedicated X/Twitter quote and URL blocks in post HTML into
 * official live-embed markup. Idempotent.
 */
export function embedXPosts(html: string): string {
  if (!html) return html;

  const withQuotes = html.replace(
    /<blockquote\b([^>]*)>([\s\S]*?)<\/blockquote>/gi,
    (full, attrs: string, inner: string) => {
      if (/\btwitter-tweet\b/i.test(attrs)) return full;
      const parsed = lastStatusInBlock(inner);
      if (!parsed) return full;
      return toTweetBlockquote(inner, parsed, attrs);
    }
  );

  return replaceStandaloneStatusParagraphs(withQuotes);
}

export const TWITTER_WIDGETS_SRC = "https://platform.twitter.com/widgets.js";
