import { describe, expect, it } from "vitest";
import { Route } from "../src/routes/__root";

/**
 * Asserts against the root route's real `head()` output rather than its source
 * text, so a refactor that keeps the emitted tags intact doesn't break the
 * suite. `og:image` must be absolute — crawlers resolve it against the
 * *fetching* URL, not the page.
 *
 * The card is the 1200×630 `public/og.png` rendered by `pnpm run og:card`; it
 * replaced a 640×640 page screenshot that link previews cropped to a square.
 */
const head = Route.options.head?.({} as never);
if (!head) throw new Error("root route has no head()");

type MetaEntry = {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
};
const meta = ((await head) as { meta?: MetaEntry[] }).meta ?? [];

const findMeta = (key: "property" | "name", value: string) =>
  meta.find((m) => m[key] === value);

describe("home Open Graph tags", () => {
  it("emits og and twitter card tags from the root head", () => {
    expect(findMeta("property", "og:image")?.content).toBe(
      "https://duyet.net/og.png"
    );
    expect(findMeta("property", "og:title")?.content).toBe(
      "Duyet — building AI agents and data platforms"
    );
    expect(findMeta("name", "twitter:card")?.content).toBe(
      "summary_large_image"
    );
  });

  it("declares the card's dimensions and alt text", () => {
    expect(findMeta("property", "og:image:width")?.content).toBe("1200");
    expect(findMeta("property", "og:image:height")?.content).toBe("630");
    expect(findMeta("property", "og:image:alt")?.content).toBeTruthy();
  });

  it("names the site for cards that show the URL alone", () => {
    expect(findMeta("property", "og:site_name")?.content).toBe("duyet.net");
  });

  it("mirrors the og image onto twitter:image", () => {
    expect(findMeta("name", "twitter:image")?.content).toBe(
      findMeta("property", "og:image")?.content
    );
  });

  it("emits every og image URL as an absolute https URL", () => {
    // Only the URL-valued tags: `og:image:alt|width|height` carry text and
    // numbers, not URLs.
    const ogImageUrls = meta
      .filter((m) => m.property === "og:image" || m.name === "twitter:image")
      .map((m) => m.content as string);

    expect(ogImageUrls.length).toBeGreaterThan(0);
    for (const url of ogImageUrls) {
      expect(() => new URL(url)).not.toThrow();
      expect(new URL(url).protocol).toBe("https:");
    }
  });
});
