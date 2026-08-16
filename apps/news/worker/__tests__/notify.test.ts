import { describe, expect, it } from "vitest";
import {
  buildTrendingQuery,
  DIGEST_LOCAL_HOUR,
  digestKey,
  localDayStartMs,
  NOTIFY_MAX_ATTEMPTS,
  shouldSendDigest,
  TRENDING_MAX_PER_DAY,
  TRENDING_MIN_GAP_SEC,
  TRENDING_MIN_IMPORTANCE,
  TRENDING_MIN_RANK,
  trendingBudget,
} from "../notify/index.js";
import {
  buildDigestMessage,
  buildStoryCaption,
  buildStoryReplyMarkup,
  escapeHtml,
  storyUrl,
  telegramNotifier,
  withUtm,
} from "../notify/telegram.js";
import type { DailyDigest, StoryPayload } from "../notify/types.js";
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
  rank_score: 30,
  llm_importance: 9,
  ...over,
});

describe("digest gating", () => {
  it("never sends before the local send hour", () => {
    expect(shouldSendDigest(null, DIGEST_LOCAL_HOUR - 1)).toBe(false);
    expect(shouldSendDigest(null, DIGEST_LOCAL_HOUR)).toBe(true);
  });

  it("sends only once per day: a sent row blocks resending", () => {
    expect(shouldSendDigest({ status: "sent", attempts: 1 }, 12)).toBe(false);
  });

  it("retries failed sends up to the attempt cap", () => {
    expect(shouldSendDigest({ status: "failed", attempts: 1 }, 12)).toBe(true);
    expect(
      shouldSendDigest({ status: "failed", attempts: NOTIFY_MAX_ATTEMPTS }, 12)
    ).toBe(false);
  });

  it("keys the digest by local date", () => {
    expect(digestKey("2026-08-17")).toBe("digest:2026-08-17");
  });
});

describe("trendingBudget", () => {
  const now = 1_700_000_000_000;
  it("stops at the daily cap", () => {
    expect(trendingBudget(TRENDING_MAX_PER_DAY, null, now)).toBe(0);
  });
  it("enforces the minimum gap since the last post", () => {
    expect(
      trendingBudget(0, now - (TRENDING_MIN_GAP_SEC - 60) * 1000, now)
    ).toBe(0);
    expect(
      trendingBudget(0, now - (TRENDING_MIN_GAP_SEC + 60) * 1000, now)
    ).toBe(1);
  });
  it("allows at most one trending post per run", () => {
    expect(trendingBudget(0, null, now)).toBe(1);
  });
});

describe("buildTrendingQuery", () => {
  it("requires published, high-rank, high-importance, unposted items", () => {
    const { sql, binds } = buildTrendingQuery("telegram", 1_700_000_000_000);
    expect(sql).toContain("status = 'published'");
    expect(sql).toContain("n.item_id IS NULL");
    expect(sql).toContain("tr.lang = 'vi'");
    expect(binds).toEqual([
      "telegram",
      1_700_000_000 - 24 * 3600,
      TRENDING_MIN_RANK,
      TRENDING_MIN_IMPORTANCE,
    ]);
  });
});

describe("localDayStartMs", () => {
  it("returns local midnight for a UTC+7 timezone", () => {
    // 2026-08-17T03:30:00Z = 10:30 local in Asia/Ho_Chi_Minh
    const now = Date.UTC(2026, 7, 17, 3, 30, 0);
    // local midnight = 2026-08-16T17:00:00Z
    expect(localDayStartMs(now, "Asia/Ho_Chi_Minh")).toBe(
      Date.UTC(2026, 7, 16, 17, 0, 0)
    );
  });
});

describe("digest message", () => {
  const digest: DailyDigest = {
    date: "2026-08-17",
    bullets: [
      { text: "OpenAI <ships> GPT-6 & more", url: "https://news.duyet.net/llm/abcdef12" },
      { text: "No-link bullet", url: null },
    ],
  };

  it("renders linked and unlinked bullets with escaped HTML", () => {
    const msg = buildDigestMessage(digest);
    expect(msg).toContain("AI hôm nay có gì — 2026-08-17");
    expect(msg).toContain("OpenAI &lt;ships&gt; GPT-6 &amp; more");
    expect(msg).toContain("utm_source=telegram");
    expect(msg).toContain("•  No-link bullet");
  });

  it("drops overflow bullets to stay under the message cap", () => {
    const big: DailyDigest = {
      date: "2026-08-17",
      bullets: Array.from({ length: 100 }, (_, i) => ({
        text: `bullet ${i} ${"x".repeat(200)}`,
        url: null,
      })),
    };
    expect(buildDigestMessage(big).length).toBeLessThan(4096);
  });
});

describe("trending story message", () => {
  it("escapes HTML and includes title, summary and meta", () => {
    const caption = buildStoryCaption(story());
    expect(caption).toContain("🔥 GPT-6 &lt;beats&gt; humans &amp; robots");
    expect(caption).toContain("A summary.");
    expect(caption).toContain("#llm");
    expect(caption).toContain("▲ 120");
    expect(caption).toContain("💬 45");
  });

  it("truncates long summaries under Telegram's caption limit", () => {
    const caption = buildStoryCaption(story({ summary: "x".repeat(2000) }));
    expect(caption.length).toBeLessThan(1024);
    expect(caption).toContain("…");
  });

  it("builds Read + TL;DR buttons with UTM tracking", () => {
    const markup = buildStoryReplyMarkup(story()) as {
      inline_keyboard: { text: string; url: string }[][];
    };
    const [row] = markup.inline_keyboard;
    expect(row[0].url).toContain("https://example.com/story");
    expect(row[0].url).toContain("utm_source=telegram");
    expect(row[1].url).toBe(
      "https://news.duyet.net/llm/abcdef12?utm_source=telegram"
    );
  });

  it("falls back to the ai category in the permalink", () => {
    expect(storyUrl({ id: "abcdef1234567890", category: null })).toBe(
      "https://news.duyet.net/ai/abcdef12"
    );
  });
});

describe("telegramNotifier gating", () => {
  it("is disabled unless both token and chat id are set", () => {
    expect(telegramNotifier.enabled({} as Env)).toBe(false);
    expect(telegramNotifier.enabled({ TELEGRAM_BOT_TOKEN: "t" } as Env)).toBe(
      false
    );
    expect(
      telegramNotifier.enabled({
        TELEGRAM_BOT_TOKEN: "t",
        TELEGRAM_CHAT_ID: "-100",
      } as Env)
    ).toBe(true);
  });
});

describe("helpers", () => {
  it("escapes ampersands first", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
  it("keeps invalid URLs unchanged in withUtm", () => {
    expect(withUtm("not a url")).toBe("not a url");
  });
});
