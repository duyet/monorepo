import type { Env } from "../types.js";
import type {
  DailyDigest,
  Notifier,
  SendResult,
  StoryPayload,
} from "./types.js";

/**
 * Telegram channel adapter.
 *
 * - Daily digest: one message — TL;DR bullet list, each bullet linked to
 *   its story permalink, with a button to the site.
 * - Trending story: single post with thumbnail (sendPhoto, text fallback),
 *   bold title + summary caption, Read/Discuss inline buttons.
 *
 * All links carry utm_source=telegram so clicks are measurable in
 * analytics (Telegram's Bot API exposes no read receipts).
 */

const SITE_URL = "https://news.duyet.net";
/** Telegram message hard limit is 4096 chars; keep headroom. */
const MESSAGE_CAP = 4000;
/** Telegram caption hard limit is 1024 chars; keep headroom for title. */
const CAPTION_SUMMARY_CAP = 500;

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function withUtm(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "telegram");
    return u.toString();
  } catch {
    return url;
  }
}

/** /ai/abc12345 permalink — mirrors src/lib/slug.ts storyPath. */
export function storyUrl(story: Pick<StoryPayload, "id" | "category">): string {
  const cat = (story.category ?? "ai").toLowerCase();
  return `${SITE_URL}/${cat}/${story.id.slice(0, 8)}`;
}

/** TL;DR digest: header + linked bullet list, capped under the message
 *  limit — bullets that would overflow are dropped from the tail. */
export function buildDigestMessage(digest: DailyDigest): string {
  const header = `<b>🗞 AI hôm nay có gì — ${digest.date}</b>`;
  const lines: string[] = [header];
  let length = header.length;
  for (const bullet of digest.bullets) {
    const text = escapeHtml(bullet.text);
    const line = bullet.url
      ? `•  ${text} <a href="${escapeHtml(withUtm(bullet.url))}">→</a>`
      : `•  ${text}`;
    if (length + line.length + 2 > MESSAGE_CAP) break;
    lines.push(line);
    length += line.length + 2;
  }
  return lines.join("\n\n");
}

export function buildDigestReplyMarkup(): object {
  return {
    inline_keyboard: [
      [{ text: "Xem đầy đủ trên news.duyet.net →", url: withUtm(SITE_URL) }],
    ],
  };
}

/** Trending story caption: bold title, trimmed summary, meta line. */
export function buildStoryCaption(story: StoryPayload): string {
  const parts = [`<b>🔥 ${escapeHtml(story.title)}</b>`];
  if (story.summary) {
    const summary =
      story.summary.length > CAPTION_SUMMARY_CAP
        ? `${story.summary.slice(0, CAPTION_SUMMARY_CAP - 1).trimEnd()}…`
        : story.summary;
    parts.push(escapeHtml(summary));
  }
  const meta: string[] = [];
  if (story.category)
    meta.push(`#${story.category.replace(/[^a-z0-9_]/gi, "_")}`);
  if (story.points > 0) meta.push(`▲ ${story.points}`);
  if (story.comments > 0) meta.push(`💬 ${story.comments}`);
  if (meta.length > 0) parts.push(meta.join("  ·  "));
  return parts.join("\n\n");
}

export function buildStoryReplyMarkup(story: StoryPayload): object {
  return {
    inline_keyboard: [
      [
        { text: "Đọc bài →", url: withUtm(story.url) },
        { text: "TL;DR", url: withUtm(storyUrl(story)) },
      ],
    ],
  };
}

interface TelegramResponse {
  ok: boolean;
  result?: { message_id?: number };
  description?: string;
}

async function callTelegram(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<TelegramResponse> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  // Telegram can return non-JSON (proxy/HTML error pages); surface the
  // HTTP status instead of letting a parse error escape.
  const raw = await res.text();
  try {
    return JSON.parse(raw) as TelegramResponse;
  } catch {
    return {
      ok: false,
      description: `HTTP ${res.status}: ${raw.slice(0, 200)}`,
    };
  }
}

export const telegramNotifier: Notifier = {
  id: "telegram",
  target: (env) => env.TELEGRAM_CHAT_ID ?? "",
  enabled: (env) => {
    const token = env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
    const chatId = env.TELEGRAM_CHAT_ID?.trim() ?? "";
    // Chat id without a token is a deploy misconfig — fail loud.
    if (chatId && !token) {
      throw new Error(
        "TELEGRAM_CHAT_ID is set but TELEGRAM_BOT_TOKEN is missing"
      );
    }
    return Boolean(token && chatId);
  },

  async sendDigest(env: Env, digest: DailyDigest): Promise<SendResult> {
    // enabled() gates before send; non-null by contract here.
    const token = env.TELEGRAM_BOT_TOKEN as string;
    const chatId = env.TELEGRAM_CHAT_ID as string;
    const msg = await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: buildDigestMessage(digest),
      parse_mode: "HTML",
      reply_markup: buildDigestReplyMarkup(),
      link_preview_options: { is_disabled: true },
    });
    if (!msg.ok) return { ok: false, error: msg.description ?? "unknown" };
    return { ok: true, messageId: String(msg.result?.message_id ?? "") };
  },

  async sendStory(env: Env, story: StoryPayload): Promise<SendResult> {
    const token = env.TELEGRAM_BOT_TOKEN as string;
    const chatId = env.TELEGRAM_CHAT_ID as string;
    const caption = buildStoryCaption(story);
    const replyMarkup = buildStoryReplyMarkup(story);

    if (story.image_url) {
      const photo = await callTelegram(token, "sendPhoto", {
        chat_id: chatId,
        photo: story.image_url,
        caption,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
      if (photo.ok)
        return { ok: true, messageId: String(photo.result?.message_id ?? "") };
      // Bad/hotlink-blocked image URLs are common — fall through to text.
      console.error(
        `telegram sendPhoto failed for ${story.id}: ${photo.description}; falling back to text`
      );
    }

    const msg = await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
      link_preview_options: { is_disabled: true },
    });
    if (!msg.ok) return { ok: false, error: msg.description ?? "unknown" };
    return { ok: true, messageId: String(msg.result?.message_id ?? "") };
  },
};
