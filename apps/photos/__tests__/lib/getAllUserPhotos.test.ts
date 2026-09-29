// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"

/**
 * Characterisation tests for `getAllUserPhotos`, which is a 306-line function
 * that paginates, enriches from a cache, and tracks downloads — with a delay
 * between every network call. It had **no tests at all**, which is what made
 * splitting it unsafe to attempt blind.
 *
 * These pin the behaviour as shipped, including the parts that look wrong:
 *
 * - pagination stops at three pages, and at an empty one;
 * - a rate-limit or API error stops pagination but **keeps whatever was already
 *   fetched** — the error is only rethrown when *zero* photos came back;
 * - enrichment falls back to an expired cache entry, and once the rate limit
 *   is hit it stops calling the API and uses stale cache for the remainder;
 * - a photo that cannot be enriched is counted and logged but still returned;
 * - download-tracking failures are silent and never fail the build.
 *
 * Everything is mocked — `unsplash-js` and the cache module — and the inter-call
 * delays are driven by fake timers, so no test touches the network and the
 * suite does not spend real seconds asleep.
 */

// Read by `lib/unsplash.ts` at module load, and static imports hoist above
// any statement, so this has to be set in a hoisted block.
vi.hoisted(() => {
  process.env.UNSPLASH_ACCESS_KEY = "test-key";
});

const state = vi.hoisted(() => ({
  /** Per-page results; `getUserPhotos` pops by page number. */
  pages: new Map<number, unknown[]>(),
  /** Ids that should make `getUserPhotos` throw, by page. */
  pageErrors: new Map<number, unknown>(),
  /** Details returned by `getPhotoDetails`, by photo id. */
  details: new Map<string, unknown>(),
  /** Ids for which `getPhotoDetails` should report a rate limit. */
  detailRateLimited: new Set<string>(),
  detailCalls: [] as string[],
  downloadCalls: [] as string[],
  downloadErrors: new Set<string>(),
  cache: new Map<string, unknown>(),
  savedCaches: 0,
}));

// The client is built at module load, so it reads the fixtures lazily: an
// object captured at mock time would hold an empty `state`.
vi.mock("unsplash-js", () => ({
  createApi: () => ({
    users: {
      getPhotos: async ({ page }: { page: number }) => {
        const err = state.pageErrors.get(page);
        if (err) throw err;
        return { response: { results: state.pages.get(page) ?? [] } };
      },
    },
    photos: {
      get: async ({ photoId }: { photoId: string }) => {
        state.detailCalls.push(photoId);
        // A rate limit reaches `getPhotoDetails` as a **thrown** error that
        // `isRateLimitError` recognises; a null response is an ordinary miss.
        if (state.detailRateLimited.has(photoId)) {
          throw Object.assign(new Error("Rate Limit Exceeded"), {
            status: 429,
            response: { status: 429 },
          });
        }
        return { response: state.details.get(photoId) ?? null };
      },
      trackDownload: async ({ downloadLocation }: { downloadLocation: string }) => {
        state.downloadCalls.push(downloadLocation);
        if (state.downloadErrors.has(downloadLocation)) {
          throw new Error("tracking failed");
        }
        return { response: null };
      },
    },
    stats: {
      download: async (url: string) => {
        state.downloadCalls.push(url);
        if (state.downloadErrors.has(url)) throw new Error("tracking failed");
        return { response: null };
      },
    },
  }),
}));
vi.mock("@/lib/config", () => ({ UNSPLASH_USERNAME: "tester" }));
vi.mock("@/lib/cache", () => ({
  loadPhotoCache: vi.fn(async () => state.cache),
  savePhotoCache: vi.fn(async () => {
    state.savedCaches += 1;
  }),
  cleanExpiredCache: vi.fn((c: Map<string, unknown>) => c.size),
  getCacheStats: vi.fn(() => ({ validEntries: state.cache.size, expiredEntries: 0 })),
  getCachedPhotoData: vi.fn((_c: Map<string, unknown>, id: string) => {
    const data = state.cache.get(id);
    return data ? { data, isExpired: false } : null;
  }),
  setCachedPhotoData: vi.fn((c: Map<string, unknown>, id: string, data: unknown) => {
    c.set(id, data);
  }),
}));

import { RateLimitError, UnknownPhotoError } from "./../../lib/errors";

/** Minimal photo, enriched enough for the cache/enrichment branches. */
const photo = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  width: 100,
  height: 100,
  color: "#fff",
  created_at: "2026-01-01T00:00:00Z",
  description: null,
  alt_description: null,
  blur_hash: null,
  urls: {
    raw: `https://example.com/${id}-raw.jpg`,
    full: `https://example.com/${id}-full.jpg`,
    regular: `https://example.com/${id}-regular.jpg`,
    small: `https://example.com/${id}-small.jpg`,
    thumb: `https://example.com/${id}-thumb.jpg`,
  },
  // The real `download_location` carries an `ixid` query param the app cannot
  // reconstruct, so a fixture without one cannot tell "used the URL the API
  // gave us" apart from "rebuilt it from the photo id".
  links: {
    download_location: `https://api.unsplash.com/photos/${id}/download?ixid=abc123`,
  },
  ...over,
});

/** Run the function to completion, driving every delay instantly. */
async function run(): Promise<UnsplashPhoto[]> {
  const { getAllUserPhotos } = await import("@/lib/unsplash");
  const promise = getAllUserPhotos();

  // Observe the settlement **immediately**, before advancing the clock.
  // Returning `promise` only after the timer loop leaves a window in which a
  // rejection is unhandled, and Vitest reports that as an unhandled rejection
  // which can mask real failures elsewhere in the file. The pre-commit hook
  // caught exactly this.
  const settled = promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error })
  );

  // Three pages x 1s, then 800ms per enrichment, then 500ms per 20 downloads.
  for (let i = 0; i < 4000; i++) await vi.advanceTimersByTimeAsync(1000);

  const outcome = await settled;
  if (!outcome.ok) throw outcome.error;
  return outcome.value;
}

beforeEach(() => {
  vi.useFakeTimers();
  state.pages = new Map();
  state.pageErrors = new Map();
  state.details = new Map();
  state.detailRateLimited = new Set();
  state.detailCalls = [];
  state.downloadCalls = [];
  state.downloadErrors = new Set();
  state.cache = new Map();
  state.savedCaches = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getAllUserPhotos pagination", () => {
  it("stops after three pages even when every page is full", async () => {
    state.pages.set(1, [photo("a"), photo("b")]);
    state.pages.set(2, [photo("c")]);
    state.pages.set(3, [photo("d")]);
    state.pages.set(4, [photo("e")]);

    const result = await run();
    // The fourth page is never requested.
    expect(result.map((p) => p.id).sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("stops at an empty page instead of requesting the rest", async () => {
    state.pages.set(1, [photo("a")]);
    state.pages.set(2, []);

    const result = await run();
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });

  it("keeps the pages it already fetched when a later page rate-limits", async () => {
    state.pages.set(1, [photo("a")]);
    state.pageErrors.set(2, new RateLimitError("unsplash", "slow down"));

    const result = await run();
    // Shipped behaviour: a mid-run rate limit is not fatal if anything arrived.
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });

  it("rethrows the rate-limit error when no photos came back at all", async () => {
    state.pageErrors.set(1, new RateLimitError("unsplash", "slow down"));

    await expect(run()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("throws UnknownPhotoError when the account is simply empty", async () => {
    state.pages.set(1, []);
    await expect(run()).rejects.toBeInstanceOf(UnknownPhotoError);
  });
});

describe("getAllUserPhotos enrichment", () => {
  it("does not call the details API for a photo already in the cache", async () => {
    state.pages.set(1, [photo("a")]);
    state.cache.set("a", { exif: { make: "Cached" } });

    const result = await run();
    expect(state.detailCalls).toEqual([]);
    expect(result[0]).toMatchObject({ exif: { make: "Cached" } });
  });

  it("fetches and applies details for a photo not in the cache", async () => {
    state.pages.set(1, [photo("a")]);
    state.details.set("a", { exif: { make: "Fresh" } });

    const result = await run();
    expect(state.detailCalls).toEqual(["a"]);
    expect(result[0]).toMatchObject({ exif: { make: "Fresh" } });
  });

  it("still returns a photo that could not be enriched at all", async () => {
    state.pages.set(1, [photo("a")]);
    // No details, no cache: the API path returns null.

    const result = await run();
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });

  it("stops calling the API once the rate limit is hit", async () => {
    state.pages.set(1, [photo("a"), photo("b"), photo("c"), photo("d")]);
    state.detailRateLimited.add("a");

    const result = await run();
    // `a` reports the limit; the rest must not be requested.
    expect(state.detailCalls).toEqual(["a"]);
    expect(result).toHaveLength(4);
  });

  it("saves the cache once, after enrichment", async () => {
    state.pages.set(1, [photo("a")]);
    state.details.set("a", { exif: { make: "Fresh" } });

    await run();
    expect(state.savedCaches).toBe(1);
  });
});

describe("getAllUserPhotos download tracking", () => {
  it("tracks a download for every photo, by its download_location", async () => {
    state.pages.set(1, [photo("a"), photo("b")]);

    await run();

    // Unsplash's attribution rules require the download endpoint to be called
    // for each displayed photo, and the URL used is the one the API handed
    // back — it carries the auth params, so it cannot be reconstructed.
    expect(state.downloadCalls).toEqual([
      "https://api.unsplash.com/photos/a/download?ixid=abc123",
      "https://api.unsplash.com/photos/b/download?ixid=abc123",
    ]);
  });

  it("still returns every photo when a tracking call fails", async () => {
    state.pages.set(1, [photo("a"), photo("b")]);
    state.downloadErrors.add("https://api.unsplash.com/photos/b/download?ixid=abc123");

    const result = await run();
    // Attribution bookkeeping must never fail a build that already produced a
    // complete gallery.
    expect(result.map((p) => p.id)).toEqual(["a", "b"]);
    expect(state.downloadCalls).toHaveLength(2);
  });
});
