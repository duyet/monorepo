import { describe, expect, it, vi } from "vitest";
import { servePublicApi } from "./public-api";
import {
  getPublicDigest,
  normalizeStoredBullets,
  PUBLIC_STORY_LIMIT,
} from "./public-queries";

interface TldrRow {
  date: string;
  bullets_en: string;
  bullets_vi: string;
}

interface StoryRow {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  category: string | null;
  image_url?: string | null;
  published_at: number;
}

function story(id: string, extra: Partial<StoryRow> = {}): StoryRow {
  return {
    id,
    url: `https://example.com/${id}`,
    title: `Story ${id}`,
    title_vi: `Tin ${id}`,
    category: "Models",
    image_url: `https://img.example/${id}.jpg`,
    published_at: 1_700_000_000,
    ...extra,
  };
}

function makeDb(opts: {
  tldr?: TldrRow | null;
  stories?: StoryRow[];
  extraImages?: Array<{ id: string; image_url: string | null }>;
  failImageColumn?: boolean;
  throwOnItems?: boolean;
}) {
  return {
    prepare(sql: string) {
      const stub = {
        bind: (..._args: unknown[]) => stub,
        all: async () => {
          if (sql.includes("tldr_snapshots")) {
            return { results: opts.tldr ? [opts.tldr] : [] };
          }
          if (sql.includes("FROM items")) {
            if (opts.throwOnItems) {
              throw new Error("D1_ERROR SQLITE_ERROR no such table: items");
            }
            if (opts.failImageColumn && sql.includes("image_url")) {
              throw new Error("no such column: image_url");
            }
            if (sql.includes("id IN")) {
              return { results: opts.extraImages ?? [] };
            }
            return { results: opts.stories ?? [] };
          }
          return { results: [] };
        },
      };
      return stub;
    },
  } as unknown as D1Database;
}

const bilingualTldr: TldrRow = {
  date: "2026-08-27",
  bullets_en: JSON.stringify([
    { text: "Nvidia buys Hugging Face", item_ids: ["a"] },
    { text: "GPT-6 ships", item_ids: ["b"] },
  ]),
  bullets_vi: JSON.stringify([
    { text: "Nvidia mua Hugging Face", item_ids: ["a"] },
    { text: "GPT-6 ra mắt", item_ids: ["b"] },
  ]),
};

describe("normalizeStoredBullets", () => {
  it("normalizes legacy item_id to item_ids and caps at 16", () => {
    const bullets = normalizeStoredBullets([
      { text: "one", item_id: "abc" },
      { text: "two", item_ids: ["def"] },
    ]);
    expect(bullets).toEqual([
      { text: "one", item_ids: ["abc"] },
      { text: "two", item_ids: ["def"] },
    ]);
    const many = Array.from({ length: 20 }, (_, i) => ({ text: `b${i}` }));
    expect(normalizeStoredBullets(many)).toHaveLength(16);
  });
});

describe("getPublicDigest", () => {
  it("returns slim tldr + stories without feed-sized fields", async () => {
    const db = makeDb({
      tldr: bilingualTldr,
      stories: [
        story("a"),
        story("b"),
        story("c", {
          title_vi: null,
          category: null,
          image_url: null,
        }),
      ],
    });
    const digest = await getPublicDigest(db);
    expect(digest.tldr?.date).toBe("2026-08-27");
    expect(digest.tldr?.bullets_vi[0]?.text).toContain("Hugging Face");
    expect(digest.tldr?.bullets_en).toHaveLength(2);
    expect(digest.tldr?.bullets_en[0]?.image_url).toBe(
      "https://img.example/a.jpg"
    );
    expect(digest.tldr?.bullets_en[1]?.image_url).toBe(
      "https://img.example/b.jpg"
    );
    expect(digest.tldr?.bullets_vi[0]?.image_url).toBe(
      "https://img.example/a.jpg"
    );
    expect(digest.stories).toHaveLength(3);
    expect(digest.stories[0]).toEqual({
      id: "a",
      url: "https://example.com/a",
      title: "Story a",
      title_vi: "Tin a",
      category: "Models",
      image_url: "https://img.example/a.jpg",
      published_at: 1_700_000_000,
    });
    expect(digest.stories[0]).not.toHaveProperty("summary");
    expect(digest.stories[0]).not.toHaveProperty("rank_score");
    expect(digest.stories[0]).not.toHaveProperty("tags");
    expect(digest.stories[0]).not.toHaveProperty("sources");
    expect(typeof digest.updatedAt).toBe("number");
    const bytes = new TextEncoder().encode(JSON.stringify(digest)).length;
    expect(bytes).toBeLessThan(50_000);
  });

  it("caps stories at PUBLIC_STORY_LIMIT", async () => {
    const stories = Array.from({ length: PUBLIC_STORY_LIMIT }, (_, i) =>
      story(`id${i}`)
    );
    const db = makeDb({ tldr: bilingualTldr, stories });
    const digest = await getPublicDigest(db);
    expect(digest.stories.length).toBeLessThanOrEqual(PUBLIC_STORY_LIMIT);
  });

  it("falls back to title-based tldr when the snapshot is thin", async () => {
    const db = makeDb({
      tldr: {
        date: "2026-08-27",
        bullets_en: JSON.stringify([{ text: "leftover" }]),
        bullets_vi: JSON.stringify([]),
      },
      stories: [story("a"), story("b")],
    });
    const digest = await getPublicDigest(db);
    expect(digest.tldr?.bullets_en.map((b) => b.text)).toEqual([
      "Story a",
      "Story b",
    ]);
    expect(digest.tldr?.bullets_vi.map((b) => b.text)).toEqual([
      "Tin a",
      "Tin b",
    ]);
  });

  it("retries without image_url when the column is missing", async () => {
    const db = makeDb({
      tldr: bilingualTldr,
      stories: [story("a", { image_url: undefined })],
      failImageColumn: true,
    });
    const digest = await getPublicDigest(db);
    expect(digest.stories[0]?.image_url).toBeNull();
    expect(digest.stories[0]?.id).toBe("a");
    expect(digest.tldr?.bullets_en[0]).not.toHaveProperty("image_url");
  });

  it("looks up a bullet image even when the story is outside the top 8", async () => {
    const db = makeDb({
      tldr: bilingualTldr,
      stories: [story("z")],
      extraImages: [
        { id: "a", image_url: "https://img.example/a.jpg" },
        { id: "b", image_url: "https://img.example/b.jpg" },
      ],
    });
    const digest = await getPublicDigest(db);
    expect(digest.tldr?.bullets_en[0]?.image_url).toBe(
      "https://img.example/a.jpg"
    );
    expect(digest.tldr?.bullets_en[1]?.image_url).toBe(
      "https://img.example/b.jpg"
    );
    expect(digest.stories[0]?.id).toBe("z");
  });

  it("omits image_url on a bullet when the linked story has none", async () => {
    const db = makeDb({
      tldr: bilingualTldr,
      stories: [
        story("a", { image_url: null }),
        story("b", { image_url: null }),
      ],
    });
    const digest = await getPublicDigest(db);
    expect(digest.tldr?.bullets_en[0]).not.toHaveProperty("image_url");
    expect(digest.tldr?.bullets_en[1]).not.toHaveProperty("image_url");
  });
});

describe("servePublicApi", () => {
  it("does not require auth and returns JSON shape", async () => {
    const db = makeDb({
      tldr: bilingualTldr,
      stories: [story("a"), story("b")],
    });
    const res = await servePublicApi(db);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toMatch(/public/);
    const body = (await res.json()) as Awaited<
      ReturnType<typeof getPublicDigest>
    >;
    expect(body.tldr?.date).toBe("2026-08-27");
    expect(Array.isArray(body.stories)).toBe(true);
    expect(body).toHaveProperty("updatedAt");
  });

  it("returns generic unavailable without leaking D1 errors", async () => {
    const missing = await servePublicApi(undefined);
    expect(missing.status).toBe(503);
    const missingBody = await missing.json();
    expect(missingBody).toEqual({ error: "unavailable" });
    expect(JSON.stringify(missingBody).toLowerCase()).not.toMatch(
      /d1|sqlite|binding|admin/
    );

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const db = makeDb({ throwOnItems: true, tldr: bilingualTldr });
    const failed = await servePublicApi(db);
    spy.mockRestore();
    expect(failed.status).toBe(500);
    const payload = await failed.json();
    expect(payload).toEqual({ error: "unavailable" });
    expect(JSON.stringify(payload).toLowerCase()).not.toMatch(
      /d1|sqlite|table|admin/
    );
  });

  it("ignores Authorization — the route is public", async () => {
    const db = makeDb({ tldr: bilingualTldr, stories: [story("a")] });
    const res = await servePublicApi(db);
    expect(res.status).toBe(200);
  });
});
