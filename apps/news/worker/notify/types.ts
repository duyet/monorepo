import type { Env } from "../types.js";

/** A trending story posted individually. Title/summary are already
 *  language-resolved by the candidate query (VI preferred, EN fallback). */
export interface StoryPayload {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  category: string | null;
  points: number;
  comments: number;
  rank_score: number;
  llm_importance: number | null;
}

/** One TL;DR bullet in the daily digest; `url` is the story permalink on
 *  news.duyet.net (null when the bullet has no resolvable item). */
export interface DigestBullet {
  text: string;
  url: string | null;
}

export interface DailyDigest {
  /** Local calendar date (YYYY-MM-DD) the digest covers. */
  date: string;
  bullets: DigestBullet[];
}

export interface SendResult {
  ok: boolean;
  /** Channel-native message id (Telegram message_id, Discord snowflake, ...). */
  messageId?: string;
  error?: string;
}

/** One delivery channel (telegram, discord, ...). Each enabled channel
 *  gets ONE TL;DR digest message per local day, plus individual posts only
 *  for algo-detected trending stories (rate-limited by the dispatcher). */
export interface Notifier {
  /** Stable id — the `notifications.channel` value. */
  id: string;
  /** Where posts go (chat id, webhook host, ...) — stored for observability. */
  target(env: Env): string;
  /** False when the channel is fully unset (local/dev). Throws when
   *  half-configured (e.g. chat id without token) so a deploy bug
   *  cannot silently skip sends. */
  enabled(env: Env): boolean;
  /** Sends the once-a-day TL;DR summary (bullet list + links). */
  sendDigest(env: Env, digest: DailyDigest): Promise<SendResult>;
  /** Sends one breaking/trending story as its own post. */
  sendStory(env: Env, story: StoryPayload): Promise<SendResult>;
}
