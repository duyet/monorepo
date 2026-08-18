import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidEmail, isValidTimezone } from "../subscribe/handlers.js";
import {
  buildDigestEmail,
  DIGEST_LOCAL_HOUR,
  getLocalHourAndDate,
  primaryItemId,
  sendDailyTldr,
  shouldSendForSubscriber,
  snapshotHasBullets,
  topBullets,
} from "../subscribe/send.js";
import type { Env } from "../types.js";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a.b+c@sub.example.co")).toBe(true);
  });

  it("rejects malformed addresses and non-strings", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(123)).toBe(false);
  });

  it("rejects overlong addresses", () => {
    const long = `${"a".repeat(250)}@example.com`;
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("topBullets", () => {
  it("caps at 5 bullets by default", () => {
    const bullets = Array.from({ length: 8 }, (_, i) => ({ text: `b${i}` }));
    expect(topBullets(JSON.stringify(bullets))).toHaveLength(5);
  });

  it("returns empty for null/invalid JSON/non-array", () => {
    expect(topBullets(null)).toEqual([]);
    expect(topBullets("not json")).toEqual([]);
    expect(topBullets(JSON.stringify({ a: 1 }))).toEqual([]);
  });

  it("promotes item_ids[0] onto item_id for telegram permalinks", () => {
    expect(
      topBullets(
        JSON.stringify([{ text: "hi", item_ids: ["abc", "def"] }])
      )
    ).toEqual([{ text: "hi", item_id: "abc" }]);
  });
});

describe("snapshotHasBullets", () => {
  it("returns false when both languages are empty", () => {
    expect(snapshotHasBullets({ bullets_en: null, bullets_vi: null })).toBe(
      false
    );
  });

  it("returns true when either language has bullets", () => {
    expect(
      snapshotHasBullets({
        bullets_en: JSON.stringify([{ text: "a" }]),
        bullets_vi: null,
      })
    ).toBe(true);
    expect(
      snapshotHasBullets({
        bullets_en: null,
        bullets_vi: JSON.stringify([{ text: "a" }]),
      })
    ).toBe(true);
  });
});

describe("isValidTimezone", () => {
  it("accepts real IANA timezone names", () => {
    expect(isValidTimezone("Asia/Ho_Chi_Minh")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("UTC")).toBe(true);
  });

  it("rejects garbage, non-IANA offsets, empty strings, and non-strings", () => {
    expect(isValidTimezone("not-a-timezone")).toBe(false);
    expect(isValidTimezone("UTC+7")).toBe(false);
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone(undefined)).toBe(false);
    expect(isValidTimezone(null)).toBe(false);
    expect(isValidTimezone(123)).toBe(false);
  });
});

describe("getLocalHourAndDate", () => {
  // 2026-08-16T12:00:00Z (noon UTC), a fixed point for cross-timezone math
  const noonUtc = Date.UTC(2026, 7, 16, 12, 0, 0);

  it("computes the correct local hour and date for a timezone ahead of UTC", () => {
    // Asia/Ho_Chi_Minh is UTC+7 — noon UTC is 19:00 local, same calendar day
    const { hour, date } = getLocalHourAndDate(noonUtc, "Asia/Ho_Chi_Minh");
    expect(hour).toBe(19);
    expect(date).toBe("2026-08-16");
  });

  it("rolls over to the next local date for a timezone far enough ahead of UTC", () => {
    // Pacific/Auckland is UTC+12 — noon UTC is midnight the next local day
    const { hour, date } = getLocalHourAndDate(noonUtc, "Pacific/Auckland");
    expect(hour).toBe(0);
    expect(date).toBe("2026-08-17");
  });

  it("rolls back to the previous local date for a timezone behind UTC", () => {
    // America/Los_Angeles is UTC-7 (DST) in August — noon UTC is early morning, same day
    const { hour, date } = getLocalHourAndDate(noonUtc, "America/Los_Angeles");
    expect(hour).toBe(5);
    expect(date).toBe("2026-08-16");
  });

  it("falls back to the default timezone for an invalid one", () => {
    const withInvalid = getLocalHourAndDate(noonUtc, "not-a-timezone");
    const withDefault = getLocalHourAndDate(noonUtc, "Asia/Ho_Chi_Minh");
    expect(withInvalid).toEqual(withDefault);
  });

  it("falls back to the default timezone when none is given", () => {
    const withNull = getLocalHourAndDate(noonUtc, null);
    const withDefault = getLocalHourAndDate(noonUtc, "Asia/Ho_Chi_Minh");
    expect(withNull).toEqual(withDefault);
  });
});

describe("shouldSendForSubscriber — gate matrix", () => {
  it("does not send before the local digest hour", () => {
    expect(
      shouldSendForSubscriber(
        { last_sent_date: null },
        DIGEST_LOCAL_HOUR - 1,
        "2026-08-16"
      )
    ).toBe(false);
  });

  it("sends once at/after the local digest hour, on a fresh date", () => {
    expect(
      shouldSendForSubscriber(
        { last_sent_date: null },
        DIGEST_LOCAL_HOUR,
        "2026-08-16"
      )
    ).toBe(true);
    expect(
      shouldSendForSubscriber(
        { last_sent_date: "2026-08-15" },
        DIGEST_LOCAL_HOUR,
        "2026-08-16"
      )
    ).toBe(true);
  });

  it("does not send again the same local day once already sent", () => {
    expect(
      shouldSendForSubscriber(
        { last_sent_date: "2026-08-16" },
        DIGEST_LOCAL_HOUR + 5,
        "2026-08-16"
      )
    ).toBe(false);
  });

  it("sends again once the local date rolls over", () => {
    expect(
      shouldSendForSubscriber(
        { last_sent_date: "2026-08-16" },
        DIGEST_LOCAL_HOUR,
        "2026-08-17"
      )
    ).toBe(true);
  });
});

describe("buildDigestEmail", () => {
  const bullets = Array.from({ length: 7 }, (_, i) => ({ text: `story ${i}` }));

  it("caps the email body at 5 bullets", () => {
    const { text, html } = buildDigestEmail("2026-08-16", bullets, "en", "tok");
    expect(text).toContain("story 0");
    expect(text).toContain("story 4");
    expect(text).not.toContain("story 5");
    expect(html).not.toContain("story 5");
  });

  it("selects the Vietnamese unsubscribe copy for lang=vi", () => {
    const { text } = buildDigestEmail("2026-08-16", bullets, "vi", "tok");
    expect(text).toContain("Hủy đăng ký");
  });

  it("selects the English unsubscribe copy for lang=en", () => {
    const { text } = buildDigestEmail("2026-08-16", bullets, "en", "tok");
    expect(text).toContain("Unsubscribe:");
  });

  it("includes the unsubscribe link with the given token", () => {
    const { html } = buildDigestEmail("2026-08-16", bullets, "en", "abc123");
    expect(html).toContain(
      "https://news.duyet.net/subscribe?unsubscribe=abc123"
    );
  });

  it("escapes HTML-sensitive characters in bullet text", () => {
    const { html } = buildDigestEmail(
      "2026-08-16",
      [{ text: '<script>alert(1)</script> & "quoted"' }],
      "en",
      "tok"
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;quoted&quot;");
  });
});

describe("sendDailyTldr — per-subscriber send flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function makeEnv(opts: {
    subscribers: Array<{
      email: string;
      lang: string;
      unsubscribe_token: string;
      timezone: string | null;
      last_sent_date: string | null;
    }>;
    emailShouldFail?: (email: string) => boolean;
  }) {
    const updates: { sql: string; args: unknown[] }[] = [];
    const sentTo: string[] = [];
    const db = {
      prepare(sql: string) {
        const bound = () => ({
          first: async () => ({
            date: "2026-08-16",
            bullets_en: JSON.stringify([{ text: "story" }]),
            bullets_vi: JSON.stringify([{ text: "tin tức" }]),
            sent_at: null,
          }),
          all: async () => ({ results: opts.subscribers }),
          run: async () => ({ success: true }),
        });
        return {
          ...bound(),
          bind: (...args: unknown[]) => {
            if (sql.startsWith("UPDATE")) updates.push({ sql, args });
            return bound();
          },
        };
      },
    };
    const email = {
      send: async (msg: { to: string }) => {
        if (opts.emailShouldFail?.(msg.to)) {
          throw new Error("send failed");
        }
        sentTo.push(msg.to);
      },
    };
    return {
      env: { DB: db, EMAIL: email } as unknown as Env,
      updates,
      sentTo,
    };
  }

  it("skips a subscriber whose local time hasn't reached the digest hour", async () => {
    // Fixed UTC instant where Asia/Ho_Chi_Minh (UTC+7) local hour is 2am.
    const fixedNow = Date.UTC(2026, 7, 16, 19, 0, 0); // 19:00 UTC -> 02:00 ICT next day
    const { env, sentTo } = makeEnv({
      subscribers: [
        {
          email: "early@example.com",
          lang: "en",
          unsubscribe_token: "t1",
          timezone: "Asia/Ho_Chi_Minh",
          last_sent_date: null,
        },
      ],
    });
    vi.setSystemTime(fixedNow);
    await sendDailyTldr(env);
    expect(sentTo).toEqual([]);
  });

  it("sends once past the digest hour and stamps last_sent_date", async () => {
    // 03:00 UTC -> 10:00 ICT (Asia/Ho_Chi_Minh, UTC+7) — past the gate.
    const fixedNow = Date.UTC(2026, 7, 16, 3, 0, 0);
    const { env, updates, sentTo } = makeEnv({
      subscribers: [
        {
          email: "ok@example.com",
          lang: "en",
          unsubscribe_token: "t1",
          timezone: "Asia/Ho_Chi_Minh",
          last_sent_date: null,
        },
      ],
    });
    vi.setSystemTime(fixedNow);
    await sendDailyTldr(env);

    expect(sentTo).toEqual(["ok@example.com"]);
    const stamp = updates.find(
      (u) =>
        u.sql.includes("UPDATE subscribers") &&
        u.args.includes("ok@example.com")
    );
    expect(stamp?.args).toContain("2026-08-16");
  });

  it("does not stamp last_sent_date when the send fails, so it retries next hour", async () => {
    const fixedNow = Date.UTC(2026, 7, 16, 3, 0, 0);
    const { env, updates, sentTo } = makeEnv({
      subscribers: [
        {
          email: "fail@example.com",
          lang: "en",
          unsubscribe_token: "t1",
          timezone: "Asia/Ho_Chi_Minh",
          last_sent_date: null,
        },
      ],
      emailShouldFail: () => true,
    });
    vi.setSystemTime(fixedNow);
    await sendDailyTldr(env);

    expect(sentTo).toEqual([]);
    const stamp = updates.find(
      (u) =>
        u.sql.includes("UPDATE subscribers") &&
        u.args.includes("fail@example.com")
    );
    expect(stamp).toBeUndefined();
  });

  it("does not send twice in the same local day (second run same day no-send)", async () => {
    const fixedNow = Date.UTC(2026, 7, 16, 3, 0, 0); // 10:00 ICT
    const { env, sentTo } = makeEnv({
      subscribers: [
        {
          email: "already@example.com",
          lang: "en",
          unsubscribe_token: "t1",
          timezone: "Asia/Ho_Chi_Minh",
          last_sent_date: "2026-08-16", // already sent today, local date
        },
      ],
    });
    vi.setSystemTime(fixedNow);
    await sendDailyTldr(env);
    expect(sentTo).toEqual([]);
  });

  it("sends again once the subscriber's local date rolls over", async () => {
    const fixedNow = Date.UTC(2026, 7, 17, 3, 0, 0); // next local day, 10:00 ICT
    const { env, sentTo } = makeEnv({
      subscribers: [
        {
          email: "nextday@example.com",
          lang: "en",
          unsubscribe_token: "t1",
          timezone: "Asia/Ho_Chi_Minh",
          last_sent_date: "2026-08-16",
        },
      ],
    });
    vi.setSystemTime(fixedNow);
    await sendDailyTldr(env);
    expect(sentTo).toEqual(["nextday@example.com"]);
  });
});

describe("primaryItemId", () => {
  it("prefers legacy item_id, then the first item_ids entry", () => {
    expect(primaryItemId({ text: "a", item_id: "legacy" })).toBe("legacy");
    expect(primaryItemId({ text: "a", item_ids: ["new1", "new2"] })).toBe(
      "new1"
    );
    expect(primaryItemId({ text: "a" })).toBeUndefined();
  });
});
