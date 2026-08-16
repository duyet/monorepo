import type { Env } from "../types.js";

/** A story ready to be delivered to a channel. Title/summary are already
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
}

export interface SendResult {
  ok: boolean;
  /** Channel-native message id (Telegram message_id, Discord snowflake, ...). */
  messageId?: string;
  error?: string;
}

/** One delivery channel (telegram, discord, email-per-story, ...). */
export interface Notifier {
  /** Stable id — the `notifications.channel` value. */
  id: string;
  /** Where posts go (chat id, webhook host, ...) — stored for observability. */
  target(env: Env): string;
  /** False when required config (secrets/vars) is missing; channel is skipped. */
  enabled(env: Env): boolean;
  send(env: Env, story: StoryPayload): Promise<SendResult>;
}
