import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getPostByPath } from "./getPost";

const TEST_DIR = join(tmpdir(), `getPost-test-${Date.now()}`);
const VALID_SLUG = "/2024/01/test-post";

function writeTempPost(filename: string, frontmatter: string, body = "Post body text"): string {
  const fullPath = join(TEST_DIR, filename);
  writeFileSync(fullPath, `---\n${frontmatter}\n---\n\n${body}`);
  return fullPath;
}

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
