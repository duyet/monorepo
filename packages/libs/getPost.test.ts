import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  mkdirSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ValidationError } from "./errors";
import { getPostByPath } from "./getPost";

const TEST_DIR = join(tmpdir(), `getPost-test-${Date.now()}`);
const VALID_SLUG = "/2024/01/test-post";

/**
 * Every temp file must use a unique name: `getPostByPath` memoizes file
 * contents in a module-level `CACHED` map keyed by absolute path, so
 * re-writing the same path would serve stale frontmatter to later tests.
 */
let fileCounter = 0;

function writeTempPost(
  filename: string,
  frontmatter: string,
  body = "Post body text"
): string {
  const fullPath = join(TEST_DIR, `${++fileCounter}-${filename}`);
  writeFileSync(fullPath, `---\n${frontmatter}\n---\n\n${body}`);
  return fullPath;
}

/** `body` as gray-matter hands it to the field handlers: a leading "\n". */
const bodyContent = (body = "Post body text") => `\n${body}`;

const words = (count: number) =>
  Array.from({ length: count }, (_, index) => `w${index + 1}`).join(" ");

beforeAll(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterAll(() => {
  try {
    const files = readdirSync(TEST_DIR);
    for (const file of files) {
      unlinkSync(join(TEST_DIR, file));
    }
    rmdirSync(TEST_DIR);
  } catch {
    // best-effort cleanup
  }
});

describe("getPostByPath – thumbnail field", () => {
  test("returns thumbnail when frontmatter thumbnail exists", () => {
    const path = writeTempPost(
      "thumb-url.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Test Post",
        "date: 2024-01-15",
        "thumbnail: /media/2024/01/cover.jpg",
      ].join("\n")
    );

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBe("/media/2024/01/cover.jpg");
  });

  test("returns thumbnail when frontmatter thumbnail is an absolute URL", () => {
    const path = writeTempPost(
      "thumb-abs.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Test Post",
        "date: 2024-01-15",
        "thumbnail: https://example.com/images/cover.png",
      ].join("\n")
    );

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBe("https://example.com/images/cover.png");
  });

  test("keeps thumbnail undefined when frontmatter thumbnail is empty", () => {
    const path = writeTempPost(
      "thumb-empty.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Test Post",
        "date: 2024-01-15",
        "thumbnail: ''",
      ].join("\n")
    );

    const post = getPostByPath(path, ["slug", "thumbnail"]);
    expect(post.thumbnail).toBeUndefined();
  });

  test("does not set thumbnail when thumbnail is not requested", () => {
    const path = writeTempPost(
      "thumb-nofield.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Test Post",
        "date: 2024-01-15",
        "thumbnail: /media/cover.jpg",
      ].join("\n")
    );

    const post = getPostByPath(path, ["slug", "title"]);
    expect(post.title).toBe("Test Post");
    expect(post.thumbnail).toBeUndefined();
  });

  test("still returns other requested fields when thumbnail is requested", () => {
    const path = writeTempPost(
      "thumb-multi.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Multi Field Post",
        "date: 2024-03-20",
        "thumbnail: /media/multi-cover.svg",
      ].join("\n"),
      "Some content here for reading time."
    );

    const post = getPostByPath(path, ["slug", "title", "thumbnail", "date"]);
    expect(post.title).toBe("Multi Field Post");
    expect(post.date).toBeInstanceOf(Date);
    expect(post.thumbnail).toBe("/media/multi-cover.svg");
  });
});

/**
 * Characterization tests for every branch of the field projection that
 * `getPostByPath` performs. Written against the `if (field === …)` chain
 * *before* it was replaced by a field-handler map, so any behavioral drift
 * introduced by that refactor shows up here as a failure.
 */

/** The 10 keys a `Post` is seeded with before any field is projected. */
const DEFAULT_POST_KEYS = [
  "slug",
  "title",
  "date",
  "content",
  "category",
  "category_slug",
  "tags",
  "tags_slug",
  "snippet",
  "featured",
];

const readField = (post: object, field: string): unknown =>
  (post as unknown as Record<string, unknown>)[field];

describe("getPostByPath – default post object", () => {
  test("seeds exactly ten keys when no fields are requested", () => {
    const path = writeTempPost(
      "defaults.md",
      [`slug: ${VALID_SLUG}`, "title: Defaults", "date: 2024-01-15"].join("\n")
    );

    const post = getPostByPath(path);
    expect(Object.keys(post)).toEqual(DEFAULT_POST_KEYS);
    expect(post.slug).toBe("");
    expect(post.title).toBe("");
    expect(post.content).toBe("");
    expect(post.category).toBe("Unknown");
    expect(post.category_slug).toBe("unknown");
    expect(post.tags).toEqual([]);
    expect(post.tags_slug).toEqual([]);
    expect(post.snippet).toBe("");
    expect(post.featured).toBe(false);
  });

  test("seeds date with the current time, not the frontmatter date", () => {
    const path = writeTempPost("defaults-date.md", "date: 2001-02-03");
    const before = Date.now();

    const post = getPostByPath(path);
    const after = Date.now();

    expect(post.date).toBeInstanceOf(Date);
    expect(post.date.getTime()).toBeGreaterThanOrEqual(before);
    expect(post.date.getTime()).toBeLessThanOrEqual(after);
  });

  test("ignores unrecognised field names instead of projecting them", () => {
    const path = writeTempPost(
      "unknown-fields.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Unknown Fields",
        "thumbnail: /media/cover.jpg",
        "author: Duyet",
      ].join("\n")
    );

    const post = getPostByPath(path, [
      "author",
      "mdxCode",
      "tokenCount",
      "edit_url",
      "definitelyNotAField",
      "",
    ]);

    expect(Object.keys(post)).toEqual(DEFAULT_POST_KEYS);
    expect(readField(post, "author")).toBeUndefined();
    expect(post.thumbnail).toBeUndefined();
  });

  test("ignores Object.prototype member names without invoking them", () => {
    const path = writeTempPost("proto-fields.md", `slug: ${VALID_SLUG}`);

    const post = getPostByPath(path, [
      "constructor",
      "toString",
      "valueOf",
      "hasOwnProperty",
      "__proto__",
    ]);

    expect(Object.keys(post)).toEqual(DEFAULT_POST_KEYS);
  });
});

describe("getPostByPath – slug", () => {
  test("uses the frontmatter slug", () => {
    const path = writeTempPost("slug-frontmatter.md", `slug: ${VALID_SLUG}`);

    expect(getPostByPath(path, ["slug"]).slug).toBe(VALID_SLUG);
  });

  test("accepts a .html suffixed slug", () => {
    const path = writeTempPost("slug-html.md", `slug: ${VALID_SLUG}.html`);

    expect(getPostByPath(path, ["slug"]).slug).toBe(`${VALID_SLUG}.html`);
  });

  test("throws ValidationError when the slug does not match /yyyy/mm/slug", () => {
    const path = writeTempPost("slug-bad.md", "slug: not-a-valid-slug");

    expect(() => getPostByPath(path, ["slug"])).toThrow(ValidationError);
    expect(() => getPostByPath(path, ["slug"])).toThrow(
      "Invalid slug format: not-a-valid-slug. Please use the format /yyyy/mm/slug(.html)"
    );
  });

  test("reports the offending slug and file path on the error", () => {
    const path = writeTempPost("slug-bad-context.md", "slug: nope");

    try {
      getPostByPath(path, ["slug"]);
      expect.unreachable("expected a ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const { context } = error as ValidationError;
      expect(context).toEqual({ slug: "nope", path });
    }
  });

  test("falls back to the file path when the frontmatter slug is missing", () => {
    const path = writeTempPost("slug-missing.md", "title: No Slug");

    // A tmpdir path can never satisfy /^\/(\d{4})\/(\d{2})\/(.+)$/, so the
    // `|| fullPath` fallback is only observable through the thrown error.
    try {
      getPostByPath(path, ["slug"]);
      expect.unreachable("expected a ValidationError");
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).context).toEqual({ slug: path, path });
    }
  });

  test("throws even when other valid fields are requested alongside slug", () => {
    const path = writeTempPost(
      "slug-throws.md",
      ["slug: /bad/slug", "title: T"].join("\n")
    );

    expect(() => getPostByPath(path, ["title", "slug", "date"])).toThrow(
      ValidationError
    );
  });
});

describe("getPostByPath – title", () => {
  test("uses the frontmatter title", () => {
    const path = writeTempPost("title.md", "title: Hello World");

    expect(getPostByPath(path, ["title"]).title).toBe("Hello World");
  });

  test("overwrites the default with undefined when the title is missing", () => {
    const path = writeTempPost("title-missing.md", "date: 2024-01-15");

    const post = getPostByPath(path, ["title"]);
    expect(post.title).toBeUndefined();
  });
});

describe("getPostByPath – path", () => {
  test("exposes the absolute file path", () => {
    const path = writeTempPost("path.md", `slug: ${VALID_SLUG}`);

    expect(getPostByPath(path, ["path"]).path).toBe(path);
  });
});

describe("getPostByPath – date", () => {
  test("keeps a YAML date as a Date instance", () => {
    const path = writeTempPost("date-yaml.md", "date: 2024-01-15");

    const post = getPostByPath(path, ["date"]);
    expect(post.date).toBeInstanceOf(Date);
    expect(post.date.toISOString()).toBe("2024-01-15T00:00:00.000Z");
  });

  test("coerces a quoted date string through new Date()", () => {
    const path = writeTempPost("date-string.md", 'date: "2024-03-20"');

    const post = getPostByPath(path, ["date"]);
    expect(post.date).toBeInstanceOf(Date);
    expect(post.date.toISOString()).toBe("2024-03-20T00:00:00.000Z");
  });

  test("produces an Invalid Date when the frontmatter date is missing", () => {
    const path = writeTempPost("date-missing.md", "title: No Date");

    const post = getPostByPath(path, ["date"]);
    expect(post.date).toBeInstanceOf(Date);
    expect(Number.isNaN(post.date.getTime())).toBe(true);
  });
});

describe("getPostByPath – content", () => {
  test("returns the body without the frontmatter block", () => {
    const path = writeTempPost(
      "content.md",
      `slug: ${VALID_SLUG}`,
      "First paragraph.\n\nSecond paragraph."
    );

    expect(getPostByPath(path, ["content"]).content).toBe(
      bodyContent("First paragraph.\n\nSecond paragraph.")
    );
  });
});

describe("getPostByPath – category and category_slug", () => {
  test("uses the frontmatter category", () => {
    const path = writeTempPost(
      "category.md",
      "category: JavaScript Frameworks"
    );

    expect(getPostByPath(path, ["category"]).category).toBe(
      "JavaScript Frameworks"
    );
  });

  test("falls back to Unknown for an explicit null category", () => {
    const path = writeTempPost("category-null.md", "category: null");

    expect(getPostByPath(path, ["category"]).category).toBe("Unknown");
  });

  test("falls back to Unknown for an empty category", () => {
    const path = writeTempPost("category-empty.md", 'category: ""');

    expect(getPostByPath(path, ["category"]).category).toBe("Unknown");
  });

  test("derives category_slug from the frontmatter category", () => {
    const path = writeTempPost(
      "category-slug.md",
      "category: JavaScript Frameworks"
    );

    expect(getPostByPath(path, ["category_slug"]).category_slug).toBe(
      "javascript-frameworks"
    );
  });

  test("category_slug ignores the value written by the category handler", () => {
    const path = writeTempPost(
      "category-slug-missing.md",
      "title: No Category"
    );

    const post = getPostByPath(path, ["category", "category_slug"]);
    expect(post.category).toBe("Unknown");
    expect(post.category_slug).toBe("unknown");
  });

  test("category and category_slug are order independent", () => {
    const path = writeTempPost(
      "category-order.md",
      "category: JavaScript Frameworks"
    );

    const categoryFirst = getPostByPath(path, ["category", "category_slug"]);
    const slugFirst = getPostByPath(path, ["category_slug", "category"]);

    expect(categoryFirst.category).toBe("JavaScript Frameworks");
    expect(categoryFirst.category_slug).toBe("javascript-frameworks");
    // Compare the two fields under test, not the whole post: `date` defaults
    // to `new Date()` per call, so two reads a millisecond apart differ and a
    // whole-object `toEqual` fails intermittently.
    expect(slugFirst.category).toBe(categoryFirst.category);
    expect(slugFirst.category_slug).toBe(categoryFirst.category_slug);
  });
});

describe("getPostByPath – tags", () => {
  test("normalizes tags and populates tags_slug as a side effect", () => {
    const path = writeTempPost(
      "tags.md",
      ["tags:", "  - javaScript", '  - "  machine  learning "', "  - ''"].join(
        "\n"
      )
    );

    const post = getPostByPath(path, ["tags"]);
    // An empty tag survives as "" — unlike `parts`, `tags` never filters them.
    expect(post.tags).toEqual(["Javascript", "Machine Learning", ""]);
    expect(post.tags_slug).toEqual(["javascript", "machine-learning", ""]);
  });

  test("requesting tags_slug alone is a no-op", () => {
    const path = writeTempPost("tags-slug-only.md", "tags:\n  - javaScript");

    const post = getPostByPath(path, ["tags_slug"]);
    expect(post.tags).toEqual([]);
    expect(post.tags_slug).toEqual([]);
  });

  test("tags and tags_slug are order independent", () => {
    const path = writeTempPost("tags-order.md", "tags:\n  - javaScript");

    const tagsFirst = getPostByPath(path, ["tags", "tags_slug"]);
    const slugFirst = getPostByPath(path, ["tags_slug", "tags"]);

    expect(tagsFirst.tags).toEqual(["Javascript"]);
    expect(tagsFirst.tags_slug).toEqual(["javascript"]);
    // Field-level, not whole-object: see the category order test for why.
    expect(slugFirst.tags).toEqual(tagsFirst.tags);
    expect(slugFirst.tags_slug).toEqual(tagsFirst.tags_slug);
  });

  test("an empty tag list yields empty arrays", () => {
    const path = writeTempPost("tags-empty.md", "tags: []");

    const post = getPostByPath(path, ["tags"]);
    expect(post.tags).toEqual([]);
    expect(post.tags_slug).toEqual([]);
  });
});

describe("getPostByPath – excerpt", () => {
  test("prefers the description frontmatter", () => {
    const path = writeTempPost(
      "excerpt-description.md",
      "description: A short summary"
    );

    expect(getPostByPath(path, ["excerpt"]).excerpt).toBe("A short summary");
  });

  test("falls back to the body when description is an empty string", () => {
    const path = writeTempPost(
      "excerpt-empty-description.md",
      'description: ""',
      "Only three words"
    );

    expect(getPostByPath(path, ["excerpt"]).excerpt).toBe(
      `${bodyContent("Only three words")}...`
    );
  });

  test("derives a 20 word slice from the body when description is missing", () => {
    const path = writeTempPost(
      "excerpt-body.md",
      "title: No Description",
      words(25)
    );

    const post = getPostByPath(path, ["excerpt"]);
    expect(post.excerpt).toBe(`\n${words(20)}...`);
    expect(post.excerpt).toContain("w20...");
    expect(post.excerpt).not.toContain("w21");
  });
});

describe("getPostByPath – snippet", () => {
  test("uses the frontmatter snippet", () => {
    const path = writeTempPost("snippet.md", "snippet: A snippet");

    expect(getPostByPath(path, ["snippet"]).snippet).toBe("A snippet");
  });

  test("falls back to an empty string when snippet is missing", () => {
    const path = writeTempPost("snippet-missing.md", "title: No Snippet");

    expect(getPostByPath(path, ["snippet"]).snippet).toBe("");
  });
});

describe("getPostByPath – featured", () => {
  test("is true for a truthy frontmatter value", () => {
    const path = writeTempPost("featured-true.md", "featured: true");

    expect(getPostByPath(path, ["featured"]).featured).toBe(true);
  });

  test("is false for an explicit false", () => {
    const path = writeTempPost("featured-false.md", "featured: false");

    expect(getPostByPath(path, ["featured"]).featured).toBe(false);
  });

  test("is false when featured is missing", () => {
    const path = writeTempPost("featured-missing.md", "title: No Featured");

    expect(getPostByPath(path, ["featured"]).featured).toBe(false);
  });

  test('a quoted "false" string is truthy', () => {
    const path = writeTempPost("featured-string.md", 'featured: "false"');

    expect(getPostByPath(path, ["featured"]).featured).toBe(true);
  });
});

describe("getPostByPath – series", () => {
  test("passes the frontmatter series through", () => {
    const path = writeTempPost("series.md", "series: Building Agents");

    expect(getPostByPath(path, ["series"]).series).toBe("Building Agents");
  });

  test("is undefined for an empty series", () => {
    const path = writeTempPost("series-empty.md", 'series: ""');

    expect(getPostByPath(path, ["series"]).series).toBeUndefined();
  });

  test("is undefined for a falsy non-string series", () => {
    const path = writeTempPost("series-zero.md", "series: 0");

    expect(getPostByPath(path, ["series"]).series).toBeUndefined();
  });
});

describe("getPostByPath – parent", () => {
  test("trims whitespace and strips the extension", () => {
    const path = writeTempPost(
      "parent.md",
      'parent: "  /2026/01/coding-agent.md  "'
    );

    expect(getPostByPath(path, ["parent"]).parent).toBe(
      "/2026/01/coding-agent"
    );
  });

  test("strips trailing slashes, and only then gets a chance at the extension", () => {
    // `.replace(extension).replace(slashes)` — a slash after the extension
    // hides it from the extension regex, so "part.md/" keeps its extension.
    const path = writeTempPost(
      "parent-slash-after-ext.md",
      'parent: "part.md//"'
    );

    expect(getPostByPath(path, ["parent"]).parent).toBe("part.md");
  });

  test("is undefined when normalisation leaves an empty string", () => {
    const path = writeTempPost("parent-empty.md", 'parent: "  /  "');

    expect(getPostByPath(path, ["parent"]).parent).toBeUndefined();
  });

  test("is undefined for a non-string parent", () => {
    const path = writeTempPost("parent-number.md", "parent: 5");

    expect(getPostByPath(path, ["parent"]).parent).toBeUndefined();
  });

  test("is undefined when parent is missing", () => {
    const path = writeTempPost("parent-missing.md", "title: No Parent");

    expect(getPostByPath(path, ["parent"]).parent).toBeUndefined();
  });
});

describe("getPostByPath – parts", () => {
  test("filters non-strings, strips extensions, trims and drops empties", () => {
    const path = writeTempPost(
      "parts.md",
      [
        "parts:",
        "  - part-one.md",
        "  - 5",
        '  - "  part-two.mdx  "',
        '  - ""',
        "  - part-three",
      ].join("\n")
    );

    expect(getPostByPath(path, ["parts"]).parts).toEqual([
      "part-one",
      "part-two",
      "part-three",
    ]);
  });

  test("is undefined for a non-array parts value", () => {
    const path = writeTempPost("parts-object.md", "parts:\n  part: one");

    expect(getPostByPath(path, ["parts"]).parts).toBeUndefined();
  });

  test("is undefined when parts is missing", () => {
    const path = writeTempPost("parts-missing.md", "title: No Parts");

    expect(getPostByPath(path, ["parts"]).parts).toBeUndefined();
  });
});

/**
 * thumbnail, video, x and hackerNews share one shape: a trimmed non-empty
 * string, otherwise undefined. These pins keep any shared helper honest.
 */
const TRIMMED_FIELDS = ["thumbnail", "video", "x", "hackerNews"] as const;

describe.each(TRIMMED_FIELDS)("getPostByPath – %s", (field) => {
  test("trims surrounding whitespace", () => {
    const path = writeTempPost(
      `${field}-trim.md`,
      `${field}: "  https://example.com/p  "`
    );

    expect(readField(getPostByPath(path, [field]), field)).toBe(
      "https://example.com/p"
    );
  });

  test("is undefined for a whitespace-only value", () => {
    const path = writeTempPost(`${field}-blank.md`, `${field}: "   "`);

    expect(readField(getPostByPath(path, [field]), field)).toBeUndefined();
  });

  test("is undefined for a non-string value", () => {
    const path = writeTempPost(`${field}-number.md`, `${field}: 42`);

    expect(readField(getPostByPath(path, [field]), field)).toBeUndefined();
  });

  test("is undefined when the key is absent", () => {
    const path = writeTempPost(`${field}-absent.md`, "title: Nothing Here");

    expect(readField(getPostByPath(path, [field]), field)).toBeUndefined();
  });

  test("reads only its own frontmatter key", () => {
    const path = writeTempPost(
      `${field}-cross-talk.md`,
      TRIMMED_FIELDS.map((key) => `${key}: "/only/${key}"`).join("\n")
    );

    const post = getPostByPath(path, [field]);
    for (const key of TRIMMED_FIELDS) {
      expect(readField(post, key)).toBe(
        key === field ? `/only/${key}` : undefined
      );
    }
  });
});

describe("getPostByPath – isMDX", () => {
  test("is true for an .mdx path", () => {
    const path = writeTempPost("is-mdx.mdx", `slug: ${VALID_SLUG}`);

    expect(getPostByPath(path, ["isMDX"]).isMDX).toBe(true);
  });

  test("is false for an .md path", () => {
    const path = writeTempPost("is-md.md", `slug: ${VALID_SLUG}`);

    expect(getPostByPath(path, ["isMDX"]).isMDX).toBe(false);
  });

  test("ignores a frontmatter isMDX value on an .md path", () => {
    const path = writeTempPost(
      "is-mdx-frontmatter.md",
      `slug: ${VALID_SLUG}\nisMDX: true`
    );

    expect(getPostByPath(path, ["isMDX"]).isMDX).toBe(false);
  });
});

describe("getPostByPath – readingTime", () => {
  test("rounds prose up to a one minute minimum", () => {
    const path = writeTempPost(
      "reading-prose.md",
      "title: T",
      "alpha beta gamma"
    );

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(1);
  });

  test("uses 200 words per minute", () => {
    const path = writeTempPost("reading-400.md", "title: T", words(400));

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(2);
  });

  test("adds two minutes per fenced code block", () => {
    const path = writeTempPost(
      "reading-block.md",
      "title: T",
      "```\ncode\n```"
    );

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(3);
  });

  test("counts every fenced block", () => {
    const path = writeTempPost(
      "reading-blocks.md",
      "title: T",
      "```\na\n```\n```\nb\n```"
    );

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(5);
  });

  test("an unterminated fence counts as no code block", () => {
    const path = writeTempPost(
      "reading-unterminated.md",
      "title: T",
      "alpha ``` beta"
    );

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(1);
  });

  test("combines prose minutes and code block minutes", () => {
    const path = writeTempPost(
      "reading-combined.md",
      "title: T",
      `${words(400)}\n\n\`\`\`\na\n\`\`\`\n\`\`\`\nb\n\`\`\``
    );

    expect(getPostByPath(path, ["readingTime"]).readingTime).toBe(7);
  });
});

describe("getPostByPath – changelog", () => {
  test("keeps an array changelog", () => {
    const path = writeTempPost(
      "changelog.md",
      ["changelog:", "  - date: 2026-01-01", "    note: First"].join("\n")
    );

    const { changelog } = getPostByPath(path, ["changelog"]);
    expect(changelog).toHaveLength(1);
    expect(changelog?.[0]?.note).toBe("First");
  });

  test("is undefined for a non-array changelog", () => {
    const path = writeTempPost(
      "changelog-object.md",
      "changelog:\n  note: First"
    );

    expect(getPostByPath(path, ["changelog"]).changelog).toBeUndefined();
  });

  test("is undefined when changelog is missing", () => {
    const path = writeTempPost("changelog-missing.md", "title: No Changelog");

    expect(getPostByPath(path, ["changelog"]).changelog).toBeUndefined();
  });
});

describe("getPostByPath – multi-field projection", () => {
  test("projects every field in one pass and ignores duplicates", () => {
    const path = writeTempPost(
      "all-fields.md",
      [
        `slug: ${VALID_SLUG}`,
        "title: Everything",
        'date: "2024-05-06"',
        "category: JavaScript Frameworks",
        "tags:\n  - javaScript",
        "description: Summary",
        "snippet: Snip",
        "featured: true",
        "series: Series",
        "parent: /2026/01/coding-agent.md",
        "parts:\n  - part-one.md",
        "thumbnail: /media/cover.jpg",
        "video: https://example.com/v.mp4",
        'x: "  https://x.com/duyet/status/1  "',
        "hackerNews: https://news.ycombinator.com/item?id=1",
        "changelog:\n  - date: 2026-01-01\n    note: First",
      ].join("\n"),
      "alpha beta gamma"
    );

    const fields = [
      "slug",
      "title",
      "path",
      "date",
      "content",
      "category",
      "category_slug",
      "tags",
      "excerpt",
      "snippet",
      "featured",
      "series",
      "parent",
      "parts",
      "thumbnail",
      "video",
      "isMDX",
      "readingTime",
      "x",
      "hackerNews",
      "changelog",
    ];

    const once = getPostByPath(path, fields);
    const twice = getPostByPath(path, [...fields, ...fields]);

    expect(twice).toEqual(once);
    expect(Object.keys(once).sort()).toEqual(
      [...new Set([...DEFAULT_POST_KEYS, ...fields])].sort()
    );
    expect(once).toMatchObject({
      slug: VALID_SLUG,
      title: "Everything",
      path,
      content: bodyContent("alpha beta gamma"),
      category: "JavaScript Frameworks",
      category_slug: "javascript-frameworks",
      tags: ["Javascript"],
      tags_slug: ["javascript"],
      excerpt: "Summary",
      snippet: "Snip",
      featured: true,
      series: "Series",
      parent: "/2026/01/coding-agent",
      parts: ["part-one"],
      thumbnail: "/media/cover.jpg",
      video: "https://example.com/v.mp4",
      isMDX: false,
      readingTime: 1,
      x: "https://x.com/duyet/status/1",
      hackerNews: "https://news.ycombinator.com/item?id=1",
    });
    expect(once.changelog?.[0]?.note).toBe("First");
  });
});
