import type { Env } from "../types.js";
import type { Notifier, SendResult, StoryPayload } from "./types.js";

/**
 * Telegram channel adapter: one message per story, HN-bot style —
 * thumbnail via sendPhoto (text fallback), bold title + summary caption,
 * inline "Read →" / "TL;DR / Discuss" buttons.
 */

const SITE_URL = "https://news.duyet.net";
/** Telegram caption hard limit is 1024 chars; keep headroom for the title. */
const SUMMARY_CAP = 500;

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** /ai/abc12345 permalink — mirrors src/lib/slug.ts storyPath. */
export function storyUrl(story: Pick<StoryPayload, "id" | "category">): string {
  const cat = (story.category ?? "ai").toLowerCase();
  return `${SITE_URL}/${cat}/${story.id.slice(0, 8)}`;
}

/** HTML caption: bold title, trimmed summary, meta line. */
export function buildCaption(story: StoryPayload): string {
  const parts = [`<b>${escapeHtml(story.title)}</b>`];
  if (story.summary) {
    const summary =
      story.summary.length > SUMMARY_CAP
        ? `${story.summary.slice(0, SUMMARY_CAP - 1).trimEnd()}…`
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

export function buildReplyMarkup(story: StoryPayload): object {
  return {
    inline_keyboard: [
      [
        { text: "Read →", url: story.url },
        { text: "TL;DR / Discuss", url: storyUrl(story) },
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
  });
  return (await res.json()) as TelegramResponse;
}

export const telegramNotifier: Notifier = {
  id: "telegram",
  target: (env) => env.TELEGRAM_CHAT_ID ?? "",
  enabled: (env) => Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),

  async send(env: Env, story: StoryPayload): Promise<SendResult> {
    // enabled() gates before send; non-null by contract here.
    const token = env.TELEGRAM_BOT_TOKEN as string;
    const chatId = env.TELEGRAM_CHAT_ID as string;
    const caption = buildCaption(story);
    const replyMarkup = buildReplyMarkup(story);

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
