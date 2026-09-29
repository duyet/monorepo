import { describe, expect, it } from "vitest";
import { buildArticleHead } from "../head";

/**
 * The three blog surfaces (post page, child chapter, quick note) all build
 * their `head()` here. These tests assert the emitted arrays, not the route
 * source text — the previous `canonical.test.ts` matched `rel: "canonical"`
 * with `readFileSync`, so moving canonical into `ogHeadLinks` broke it even
 * though the rendered page was correct.
 */

const post = {
  title: "I don't read code anymore",
  description: "It's been a year or two.",
  url: "https://blog.duyet.net/2026/09/i-dont-read-code-anymore",
  image: "https://blog.duyet.net/og/2026-09-i-dont-read-code-anymore.png",
};

const content = (head: ReturnType<typeof buildArticleHead>, key: string) =>
  head.meta.find((m) => m[key] !== undefined)?.[key] as string;
const property = (head: ReturnType<typeof buildArticleHead>, p: string) =>
  head.meta.find((m) => m.property === p)?.content as string;
const named = (head: ReturnType<typeof buildArticleHead>, n: string) =>
  head.meta.find((m) => m.name === n)?.content as string;
const link = (head: ReturnType<typeof buildArticleHead>, rel: string) =>
  head.links.find((l) => l.rel === rel);
const jsonLd = (head: ReturnType<typeof buildArticleHead>) =>
  JSON.parse(head.scripts[0].children as string) as Record<string, unknown>;

describe("buildArticleHead", () => {
  it("puts the title and description in meta", () => {
    const head = buildArticleHead(post);
    expect(content(head, "title")).toBe(
      "I don't read code anymore | Tôi là Duyệt"
    );
    expect(named(head, "description")).toBe(post.description);
  });

  it("honours a custom title suffix", () => {
    expect(
      content(
        buildArticleHead({ ...post, titleSuffix: " | Quick Notes" }),
        "title"
      )
    ).toBe("I don't read code anymore | Quick Notes");
  });

  it("emits canonical in links, not meta", () => {
    const head = buildArticleHead(post);
    // A rel=canonical inside meta[] is silently dropped by the renderer, so
    // this asserts both halves: it is in links[], and it is not in meta[].
    expect(link(head, "canonical")?.href).toBe(post.url);
    expect(head.meta.some((m) => m.rel === "canonical")).toBe(false);
  });

  it("adds the markdown alternate only when the surface has one", () => {
    expect(
      link(
        buildArticleHead({ ...post, markdownHref: `${post.url}.md` }),
        "alternate"
      )
    ).toEqual({
      rel: "alternate",
      type: "text/markdown",
      href: `${post.url}.md`,
    });
    expect(link(buildArticleHead(post), "alternate")).toBeUndefined();
  });

  it("emits a large Twitter card pointed at the generated PNG", () => {
    const head = buildArticleHead({ ...post, type: "article" } as never);
    expect(property(head, "og:image")).toBe(post.image);
    expect(named(head, "twitter:image")).toBe(post.image);
    expect(named(head, "twitter:card")).toBe("summary_large_image");
    expect(property(head, "og:type")).toBe("article");
  });

  it("emits BlogPosting JSON-LD with the author and card", () => {
    const head = buildArticleHead({
      ...post,
      datePublished: "2026-09-01",
    });
    const ld = jsonLd(head);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe(post.title);
    expect(ld.url).toBe(post.url);
    expect(ld.image).toBe(post.image);
    expect(ld.datePublished).toBe("2026-09-01");
    expect(ld.author).toEqual({
      "@type": "Person",
      name: "Duyet Le",
      url: "https://duyet.net",
    });
  });

  it("normalizes a Date datePublished to an ISO string", () => {
    // Post["date"] is a Date, and JSON-LD requires ISO-8601.
    const date = new Date("2026-09-01T08:30:00.000Z");
    const ld = jsonLd(buildArticleHead({ ...post, datePublished: date }));
    expect(ld.datePublished).toBe("2026-09-01T08:30:00.000Z");
  });

  it("omits datePublished rather than emitting null", () => {
    const ld = jsonLd(buildArticleHead(post));
    // `datePublished: null` fails Google's rich-result validator, so an
    // undated surface must leave the key out entirely.
    expect("datePublished" in ld).toBe(false);
  });

  it("appends extra scripts after the JSON-LD blob", () => {
    const head = buildArticleHead({
      ...post,
      scripts: [
        { src: "https://platform.twitter.com/widgets.js", async: true },
      ],
    });
    expect(head.scripts[0].type).toBe("application/ld+json");
    expect(head.scripts[1]).toEqual({
      src: "https://platform.twitter.com/widgets.js",
      async: true,
    });
  });
});
