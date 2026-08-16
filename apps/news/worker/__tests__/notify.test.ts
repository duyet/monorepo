import { describe, expect, it } from "vitest";
import {
  buildCandidatesQuery,
  NOTIFY_MAX_ATTEMPTS,
  NOTIFY_MIN_RANK,
} from "../notify/index.js";
import {
  buildCaption,
  buildReplyMarkup,
  escapeHtml,
  storyUrl,
  telegramNotifier,
} from "../notify/telegram.js";
import type { StoryPayload } from "../notify/types.js";
import type { Env } from "../types.js";

const story = (over: Partial<StoryPayload> = {}): StoryPayload => ({
  id: "abcdef1234567890",
  url: "https://example.com/story?a=1&b=2",
  title: "GPT-6 <beats> humans & robots",
  summary: "A summary.",
  image_url: null,
  category: "llm",
  points: 120,
  comments: 45,
  rank_score: 20,
  ...over,
});

describe("buildCandidatesQuery", () => {
  it("selects published, ranked, windowed items unposted or retryable for the channel", () => {
    const nowMs = 1_700_000_000_000;
    const { sql, binds } = buildCandidatesQuery("telegram", nowMs);
    expect(sql).toContain("status = 'published'");
    expect(sql).toContain("n.item_id IS NULL");
    expect(sql).toContain("n.status = 'failed' AND n.attempts < ?");
    expect(sql).toContain("tr.lang = 'vi'");
    expect(binds).toEqual([
      "telegram",
      1_700_000_000 - 24 * 3600,
      NOTIFY_MIN_RANK,
      NOTIFY_MAX_ATTEMPTS,
    ]);
  });
});

describe("telegram caption", () => {
  it("escapes HTML and includes title, summary and meta", () => {
    const caption = buildCaption(story());
    expect(caption).toContain("<b>GPT-6 &lt;beats&gt; humans &amp; robots</b>");
    expect(caption).toContain("A summary.");
    expect(caption).toContain("#llm");
    expect(caption).toContain("▲ 120");
    expect(caption).toContain("💬 45");
  });

  it("truncates long summaries under Telegram's caption limit", () => {
    const caption = buildCaption(story({ summary: "x".repeat(2000) }));
    expect(caption.length).toBeLessThan(1024);
    expect(caption).toContain("…");
  });

  it("omits summary and meta rows when data is missing", () => {
    const caption = buildCaption(
      story({ summary: null, category: null, points: 0, comments: 0 })
    );
    expect(caption).toBe("<b>GPT-6 &lt;beats&gt; humans &amp; robots</b>");
  });
});

describe("telegram buttons and permalink", () => {
  it("builds Read + Discuss inline buttons", () => {
    const markup = buildReplyMarkup(story()) as {
      inline_keyboard: { text: string; url: string }[][];
    };
    const [row] = markup.inline_keyboard;
    expect(row[0].url).toBe("https://example.com/story?a=1&b=2");
    expect(row[1].url).toBe("https://news.duyet.net/llm/abcdef12");
  });

  it("falls back to the ai category in the permalink", () => {
    expect(storyUrl({ id: "abcdef1234567890", category: null })).toBe(
      "https://news.duyet.net/ai/abcdef12"
    );
  });
});

describe("telegramNotifier gating", () => {
  it("is disabled unless both token and chat id are set", () => {
    const base = {} as Env;
    expect(telegramNotifier.enabled(base)).toBe(false);
    expect(
      telegramNotifier.enabled({ TELEGRAM_BOT_TOKEN: "t" } as Env)
    ).toBe(false);
    expect(
      telegramNotifier.enabled({
        TELEGRAM_BOT_TOKEN: "t",
        TELEGRAM_CHAT_ID: "-100",
      } as Env)
    ).toBe(true);
  });
});

describe("escapeHtml", () => {
  it("escapes ampersands first", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});
